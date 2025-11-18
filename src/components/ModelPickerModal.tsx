

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList, Modal, SafeAreaView } from 'react-native';
// Full-screen modal picker replacing bottom sheet
import { ModelPickerModalProps } from '../types/models';

const ModelPickerModal = ({ isVisible, models, onSelectModel, onClose }: ModelPickerModalProps) => {

  const handleModelSelect = (model: any) => {
    onSelectModel(model);
    onClose();
  };

  const renderModelItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.modelItem}
      onPress={() => handleModelSelect(item)}
    >
      <View style={styles.modelThumbnail}>
        <Image
          source={item.thumbnailPath
            ? { uri: item.thumbnailPath.localUri ?? item.thumbnailPath.uri }
            : require('../../assets/icon.png')}
          style={styles.thumbnailImage}
          resizeMode="contain"
          defaultSource={require('../../assets/icon.png')}
        />
      </View>
      <Text style={styles.modelName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.fullscreen}>
        <View style={styles.header}>
          <Text style={styles.title}>Select a 3D Model</Text>
          <TouchableOpacity onPress={onClose} style={styles.headerClose}>
            <Text style={styles.headerCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.container}>
          <FlatList
            data={models}
            renderItem={renderModelItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  headerClose: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  headerCloseText: {
    fontSize: 14,
    color: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'left',
  },
  listContent: {
    paddingBottom: 24,
    paddingHorizontal: 8,
  },
  modelItem: {
    flex: 1,
    margin: 10,
    alignItems: 'center',
    minHeight: 160,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eaeaea',
    padding: 12,
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
    textAlign: 'center',
  },
});

export default ModelPickerModal;
