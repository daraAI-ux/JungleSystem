import React from 'react';
import type {RuntimeIdentityItem} from '../domain/runtime-identity';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamRuntimeIdentityCardHeader} from './kolam-runtime-identity-card-header';
import {runtimeIdentityStyles as styles} from './kolam-runtime-identity-styles';

export function KolamRuntimeIdentityCard({
  item,
}: {
  item: RuntimeIdentityItem;
}) {
  return (
    <KolamCardFrame variant="runtimeIdentityItem">
      <KolamRuntimeIdentityCardHeader item={item} />
      <KolamCopyStack
        items={[
          {id: 'value', text: item.value, style: styles.runtimeIdentityValue},
          {
            id: 'detail',
            text: item.detail,
            style: styles.runtimeIdentityDetail,
          },
        ]}
      />
    </KolamCardFrame>
  );
}