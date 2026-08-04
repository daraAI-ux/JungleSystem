import React, {useEffect, useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {
  isKolamDaraMarketIntelMongoObjectId,
  matchKolamDaraMarketIntelProductDigitFilter,
} from '../domain/kolam-dara-market-intel';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {getKolamProducts} from '../services/kolam-product-api';
import {KolamButton} from './kolam-button';

type ProductOption = {id: string; label: string; sku: string; name: string};

const PRODUCT_LIMIT = 250;

/**
 * Local FE `DaraCompetitorProductSelect` parity — module-scoped, not global extract.
 */
export function KolamDaraMarketIntelCompetitorsProductSelect({
  brandId,
  productId,
  productLabel,
  onClear,
  onSelect,
}: {
  brandId: string;
  productId: string;
  productLabel: string;
  onClear: () => void;
  onSelect: (id: string, label: string) => void;
}) {
  const [digitFilter, setDigitFilter] = useState('');
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);
  const brandReady =
    brandId !== 'all' && isKolamDaraMarketIntelMongoObjectId(brandId);

  useEffect(() => {
    setDigitFilter('');
  }, [brandId]);

  useEffect(() => {
    if (!brandReady) {
      setOptions([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void getKolamProducts({
      page: 1,
      limit: PRODUCT_LIMIT,
      type: 'product',
      brand: brandId,
      view: 'list',
    })
      .then(result => {
        if (cancelled) {
          return;
        }
        const next = result.data
          .map(product => {
            const sku = String(product.sku || '').trim();
            const name = String(product.name || '').trim();
            const label = sku ? `${sku} — ${name}` : name || product.id;
            return {id: product.id, label, sku, name};
          })
          .sort((a, b) => a.sku.localeCompare(b.sku, 'id'));
        setOptions(next);
      })
      .catch(() => {
        if (!cancelled) {
          setOptions([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [brandId, brandReady]);

  const filtered = useMemo(() => {
    if (!digitFilter.trim()) {
      return options.slice(0, 80);
    }
    return options
      .filter(option =>
        matchKolamDaraMarketIntelProductDigitFilter(
          option.sku,
          option.name,
          digitFilter,
        ),
      )
      .slice(0, 80);
  }, [digitFilter, options]);

  if (productId && isKolamDaraMarketIntelMongoObjectId(productId)) {
    return (
      <View style={styles.selectedRow}>
        <Text numberOfLines={1} style={styles.chip}>
          {productLabel || productId}
        </Text>
        <KolamButton
          label="Ganti"
          onPress={() => {
            onClear();
            setDigitFilter('');
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <TextInput
        editable={brandReady}
        onChangeText={setDigitFilter}
        placeholder="SKU"
        placeholderTextColor={V.colors.mutedFg}
        style={styles.skuInput}
        value={digitFilter}
      />
      {!brandReady ? (
        <Text style={styles.hint}>
          Pilih merek di toolbar terlebih dahulu agar daftar produk muncul.
        </Text>
      ) : loading ? (
        <Text style={styles.hint}>Memuat produk…</Text>
      ) : filtered.length === 0 ? (
        <Text style={styles.hint}>Tidak ada produk.</Text>
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={styles.optionScroll}>
          {filtered.map(option => (
            <KolamButton
              intent="plain"
              key={option.id}
              label={option.label}
              onPress={() => onSelect(option.id, option.label)}
              style={styles.option}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  selectedRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  skuInput: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    maxWidth: 160,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  hint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  optionScroll: {
    maxHeight: 180,
  },
  option: {
    justifyContent: 'flex-start',
  },
});
