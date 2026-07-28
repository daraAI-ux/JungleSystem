import React from 'react';
import {StyleSheet, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {
  getAdminCashflowHeaderRoute,
} from '../services/kolam-cashflow-session-api';
import {useKolamAdminCashflowHeaderController} from '../hooks/use-kolam-admin-cashflow-header-controller';
import {KolamIconButton} from './kolam-icon-button';
import {ModuleNavWalletIcon} from './kolam-module-nav-wallet-icon';

/**
 * Top-nav cashflow quick access — FE parity with CashflowHeaderIcon
 * (`header-quick-access-icons.tsx`). Poll state stays in this host so App
 * chrome does not re-render on the 60s interval.
 */
export function KolamTopNavigationCashflowHost({
  onNavigate,
}: {
  onNavigate?: (route: string) => void;
}) {
  const {loading, session, state} = useKolamAdminCashflowHeaderController();

  if (loading) {
    return null;
  }

  const tooltip =
    state === 'open'
      ? session?.name || 'Sesi tunai dibuka'
      : state === 'locked'
        ? 'Sesi tunai terkunci'
        : 'Tidak ada sesi tunai aktif';

  return (
    <View style={styles.wrap}>
      {state === 'open' || state === 'locked' ? (
        <View
          pointerEvents="none"
          style={[
            styles.glow,
            state === 'open' ? styles.glowOpen : styles.glowLocked,
          ]}
        />
      ) : null}
      <KolamIconButton
        accessibilityLabel={tooltip}
        onPress={() => onNavigate?.(getAdminCashflowHeaderRoute(session))}
        radius="full"
        size={32}
        variant="ghost">
        <ModuleNavWalletIcon
          tintStyle={{
            backgroundColor: V.colors.mutedFg,
          }}
        />
      </KolamIconButton>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    top: 2,
    right: 2,
    bottom: 2,
    left: 2,
    borderRadius: 999,
  },
  glowOpen: {
    borderWidth: 1,
    borderColor: 'rgba(111, 189, 130, 0.45)',
    backgroundColor: 'rgba(111, 189, 130, 0.12)',
  },
  glowLocked: {
    borderWidth: 1,
    borderColor: 'rgba(216, 199, 160, 0.4)',
    backgroundColor: 'rgba(216, 199, 160, 0.1)',
  },
});
