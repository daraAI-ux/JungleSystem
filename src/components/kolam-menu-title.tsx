import React from 'react';
import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamHeaderFrame} from './kolam-header-frame';

export function KolamMenuTitle({
  filterByAccess,
  itemCount,
}: {
  filterByAccess: boolean;
  itemCount: number;
}) {
  return (
    <KolamHeaderFrame variant="menuTitle">
      <KolamCopyStack
        items={[
          {id: 'title', text: 'Kolam Menu', style: styles.navGroupLabel},
        ]}
      />
      {filterByAccess ? (
        <KolamCopyStack
          items={[
            {
              id: 'count',
              text: itemCount,
              style: styles.kolamMenuAccessBadge,
            },
          ]}
        />
      ) : null}
    </KolamHeaderFrame>
  );
}

const styles = StyleSheet.create({
  navGroupLabel: {
    marginBottom: 6,
    paddingHorizontal: 12,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  kolamMenuAccessBadge: {
    overflow: 'hidden',
    minWidth: 22,
    marginRight: 8,
    paddingHorizontal: V.control.badgePaddingX,
    paddingVertical: V.control.badgePaddingY,
    borderRadius: V.control.badgeRadius,
    color: V.colors.primary,
    backgroundColor: V.colors.successSoft,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
});