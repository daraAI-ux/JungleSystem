import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  getKolamNavigationDisclosure,
  type KolamNavigationItem,
} from '../domain/kolam-navigation';
import { KolamMappedList } from './kolam-mapped-list';
import { KolamMenuItemGroupLabel } from './kolam-menu-item-group-label';
import { KolamMenuItem } from './kolam-menu-item-row';

export function KolamMenuSectionItems({
  activeRoute,
  items,
  onSelectItem,
}: {
  activeRoute?: string | null;
  items: ReturnType<typeof getKolamNavigationDisclosure>['visibleItems'];
  onSelectItem: (item: KolamNavigationItem) => void;
}) {
  return (
    <KolamMappedList
      items={getMenuItemGroups(items)}
      getKey={group => group.id}
      renderItem={group => (
        <View style={group.label ? styles.group : styles.rootGroup}>
          {group.label ? <KolamMenuItemGroupLabel label={group.label} /> : null}
          <KolamMappedList
            items={group.items}
            getKey={item => item.route}
            renderItem={item => (
              <KolamMenuItem
                active={isMenuItemActive(item, activeRoute)}
                grouped={Boolean(group.label)}
                label={item.label}
                onPress={() => onSelectItem(item)}
              />
            )}
          />
        </View>
      )}
    />
  );
}

function getMenuItemGroups(items: KolamNavigationItem[]) {
  return items.reduce<
    Array<{ id: string; label: string | null; items: KolamNavigationItem[] }>
  >((groups, item) => {
    const label = item.group ?? null;
    const id = label ? `group:${label}` : `item:${item.route}`;
    const lastGroup = groups[groups.length - 1];

    if (lastGroup?.label === label) {
      lastGroup.items.push(item);
      return groups;
    }

    groups.push({ id, label, items: [item] });
    return groups;
  }, []);
}

function isMenuItemActive(
  item: KolamNavigationItem,
  activeRoute?: string | null,
) {
  if (!activeRoute) {
    return false;
  }

  const routePath = activeRoute.split('?')[0];

  return (
    routePath === item.route ||
    (item.route !== '/' && routePath.startsWith(`${item.route}/`))
  );
}

const styles = StyleSheet.create({
  rootGroup: {
    gap: 1,
  },
  group: {
    gap: 1,
    marginTop: 2,
  },
});
