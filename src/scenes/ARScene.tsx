
import React, { useState, useRef, useEffect, useMemo } from 'react';
import Constants from 'expo-constants';
import { StyleSheet, Dimensions } from 'react-native';
import {
  ViroARScene,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroSpotLight,
  Viro3DObject,
  ViroNode,
  ViroText,
  ViroTrackingStateConstants,
  ViroARPlane,
  ViroQuad,
  ViroMaterials,
} from '@viro-community/react-viro';
import { ARSceneState } from '../types/models';

// Register materials at module scope so they exist before any view renders.
// This fixes runtime errors like: "Material [planeIndicator] not found".
try {
  ViroMaterials.createMaterials({
    planeIndicator: {
      // Softer tint that blends with real surfaces but remains visible
      diffuseColor: '#FFF4B3',
      lightingModel: 'Lambert',
    },
  });
} catch (e) {
  // On fast refresh or HMR the material may already exist; ignore.
}

const ARScene = (props: any) => {
  const appProps = props?.sceneNavigator?.viroAppProps ?? props;
  const {
    model,
    onClose,
    onShowModelPicker,
    onAnchorFound,
    onTrackingUpdated,
    onError,
  } = appProps;
  const [trackingState, setTrackingState] = useState<string>('TRACKING_NONE');
  const [planeDetected, setPlaneDetected] = useState<boolean>(false);
  const [stablePlaneFrames, setStablePlaneFrames] = useState<number>(0);
  const [lastPlaneExtent, setLastPlaneExtent] = useState<[number, number]>([0, 0]);
  const [lastPlaneAlignment, setLastPlaneAlignment] = useState<'Horizontal' | 'Vertical' | null>(null);
  const [modelPlaced, setModelPlaced] = useState<boolean>(false);
  const arNodeRef = useRef(null);
  const arSceneRef = useRef<any>(null);
  const planeNormalRef = useRef<[number, number, number] | null>(null);
  const [modelPosition, setModelPosition] = useState<[number, number, number] | null>(null);
  const [hintVisible, setHintVisible] = useState<boolean>(true);
  const [infoText, setInfoText] = useState<string | null>(null);
  const screen = Dimensions.get('window');
  const autoAnchorRequestedRef = useRef<boolean>(false);
  const infoTimeoutRef = useRef<any>(null);
  const STABLE_FRAMES_THRESHOLD = 3; // consecutive updates indicating stability (relaxed)
  const MIN_EXTENT_METERS = 0.15;    // ignore tiny planes (min width/height in meters, relaxed)
  const STABILITY_DELTA_M = 0.02;    // max center movement between updates to count as stable
  const SURFACE_Y_TOLERANCE_M = 0.03; // tolerance to clamp Y to plane center for flush placement
  const PLANE_UP_NORMAL_MIN = 0.90;   // require strongly upward normal for acceptance (relaxed to 0.90)
  const CAMERA_Y_BAND_M = 2.0;        // consider only planes whose Y is within ±2m of camera Y
  const stablePlane = stablePlaneFrames >= STABLE_FRAMES_THRESHOLD;
  const extentKnown = lastPlaneExtent[0] > 0 && lastPlaneExtent[1] > 0;
  const extentMeetsThreshold = lastPlaneExtent[0] >= MIN_EXTENT_METERS && lastPlaneExtent[1] >= MIN_EXTENT_METERS;
  const upNormalOk = ((): boolean => {
    const n = planeNormalRef.current;
    return !!n && Number(n[1]) >= PLANE_UP_NORMAL_MIN;
  })();
  const confidentPlane =
    stablePlane &&
    trackingState === 'TRACKING_NORMAL' &&
    extentKnown && extentMeetsThreshold && upNormalOk;

  // Tap allowed only when we have a confident horizontal plane under normal tracking
  const planeTapAllowed = trackingState === 'TRACKING_NORMAL' && confidentPlane;

  // Grid visualization state (semi-transparent, on-brand)
  const clamp = (x: number, min: number, max: number) => Math.max(min, Math.min(max, x));
  const GRID_MIN = 0.30; // meters
  const GRID_MAX = 1.50; // meters
  const GRID_Y_EPSILON = 0.001; // tiny lift to avoid z-fighting
  const [gridVisible, setGridVisible] = useState<boolean>(false);
  const [gridAlpha, setGridAlpha] = useState<number>(0);
  const [gridSize, setGridSize] = useState<[number, number]>([0.6, 0.6]);
  const gridOpacity = gridVisible ? gridAlpha : 0.0;
  // planeReady is defined later to include fallback and center availability
  // Fallback readiness: some platforms don’t report plane extent but still provide
  // a stable horizontal center and upward normal. Use that for instant placement
  // without changing the underlying plane detection thresholds.
  const planeReadyFallback =
    gridVisible &&
    trackingState === 'TRACKING_NORMAL' &&
    lastPlaneAlignment === 'Horizontal' &&
    stablePlane &&
    (upNormalOk || planeNormalRef.current == null);

  // Dynamic model scaling
  const [modelScale, setModelScale] = useState<[number, number, number] | null>(null);

  // Debug: on-screen plane extent text
  const [planeDebugText, setPlaneDebugText] = useState<string | null>(null);

  const prevCenterRef = useRef<[number, number, number] | null>(null);
  const planeRotationRef = useRef<[number, number, number] | null>(null);
  // Track the "best" horizontal plane based on height relative to camera
  type PlanePose = {
    id?: string;
    center: [number, number, number];
    normalY: number;
    rotation: [number, number, number] | null;
    extent?: [number, number] | null;
  };
  const bestPlaneRef = useRef<PlanePose | null>(null);
  const [bestPlane, setBestPlane] = useState<PlanePose | null>(null);
  const [planeKey, setPlaneKey] = useState<string>('plane');

  // Final readiness: grid visible, horizontal alignment, confidence (or fallback),
  // and we have a usable center from either prevCenterRef or bestPlane.
  const planeReady =
    gridVisible &&
    lastPlaneAlignment === 'Horizontal' &&
    (confidentPlane || planeReadyFallback) &&
    (!!prevCenterRef.current || !!bestPlane?.center);

  useEffect(() => {
    if (!bestPlane) return;
    // Force the ViroARPlane subtree to remount, nudging it to re-anchor
    const nextKey = bestPlane.id ? String(bestPlane.id) : `y:${bestPlane.center[1].toFixed(3)}`;
    setPlaneKey(nextKey);
  }, [bestPlane]);

  // Compute a position that sits flush on the detected plane.
  // For horizontal planes, clamp Y to plane center within a tolerance,
  // then apply model.baseYOffsetMeters so the model base sits on the surface.
  // For vertical planes, we keep the position as-is (flush in-plane placement).
  const computeFlushPosition = (rawPos?: [number, number, number] | null): [number, number, number] | null => {
    const p = rawPos ?? prevCenterRef.current;
    if (!p) return null;
    const center = prevCenterRef.current;
    if (lastPlaneAlignment === 'Horizontal') {
      const yOff = Number(model?.baseYOffsetMeters ?? 0);
      const planeY = center ? center[1] : p[1];
      const baseY = Math.abs(p[1] - planeY) <= SURFACE_Y_TOLERANCE_M ? p[1] : planeY;
      return [p[0], baseY + yOff, p[2]];
    }
    // Vertical or unknown: no Y offset; assume model pivot is appropriate
    return [p[0], p[1], p[2]];
  };

  // Extract approximate Euler rotation [x,y,z] (degrees) from event's anchor transform
  const extractRotationFromEvent = (event: any): [number, number, number] | null => {
    try {
      const ne = event?.nativeEvent ?? event;
      const anchor = ne?.anchor;
      const rot = anchor?.rotation; // some platforms expose Euler directly
      if (Array.isArray(rot) && rot.length >= 3) {
        return [Number(rot[0]), Number(rot[1]), Number(rot[2])];
      }
      const m = anchor?.transform;
      if (!Array.isArray(m) || m.length < 16) return null;
      // Matrix is 4x4. Assume column-major (ARKit). Convert to Euler.
      const m00 = m[0],  m01 = m[1],  m02 = m[2];
      const m10 = m[4],  m11 = m[5],  m12 = m[6];
      const m20 = m[8],  m21 = m[9],  m22 = m[10];
      const sy = Math.sqrt(m00 * m00 + m10 * m10);
      let x, y, z;
      if (sy > 1e-6) {
        x = Math.atan2(m21, m22);
        y = Math.atan2(-m20, sy);
        z = Math.atan2(m10, m00);
      } else {
        x = Math.atan2(-m12, m11);
        y = Math.atan2(-m20, sy);
        z = 0;
      }
      const deg = (r: number) => (r * 180) / Math.PI;
      return [deg(x), deg(y), deg(z)];
    } catch {
      return null;
    }
  };

  // Extract plane normal from the anchor transform matrix. Assumes column-major 4x4.
  // For ARKit/ARCore, the second column typically represents the local Y axis (up).
  const extractNormalFromTransform = (event: any): [number, number, number] | null => {
    try {
      const ne = event?.nativeEvent ?? event;
      const m = ne?.anchor?.transform;
      if (!Array.isArray(m) || m.length < 16) return null;
      const nx = Number(m[1]);  // column 1, row 0
      const ny = Number(m[5]);  // column 1, row 1
      const nz = Number(m[9]);  // column 1, row 2
      const mag = Math.sqrt(nx * nx + ny * ny + nz * nz);
      if (mag <= 1e-6) return null;
      return [nx / mag, ny / mag, nz / mag];
    } catch {
      return null;
    }
  };


  const showInfo = (text: string, durationMs = 2000) => {
    try { clearTimeout(infoTimeoutRef.current); } catch {}
    setInfoText(text);
    infoTimeoutRef.current = setTimeout(() => setInfoText(null), durationMs);
  };

  // Resolve Viro3DObject source robustly: prefer require('...glb'),
  // otherwise fall back to an Asset-provided localUri or uri.
  const resolvedSource = useMemo(() => {
    if (!model) return undefined as any;
    if (model.sourceModule) {
      if (Constants?.expoConfig?.extra?.DEBUG_AR) {
        console.log('[AR] Using require() source for', model.id);
      }
      return model.sourceModule;
    }
    const asset = model.modelPath;
    const uri = (asset?.localUri || asset?.uri) as string | undefined;
    if (uri) {
      if (Constants?.expoConfig?.extra?.DEBUG_AR) {
        console.log('[AR] Using URI source for', model.id, '->', uri);
      }
      return { uri } as any;
    }
    if (Constants?.expoConfig?.extra?.DEBUG_AR) {
      console.warn('[AR] No valid source for model', model.id);
    }
    return undefined as any;
  }, [model]);

  // Handle AR tracking updates
  const handleTrackingUpdated = (state: any) => {
    const trackingNormal =
      state === (ViroTrackingStateConstants as any).TRACKING_NORMAL ||
      state === 'TRACKING_NORMAL' ||
      state === 3; // fallback for native enum value
    setTrackingState(trackingNormal ? 'TRACKING_NORMAL' : 'TRACKING_NONE');
    
    if (onTrackingUpdated) {
      onTrackingUpdated({
        isTracking: trackingNormal,
        planeDetected,
        anchorFound: modelPlaced,
      });
    }
  };

  // In auto-place mode we do not rely on plane detection
  // Keeping state for debug text compatibility
  const extractExtentFromEvent = (event: any): [number, number] | null => {
    const ne = event?.nativeEvent ?? event;
    const anchor = ne?.anchor;
    // ARKit: anchor.extent: [width, length]
    const extent = anchor?.extent;
    if (Array.isArray(extent) && extent.length >= 2) return [Number(extent[0]), Number(extent[1])];
    // Some Android builds: extent may be object
    if (extent && typeof extent.width === 'number' && typeof extent.height === 'number') {
      return [Number(extent.width), Number(extent.height)];
    }
    // Other variants: anchor.extent may be { x, z } or separate properties extentX/extentZ
    if (extent && typeof extent.x === 'number' && typeof extent.z === 'number') {
      return [Number(extent.x), Number(extent.z)];
    }
    if (typeof anchor?.extentX === 'number' && typeof anchor?.extentZ === 'number') {
      return [Number(anchor.extentX), Number(anchor.extentZ)];
    }
    return null;
  };

  const handlePlaneAnchor = (event: any, alignment: 'Horizontal' | 'Vertical') => {
    if (autoAnchorRequestedRef.current) return;
    // Do not flip planeDetected here; it is derived from stability/extent in an effect.
    setHintVisible(true);
    const ext = extractExtentFromEvent(event);
    const center = getPositionFromAnchorEvent(event);
    const rotationEuler = extractRotationFromEvent(event);
    const normal = extractNormalFromTransform(event);
    const ne = event?.nativeEvent ?? event;
    const anchor = ne?.anchor || {};
    const anchorId = anchor?.identifier || anchor?.id || anchor?.uuid || anchor?.anchorId;
    setLastPlaneAlignment(alignment);
    if (ext) {
      setLastPlaneExtent(ext);
    }

    // Filter: Only accept strongly upward-pointing normals for horizontal planes
    if (alignment === 'Horizontal' && normal && normal[1] < PLANE_UP_NORMAL_MIN) {
      console.log('[AR] Ignoring plane: not horizontal enough, normal=', normal);
      return;
    }

     // Update grid size from plane extent for horizontal planes (based on current candidate)
     if (alignment === 'Horizontal') {
       const sizeX = clamp(ext ? Number(ext[0]) : 0.6, GRID_MIN, GRID_MAX);
       const sizeZ = clamp(ext ? Number(ext[1]) : 0.6, GRID_MIN, GRID_MAX);
       setGridSize([sizeX, sizeZ]);
       if (!gridVisible) {
         setGridVisible(true);
         setGridAlpha(0.56);
         console.log('[AR] Showing grid (callback): size', [sizeX, sizeZ], 'alpha', 0.56, 'center', center);
       }
     }

    // Count stability when tracking is normal and center is steady,
    // regardless of extent availability. Extent (when present) still contributes to confidence.
    setStablePlaneFrames((n) => {
      if (trackingState !== 'TRACKING_NORMAL') return 0;
      if (!center) {
        prevCenterRef.current = center ?? prevCenterRef.current;
        return n;
      }
      const prev = prevCenterRef.current;
      prevCenterRef.current = center;
      if (!prev) return Math.min(n + 1, 30);
      const dx = center[0] - prev[0];
      const dy = center[1] - prev[1];
      const dz = center[2] - prev[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist <= STABILITY_DELTA_M) {
        return Math.min(n + 1, 30);
      }
      return 0;
    });

    // Unconditional debug logs for verification on real device
    const sizeStr = ext ? `${Number(ext[0]).toFixed(2)}x${Number(ext[1]).toFixed(2)}m` : 'unknown';
    const centerStr = center ? `${center.map(v => Number(v).toFixed(2)).join(', ')}` : 'unknown';
    console.log(`[AR] Plane ${alignment} detected: size ${sizeStr}, center ${centerStr}`);
    planeRotationRef.current = rotationEuler ?? planeRotationRef.current;
    planeNormalRef.current = normal ?? planeNormalRef.current;
    // Log when the plane passes minimal acceptance (extent + upward normal)
    const extentOk = !!ext && Number(ext[0]) >= MIN_EXTENT_METERS && Number(ext[1]) >= MIN_EXTENT_METERS;
    const normalOk = !normal || Number(normal[1]) >= PLANE_UP_NORMAL_MIN;
    if (alignment === 'Horizontal' && center && extentOk && normalOk) {
      console.log('[AR] plane pose', center, 'normal=', normal);
    }
    setPlaneDebugText(`Plane detected: ${sizeStr}`);
    try {
      clearTimeout(infoTimeoutRef.current);
    } catch {}
    infoTimeoutRef.current = setTimeout(() => setPlaneDebugText(null), 2500);

    // Choose best horizontal plane by height relative to camera
    if (alignment === 'Horizontal' && center && normal) {
      const chooseBestPlaneByHeight = async () => {
        let cameraY: number | null = null;
        try {
          const cam = await arSceneRef.current?.getCameraOrientationAsync?.();
          const pos = cam?.position;
          if (Array.isArray(pos) && pos.length >= 3) {
            cameraY = Number(pos[1]);
          }
        } catch {}

        // Optional safety: ignore planes too far (vertical band around camera origin)
        if (cameraY !== null) {
          const dy = Math.abs(Number(center[1]) - cameraY);
          if (dy > CAMERA_Y_BAND_M) {
            console.log('[AR] Skipping plane: too low or too high for camera band. centerY=', Number(center[1]).toFixed(3), 'cameraY=', Number(cameraY).toFixed(3));
            return;
          }
        }

        const candidate: PlanePose = {
          id: anchorId ? String(anchorId) : undefined,
          center,
          normalY: Number(normal[1]),
          rotation: rotationEuler ?? null,
          extent: ext ?? null,
        };

        const prev = bestPlaneRef.current;
        let shouldUpdate = false;
        if (!prev) {
          shouldUpdate = true;
        } else {
          const prevY = Number(prev.center[1]);
          const candY = Number(center[1]);
          if (cameraY !== null) {
            const prevBelow = prevY <= cameraY + 1e-6;
            const candBelow = candY <= cameraY + 1e-6;
            if (candBelow && prevBelow) {
              // Prefer the highest plane below the camera (desk/chair over floor)
              shouldUpdate = candY > prevY + 1e-3;
            } else if (candBelow && !prevBelow) {
              // Candidate below camera beats a previous plane above camera
              shouldUpdate = true;
            } else if (!candBelow && !prevBelow) {
              // Both above camera: prefer the closest above (lower Y)
              shouldUpdate = candY < prevY - 1e-3;
            } else {
              shouldUpdate = false;
            }
          } else {
            // No camera Y available: prefer higher Y to avoid floor when scanning tables
            shouldUpdate = candY > prevY + 0.02;
          }
        }

        if (shouldUpdate) {
          bestPlaneRef.current = candidate;
          setBestPlane(candidate);
          prevCenterRef.current = candidate.center;
          planeRotationRef.current = candidate.rotation ?? planeRotationRef.current;
          planeNormalRef.current = [0, candidate.normalY, 0] as [number, number, number];
          console.log('[AR] bestPlane updated: centerY=', Number(candidate.center[1]).toFixed(3), 'normalY=', Number(candidate.normalY).toFixed(3));
        }
      };

      // Only consider planes with upward normals
      if (Number(normal[1]) >= PLANE_UP_NORMAL_MIN) {
        // fire-and-forget; does not block frame
        chooseBestPlaneByHeight();
      }
    }
  };

  // Derive planeDetected from stability and/or extent thresholds under normal tracking.
  useEffect(() => {
    const active =
      trackingState === 'TRACKING_NORMAL' &&
      ( (extentKnown && extentMeetsThreshold) || stablePlane );
    setPlaneDetected(active);
  }, [trackingState, extentKnown, extentMeetsThreshold, stablePlaneFrames]);

  // Show the semi-transparent grid when a confident horizontal plane is detected
  // Also triggered directly from the plane anchor callback on first detection
  useEffect(() => {
    if (modelPlaced) return;
    if (autoAnchorRequestedRef.current) return;
    if (!confidentPlane) return;
    if (lastPlaneAlignment !== 'Horizontal') return;
    if (!gridVisible) {
      setGridVisible(true);
      setGridAlpha(0.56); // 50–60% opacity
      console.log('[AR] Showing grid (effect): size', gridSize, 'alpha', 0.56);
      // Log grid pose in world space (plane center + tiny Y epsilon)
      if (prevCenterRef.current) {
        const yaw = planeRotationRef.current ? Number(planeRotationRef.current[1]) : 0;
        const gridRotation: [number, number, number] = [-90, yaw, 0];
        console.log('[AR] grid pose (local [0,eps,0]) on plane center', prevCenterRef.current);
        console.log('[AR] using plane normal', planeNormalRef.current, 'grid rotation', gridRotation);
      }
    }
  }, [confidentPlane, lastPlaneAlignment, modelPlaced]);

  // Safely derive a position from plane anchor events
  const getPositionFromAnchorEvent = (event: any): [number, number, number] | null => {
    const ne = event?.nativeEvent ?? event;
    const p = ne?.position;
    if (Array.isArray(p) && p.length >= 3) return [p[0], p[1], p[2]];
    const anchor = ne?.anchor;
    const center = anchor?.center;
    if (Array.isArray(center) && center.length >= 3) return [center[0], center[1], center[2]];
    if (center && typeof center.x === 'number') {
      return [center.x, Number(center.y ?? 0), Number(center.z ?? 0)];
    }
    const transform = anchor?.transform;
    if (Array.isArray(transform) && transform.length >= 16) {
      return [transform[12], transform[13], transform[14]] as [number, number, number];
    }
    return null;
  };

  // Handle model loading errors from Viro events and forward a string message
  const handleModelError = (event: any) => {
    const native = event?.nativeEvent ?? event;
    const message =
      native?.error || native?.message || native?.errorMessage || 'Unknown AR error';
    if (Constants?.expoConfig?.extra?.DEBUG_AR) {
      console.error('[AR] onError:', message);
    }
    setModelPlaced(false);
    if (onError) onError(String(message));
  };

  // Mark model as placed only after it has loaded
  const markModelPlaced = () => {
    setModelPlaced(true);
    if (onAnchorFound) onAnchorFound();
    // Hide hint once model is loaded (UI-only change)
    setHintVisible(false);
    // Fade out grid smoothly after the model is placed
    if (gridVisible) {
      let val = gridAlpha;
      const step = 0.06;
      const interval = setInterval(() => {
        val = Math.max(0, val - step);
        setGridAlpha(val);
        if (val <= 0) {
          try { clearInterval(interval); } catch {}
          setGridVisible(false);
        }
      }, 60);
    }
  };

  // Handle model removal
  const handleRemoveModel = () => {
    setModelPlaced(false);
    setModelPosition(null);
    onClose();
  };

  // Placement strategy: only place on stable plane tap; no camera fallback.
  useEffect(() => {
    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

    if (model) {
      // Wait for user tap on a stable plane; clear any previous position
      setModelPosition(null);
      autoAnchorRequestedRef.current = false;
    } else {
      // Model cleared
      setModelPlaced(false);
      setModelPosition(null);
      autoAnchorRequestedRef.current = false;
      setStablePlaneFrames(0);
      setLastPlaneExtent([0, 0]);
      setLastPlaneAlignment(null);
      try { clearTimeout(infoTimeoutRef.current); } catch {}
      setInfoText(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  // Auto-place when a model is selected and the plane/grid are ready.
  useEffect(() => {
    if (!model) {
      if (Constants?.expoConfig?.extra?.DEBUG_AR) {
        console.log('[AR] Auto-place skipped: no model selected');
      }
      return;
    }
    if (!planeReady) {
      if (Constants?.expoConfig?.extra?.DEBUG_AR) {
        console.log('[AR] Auto-place skipped: plane not ready', {
          gridVisible,
          lastPlaneAlignment,
          confidentPlane,
          planeReadyFallback,
          hasCenter: !!prevCenterRef.current || !!bestPlane?.center,
        });
      }
      return;
    }
    if (autoAnchorRequestedRef.current) {
      if (Constants?.expoConfig?.extra?.DEBUG_AR) {
        console.log('[AR] Auto-place skipped: already requested');
      }
      return;
    }

    const center: [number, number, number] | null =
      (prevCenterRef.current as [number, number, number] | null) ??
      (bestPlane?.center as [number, number, number] | undefined) ??
      null;

    const pos = computeFlushPosition(center);
    if (!pos) return;

    const target = Math.min(Number(gridSize[0]), Number(gridSize[1])) * 0.9;
    const baseFootprint = Number(model.footprintMeters ?? model.defaultPlacementMeters ?? 1.0);
    const factor = clamp(target / baseFootprint, 0.5, 2.2);
    const base = model.defaultScale as any;
    let scale: [number, number, number];
    if (Array.isArray(base) && base.length >= 3) {
      scale = [Number(base[0]) * factor, Number(base[1]) * factor, Number(base[2]) * factor];
    } else {
      const b = Number(base ?? 1.0);
      scale = [b * factor, b * factor, b * factor];
    }

    console.log('[AR] Auto place after select', {
      model: model.id,
      center,
      gridSize,
      factor,
    });

    setModelPosition(pos);
    setModelScale(scale);
    autoAnchorRequestedRef.current = true; // one-shot
    showInfo('Placing model on detected surface...', 1200);
  }, [model, planeReady, gridSize, bestPlane]);

  

  return (
    <ViroARScene ref={arSceneRef} onTrackingUpdated={handleTrackingUpdated}>
        {/* Strong ambient light for overall illumination (avoid overexposure) */}
        <ViroAmbientLight color="#ffffff" intensity={800} influenceBitMask={3} />
        {/* Main directional light for form and shading */}
        <ViroDirectionalLight
          color="#ffffff"
          direction={[0, -1, -0.2]}
          castsShadow={true}
          influenceBitMask={3}
          intensity={800}
        />
        
        {/* Spot light to create highlights and shadows */}
        <ViroSpotLight
          innerAngle={5}
          outerAngle={25}
          direction={[0, -1, -0.2]}
          position={[0, 3, 0]}
          color="#ffffff"
          castsShadow={true}
          influenceBitMask={2}
          intensity={600}
          shadowMapSize={2048}
          shadowNearZ={2}
          shadowFarZ={5}
          shadowOpacity={0.7}
        />


        {/* Plane detection indicator & tap-to-place */}
        {/* Horizontal plane indicator */}
        <ViroARPlane
          key={planeKey}
          alignment="Horizontal"
          minWidth={MIN_EXTENT_METERS}
          minHeight={MIN_EXTENT_METERS}
          onAnchorFound={(e: any) => {
            handlePlaneAnchor(e, 'Horizontal');
          }}
          onAnchorUpdated={(e: any) => {
            handlePlaneAnchor(e, 'Horizontal');
          }}
          onAnchorRemoved={() => { setPlaneDetected(false); setStablePlaneFrames(0); setLastPlaneExtent([0,0]); prevCenterRef.current = null; }}
          onClick={(event: any) => { /* tap-to-place disabled */ return; }}
        >
          <ViroNode
            onClick={(event: any) => { /* tap-to-place disabled */ return; }}
          >
            <ViroQuad
              rotation={[-90, (planeRotationRef.current ? planeRotationRef.current[1] : 0), 0]}
              position={[0, GRID_Y_EPSILON, 0]}
              width={gridSize[0]}
              height={gridSize[1]}
              materials={["planeIndicator"]}
              opacity={gridOpacity}
              onClick={(event: any) => { /* tap-to-place disabled */ return; }}
            />
          </ViroNode>
        </ViroARPlane>


        {/* Auto-placed node: fixed in world coordinates in front of camera */}
        {model && modelPosition && (
          <ViroNode
            ref={arNodeRef}
            position={modelPosition}
            ignoreEventHandling={false}
          >
            <Viro3DObject
              source={resolvedSource}
              resources={model.resources ?? []}
              position={[0, 0, 0]}
              scale={modelScale || model.defaultScale}
              rotation={model.defaultRotation}
              type="GLB"
              lightReceivingBitMask={3}
              shadowCastingBitMask={2}
              onLoadStart={() => {
                if (Constants?.expoConfig?.extra?.DEBUG_AR) {
                  console.log('[AR] onLoadStart for', model.id);
                }
                setModelPlaced(false);
              }}
              onLoadEnd={() => {
                if (Constants?.expoConfig?.extra?.DEBUG_AR) {
                  console.log('[AR] onLoadEnd for', model.id);
                }
                markModelPlaced();
              }}
              onError={handleModelError}
              highAccuracyEvents={true}
            />
          </ViroNode>
        )}

        {/* Status chip */}
        {trackingState === 'TRACKING_NORMAL' && (
          <ViroText
            text={confidentPlane ? 'Surface detected' : 'AR Ready'}
            position={[0, 0.25, -1]}
            style={styles.statusText}
            width={2}
            height={2}
          />
        )}

        {/* Placement feedback (temporary) */}
        {infoText && (
          <ViroText
            text={infoText}
            position={[0, 0.20, -1]}
            style={styles.statusText}
            width={2}
            height={2}
          />
        )}

        {/* Plane extent debug text */}
        {planeDebugText && (
          <ViroText
            text={planeDebugText}
            position={[0, 0.15, -1]}
            style={styles.statusText}
            width={2}
            height={2}
          />
        )}

        {/* Subtle UX hints */}
        {trackingState !== 'TRACKING_NORMAL' && (
          <ViroText
            text="Initializing AR..."
            position={[0, 0.05, -1]}
            style={styles.hintText}
            width={2}
            height={2}
          />
        )}
        {trackingState === 'TRACKING_NORMAL' && !confidentPlane && (
          <ViroText
            text="Scanning for surfaces..."
            position={[0, 0.05, -1]}
            style={styles.hintText}
            width={2}
            height={2}
          />
        )}
        {confidentPlane && hintVisible && (
          <ViroText
            text="Tap to place the model"
            position={[0, 0.03, -1]}
            style={styles.hintText}
            width={2}
            height={2}
          />
        )}
    </ViroARScene>
  );
};

const styles = StyleSheet.create({
  hintText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
});

export default ARScene;
