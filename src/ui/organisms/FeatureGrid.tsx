import React from 'react';
import { View, StyleSheet } from 'react-native';
import FeatureCard, { FeatureCardProps } from '../molecules/FeatureCard';
import { useResponsiveColumns } from '../hooks/useResponsiveColumns';

type FeatureItem = Omit<FeatureCardProps, 'index' | 'widthPercent'>;

type Props = {
  items: FeatureItem[];
};

const FeatureGrid: React.FC<Props> = ({ items }) => {
  const columns = useResponsiveColumns();
  const widthPercent = 100 / columns - 2.5; // account for gaps

  return (
    <View style={[styles.grid]}> 
      {items.map((item, idx) => (
        <FeatureCard key={item.title} {...item} index={idx} widthPercent={widthPercent} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default FeatureGrid;