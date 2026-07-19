import React from 'react';
import type {ReadinessCheck} from '../domain/readiness';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamReadinessItem} from './kolam-readiness-item';

export function KolamReadinessGrid({checks}: {checks: ReadinessCheck[]}) {
  return (
    <KolamListFrame>
      <KolamMappedList
        items={checks}
        getKey={check => check.id}
        renderItem={check => <KolamReadinessItem check={check} />}
      />
    </KolamListFrame>
  );
}
