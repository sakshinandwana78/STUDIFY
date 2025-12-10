import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import Text from '../atoms/Text';
import { theme } from '../tokens/theme';

type ConfirmModalProps = {
  visible: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title = 'Confirm',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {!!title && (
            <Text variant="subtitle" weight="bold" style={styles.title}>{title}</Text>
          )}
          <Text variant="body" style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} activeOpacity={0.85} onPress={onCancel}>
              <Text variant="body" weight="bold" style={styles.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.confirmBtn]} activeOpacity={0.85} onPress={onConfirm}>
              <Text variant="body" weight="bold" style={styles.confirmText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#F4F7FB',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e3ebfb',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  title: { color: '#3f60a0', textAlign: 'center', marginBottom: 8, fontSize: 18 },
  message: { color: 'rgba(98,134,203,0.95)', textAlign: 'center', lineHeight: 20 },
  actions: {
    marginTop: theme.spacing.lg,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: theme.spacing.sm,
  },
  btn: {
    alignSelf: 'stretch',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    borderColor: '#6286cb',
  },
  confirmBtn: {
    backgroundColor: '#3f60a0',
    borderColor: '#3f60a0',
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cancelText: { color: '#3f60a0', textAlign: 'center' },
  confirmText: { color: '#FFFFFF', textAlign: 'center' },
});

export default ConfirmModal;
