import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import type {KolamInfoListRowVariant} from './kolam-info-list-row-types';
import {infoListRowStyles as styles} from './kolam-info-list-row-styles';

export function KolamInfoListMeta({
  metaDetail,
  metaLabel,
  variant,
}: {
  metaDetail: string;
  metaLabel: string;
  variant: KolamInfoListRowVariant;
}) {
  const isRoute = variant === 'route';

  return (
    <KolamCopyStack
      containerStyle={isRoute ? styles.routeMeta : styles.commandMeta}
      items={[
        {
          id: 'label',
          text: metaLabel,
          style: isRoute ? styles.routeBadge : styles.commandBadge,
        },
        {
          id: 'detail',
          text: metaDetail,
          style: isRoute ? styles.routeMetaDetail : styles.commandMetaDetail,
        },
      ]}
    />
  );
}
