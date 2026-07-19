import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {View} from 'react-native';
import {KolamSearchIcon} from './kolam-search-icon';
import {quickSearchStyles as styles} from './kolam-quick-search-styles';

export function KolamQuickSearchIdentity({
  collapsed,
  label,
}: {
  collapsed: boolean;
  label: string;
}) {
  return (
    <View style={[styles.identity, collapsed && styles.identityCollapsed]}>
      <KolamSearchIcon />
      {collapsed ? null : (
        <KolamCopyStack
          items={[{id: 'label', text: label, style: styles.text}]}
        />
      )}
    </View>
  );
}
