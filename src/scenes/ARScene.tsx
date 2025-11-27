
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
      diffuseColor: '#D9E8FF',
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
  const [modelPosition, setModelPosition] = useState<[number, number, number] | null>(null);
  const [hintVisible, setHintVisible] = useState<boolean>(true);
  const [infoText, setInfoText] = useState<string | null>(null);
  const screen = Dimensions.get('window');
  const autoAnchorRequestedRef = useRef<boolean>(false);
  const autoPlaceTimerRef = useRef<any>(null);
  const infoTimeoutRef = useRef<any>(null);
  const STABLE_FRAMES_THRESHOLD = 8; // consecutive updates indicating stability
  const MIN_EXTENT_METERS = 0.25;    // ignore tiny planes (min width/height in meters)
  const STABILITY_DELTA_M = 0.02;    // max center movement between updates to count as stable
  const SURFACE_Y_TOLERANCE_M = 0.03; // tolerance to clamp Y to plane center for flush placement
  const stablePlane = stablePlaneFrames >= STABLE_FRAMES_THRESHOLD;
  const extentKnown = lastPlaneExtent[0] > 0 && lastPlaneExtent[1] > 0;
  const extentMeetsThreshold = lastPlaneExtent[0] >= MIN_EXTENT_METERS && lastPlaneExtent[1] >= MIN_EXTENT_METERS;
  const confidentPlane =
    stablePlane &&
    trackingState === 'TRACKING_NORMAL' &&
    extentKnown && extentMeetsThreshold;

  // Plane visibility & tap allowance
  // Show grids and allow taps when tracking is normal and the plane center is stable,
  // even if extent is missing. Extent thresholds still strengthen confidence when present.
  const planeVisible = trackingState === 'TRACKING_NORMAL' && (planeDetected || stablePlane);
  const planeTapAllowed = trackingState === 'TRACKING_NORMAL' && (
    (extentKnown && extentMeetsThreshold) || stablePlane
  );
  // Smooth, graded grid opacity based on confidence from stability and extent.
  // Base visibility stays low but present; ramps up as confidence increases.
  const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
  const stablePct = clamp01(stablePlaneFrames / STABLE_FRAMES_THRESHOLD);
  const extentPct = extentKnown
    ? clamp01(Math.min(lastPlaneExtent[0], lastPlaneExtent[1]) / MIN_EXTENT_METERS)
    : 0;
  const confidence = Math.max(stablePct, extentPct);
  const baseOpacity = 0.12;
  const peakOpacity = 0.48;
  const gridOpacity = planeVisible ? baseOpacity + (peakOpacity - baseOpacity) * confidence : 0.0;

  const prevCenterRef = useRef<[number, number, number] | null>(null);

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
    return null;
  };

  const handlePlaneAnchor = (event: any, alignment: 'Horizontal' | 'Vertical') => {
    // Do not flip planeDetected here; it is derived from stability/extent in an effect.
    setHintVisible(true);
    const ext = extractExtentFromEvent(event);
    const center = getPositionFromAnchorEvent(event);
    setLastPlaneAlignment(alignment);
    if (ext) {
      setLastPlaneExtent(ext);
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

    if (Constants?.expoConfig?.extra?.DEBUG_AR) {
      console.log('[AR] Anchor', alignment, 'extent=', ext, 'center=', center, {
        stableFrames: stablePlaneFrames,
        extentKnown,
        extentMeetsThreshold,
        confidentPlane,
      });
      if (!extentKnown && center) {
        console.log('[AR] Center-stability gating active: extent missing, enabling early grid/tap');
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
      try { clearTimeout(autoPlaceTimerRef.current); } catch {}
      try { clearTimeout(infoTimeoutRef.current); } catch {}
      setInfoText(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  // Auto-place on first valid plane (stable center or large extent) without requiring a tap.
  useEffect(() => {
    if (!model) return;
    if (modelPlaced) return;
    if (autoAnchorRequestedRef.current) return; // already auto-placed or fallback done
    if (trackingState !== 'TRACKING_NORMAL') return;
    if (!planeTapAllowed) return;

    const center = prevCenterRef.current;
    if (!center) return; // wait until we have a center

    const yOff = Number(model?.baseYOffsetMeters ?? 0);
    const adjusted: [number, number, number] =
      lastPlaneAlignment === 'Horizontal'
        ? [center[0], center[1] + yOff, center[2]]
        : [center[0], center[1], center[2]];
    setModelPosition(adjusted);
    setHintVisible(false);
    autoAnchorRequestedRef.current = true;
    showInfo('Auto-placed on detected surface', 2000);
    if (Constants?.expoConfig?.extra?.DEBUG_AR) {
      console.log('[AR] Auto-placed on plane at', adjusted, 'alignment=', lastPlaneAlignment);
    }
  }, [model, planeTapAllowed, trackingState, lastPlaneAlignment]);

  // If no valid plane appears in 2 seconds, place the model in front of the camera as a fallback.
  useEffect(() => {
    if (!model) return;
    if (modelPlaced) return;
    if (autoAnchorRequestedRef.current) return;

    try { clearTimeout(autoPlaceTimerRef.current); } catch {}
    autoPlaceTimerRef.current = setTimeout(async () => {
      if (!model) return;
      if (modelPlaced) return;
      if (autoAnchorRequestedRef.current) return;

      let pos: [number, number, number] = [0, 0, -0.75];
      const d = 0.75;
      try {
        const api = arSceneRef.current?.getCameraOrientationAsync;
        if (typeof api === 'function') {
          const orientation = await arSceneRef.current.getCameraOrientationAsync();
          const camPos = orientation.position as [number, number, number];
          const forward = orientation.forward as [number, number, number];
          pos = [
            camPos[0] + forward[0] * d,
            camPos[1] + forward[1] * d,
            camPos[2] + forward[2] * d,
          ];
        }
      } catch (e) {
        if (Constants?.expoConfig?.extra?.DEBUG_AR) {
          console.warn('[AR] getCameraOrientationAsync failed; using static fallback', e);
        }
      }

      setModelPosition(pos);
      setHintVisible(false);
      autoAnchorRequestedRef.current = true;
      showInfo('Placed in front of camera. Scan & tap to re-place.', 2400);
      if (Constants?.expoConfig?.extra?.DEBUG_AR) {
        console.log('[AR] Fallback auto-placement at', pos);
      }
    }, 2000);

    return () => {
      try { clearTimeout(autoPlaceTimerRef.current); } catch {}
    };
  }, [model, trackingState, planeTapAllowed, modelPlaced]);

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
          onClick={(event: any) => {
            const pos = event?.nativeEvent?.position as [number, number, number] | undefined;
            const canTap = planeTapAllowed || confidentPlane;
            if (!model || !canTap) return;
            const p = pos ?? getPositionFromAnchorEvent(event);
            const adjusted = computeFlushPosition(p);
            if (adjusted) {
              setModelPosition(adjusted);
              setHintVisible(false);
              if (Constants?.expoConfig?.extra?.DEBUG_AR) {
                console.log('[AR] Tap Horizontal plane pos=', pos, 'fallback=', p);
              }
            } else {
              if (onError) onError('Couldn\u2019t determine tap position. Try a larger, steadier surface.');
              if (Constants?.expoConfig?.extra?.DEBUG_AR) {
                console.warn('[AR] Tap Horizontal: no position/fallback available');
              }
            }
          }}
        >
          <ViroNode
            onClick={(event: any) => {
              const pos = event?.nativeEvent?.position as [number, number, number] | undefined;
              if (!pos) {
                const fallback = getPositionFromAnchorEvent(event);
                const canTap = planeTapAllowed || confidentPlane;
                if (fallback && model && canTap) {
                  const adjusted = computeFlushPosition(fallback);
                  setModelPosition(adjusted);
                  setHintVisible(false);
                  if (Constants?.expoConfig?.extra?.DEBUG_AR) {
                    console.log('[AR] Node Tap Horizontal fallback=', fallback);
                  }
                } else if (!fallback) {
                  if (onError) onError('Tap didn\u2019t produce a position. Move device slightly and try again.');
                  if (Constants?.expoConfig?.extra?.DEBUG_AR) {
                    console.warn('[AR] Node Tap Horizontal: no position/fallback');
                  }
                }
                return;
              }
              const canTap = planeTapAllowed || confidentPlane;
              if (pos && model && canTap) {
                const adjusted = computeFlushPosition(pos);
                setModelPosition(adjusted);
                setHintVisible(false);
                if (Constants?.expoConfig?.extra?.DEBUG_AR) {
                  console.log('[AR] Node Tap Horizontal pos=', pos);
                }
              }
            }}
          >
            <ViroQuad
              rotation={[-90, 0, 0]}
              width={0.6}
              height={0.6}
              materials={["planeIndicator"]}
              opacity={gridOpacity}
              onClick={(event: any) => {
                const pos = event?.nativeEvent?.position as [number, number, number] | undefined;
                if (!pos) {
                  const fallback = getPositionFromAnchorEvent(event);
                  const canTap = planeTapAllowed || confidentPlane;
                  if (fallback && model && canTap) {
                    const adjusted = computeFlushPosition(fallback);
                    setModelPosition(adjusted);
                    setHintVisible(false);
                    if (Constants?.expoConfig?.extra?.DEBUG_AR) {
                      console.log('[AR] Quad Tap Horizontal fallback=', fallback);
                    }
                  } else if (!fallback) {
                    if (onError) onError('Tap failed to resolve a position. Try a larger or brighter surface.');
                    if (Constants?.expoConfig?.extra?.DEBUG_AR) {
                      console.warn('[AR] Quad Tap Horizontal: no position/fallback');
                    }
                  }
                  return;
                }
                const canTap = planeTapAllowed || confidentPlane;
                if (pos && model && canTap) {
                  const adjusted = computeFlushPosition(pos);
                  setModelPosition(adjusted);
                  setHintVisible(false);
                  if (Constants?.expoConfig?.extra?.DEBUG_AR) {
                    console.log('[AR] Quad Tap Horizontal pos=', pos);
                  }
                }
              }}
            />
          </ViroNode>
        </ViroARPlane>

        {/* Vertical plane indicator */}
        <ViroARPlane
          alignment="Vertical"
          minWidth={MIN_EXTENT_METERS}
          minHeight={MIN_EXTENT_METERS}
          onAnchorFound={(e: any) => {
            handlePlaneAnchor(e, 'Vertical');
          }}
          onAnchorUpdated={(e: any) => {
            handlePlaneAnchor(e, 'Vertical');
          }}
          onAnchorRemoved={() => { setPlaneDetected(false); setStablePlaneFrames(0); setLastPlaneExtent([0,0]); prevCenterRef.current = null; }}
          onClick={(event: any) => {
            const pos = event?.nativeEvent?.position as [number, number, number] | undefined;
            const canTap = planeTapAllowed || confidentPlane;
            if (!model || !canTap) return;
            const p = pos ?? getPositionFromAnchorEvent(event);
            const adjusted = computeFlushPosition(p);
            if (adjusted) {
              setModelPosition(adjusted);
              setHintVisible(false);
              if (Constants?.expoConfig?.extra?.DEBUG_AR) {
                console.log('[AR] Tap Vertical plane pos=', pos, 'fallback=', p);
              }
            } else {
              if (onError) onError('Couldn\u2019t determine tap position. Try a larger, steadier surface.');
              if (Constants?.expoConfig?.extra?.DEBUG_AR) {
                console.warn('[AR] Tap Vertical: no position/fallback available');
              }
            }
          }}
        >
          <ViroNode
            onClick={(event: any) => {
              const pos = event?.nativeEvent?.position as [number, number, number] | undefined;
              if (!pos) {
                const fallback = getPositionFromAnchorEvent(event);
                const canTap = planeTapAllowed || confidentPlane;
                if (fallback && model && canTap) {
                  const adjusted = computeFlushPosition(fallback);
                  setModelPosition(adjusted);
                  setHintVisible(false);
                  if (Constants?.expoConfig?.extra?.DEBUG_AR) {
                    console.log('[AR] Node Tap Vertical fallback=', fallback);
                  }
                } else if (!fallback) {
                  if (onError) onError('Tap didn\u2019t produce a position. Move device slightly and try again.');
                  if (Constants?.expoConfig?.extra?.DEBUG_AR) {
                    console.warn('[AR] Node Tap Vertical: no position/fallback');
                  }
                }
                return;
              }
              const canTap = planeTapAllowed || confidentPlane;
              if (pos && model && canTap) {
                const adjusted = computeFlushPosition(pos);
                setModelPosition(adjusted);
                setHintVisible(false);
                if (Constants?.expoConfig?.extra?.DEBUG_AR) {
                  console.log('[AR] Node Tap Vertical pos=', pos);
                }
              }
            }}
          >
            <ViroQuad
              rotation={[0, 0, 0]}
              width={0.6}
              height={0.6}
              materials={["planeIndicator"]}
              opacity={gridOpacity}
              onClick={(event: any) => {
                const pos = event?.nativeEvent?.position as [number, number, number] | undefined;
                if (!pos) {
                  const fallback = getPositionFromAnchorEvent(event);
                  const canTap = planeTapAllowed || confidentPlane;
                if (fallback && model && canTap) {
                  const adjusted = computeFlushPosition(fallback);
                  setModelPosition(adjusted);
                  setHintVisible(false);
                  if (Constants?.expoConfig?.extra?.DEBUG_AR) {
                    console.log('[AR] Quad Tap Vertical fallback=', fallback);
                  }
                } else if (!fallback) {
                    if (onError) onError('Tap failed to resolve a position. Try a larger or brighter surface.');
                    if (Constants?.expoConfig?.extra?.DEBUG_AR) {
                      console.warn('[AR] Quad Tap Vertical: no position/fallback');
                    }
                  }
                  return;
                }
                const canTap = planeTapAllowed || confidentPlane;
                if (pos && model && canTap) {
                  const adjusted = computeFlushPosition(pos);
                  setModelPosition(adjusted);
                  setHintVisible(false);
                  if (Constants?.expoConfig?.extra?.DEBUG_AR) {
                    console.log('[AR] Quad Tap Vertical pos=', pos);
                  }
                }
              }}
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
              scale={model.defaultScale}
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
