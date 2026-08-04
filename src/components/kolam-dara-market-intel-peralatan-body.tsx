import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraMarketPlatformFeeController} from '../hooks/use-kolam-dara-market-platform-fee-controller';
import {KolamDaraMarketPlatformFeeBody} from './kolam-dara-market-platform-fee-body';
import {KolamEmptyState} from './kolam-empty-state';

/** FE `DaraMarketPeralatanPage` — Batch 6a: platform fee; bulk pricing in 6b. */
export function KolamDaraMarketIntelPeralatanBody({
  canDraft,
  platformFeeController,
}: {
  canDraft: boolean;
  platformFeeController: KolamDaraMarketPlatformFeeController;
}) {
  if (!canDraft) {
    return (
      <View style={styles.root}>
        <KolamEmptyState
          message="Peralatan bulk harga hanya untuk admin/owner atau role dengan izin draft Market Intel."
          title="Akses ditolak"
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.fee}>
        <KolamDaraMarketPlatformFeeBody controller={platformFeeController} />
      </View>
      <View style={styles.bulkPlaceholder}>
        <Text style={styles.bulkTitle}>Bulk harga</Text>
        <Text style={styles.bulkMeta}>Belum tersedia</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: 12,
  },
  fee: {
    flex: 1,
    minHeight: 0,
  },
  bulkPlaceholder: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexShrink: 0,
    gap: 4,
    padding: 14,
  },
  bulkTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  bulkMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
});
