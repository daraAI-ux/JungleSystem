import React from 'react';
import {Linking, StyleSheet, Text, View} from 'react-native';
import type {KolamSpecies} from '../domain/kolam-species';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamButton} from './kolam-button';
import {KolamContentFrame} from './kolam-content-frame';
import {KolamStatusBadge} from './kolam-status-badge';

type DisplayLink = {
  label: string;
  name: string;
  scopeLabel?: string;
  value: string;
};

const LINK_ORDER = ['shopee', 'tokopedia', 'website', 'link_pos', 'other_link'];
const LINK_LABELS: Record<string, string> = {
  shopee: 'Shopee',
  tokopedia: 'Tokopedia',
  website: 'Website',
  link_pos: 'Tautan POS',
  other_link: 'Tautan Lain',
};

export function KolamSpeciesDetailExternalLinksPanel({species}: {species: KolamSpecies}) {
  const rootLinks = orderLinks((species.links ?? []).map(link => ({
    label: LINK_LABELS[link.name] ?? link.label,
    name: link.name,
    value: link.value,
  })));
  const variantGroups = (species.variants ?? [])
    .map(variant => ({
      id: variant.id,
      label: getVariantLabel(variant),
      links: orderLinks(normalizeLinksFromRaw(getRawRecord(variant.raw).link)),
    }))
    .filter(group => group.links.length > 0);
  const hasLinks = rootLinks.length > 0 || variantGroups.length > 0;

  return (
    <KolamContentFrame style={styles.sectionCardFull} variant="settingsWebConfig">
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>Tautan Eksternal</Text>
          <Text style={styles.sectionDescription}>Diambil dari field tautan eksternal species.</Text>
        </View>
        <KolamStatusBadge intent="muted" label={`${rootLinks.length + variantGroups.reduce((total, group) => total + group.links.length, 0)} tautan`} />
      </View>
      <View style={styles.linkStack}>
        {hasLinks ? (
          <>
            {rootLinks.length ? (
              <View style={styles.linkGroup}>
                <Text style={styles.linkGroupTitle}>Spesies</Text>
                {rootLinks.map(link => <ExternalLinkRow key={`${link.name}-${link.value}`} link={link} />)}
              </View>
            ) : null}
            {variantGroups.map(group => (
              <View key={group.id} style={styles.linkGroup}>
                <Text style={styles.linkGroupTitle}>{group.label}</Text>
                {group.links.map(link => <ExternalLinkRow key={`${group.id}-${link.name}-${link.value}`} link={link} />)}
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.emptyText}>Belum ada tautan eksternal.</Text>
        )}
      </View>
    </KolamContentFrame>
  );
}

function ExternalLinkRow({link}: {link: DisplayLink}) {
  return (
    <View style={styles.linkRow}>
      <View style={styles.linkCopy}>
        <Text style={styles.linkTitle}>{link.label}</Text>
        <Text numberOfLines={2} style={styles.linkValue}>{link.value}</Text>
      </View>
      <KolamButton label="Buka" onPress={() => Linking.openURL(normalizeUrl(link.value))} style={styles.linkButton} />
    </View>
  );
}

function normalizeLinksFromRaw(value: unknown): DisplayLink[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const record = getRawRecord(item);
      const name = getString(record.name);
      const linkValue = getString(record.value);
      if (!name || !linkValue) {
        return null;
      }
      return {
        label: LINK_LABELS[name] ?? name,
        name,
        value: linkValue,
      };
    })
    .filter(Boolean) as DisplayLink[];
}

function orderLinks(links: DisplayLink[]) {
  return [...links].sort((left, right) => {
    const leftIndex = LINK_ORDER.indexOf(left.name);
    const rightIndex = LINK_ORDER.indexOf(right.name);
    return (leftIndex === -1 ? 99 : leftIndex) - (rightIndex === -1 ? 99 : rightIndex);
  });
}

function getVariantLabel(variant: KolamSpecies['variants'][number]) {
  const parts = [variant.tier1Value, variant.tier2Value].map(part => part.trim()).filter(Boolean);
  return parts.length ? `Varian: ${parts.join(' / ')}` : `Varian ${variant.sku || variant.id}`;
}

function getRawRecord(value: unknown) {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function getString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

const styles = StyleSheet.create({
  sectionCardFull: {
    gap: 0,
    minWidth: 320,
    overflow: 'hidden',
    padding: 0,
    width: '100%',
  },
  sectionHeader: {
    alignItems: 'flex-start',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sectionTitleWrap: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 21,
  },
  sectionDescription: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  linkStack: {
    gap: 12,
    padding: 12,
  },
  linkGroup: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 0,
    overflow: 'hidden',
  },
  linkGroupTitle: {
    backgroundColor: V.colors.mutedSoft,
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  linkRow: {
    alignItems: 'center',
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  linkCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  linkTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  linkValue: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  linkButton: {
    minHeight: 26,
    paddingHorizontal: 8,
  },
  emptyText: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    padding: 18,
    textAlign: 'center',
  },
});
