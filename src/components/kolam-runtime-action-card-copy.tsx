import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import type {RuntimeAction} from '../domain/runtime-actions';
import {runtimeActionStyles as styles} from './kolam-runtime-action-styles';

export function KolamRuntimeActionCardCopy({
  action,
}: {
  action: RuntimeAction;
}) {
  return (
    <KolamCopyStack
      items={[
        {
          id: 'description',
          text: action.description,
          style: styles.runtimeActionDescription,
        },
        {
          id: 'contract',
          text: action.sourceContract,
          style: styles.runtimeActionContract,
        },
      ]}
    />
  );
}
