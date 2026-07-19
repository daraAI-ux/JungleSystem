import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCopyStack} from './kolam-copy-stack';
import {DASHBOARD_RAIL_VISUAL} from './kolam-dashboard-rail-visual';

export function KolamDashboardProductThumb({
  label,
  url,
}: {
  label: string;
  url: string | null;
}) {
  return (
    <View
      accessibilityLabel={`${label} thumbnail`}
      style={styles.thumb}
      testID="dashboard-product-thumb">
      {url ? (
        <Image
          accessibilityIgnoresInvertColors
          source={{uri: url}}
          style={styles.image}
        />
      ) : (
        <KolamCopyStack
          items={[
            {
              id: 'placeholder',
              text: DASHBOARD_RAIL_VISUAL.text.thumbPlaceholderText,
              style: styles.placeholder,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  thumb: {
    overflow: 'hidden',
    width: DASHBOARD_RAIL_VISUAL.layout.thumbSize,
    height: DASHBOARD_RAIL_VISUAL.layout.thumbSize,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: DASHBOARD_RAIL_VISUAL.layout.thumbRadius,
    borderColor: DASHBOARD_RAIL_VISUAL.layout.thumbBorderColor,
    borderWidth: DASHBOARD_RAIL_VISUAL.layout.thumbBorderWidth,
    backgroundColor: DASHBOARD_RAIL_VISUAL.layout.thumbBackgroundColor,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_RAIL_VISUAL.text.thumbPlaceholderFontSize,
  },
});
