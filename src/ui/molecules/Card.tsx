import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../tokens/colors';

interface Props {
  style?: ViewStyle;
  children?: React.ReactNode;
}

const Card: React.FC<Props> = ({ style, children }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
});

export default Card;