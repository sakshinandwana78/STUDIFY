
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
      diffuseColor: '#FFFFFF',
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
  const [modelPlaced, setModelPlaced] = useState<boolean>(false);
  const arNodeRef = useRef(null);
  const arSceneRef = useRef<any>(null);
  const [modelPosition, setModelPosition] = useState<[number, number, number] | null>(null);
  const [hintVisible, setHintVisible] = useState<boolean>(true);
  const screen = Dimensions.get('window');
  const autoAnchorRequestedRef = useRef<boolean>(false);

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
  const handlePlaneDetected = () => {
    setPlaneDetected(true);
    setHintVisible(true);
  };

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

  // Auto-place: when a model is selected, compute a fixed world position
  // directly in front of the camera and place the node there.
  useEffect(() => {
    const placeInFrontOfCamera = async () => {
      if (!arSceneRef.current) return;
      try {
        const orientation: any = await arSceneRef.current.getCameraOrientationAsync();
        const pos = orientation.position as [number, number, number];
        const fwd = orientation.forward as [number, number, number];
        const distance = model?.defaultPlacementMeters ?? 1.0; // meters in front of the camera
        const target: [number, number, number] = [
          pos[0] + fwd[0] * distance,
          pos[1] + fwd[1] * distance,
          pos[2] + fwd[2] * distance,
        ];
        setModelPosition(target);
      } catch (e) {
        // Fallback: place forward in camera space using desired distance
        const distance = model?.defaultPlacementMeters ?? 1.0;
        setModelPosition([0, 0, -distance]);
      }
    };

    // Try to place on the nearest detected plane at screen center.
    const tryPlaceOnNearestPlane = async (): Promise<boolean> => {
      const scene = arSceneRef.current as any;
      if (!scene || !scene.performARHitTestWithPoint) return false;
      try {
        const x = Math.round(screen.width / 2);
        const y = Math.round(screen.height / 2);
        const results = await scene.performARHitTestWithPoint(x, y);
        if (Array.isArray(results)) {
          const preferred = results.find((r: any) =>
            String(r?.type || '').includes('ExistingPlaneUsingExtent') ||
            String(r?.type || '').includes('ExistingPlane') ||
            String(r?.type || '').includes('EstimatedHorizontalPlane') ||
            String(r?.type || '').includes('EstimatedVerticalPlane')
          );
          const hit = preferred || results[0];
          const pos = hit?.position as [number, number, number] | undefined;
          if (pos) {
            setModelPosition(pos);
            setPlaneDetected(true);
            setHintVisible(false);
            return true;
          }
        }
      } catch (err) {
        if (Constants?.expoConfig?.extra?.DEBUG_AR) {
          console.warn('[AR] hitTest failed:', err);
        }
      }
      return false;
    };

    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

    if (model) {
      // Place temporarily in front of camera so user sees immediate feedback
      placeInFrontOfCamera();
      autoAnchorRequestedRef.current = true;
      // Then, in the background, try to anchor to the nearest plane
      (async () => {
        // Up to ~3 seconds of attempts, then keep fallback
        const maxAttempts = 10;
        for (let i = 0; i < maxAttempts; i++) {
          const placed = await tryPlaceOnNearestPlane();
          if (placed) break;
          await sleep(300);
        }
      })();
    } else {
      // Model cleared
      setModelPlaced(false);
      setModelPosition(null);
      autoAnchorRequestedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

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

        {/* Plane detection indicator & tap-to-place (preferences: detected plane if found) */}
        {/* Horizontal plane indicator */}
        <ViroARPlane
          alignment="Horizontal"
          minWidth={0.1}
          minHeight={0.1}
          onAnchorFound={(e: any) => {
            handlePlaneDetected();
            if (model && autoAnchorRequestedRef.current) {
              const pos = getPositionFromAnchorEvent(e);
              if (pos) {
                setModelPosition(pos);
                autoAnchorRequestedRef.current = false;
                setHintVisible(false);
              }
            }
          }}
          onAnchorUpdated={(e: any) => {
            handlePlaneDetected();
            if (model && autoAnchorRequestedRef.current) {
              const pos = getPositionFromAnchorEvent(e);
              if (pos) {
                setModelPosition(pos);
                autoAnchorRequestedRef.current = false;
                setHintVisible(false);
              }
            }
          }}
          onAnchorRemoved={() => setPlaneDetected(false)}
        >
          <ViroNode
            onClick={(event: any) => {
              const pos = event?.nativeEvent?.position as [number, number, number] | undefined;
              if (pos && model) {
                setModelPosition(pos);
                setHintVisible(false);
              }
            }}
          >
            <ViroQuad
              rotation={[-90, 0, 0]}
              width={0.6}
              height={0.6}
              materials={["planeIndicator"]}
              opacity={planeDetected ? 0.18 : 0.0}
            />
          </ViroNode>
        </ViroARPlane>

        {/* Vertical plane indicator */}
        <ViroARPlane
          alignment="Vertical"
          minWidth={0.1}
          minHeight={0.1}
          onAnchorFound={(e: any) => {
            handlePlaneDetected();
            if (model && autoAnchorRequestedRef.current) {
              const pos = getPositionFromAnchorEvent(e);
              if (pos) {
                setModelPosition(pos);
                autoAnchorRequestedRef.current = false;
                setHintVisible(false);
              }
            }
          }}
          onAnchorUpdated={(e: any) => {
            handlePlaneDetected();
            if (model && autoAnchorRequestedRef.current) {
              const pos = getPositionFromAnchorEvent(e);
              if (pos) {
                setModelPosition(pos);
                autoAnchorRequestedRef.current = false;
                setHintVisible(false);
              }
            }
          }}
          onAnchorRemoved={() => setPlaneDetected(false)}
        >
          <ViroNode
            onClick={(event: any) => {
              const pos = event?.nativeEvent?.position as [number, number, number] | undefined;
              if (pos && model) {
                setModelPosition(pos);
                setHintVisible(false);
              }
            }}
          >
            <ViroQuad
              rotation={[0, 0, 0]}
              width={0.6}
              height={0.6}
              materials={["planeIndicator"]}
              opacity={planeDetected ? 0.18 : 0.0}
            />
          </ViroNode>
        </ViroARPlane>

        {/* Auto-placed node: fixed in world coordinates in front of camera */}
        {model && (
          <ViroNode
            ref={arNodeRef}
            position={modelPosition ?? [0, 0, -1]}
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
            text={planeDetected ? 'Surface detected' : 'AR Ready'}
            position={[0, 0.25, -1]}
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
        {trackingState === 'TRACKING_NORMAL' && !planeDetected && (
          <ViroText
            text="Scanning for surfaces..."
            position={[0, 0.05, -1]}
            style={styles.hintText}
            width={2}
            height={2}
          />
        )}
        {planeDetected && hintVisible && (
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

