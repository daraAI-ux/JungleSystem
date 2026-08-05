import React from 'react';
import {filterBarStyles as styles} from './kolam-filter-bar-styles';
import {KolamRefreshButton} from './kolam-refresh-button';

export function KolamFilterRefreshButton({
  onRefresh,
  refreshLabel,
}: {
  onRefresh?: () => void;
  refreshLabel: string;
}) {
  return (
    <KolamRefreshButton
      accessibilityLabel={refreshLabel}
      label={refreshLabel}
      intent="outline"
      size="sm"
      style={styles.refreshButton}
      onPress={onRefresh}
    />
  );
}
