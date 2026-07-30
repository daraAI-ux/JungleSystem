import React from 'react';
import {KolamCheckmarkIcon} from './kolam-checkmark-icon';
import {KolamChevronIcon} from './kolam-chevron-icon';
import {
  KolamStatusGlyph,
  type KolamStatusGlyphKind,
} from './kolam-status-glyph';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export type KolamStatusIndicatorIconKind =
  | 'check'
  | 'triangle-left'
  | KolamStatusGlyphKind;

export interface KolamStatusIndicatorIconProps {
  color?: string;
  kind: KolamStatusIndicatorIconKind;
}

export function KolamStatusIndicatorIcon({
  color = V.colors.mutedFg,
  kind,
}: KolamStatusIndicatorIconProps) {
  if (kind === 'check') {
    return <KolamCheckmarkIcon color={color} />;
  }

  if (kind === 'triangle-left') {
    return <KolamChevronIcon color={color} direction="left" size="menu-sm" />;
  }

  return <KolamStatusGlyph color={color} kind={kind} />;
}
