import React, { useEffect, useRef } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Text from '../atoms/Text';
import { theme } from '../tokens/theme';

type LogoutModalProps = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const LogoutModal: React.FC<LogoutModalProps> = ({ visible, onConfirm, onCancel }) => {
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(scale, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    } else {
      scale.setValue(0.96);
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <Text variant="subtitle" weight="bold" style={styles.title}>Log out?</Text>
          <Text variant="body" style={styles.message}>You will be signed out of your account.</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.confirmBtn]} activeOpacity={0.9} onPress={onConfirm}>
              <Text variant="body" weight="bold" style={styles.confirmText}>Log out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} activeOpacity={0.85} onPress={onCancel}>
              <Text variant="body" weight="bold" style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: '#F4F7FB',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e3ebfb',
    paddingHorizontal: 22,
    paddingVertical: 22,
  },
  title: { color: '#3f60a0', textAlign: 'center', marginBottom: 6, fontSize: 24, fontWeight: '800' },
  message: { color: theme.colors.subtleText, textAlign: 'center', fontSize: 14, lineHeight: 20, marginBottom: 12 },
  actions: {
    marginTop: 10,
    flexDirection: 'column',
  },
  btn: {
    alignSelf: 'stretch',
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtn: {
    backgroundColor: '#3f60a0',
    borderColor: '#3f60a0',
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    borderColor: '#6286cb',
    marginTop: 10,
  },
  confirmText: { color: theme.colors.secondaryBg, textAlign: 'center', fontSize: 16, fontWeight: '700' },
  cancelText: { color: '#3f60a0', textAlign: 'center', fontSize: 16, fontWeight: '700' },
});

export default LogoutModal;
