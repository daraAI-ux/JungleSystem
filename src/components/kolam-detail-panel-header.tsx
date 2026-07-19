import React from 'react';
import {KolamActionControlButton} from './kolam-action-control-button';
import {KolamCopyStack} from './kolam-copy-stack';
import {detailPanelStyles as styles} from './kolam-detail-panel-styles';
import {KolamHeaderFrame} from './kolam-header-frame';

export function KolamDetailPanelHeader({
  closeLabel,
  onClose,
  subtitle,
  title,
}: {
  closeLabel: string;
  onClose: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <KolamHeaderFrame variant="detailPanel">
      <KolamCopyStack
        items={[
          {id: 'title', text: title, style: styles.title},
          {id: 'subtitle', text: subtitle, style: styles.subtitle},
        ]}
      />
      <KolamActionControlButton
        label={closeLabel}
        onPress={onClose}
        style={styles.closeButton}
        textStyle={styles.closeText}
      />
    </KolamHeaderFrame>
  );
}