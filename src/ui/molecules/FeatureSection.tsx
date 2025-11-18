import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../tokens/theme';
import FeatureCard from '../../components/FeatureCard';

type SectionItem = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  onPress: () => void;
};

type Props = {
  title: string;
  items: SectionItem[];
};

export default function FeatureSection({ title, items }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.row}>
        {items.map((item, idx) => (
          <View
            key={item.title}
            style={[styles.cell, idx % 2 === 0 ? styles.cellLeft : styles.cellRight]}
          >
            <FeatureCard
              title={item.title}
              icon={item.icon}
              accentColor={item.accentColor}
              onPress={item.onPress}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  cell: {
    width: '48%',
    marginBottom: 6,
  },
  // Pull columns slightly toward the center to reduce middle gap
  cellLeft: {
    marginRight: 4,
  },
  cellRight: {
    marginLeft: 4,
  },
});