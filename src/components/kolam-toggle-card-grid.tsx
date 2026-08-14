import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

interface KolamToggleCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3;
  itemStyle?: StyleProp<ViewStyle>;
  minItemWidth?: number;
  style?: StyleProp<ViewStyle>;
}

export function KolamToggleCardGrid({
  children,
  columns = 2,
  itemStyle,
  minItemWidth = 240,
  style,
}: KolamToggleCardGridProps) {
  const items = React.Children.toArray(children);
  const basis = columns === 3 ? '30%' : '48%';

  return (
    <View style={[styles.grid, style]}>
      {items.map((child, index) => (
        <View
          key={`toggle-card-${index}`}
          style={[
            styles.item,
            {flexBasis: basis, minWidth: minItemWidth},
            itemStyle,
          ]}>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  item: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    overflow: 'hidden',
  },
});
