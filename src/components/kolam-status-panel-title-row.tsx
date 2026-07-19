import React from 'react';
import {View} from 'react-native';
import type {StatusPanelDescriptor} from '../domain/status-panel';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamHeaderFrame} from './kolam-header-frame';
import {KolamStatusPanelIcon} from './kolam-status-panel-icon';
import {statusPanelFrameStyles as styles} from './kolam-status-panel-frame-styles';

export function KolamStatusPanelTitleRow({
  panel,
}: {
  panel: StatusPanelDescriptor;
}) {
  return (
    <KolamHeaderFrame variant="statusPanelTitleRow">
      <View style={styles.statusPanelGlyph}>
        <KolamStatusPanelIcon kind={panel.iconKind} />
      </View>
      <KolamCopyStack
        containerStyle={styles.statusPanelCopy}
        items={[
          {
            id: 'title',
            text: panel.title,
            style: styles.statusPanelTitle,
          },
          {
            id: 'description',
            text: panel.description,
            style: styles.statusPanelDescription,
          },
        ]}
      />
    </KolamHeaderFrame>
  );
}