import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import type {ReadinessCheck} from '../domain/readiness';
import {readinessStyles as styles} from './kolam-readiness-styles';

export function KolamReadinessCopy({check}: {check: ReadinessCheck}) {
  return (
    <KolamCopyStack
      items={[
        {id: 'label', text: check.label, style: styles.label},
        {id: 'detail', text: check.detail, style: styles.detail},
        {id: 'evidence', text: check.evidence, style: styles.evidence},
      ]}
    />
  );
}
