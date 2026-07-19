import React from 'react';
import type {AuthSource, AuthSourceDescriptor} from '../domain/auth';
import {KolamAuthSourceSegment} from './kolam-auth-source-segment';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';

export function KolamAuthSourcePicker({
  authSource,
  authSources,
  onAuthSourceChange,
}: {
  authSource: AuthSource;
  authSources: AuthSourceDescriptor[];
  onAuthSourceChange: (source: AuthSource) => void;
}) {
  return (
    <KolamListFrame variant="authSourcePicker">
      <KolamMappedList
        items={authSources}
        getKey={source => source.id}
        renderItem={source => (
          <KolamAuthSourceSegment
            source={source}
            selectedSource={authSource}
            onAuthSourceChange={onAuthSourceChange}
          />
        )}
      />
    </KolamListFrame>
  );
}