import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamHeaderFrame} from './kolam-header-frame';
import {KolamRuntimeIdentityClientPill} from './kolam-runtime-identity-client-pill';
import {runtimeIdentityStyles as styles} from './kolam-runtime-identity-styles';

export function KolamRuntimeIdentityHeader({meta}: {meta: string}) {
  return (
    <KolamHeaderFrame variant="runtimeIdentityStrip">
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: 'Runtime',
            style: styles.runtimeIdentityTitle,
          },
          {
            id: 'meta',
            text: meta,
            style: styles.runtimeIdentityMeta,
          },
        ]}
      />
      <KolamRuntimeIdentityClientPill />
    </KolamHeaderFrame>
  );
}