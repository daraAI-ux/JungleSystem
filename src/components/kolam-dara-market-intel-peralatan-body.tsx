import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import type {KolamDaraMarketPlatformFeeController} from '../hooks/use-kolam-dara-market-platform-fee-controller';
import type {KolamDaraPricingEquipmentController} from '../hooks/use-kolam-dara-pricing-equipment-controller';
import {KolamDaraMarketBulkPricingBody} from './kolam-dara-market-bulk-pricing-body';
import {KolamDaraMarketPlatformFeeBody} from './kolam-dara-market-platform-fee-body';
import {KolamEmptyState} from './kolam-empty-state';

/** FE `DaraMarketPeralatanPage` — platform fee + bulk pricing. */
export function KolamDaraMarketIntelPeralatanBody({
  bulkPricingController,
  canDraft,
  platformFeeController,
}: {
  bulkPricingController: KolamDaraPricingEquipmentController;
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
      <ScrollView
        contentContainerStyle={styles.bulkContent}
        style={styles.bulk}>
        <KolamDaraMarketBulkPricingBody controller={bulkPricingController} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: 12,
    minHeight: 0,
  },
  fee: {
    flex: 1,
    minHeight: 0,
  },
  bulk: {
    flexGrow: 0,
    flexShrink: 1,
    maxHeight: '48%',
  },
  bulkContent: {
    paddingBottom: 8,
  },
});
