import React, { useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
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
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.arScene]}
        />

        <View style={styles.overlay} pointerEvents="auto">
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

          <View style={styles.trackingIndicator} pointerEvents="none">
            <Text style={styles.trackingText}>
              {arState.isTracking ? 'AR Ready' : 'Initializing AR…'}
            </Text>
          </View>
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
  trackingText: { color: '#ffffff', fontSize: 12 },
});