import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import type {KolamDaraMarketPlatformFeeController} from '../hooks/use-kolam-dara-market-platform-fee-controller';
import type {KolamDaraPricingEquipmentController} from '../hooks/use-kolam-dara-pricing-equipment-controller';
import {KolamDaraMarketBulkPricingBody} from './kolam-dara-market-bulk-pricing-body';
import {KolamDaraMarketPlatformFeeBody} from './kolam-dara-market-platform-fee-body';
import {KolamEmptyState} from './kolam-empty-state';

/** FE `DaraMarketPeralatanPage` — single page scroll: platform fee then bulk. */
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
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}>
      <KolamDaraMarketPlatformFeeBody controller={platformFeeController} />
      <KolamDaraMarketBulkPricingBody controller={bulkPricingController} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  /** FE `space-y-8` between platform-fee and bulk panels. */
  scrollContent: {
    gap: 32,
    paddingBottom: 24,
  },
});
