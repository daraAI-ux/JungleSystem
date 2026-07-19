import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {CashflowSalesPreview} from '../domain/pos';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {getRequiredDeposit} from '../lib/cashflow';
import {formatRupiah} from '../lib/money';
import {KolamContentFrame} from './kolam-content-frame';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamTotalRow} from './kolam-total-row';

export function KolamCashflowClosePreview({
  cashflowPreview,
  isLoadingCashflowPreview,
}: {
  cashflowPreview: CashflowSalesPreview | null;
  isLoadingCashflowPreview: boolean;
}) {
  return (
    <KolamContentFrame variant="cashflowPreview">
      <KolamCopyStack
        items={[
          {id: 'label', text: 'Close preview', style: styles.adjustmentLabel},
        ]}
      />
      {isLoadingCashflowPreview ? (
        <KolamCopyStack
          items={[
            {
              id: 'loading',
              text: 'Memuat sales preview...',
              style: styles.cashflowPreviewMuted,
            },
          ]}
        />
      ) : cashflowPreview ? (
        <>
          <KolamTotalRow
            label="Opening cash"
            value={formatRupiah(cashflowPreview.openingCash)}
          />
          <KolamTotalRow
            label={`Cash sales (${cashflowPreview.cashSalesCount})`}
            value={formatRupiah(cashflowPreview.cashSalesTotal)}
          />
          <View style={styles.totalDivider} />
          <KolamTotalRow
            label="Required deposit"
            value={formatRupiah(getRequiredDeposit(cashflowPreview))}
            strong
          />
        </>
      ) : (
        <KolamCopyStack
          items={[
            {
              id: 'unavailable',
              text: 'Sales preview belum tersedia. Close tetap bisa dilakukan.',
              style: styles.cashflowPreviewMuted,
            },
          ]}
        />
      )}
    </KolamContentFrame>
  );
}

const styles = StyleSheet.create({
  cashflowPreviewMuted: {
    color: V.colors.mutedFg,
    fontSize: 13,
    lineHeight: 18,
  },
  adjustmentLabel: {
    marginBottom: 6,
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  totalDivider: {
    height: 1,
    marginVertical: 8,
    backgroundColor: V.colors.border,
  },
});