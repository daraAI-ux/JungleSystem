import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {quickSearchStyles as styles} from './kolam-quick-search-styles';

export function KolamQuickSearchShortcut({
  collapsed,
  shortcutLabel,
}: {
  collapsed: boolean;
  shortcutLabel: string;
}) {
  if (collapsed) {
    return null;
  }

  return (
    <KolamCopyStack
      items={[{id: 'shortcut', text: shortcutLabel, style: styles.key}]}
    />
  );
}
