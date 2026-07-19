import React from 'react';
import {KolamDetailPanelBody} from './kolam-detail-panel-body';
import {KolamDetailPanelHeader} from './kolam-detail-panel-header';
import {KolamPanelFrame} from './kolam-panel-frame';
import type {KolamDetailPanelProps} from './kolam-detail-panel-types';

export type {
  KolamDetailPanelField,
  KolamDetailPanelProps,
} from './kolam-detail-panel-types';

export function KolamDetailPanel({
  closeLabel = 'Tutup',
  fields,
  onClose,
  subtitle,
  title,
  warningFlags = [],
  warningTitle = 'Suspicious flags',
}: KolamDetailPanelProps) {
  return (
    <KolamPanelFrame variant="detail">
      <KolamDetailPanelHeader
        closeLabel={closeLabel}
        onClose={onClose}
        subtitle={subtitle}
        title={title}
      />
      <KolamDetailPanelBody
        fields={fields}
        warningFlags={warningFlags}
        warningTitle={warningTitle}
      />
    </KolamPanelFrame>
  );
}