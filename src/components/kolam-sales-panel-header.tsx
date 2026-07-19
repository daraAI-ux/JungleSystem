import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamHeaderFrame} from './kolam-header-frame';
import {salesPanelStyles as styles} from './kolam-sales-panel-styles';

export function KolamSalesPanelHeader() {
  return (
    <KolamHeaderFrame variant="sectionHeader">
      <KolamCopyStack
        items={[
          {id: 'title', text: 'Sales Terbaru', style: styles.sectionTitle},
          {
            id: 'hint',
            text: 'Draft, paid, dan status order akan disambungkan ke backend.',
            style: styles.sectionHint,
          },
        ]}
      />
    </KolamHeaderFrame>
  );
}