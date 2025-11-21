

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, Modal, SafeAreaView, TouchableWithoutFeedback, Animated, Easing, Dimensions, Pressable, TextInput } from 'react-native';
// Full-screen modal picker replacing bottom sheet
import { ModelPickerModalProps } from '../types/models';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../ui/tokens/theme';

const ModelPickerModal = ({ isVisible, models, onSelectModel, onClose }: ModelPickerModalProps) => {
  const SHEET_HEIGHT = Math.round(Dimensions.get('window').height * 0.5);
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT + 24)).current;

  const [query, setQuery] = useState('');

  const handleModelSelect = (model: any) => {
    onSelectModel(model);
    onClose();
  };

  const animateIn = () => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const animateOutAndClose = () => {
    Animated.timing(translateY, {
      toValue: SHEET_HEIGHT + 24,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onClose();
    });
  };

  useEffect(() => {
    if (isVisible) {
      translateY.setValue(SHEET_HEIGHT + 24);
      animateIn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const filteredModels = useMemo(() => {
    const base = models.filter(
      (m) => m?.id !== 'heart' && String(m?.name ?? '').toLowerCase() !== 'human heart'
    );
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((m) => String(m?.name ?? '').toLowerCase().includes(q));
  }, [models, query]);

  const [searchFocused, setSearchFocused] = useState(false);

  const ModalSearchBar = () => (
    <View
      style={[
        styles.searchContainer,
        searchFocused ? styles.searchFocused : null,
      ]}
    >
      <Ionicons name="search-outline" size={18} color="#FFFFFF" style={styles.searchIcon} />
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search models..."
        placeholderTextColor="rgba(255,255,255,0.6)"
        style={styles.searchInput}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
      />
    </View>
  );

  const renderModelItem = ({ item }: { item: any }) => (
    <Pressable
      style={({ pressed, hovered }) => [
        styles.modelItem,
        pressed && styles.modelItemPressed,
        hovered && styles.modelItemHovered,
      ]}
      onPress={() => handleModelSelect(item)}
    >
      <View style={styles.leftAccent} />
      <Ionicons name="cube-outline" size={18} style={styles.itemIcon} />
      <Text style={styles.modelName}>{item.name}</Text>
    </Pressable>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={animateOutAndClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={animateOutAndClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <Animated.View style={[styles.sheet, { transform: [{ translateY }], height: SHEET_HEIGHT }] }>
          <SafeAreaView style={styles.sheetContent}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.title}>Select a 3D Model</Text>
              <Pressable onPress={animateOutAndClose} style={({ pressed }) => [styles.headerClose, pressed && styles.headerClosePressed]}>
                <Ionicons name="close" size={18} color={theme.colors.brandBlack} />
              </Pressable>
            </View>
            <View style={styles.container}>
              <ModalSearchBar />
              <FlatList
                data={filteredModels}
                renderItem={renderModelItem}
                keyExtractor={(item) => item.id}
                numColumns={1}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No models found</Text>
                  </View>
                )}
              />
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    // Frosted, semi-transparent dark overlay
    backgroundColor: 'rgba(10, 12, 16, 0.6)',
  },
  sheet: {
    backgroundColor: '#181D23', // dark card background
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    // Gentle glow/shadow for premium separation
    shadowOffset: { width: 0, height: -2 },
  },
  sheetContent: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2A2F38',
    marginTop: 8,
    marginBottom: 6,
  },
  // Local dark search bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2F38',
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#23272F',
    marginBottom: 14,
  },
  searchFocused: {
    borderColor: theme.colors.brandYellow,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2A2F38',
  },
  headerClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.brandYellow,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  headerClosePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'left',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  listContent: {
    paddingBottom: 28,
    paddingHorizontal: 8,
  },
  modelItem: {
    marginVertical: 6,
    alignItems: 'center',
    minHeight: 56,
    backgroundColor: '#22242B',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2A2F38',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  modelItemHovered: {
    elevation: 6,
    shadowOpacity: 0.16,
    shadowRadius: 10,
  },
  modelItemPressed: {
    backgroundColor: 'rgba(255, 204, 0, 0.08)', // soft yellow fill
    borderColor: theme.colors.brandYellow,
  },
  leftAccent: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: theme.colors.brandYellow,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    marginRight: 12,
  },
  modelThumbnail: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '90%',
    height: '90%',
  },
  modelName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  emptyState: {
    marginTop: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#A3A3A3',
  },
  itemIcon: {
    marginRight: 10,
    color: theme.colors.brandYellow,
  },
});

export default ModelPickerModal;
