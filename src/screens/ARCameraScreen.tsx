import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ViroARSceneNavigator } from '@viro-community/react-viro';
import ARScene from '../scenes/ARScene';
import ModelPickerModal from '../components/ModelPickerModal';
import useModelAssets from '../hooks/useModelAssets';
import { Model3D, ARSceneState } from '../types/models';

export default function ARCameraScreen() {
  const { models, loading, error } = useModelAssets();
  const [isModelPickerVisible, setIsModelPickerVisible] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<Model3D | undefined>(undefined);
  const [arInitialized, setArInitialized] = useState<boolean>(false);
  const [arState, setArState] = useState<ARSceneState>({
    isTracking: false,
    planeDetected: false,
    anchorFound: false,
  });
  const [overlayOpacity] = useState(new Animated.Value(1));

  const handleAnchorFound = () => {
    setArState((prev) => ({ ...prev, anchorFound: true }));
  };

  const handleSelectModel = (model: Model3D) => {
    setSelectedModel(model);
    setIsModelPickerVisible(false);
  };

  const handleShowModelPicker = () => setIsModelPickerVisible(true);
  const handleCloseModelPicker = () => setIsModelPickerVisible(false);
  const handleRemoveModel = () => {
    setSelectedModel(undefined);
    setArState((prev) => ({ ...prev, anchorFound: false }));
  };
  const handleTrackingUpdated = (state: ARSceneState) => {
    setArState(state);
    if (!arInitialized && state.isTracking) setArInitialized(true);
  };
  const handleARError = (err: string) => {
    const msg = String(err ?? '').toLowerCase();
    // Ignore benign abort errors often triggered during dev reloads
    if (msg.includes('abort')) {
      return;
    }
    console.error('AR Error:', err);
  };

  // Fade overlay out smoothly when model is placed
  useEffect(() => {
    if (arState.anchorFound) {
      Animated.timing(overlayOpacity, { toValue: 0, duration: 450, useNativeDriver: true }).start();
    } else {
      Animated.timing(overlayOpacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    }
  }, [arState.anchorFound]);

  const statusText = (() => {
    if (!arState.anchorFound) {
      if (!arState.isTracking) return 'Wait, detecting the surface…';
      if (arState.isTracking && !arState.planeDetected) return 'AR Ready';
      if (arState.isTracking && arState.planeDetected) return 'Great! Surface detected, tap to place the model';
    }
    return '';
  })();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading 3D Models...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading models: {error.message}</Text>
      </View>
    );
  }

  return (
      <View style={styles.container}>
        <ViroARSceneNavigator
          initialScene={{ scene: ARScene }}
          viroAppProps={{
            model: selectedModel,
            onClose: handleRemoveModel,
            onShowModelPicker: handleShowModelPicker,
            onAnchorFound: handleAnchorFound,
            onTrackingUpdated: handleTrackingUpdated,
            onError: handleARError,
          }}
          style={[StyleSheet.absoluteFill, styles.arScene]}
        />

        {/* Allow taps to pass through except on interactive children */}
        <View style={styles.overlay} pointerEvents="box-none">
          {!isModelPickerVisible && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleShowModelPicker}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={50} color="#ffffff" />
            </TouchableOpacity>
          )}

          {selectedModel && arState.anchorFound && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleRemoveModel}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle" size={40} color="#ffffff" />
            </TouchableOpacity>
          )}

          <ModelPickerModal
            isVisible={isModelPickerVisible}
            models={models}
            onSelectModel={handleSelectModel}
            onClose={handleCloseModelPicker}
          />

          {!arState.anchorFound && !!statusText && (
            <Animated.View style={[styles.statusOverlay, { opacity: overlayOpacity }]} pointerEvents="none">
              <Text style={styles.statusOverlayText}>{statusText}</Text>
            </Animated.View>
          )}
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  arScene: { zIndex: 1 },
  overlay: {
    // StyleSheet.absoluteFillObject already sets position: 'absolute'
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    elevation: 10,
    pointerEvents: 'auto',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 10, fontSize: 16 },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center' },
  addButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 5,
    zIndex: 3,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 5,
    zIndex: 3,
  },
  statusOverlay: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 3,
  },
  statusOverlayText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: '88%',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    overflow: 'hidden',
  },
});
