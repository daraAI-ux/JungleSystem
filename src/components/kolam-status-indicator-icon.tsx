import React from 'react';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCheckmarkIcon} from './kolam-checkmark-icon';
import {
  KolamStatusGlyph,
  type KolamStatusGlyphKind,
} from './kolam-status-glyph';

export type KolamStatusIndicatorIconKind = 'check' | KolamStatusGlyphKind;

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

  return <KolamStatusGlyph color={color} kind={kind} />;
}
