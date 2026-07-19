import React from 'react';
import {actionFrameStyles as styles} from './kolam-action-frame-styles';
import {KolamCopyStack} from './kolam-copy-stack';

export type KolamTextActionLabelVariant = 'default' | 'primaryUnderline';

export function KolamTextActionLabel({
  label,
  variant = 'default',
}: {
  label: string;
  variant?: KolamTextActionLabelVariant;
}) {
  return (
    <KolamCopyStack
      items={[
        {
          id: 'label',
          text: label,
          style: [
            styles.textLabel,
            variant === 'primaryUnderline' &&
              styles.textLabelPrimaryUnderline,
          ],
        },
      ]}
    />
  );
}
