import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamStatusBadge } from './kolam-status-badge';

const SHOPEE_LOGO = require('../assets/marketplace/shopee.jpg');
const TOKOPEDIA_LOGO = require('../assets/marketplace/tokopedia.png');

export type KolamMarketplaceSyncPlatformView = {
  label?: string;
  lastSyncedAt?: string;
  platform: string;
  status: string;
  statusLabel?: string;
};

export function KolamMarketplaceSyncPlatformList({
  emptyText = 'Belum sinkron',
  formatTime,
  platforms,
  showTime = false,
}: {
  emptyText?: string;
  formatTime?: (value: string) => string;
  platforms: KolamMarketplaceSyncPlatformView[];
  showTime?: boolean;
}) {
  const visiblePlatforms = platforms.filter(
    platform => platform.lastSyncedAt || platform.status !== 'unknown',
  );

  if (!visiblePlatforms.length) {
    return <Text style={styles.emptyText}>{emptyText}</Text>;
  }

  return (
    <View style={styles.stack}>
      {visiblePlatforms.map(platform => (
        <View key={platform.platform} style={styles.row}>
          <View style={styles.logoFrame}>
            {getMarketplaceLogo(platform.platform) ? (
              <Image
                resizeMode="contain"
                source={getMarketplaceLogo(platform.platform)}
                style={styles.logo}
              />
            ) : (
              <Text style={styles.logoFallback}>
                {getMarketplaceShortLabel(platform)}
              </Text>
            )}
          </View>
          <KolamStatusBadge
            intent={getMarketplaceSyncStatusIntent(platform.status)}
            label={platform.statusLabel || getMarketplaceSyncStatusLabel(platform.status)}
            textStyle={styles.badgeText}
          />
          {showTime && platform.lastSyncedAt ? (
            <Text numberOfLines={1} style={styles.timeText}>
              {formatTime ? formatTime(platform.lastSyncedAt) : platform.lastSyncedAt}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function getMarketplaceLogo(platform: string) {
  if (platform === 'shopee') {
    return SHOPEE_LOGO;
  }
  if (platform === 'tokopedia') {
    return TOKOPEDIA_LOGO;
  }
  return null;
}

function getMarketplaceShortLabel(platform: KolamMarketplaceSyncPlatformView) {
  if (platform.platform === 'tokopedia') {
    return 'TP';
  }
  if (platform.platform === 'shopee') {
    return 'SH';
  }
  return (platform.label || platform.platform || '-').slice(0, 2).toUpperCase();
}

function getMarketplaceSyncStatusIntent(status: string) {
  switch (status) {
    case 'synced':
      return 'success';
    case 'pending':
      return 'primary';
    case 'partial':
    case 'notFound':
      return 'warning';
    case 'failed':
      return 'danger';
    case 'skipped':
    case 'unknown':
    default:
      return 'muted';
  }
}

function getMarketplaceSyncStatusLabel(status: string) {
  switch (status) {
    case 'pending':
      return 'Antre';
    case 'synced':
      return 'Sinkron';
    case 'skipped':
      return 'Dilewati';
    case 'notFound':
      return 'Tidak ditemukan';
    case 'failed':
      return 'Gagal';
    case 'partial':
      return 'Sebagian';
    case 'unknown':
    default:
      return 'Belum sinkron';
  }
}

const styles = StyleSheet.create({
  stack: {
    gap: 4,
    minWidth: 0,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    minWidth: 0,
  },
  logoFrame: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 4,
    borderWidth: 1,
    height: 18,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 18,
  },
  logo: {
    height: 16,
    width: 16,
  },
  logoFallback: {
    color: V.colors.mutedFg,
    fontSize: 8,
    fontWeight: '900',
    lineHeight: 10,
  },
  badgeText: {
    fontSize: 9,
    lineHeight: 12,
  },
  emptyText: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  timeText: {
    color: V.colors.mutedFg,
    flexShrink: 1,
    fontSize: 9,
    fontWeight: '600',
    lineHeight: 12,
    minWidth: 0,
  },
});
