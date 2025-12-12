import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../ui/tokens/colors';
import { Typography } from '../ui/tokens/typography';
import { theme } from '../ui/tokens/theme';
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
  const [hasActiveModel, setHasActiveModel] = useState<boolean>(false);
  const [arState, setArState] = useState<ARSceneState>({
    isTracking: false,
    planeDetected: false,
    anchorFound: false,
  });
  const [overlayOpacity] = useState(new Animated.Value(1));
  const [showTip, setShowTip] = useState<boolean>(true);

  // Show tip for 2 seconds on mount, then auto-hide
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

  const handleSelectModel = (model: Model3D) => {
    if (hasActiveModel) {
      // Ignore selection while a model is active
      return;
    }
    setSelectedModel(model);
    setIsModelPickerVisible(false);
  };

  const handleShowModelPicker = () => {
    if (hasActiveModel) return;
    setIsModelPickerVisible(true);
  };
  const handleCloseModelPicker = () => setIsModelPickerVisible(false);
  const handleRemoveModel = () => {
    setSelectedModel(undefined);
    setArState((prev) => ({ ...prev, anchorFound: false }));
    setHasActiveModel(false);
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
      return 'Point your camera to a flat surface to detect a plane, then choose a model to place on it.';
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

          {showTip && (
            <View style={styles.tipBanner} pointerEvents="none">
              <Text style={styles.tipBannerText}>
                Point your camera to a flat surface to detect a plane, then choose a model to place on it.
              </Text>
            </View>
          )}

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
  statusOverlay: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 3,
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
  statusOverlayText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: Typography.lineHeight.sm,
    textAlign: 'center',
    maxWidth: '92%',
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    textShadowColor: theme.colors.shadow,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
