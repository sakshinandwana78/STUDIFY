import React from 'react';
import { ViewStyle } from 'react-native';
import Card from './Card';
import Text from '../atoms/Text';
import { Colors } from '../tokens/colors';

interface Props {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
  children?: React.ReactNode;
}

const SectionCard: React.FC<Props> = ({ title, subtitle, style, children }) => {
  return (
    <Card style={style}>
      <Text variant="subtitle" weight="bold">{title}</Text>
      {subtitle ? (
        <Text variant="body" color={Colors.textSecondary} style={{ marginTop: 4 }}>{subtitle}</Text>
      ) : null}
      {children}
    </Card>
  );
};

export default SectionCard;