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
  const groups = getMenuItemGroups(items);
  const [expandedGroups, setExpandedGroups] = React.useState<
    Record<string, boolean>
  >({});

  return (
    <KolamMappedList
      items={groups}
      getKey={group => group.id}
      renderItem={group => {
        if (!group.label) {
          return (
            <View style={styles.rootGroup}>
              <KolamMappedList
                items={group.items}
                getKey={item => item.route}
                renderItem={item => (
                  <KolamMenuItem
                    active={isMenuItemActive(item, activeRoute)}
                    label={item.label}
                    moduleIcon={item.moduleIcon}
                    onPress={() => onSelectItem(item)}
                  />
                )}
              />
            </View>
          );
        }

        const hasActiveChild = group.items.some(item =>
          isMenuItemActive(item, activeRoute),
        );
        const expanded =
          hasActiveChild || Boolean(expandedGroups[group.label]);

        return (
          <View style={styles.group}>
            <KolamMenuItemGroupLabel
              expanded={expanded}
              label={group.label}
              onPress={() => {
                if (hasActiveChild) {
                  return;
                }
                setExpandedGroups(current => ({
                  ...current,
                  [group.label!]: !current[group.label!],
                }));
              }}
            />
            {expanded ? (
              <KolamMappedList
                items={group.items}
                getKey={item => item.route}
                renderItem={item => (
                  <KolamMenuItem
                    active={isMenuItemActive(item, activeRoute)}
                    grouped
                    label={item.label}
                    moduleIcon={item.moduleIcon}
                    onPress={() => onSelectItem(item)}
                  />
                )}
              />
            ) : null}
          </View>
        );
      }}
    />
  );
}

export function getMenuItemGroups(items: KolamNavigationItem[]) {
  return items.reduce<
    Array<{ id: string; label: string | null; items: KolamNavigationItem[] }>
  >((groups, item) => {
    const label = item.group ?? null;
    const lastGroup = groups[groups.length - 1];

    if (label && lastGroup?.label === label) {
      lastGroup.items.push(item);
      return groups;
    }

    // Include first route so non-adjacent same labels stay unique React keys.
    const id = label
      ? `group:${label}:${item.route}`
      : `item:${item.route}`;
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
