import React from 'react';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {TopNavUserMenuItem} from '../domain/top-nav';
import {KolamChevronIcon} from './kolam-chevron-icon';

export function KolamUserMenuChevron({item}: {item: TopNavUserMenuItem}) {
  if (item.trailingIconKind !== 'chevron') {
    return null;
  }

  return (
    <KolamChevronIcon
      color={item.id === 'logout' ? V.colors.danger : V.colors.mutedFg}
      size="user"
    />
  );
}
