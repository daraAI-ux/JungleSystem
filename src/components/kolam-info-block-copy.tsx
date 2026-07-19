import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {infoBlockStyles as styles} from './kolam-info-block-styles';
import type {KolamInfoBlockProps} from './kolam-info-block-types';

export function KolamInfoBlockCopy({
  label,
  primary,
  secondary,
}: KolamInfoBlockProps) {
  return (
    <KolamCopyStack
      items={[
        {id: 'label', text: label, style: styles.label},
        {id: 'primary', text: primary, style: styles.primary},
        {id: 'secondary', text: secondary, style: styles.secondary},
      ]}
    />
  );
}
