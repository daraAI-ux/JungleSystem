import React from 'react';
import {KolamInteractiveRowFrame} from './kolam-interactive-row-frame';
import {KolamSelectableRowCopy} from './kolam-selectable-row-copy';
import type {KolamSelectableRowProps} from './kolam-selectable-row-types';

export type {KolamSelectableRowProps} from './kolam-selectable-row-types';

export function KolamSelectableRow({
  children,
  description,
  selected = false,
  title,
  accessibilityLabel,
  onPress,
  style,
}: KolamSelectableRowProps) {
  return (
    <KolamInteractiveRowFrame
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{selected}}
      onPress={onPress}
      selected={selected}
      style={style}>
      <KolamSelectableRowCopy description={description} title={title} />
      {children}
    </KolamInteractiveRowFrame>
  );
}
