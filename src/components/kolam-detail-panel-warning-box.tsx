import React from 'react';
import {KolamContentFrame} from './kolam-content-frame';
import {KolamCopyStack} from './kolam-copy-stack';
import {detailPanelStyles as styles} from './kolam-detail-panel-styles';
import {KolamMappedList} from './kolam-mapped-list';

export function KolamDetailPanelWarningBox({
  warningFlags,
  warningTitle,
}: {
  warningFlags: string[];
  warningTitle: string;
}) {
  if (!warningFlags.length) {
    return null;
  }

  return (
    <KolamContentFrame variant="detailWarningBox">
      <KolamCopyStack
        items={[
          {id: 'title', text: warningTitle, style: styles.warningTitle},
        ]}
      />
      <KolamMappedList
        items={warningFlags}
        getKey={flag => flag}
        renderItem={flag => (
          <KolamCopyStack
            items={[{id: 'flag', text: flag, style: styles.warningFlag}]}
          />
        )}
      />
    </KolamContentFrame>
  );
}