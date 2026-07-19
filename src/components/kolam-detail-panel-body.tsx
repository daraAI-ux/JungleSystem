import React from 'react';
import {KolamContentFrame} from './kolam-content-frame';
import {KolamDetailPanelFieldRow} from './kolam-detail-panel-field-row';
import {KolamDetailPanelWarningBox} from './kolam-detail-panel-warning-box';
import type {KolamDetailPanelField} from './kolam-detail-panel-types';
import {KolamMappedList} from './kolam-mapped-list';

export function KolamDetailPanelBody({
  fields,
  warningFlags,
  warningTitle,
}: {
  fields: KolamDetailPanelField[];
  warningFlags: string[];
  warningTitle: string;
}) {
  return (
    <KolamContentFrame variant="detailPanelBody">
      <KolamDetailPanelWarningBox
        warningFlags={warningFlags}
        warningTitle={warningTitle}
      />
      <KolamMappedList
        items={fields}
        getKey={field => field.id}
        renderItem={field => <KolamDetailPanelFieldRow field={field} />}
      />
    </KolamContentFrame>
  );
}