
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ViroARSceneNavigator } from '@viro-community/react-viro';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ARScene from './src/scenes/ARScene';
import ModelPickerModal from './src/components/ModelPickerModal';
import useModelAssets from './src/hooks/useModelAssets';
import { Model3D, ARSceneState } from './src/types/models';

export default function App() {
  const { models, loading, error } = useModelAssets();
  const [isModelPickerVisible, setIsModelPickerVisible] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<Model3D | undefined>(undefined);
  const [arInitialized, setArInitialized] = useState<boolean>(false);
  const [hasActiveModel, setHasActiveModel] = useState<boolean>(false);
  const [arState, setArState] = useState<ARSceneState>({
    isTracking: false,
    planeDetected: false,
    anchorFound: false,
  });
  const [showTip, setShowTip] = useState<boolean>(true);

  // Show a non-blocking tip banner on mount for ~2 seconds
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (showTip) {
      timer = setTimeout(() => setShowTip(false), 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleAnchorFound = () => {
    setArState((prev) => ({ ...prev, anchorFound: true }));
    setHasActiveModel(true);
  };

  // Handle model selection
  const handleSelectModel = (model: Model3D) => {
    if (hasActiveModel) {
      // Ignore selection while a model is active (locked)
      return;
    }
    console.log('[App] Selected model:', model.id, model.name);
    setSelectedModel(model);
    setIsModelPickerVisible(false);
  };

  // Show model picker (guarded by hasActiveModel lock)
  const handleShowModelPicker = () => {
    if (hasActiveModel) return;
    setIsModelPickerVisible(true);
  };

  // Close model picker
  const handleCloseModelPicker = () => {
    setIsModelPickerVisible(false);
  };

  // Remove selected model
  const handleRemoveModel = () => {
    setSelectedModel(undefined);
    setArState((prev) => ({ ...prev, anchorFound: false }));
    setHasActiveModel(false);
  };

  // Handle AR tracking updates
  const handleTrackingUpdated = (state: ARSceneState) => {
    setArState(state);
    if (!arInitialized && state.isTracking) {
      setArInitialized(true);
    }
  };

  // Handle AR errors
  const handleARError = (error: string) => {
    const msg = String(error ?? '').toLowerCase();
    // Ignore benign abort errors often triggered during dev reloads
    if (msg.includes('abort')) {
      return;
    }
    console.error('[App] AR Error:', error);
  };

  // If models are still loading, show loading indicator
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading 3D Models...</Text>
      </View>
    );
  }

  // If there was an error loading models, show error message
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading models: {error.message}</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
        <View style={styles.container}>
          <ViroARSceneNavigator
            initialScene={{
              scene: ARScene,
            }}
            viroAppProps={{
              model: selectedModel,
              onClose: handleRemoveModel,
              onShowModelPicker: handleShowModelPicker,
              onAnchorFound: handleAnchorFound,
              onTrackingUpdated: handleTrackingUpdated,
              onError: handleARError,
            }}
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, styles.arScene]}
          />

          <View style={styles.overlay} pointerEvents="auto">
            {showTip && (
              <View style={styles.tipBanner} pointerEvents="none">
                <Text style={styles.tipBannerText}>
                  Point your camera to a flat surface to detect a plane, then choose a model to place on it.
                </Text>
              </View>
            )}
            {!isModelPickerVisible && (
              <TouchableOpacity
                style={[styles.addButton, hasActiveModel && styles.addButtonDisabled]}
                onPress={handleShowModelPicker}
                disabled={hasActiveModel}
                pointerEvents={hasActiveModel ? 'none' : 'auto'}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={hasActiveModel ? 1 : 0.8}
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
              disabled={hasActiveModel}
            />

            {/* Small, subtle tracking indicator */}
            <View style={styles.trackingIndicator} pointerEvents="none">
              <Text style={styles.trackingText}>
                {arState.isTracking ? 'AR Ready' : 'Initializing AR…'}
              </Text>
            </View>
          </View>
        </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  arScene: {
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 5,
    zIndex: 3,
  },
  addButtonDisabled: {
    opacity: 0.55,
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
  trackingIndicator: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    zIndex: 3,
  },
  trackingText: {
    color: '#ffffff',
    fontSize: 12,
  },
  tipBanner: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 4,
  },
  tipBannerText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: '92%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    elevation: 4,
    overflow: 'hidden',
  },
});
