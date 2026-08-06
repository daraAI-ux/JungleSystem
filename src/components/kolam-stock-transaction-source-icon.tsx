import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { stockTransactionSourceLabel } from '../domain/kolam-stock-transaction';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamHoverTooltip } from './kolam-hover-tooltip';
import { KolamRemoteImage } from './kolam-remote-image';

type SourceTone = 'default' | 'success' | 'warning' | 'danger' | 'info';

const SOURCE_BADGES: Record<
  string,
  {
    shortLabel: string;
    tone: SourceTone;
  }
> = {
  'stock-opname': { shortLabel: 'Opname', tone: 'warning' },
  stock_opname: { shortLabel: 'Opname', tone: 'warning' },
  sale: { shortLabel: 'Sale', tone: 'success' },
  'sale-draft': { shortLabel: 'Draft', tone: 'info' },
  'sale-cancelled': { shortLabel: 'Batal', tone: 'danger' },
  production: { shortLabel: 'Produksi', tone: 'default' },
  po: { shortLabel: 'PO', tone: 'info' },
  pos: { shortLabel: 'POS', tone: 'success' },
  complaint: { shortLabel: 'Komplain', tone: 'danger' },
  'complaint-return': { shortLabel: 'Retur', tone: 'warning' },
  'complaint-replacement': { shortLabel: 'Ganti', tone: 'warning' },
  custom_project: { shortLabel: 'Proyek', tone: 'info' },
  enclosure: { shortLabel: 'Kandang', tone: 'default' },
  adjustment: { shortLabel: 'Adjust', tone: 'default' },
  arrival_inspection: { shortLabel: 'Inspeksi', tone: 'info' },
  warranty_claim: { shortLabel: 'Garansi', tone: 'danger' },
};

export function KolamStockTransactionSourceIcon({
  label,
  logoUri,
  salesSourceName,
  source,
}: {
  label?: string;
  logoUri?: string | null;
  salesSourceName?: string | null;
  source: string;
}) {
  const stockLabel =
    label || stockTransactionSourceLabel(source) || source || '—';
  const tooltip = salesSourceName
    ? `${salesSourceName} · ${stockLabel}`
    : stockLabel;
  const visual = resolveSourceVisual(source, stockLabel);

  if (!source) {
    return <Text style={styles.empty}>—</Text>;
  }

  if (logoUri) {
    return (
      <KolamHoverTooltip label={tooltip}>
        <View accessibilityLabel={tooltip} style={styles.logoWrap}>
          <KolamRemoteImage
            accessibilityLabel={tooltip}
            resizeMode="contain"
            revision={logoUri}
            sourceUri={logoUri}
            style={styles.logo}
          />
        </View>
      </KolamHoverTooltip>
    );
  }

  return (
    <KolamHoverTooltip label={tooltip}>
      <View
        accessibilityLabel={tooltip}
        style={[styles.chip, toneStyles[visual.tone]]}
      >
        <Text
          numberOfLines={1}
          style={[styles.shortLabel, toneTextStyles[visual.tone]]}
        >
          {visual.shortLabel}
        </Text>
      </View>
    </KolamHoverTooltip>
  );
}

function resolveSourceVisual(source: string, fullLabel: string) {
  const known = SOURCE_BADGES[source];
  if (known) {
    return known;
  }

  const fromLabel = fullLabel.trim();
  if (fromLabel && fromLabel !== '—') {
    return {
      shortLabel: truncateShort(titleCaseWords(fromLabel)),
      tone: 'default' as const,
    };
  }

  return {
    shortLabel: truncateShort(titleCaseWords(source.replace(/[_-]+/g, ' '))),
    tone: 'default' as const,
  };
}

function titleCaseWords(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function truncateShort(value: string) {
  if (value.length <= 10) {
    return value;
  }
  return `${value.slice(0, 9)}…`;
}

const styles = StyleSheet.create({
  empty: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  logoWrap: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: V.colors.border,
    backgroundColor: V.colors.muted,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  logo: {
    width: 28,
    height: 28,
  },
  chip: {
    maxWidth: 88,
    minHeight: 26,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  shortLabel: {
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
});

const toneStyles = StyleSheet.create({
  default: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
  },
  success: {
    backgroundColor: V.colors.successSoft,
    borderColor: V.colors.success,
  },
  warning: {
    backgroundColor: V.colors.warningSoft,
    borderColor: V.colors.warning,
  },
  danger: {
    backgroundColor: V.colors.dangerSoft,
    borderColor: V.colors.danger,
  },
  info: {
    backgroundColor: V.colors.infoSoft,
    borderColor: V.colors.info,
  },
});

const toneTextStyles = StyleSheet.create({
  default: { color: V.colors.fg },
  success: { color: V.colors.success },
  warning: { color: V.colors.warning },
  danger: { color: V.colors.danger },
  info: { color: V.colors.info },
});
