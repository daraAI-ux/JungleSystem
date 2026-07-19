import React from 'react';
import {KolamActionControlButton} from './kolam-action-control-button';
import {cashflowModuleStyles as styles} from './kolam-cashflow-module-styles';

export function KolamCashflowActionButton({
  canRun,
  label,
  loadingLabel,
  loading,
  onPress,
}: {
  canRun: boolean;
  label: string;
  loadingLabel: string;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <KolamActionControlButton
      label={label}
      loading={loading}
      loadingLabel={loadingLabel}
      intent="primary"
      size="md"
      onPress={onPress}
      canRun={canRun}
      style={styles.moduleActionControl}
    />
  );
}
