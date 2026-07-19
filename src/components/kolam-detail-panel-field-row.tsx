import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInlineFrame} from './kolam-inline-frame';
import {detailPanelStyles as styles} from './kolam-detail-panel-styles';
import type {KolamDetailPanelField} from './kolam-detail-panel-types';

export function KolamDetailPanelFieldRow({
  field,
}: {
  field: KolamDetailPanelField;
}) {
  return (
    <KolamInlineFrame variant="detailField">
      <KolamCopyStack
        items={[
          {id: 'label', text: field.label, style: styles.fieldLabel},
          {
            id: 'value',
            text: field.value,
            style: [styles.fieldValue, field.mono && styles.fieldValueMono],
            textProps: {selectable: true},
          },
        ]}
      />
    </KolamInlineFrame>
  );
}