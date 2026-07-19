import React from 'react';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {KolamInfoListCopy} from './kolam-info-list-copy';
import {KolamInfoListMeta} from './kolam-info-list-meta';
import {
  type KolamInfoListRowProps,
  type KolamInfoListRowVariant,
} from './kolam-info-list-row-types';
import {infoListRowStyles as styles} from './kolam-info-list-row-styles';

export type {KolamInfoListRowProps, KolamInfoListRowVariant};

export function KolamInfoListRow({
  detail,
  description,
  metaDetail,
  metaLabel,
  onPress,
  selected = false,
  title,
  variant = 'command',
}: KolamInfoListRowProps) {
  const isRoute = variant === 'route';

  return (
    <KolamInteractionFrame
      accessibilityState={{selected}}
      onPress={onPress}
      style={[styles.row, isRoute && styles.routeRow, selected && styles.selected]}>
      <KolamInfoListCopy
        detail={detail}
        description={description}
        title={title}
        variant={variant}
      />
      <KolamInfoListMeta
        metaDetail={metaDetail}
        metaLabel={metaLabel}
        variant={variant}
      />
    </KolamInteractionFrame>
  );
}

