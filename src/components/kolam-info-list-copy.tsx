import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import type {KolamInfoListRowVariant} from './kolam-info-list-row-types';
import {infoListRowStyles as styles} from './kolam-info-list-row-styles';

export function KolamInfoListCopy({
  detail,
  description,
  title,
  variant,
}: {
  detail?: string;
  description: string;
  title: string;
  variant: KolamInfoListRowVariant;
}) {
  const isRoute = variant === 'route';

  return (
    <KolamCopyStack
      containerStyle={styles.copy}
      items={[
        {
          id: 'title',
          text: title,
          style: isRoute ? styles.routeTitle : styles.commandTitle,
        },
        {
          id: 'description',
          text: description,
          style: isRoute
            ? styles.routeDescription
            : styles.commandDescription,
        },
        ...(detail
          ? [{id: 'detail', text: detail, style: styles.routeDetail}]
          : []),
      ]}
    />
  );
}
