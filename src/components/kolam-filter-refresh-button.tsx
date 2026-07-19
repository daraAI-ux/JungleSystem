import React from 'react';
import {KolamActionControlButton} from './kolam-action-control-button';
import {filterBarStyles as styles} from './kolam-filter-bar-styles';
import {KolamRefreshIcon} from './kolam-refresh-icon';

export function KolamFilterRefreshButton({
  refreshLabel,
}: {
  refreshLabel: string;
}) {
  return (
    <KolamActionControlButton
      label={refreshLabel}
      intent="outline"
      size="sm"
      style={styles.refreshButton}
      icon={<KolamRefreshIcon />}
    />
  );
}
