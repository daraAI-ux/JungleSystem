import React from 'react';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamChevronIcon} from './kolam-chevron-icon';

export interface KolamArrowIconProps {
  color?: string;
}

export function KolamArrowIcon({color = V.colors.mutedFg}: KolamArrowIconProps) {
  return <KolamChevronIcon color={color} direction="right" size="dashboard-sm" />;
}
