import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {AppModule, ShellModule} from '../domain/app-shell';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamNavItem} from './kolam-nav-item';

export function KolamSidebarNavGroup({
  activeModule,
  collapsed = false,
  label,
  meta,
  modules,
  onSelect,
}: {
  activeModule: AppModule;
  collapsed?: boolean;
  label: string;
  meta?: string;
  modules: ShellModule[];
  onSelect: (module: AppModule) => void;
}) {
  return (
    <View style={[styles.navGroup, collapsed && styles.navGroupCollapsed]}>
      {collapsed ? null : (
        <KolamCopyStack
          items={[
            {id: 'label', text: label, style: styles.navGroupLabel},
            ...(meta
              ? [{id: 'meta', text: meta, style: styles.navGroupMeta}]
              : []),
          ]}
        />
      )}
      <KolamMappedList
        items={modules}
        getKey={module => module.id}
        renderItem={module => (
          <KolamNavItem
            active={activeModule === module.id}
            collapsed={collapsed}
            module={module}
            onPress={() => onSelect(module.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  navGroup: {
    marginBottom: V.layout.navSectionGap,
  },
  navGroupCollapsed: {
    alignItems: 'center',
    marginBottom: 8,
  },
  navGroupLabel: {
    paddingHorizontal: 12,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  navGroupMeta: {
    marginBottom: 6,
    paddingHorizontal: 12,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
  },
});
