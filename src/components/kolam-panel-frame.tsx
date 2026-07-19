import React from 'react';
import {View} from 'react-native';
import {getPanelFrameStyle} from './kolam-panel-frame-style';
import type {KolamPanelFrameProps} from './kolam-panel-frame-types';

export type {
  KolamPanelFrameProps,
  KolamPanelFrameVariant,
} from './kolam-panel-frame-types';

export function KolamPanelFrame({
  accessibilityLabel,
  children,
  style,
  variant,
}: KolamPanelFrameProps) {
  const frameStyle = getPanelFrameStyle(variant);

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={style ? [frameStyle, style] : frameStyle}>
      {children}
    </View>
  );
}