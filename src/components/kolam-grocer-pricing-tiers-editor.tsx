import React from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamButton} from './kolam-button';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamFormTextField} from './kolam-form-text-field';
import {settingsWebFormStyles} from './kolam-settings-web-form-styles';

export interface KolamGrocerPricingTierEditorRow {
  id: string;
  minQty: string;
  price: string;
  onlinePrice: string;
}

export function createEmptyGrocerPricingTierRow(
  rows: KolamGrocerPricingTierEditorRow[],
): KolamGrocerPricingTierEditorRow {
  const maxQty = rows.reduce(
    (max, row) => Math.max(max, toNumber(row.minQty)),
    0,
  );

  return {
    id: `tier-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    minQty: String(maxQty + 1),
    price: '0',
    onlinePrice: '0',
  };
}

export function KolamGrocerPricingTiersEditor({
  disabled = false,
  onChange,
  rows,
  style,
}: {
  disabled?: boolean;
  onChange: (rows: KolamGrocerPricingTierEditorRow[]) => void;
  rows: KolamGrocerPricingTierEditorRow[];
  style?: StyleProp<ViewStyle>;
}) {
  const orderedRows = React.useMemo(
    () => [...rows].sort((a, b) => toNumber(a.minQty) - toNumber(b.minQty)),
    [rows],
  );
  const addTier = () => onChange([...rows, createEmptyGrocerPricingTierRow(rows)]);
  const removeTier = (id: string) => onChange(rows.filter(row => row.id !== id));
  const patchTier = (
    id: string,
    patch: Partial<KolamGrocerPricingTierEditorRow>,
  ) => onChange(rows.map(row => (row.id === id ? {...row, ...patch} : row)));

  return (
    <View style={[styles.root, style]}>
      {orderedRows.length ? (
        orderedRows.map((row, index) => (
          <View key={row.id} style={styles.row}>
            <View style={styles.rowHeader}>
              <KolamCopyStack
                items={[
                  {
                    id: 'title',
                    text: `Tingkat ${index + 1}`,
                    style: styles.rowTitle,
                  },
                  {
                    id: 'summary',
                    text: getTierSummary(row),
                    style: styles.rowHint,
                  },
                ]}
              />
              <KolamButton
                disabled={disabled}
                intent="danger"
                label="Hapus Tingkat"
                onPress={() => removeTier(row.id)}
              />
            </View>
            <View style={styles.fieldGrid}>
              <GrocerPricingField
                disabled={disabled}
                hint="Harga ini aktif mulai jumlah pembelian tersebut."
                label="Mulai Kuantitas"
                onChangeText={minQty => patchTier(row.id, {minQty})}
                placeholder="Contoh: 10"
                value={row.minQty}
              />
              <GrocerPricingField
                disabled={disabled}
                hint="Harga per unit untuk transaksi POS."
                label="Harga POS / Unit"
                onChangeText={price => patchTier(row.id, {price})}
                placeholder="Contoh: 45000"
                value={row.price}
              />
              <GrocerPricingField
                disabled={disabled}
                hint="Harga per unit untuk webstore atau marketplace."
                label="Harga Daring / Unit"
                onChangeText={onlinePrice => patchTier(row.id, {onlinePrice})}
                placeholder="Contoh: 47000"
                value={row.onlinePrice}
              />
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyBox}>
          <KolamCopyStack
            items={[
              {
                id: 'empty',
                text: 'Belum ada harga grosir bertingkat.',
                style: styles.emptyText,
              },
              {
                id: 'empty-hint',
                text: 'Tambahkan tingkat jika pembelian jumlah besar memiliki harga per unit berbeda.',
                style: styles.emptyHint,
              },
            ]}
          />
        </View>
      )}
      <KolamButton
        disabled={disabled}
        intent="secondary"
        label="Tambah Harga Grosir"
        onPress={addTier}
      />
    </View>
  );
}

function GrocerPricingField({
  disabled,
  hint,
  label,
  onChangeText,
  placeholder,
  value,
}: {
  disabled: boolean;
  hint: string;
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.fieldBlock}>
      <KolamCopyStack
        items={[
          {id: 'label', text: label, style: styles.fieldLabel},
          {id: 'hint', text: hint, style: styles.fieldHint},
        ]}
      />
      <KolamFormTextField
        editable={!disabled}
        keyboardType="numeric"
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={settingsWebFormStyles.settingsWebFormFieldValue}
        value={value}
      />
    </View>
  );
}

function getTierSummary(row: KolamGrocerPricingTierEditorRow) {
  const minQty = toNumber(row.minQty);
  const posPrice = toNumber(row.price);
  const onlinePrice = toNumber(row.onlinePrice);
  const posLabel = posPrice > 0 ? formatCurrency(posPrice) : 'Harga POS belum diisi';
  const onlineLabel =
    onlinePrice > 0 ? formatCurrency(onlinePrice) : 'Harga daring belum diisi';

  return `Mulai ${minQty} unit - ${posLabel} POS / ${onlineLabel} daring`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    currency: 'IDR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value || 0);
}
function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
  },
  emptyBox: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: 14,
  },
  emptyText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
  row: {
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  rowHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  rowTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  rowHint: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  fieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  fieldBlock: {
    flexBasis: 240,
    flexGrow: 1,
    gap: 8,
    minWidth: 210,
  },
  fieldLabel: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  fieldHint: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  emptyHint: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: 4,
    textAlign: 'center',
  },
});



