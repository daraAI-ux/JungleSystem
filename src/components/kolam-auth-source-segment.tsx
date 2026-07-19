import React from 'react';
import type {AuthSource, AuthSourceDescriptor} from '../domain/auth';
import {KolamChoiceSegment} from './kolam-choice-segment';

export function KolamAuthSourceSegment({
  selectedSource,
  source,
  onAuthSourceChange,
}: {
  selectedSource: AuthSource;
  source: AuthSourceDescriptor;
  onAuthSourceChange: (source: AuthSource) => void;
}) {
  return (
    <KolamChoiceSegment
      id={source.id}
      label={source.label}
      selectedId={selectedSource}
      onSelect={onAuthSourceChange}
    />
  );
}
