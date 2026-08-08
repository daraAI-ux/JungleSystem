import React from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {KOLAM_CASHFLOW_SESSION_MODULE_ICON_SVG} from '../assets/icons/cashflow-session-module-icon-svg';
import {
  getAdminCashflowHeaderRoute,
} from '../services/kolam-cashflow-session-api';
import {useKolamAdminCashflowHeaderController} from '../hooks/use-kolam-admin-cashflow-header-controller';
import {KolamIconButton} from './kolam-icon-button';

const CASHFLOW_SESSION_ICON_PATHS = getSvgPathData(
  KOLAM_CASHFLOW_SESSION_MODULE_ICON_SVG,
);

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
    <Svg height={22} width={22} viewBox="0 0 810 809.999993">
      {CASHFLOW_SESSION_ICON_PATHS.map(path => (
        <Path key={path} d={path} fill="#1a1a1a" fillRule="evenodd" />
      ))}
    </Svg>
  );
}

function getSvgPathData(svg: string) {
  const paths: string[] = [];
  const drawableSvg = svg.replace(/<defs[\s\S]*?<\/defs>/g, '');
  const pattern = /\sd="([^"]+)"/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(drawableSvg)) !== null) {
    if (match[1]) {
      paths.push(match[1]);
    }
  }

  return paths;
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
