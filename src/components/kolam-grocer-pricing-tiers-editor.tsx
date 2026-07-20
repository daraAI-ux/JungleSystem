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
  const addTier = () => onChange([...rows, createEmptyGrocerPricingTierRow(rows)]);
  const removeTier = (id: string) => onChange(rows.filter(row => row.id !== id));
  const patchTier = (
    id: string,
    patch: Partial<KolamGrocerPricingTierEditorRow>,
  ) => onChange(rows.map(row => (row.id === id ? {...row, ...patch} : row)));

  return (
    <View style={[styles.root, style]}>
      {rows.length ? (
        rows.map((row, index) => (
          <View key={row.id} style={styles.row}>
            <View style={styles.rowHeader}>
              <KolamCopyStack
                items={[
                  {
                    id: 'title',
                    text: `Tier ${index + 1}`,
                    style: styles.rowTitle,
                  },
                  {
                    id: 'summary',
                    text: `Mulai ${toNumber(row.minQty)} unit`,
                    style: styles.rowHint,
                  },
                ]}
              />
              <KolamButton
                disabled={disabled}
                intent="danger"
                label="Hapus Tier"
                onPress={() => removeTier(row.id)}
              />
            </View>
            <View style={styles.fieldGrid}>
              <KolamFormTextField
                editable={!disabled}
                keyboardType="numeric"
                onChangeText={minQty => patchTier(row.id, {minQty})}
                placeholder="Min. qty"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={row.minQty}
              />
              <KolamFormTextField
                editable={!disabled}
                keyboardType="numeric"
                onChangeText={price => patchTier(row.id, {price})}
                placeholder="Harga POS"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={row.price}
              />
              <KolamFormTextField
                editable={!disabled}
                keyboardType="numeric"
                onChangeText={onlinePrice => patchTier(row.id, {onlinePrice})}
                placeholder="Harga online"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
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
                text: 'Belum ada tier harga grosir.',
                style: styles.emptyText,
              },
            ]}
          />
        </View>
      )}
      <KolamButton
        disabled={disabled}
        intent="secondary"
        label="Tambah Tier"
        onPress={addTier}
      />
    </View>
  );
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
});