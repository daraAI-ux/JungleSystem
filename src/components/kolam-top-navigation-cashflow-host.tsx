import React from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';
import {
  getAdminCashflowHeaderRoute,
} from '../services/kolam-cashflow-session-api';
import {useKolamAdminCashflowHeaderController} from '../hooks/use-kolam-admin-cashflow-header-controller';
import {KolamIconButton} from './kolam-icon-button';

/**
 * Top-nav cashflow quick access â€” FE parity with CashflowHeaderIcon
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
        <CashflowSessionIcon />
      </KolamIconButton>
    </View>
  );
}

function CashflowSessionIcon() {
  return (
    <Svg height={22} width={22} viewBox="0 0 512 512">
      <Circle cx={256} cy={256} r={256} fill="#050505" />
      <Path
        d="M153 184h242c21 0 38 17 38 38v96c0 21-17 38-38 38H153c-21 0-38-17-38-38v-96c0-21 17-38 38-38Z"
        fill="#9CFF7A"
        stroke="#050505"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={22}
      />
      <Path
        d="M116 224h250c23 0 42 19 42 42v93c0 23-19 42-42 42H116c-23 0-42-19-42-42v-93c0-23 19-42 42-42Z"
        fill="#9CFF7A"
        stroke="#050505"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={22}
      />
      <Path
        d="M223 311c0-43 25-76 58-76s58 33 58 76-25 76-58 76-58-33-58-76Z"
        fill="#9CFF7A"
        stroke="#050505"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={18}
      />
      <Path
        d="M118 313h40M403 313h40"
        fill="none"
        stroke="#050505"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={18}
      />
    </Svg>
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
