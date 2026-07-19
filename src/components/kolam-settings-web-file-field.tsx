import React from 'react';
import {KolamActionControlButton} from './kolam-action-control-button';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamInlineFrame} from './kolam-inline-frame';

export function KolamSettingsWebFileField({value}: {value: string}) {
  return (
    <KolamInlineFrame variant="settingsWebLogoRow">
      <KolamCardFrame variant="settingsWebLogoPreview">{null}</KolamCardFrame>
      <KolamActionControlButton label={value} intent="outline" />
    </KolamInlineFrame>
  );
}