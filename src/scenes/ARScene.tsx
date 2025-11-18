
import React, { useState, useRef, useEffect, useMemo } from 'react';
import Constants from 'expo-constants';
import { StyleSheet } from 'react-native';
import {
  ViroARScene,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroSpotLight,
  Viro3DObject,
  ViroNode,
  ViroText,
  ViroTrackingStateConstants,
} from '@viro-community/react-viro';
import { ARSceneState } from '../types/models';

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

    if (model) {
      placeInFrontOfCamera();
    } else {
      // Model cleared
      setModelPlaced(false);
      setModelPosition(null);
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

        {/* Debug text removed; tracking shown via subtle UI in App overlay */}
    </ViroARScene>
  );
};

const styles = StyleSheet.create({});

export default ARScene;

