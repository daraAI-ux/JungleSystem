import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { KolamRowFrame } from './kolam-row-frame';

export function KolamDataTableRowFrame({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <KolamRowFrame variant="dataTable" style={style}>
      {children}
    </KolamRowFrame>
  );
}
