import React from 'react';
import type {ReadinessCheck} from '../domain/readiness';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamReadinessCopy} from './kolam-readiness-copy';
import {KolamReadinessStatusBadge} from './kolam-readiness-status-badge';

export function KolamReadinessItem({check}: {check: ReadinessCheck}) {
  return (
    <KolamCardFrame variant="readiness">
      <KolamReadinessStatusBadge check={check} />
      <KolamReadinessCopy check={check} />
    </KolamCardFrame>
  );
}
