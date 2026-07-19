import React from 'react';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamInfoBlockCopy} from './kolam-info-block-copy';
import type {KolamInfoBlockProps} from './kolam-info-block-types';

export type {KolamInfoBlockProps} from './kolam-info-block-types';

export function KolamInfoBlock(props: KolamInfoBlockProps) {
  return (
    <KolamCardFrame variant="info">
      <KolamInfoBlockCopy {...props} />
    </KolamCardFrame>
  );
}
