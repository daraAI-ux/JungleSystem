import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { KolamPackingOption } from '../domain/kolam-packing-option';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamButton } from './kolam-button';
import {KolamDeleteButton} from './kolam-delete-button';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamFormTextField } from './kolam-form-text-field';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';

export interface KolamPackingLinkEditorRow {
  id: string;
  packingId: string;
  variantId: string;
  quantity: string;
}

export interface KolamPackingLinkVariantOption {
  id: string;
  label: string;
}

export function KolamPackingLinksEditor({
  disabled = false,
  onChange,
  packings,
  rows,
  rootTargetLabel = 'Spesies utama',
  variants,
}: {
  disabled?: boolean;
  onChange: (rows: KolamPackingLinkEditorRow[]) => void;
  packings: KolamPackingOption[];
  rootTargetLabel?: string;
  rows: KolamPackingLinkEditorRow[];
  variants: KolamPackingLinkVariantOption[];
}) {
  const packingOptions = React.useMemo(
    () => [
      { label: 'Pilih kemasan', value: '' },
      ...packings.map(packing => ({
        label: packing.category
          ? `${packing.name} (${packing.category})`
          : packing.name,
        value: packing.id,
      })),
    ],
    [packings],
  );
  const variantOptions = React.useMemo(
    () => [
      { label: rootTargetLabel, value: '' },
      ...variants.map(variant => ({ label: variant.label, value: variant.id })),
    ],
    [rootTargetLabel, variants],
  );

  const patchRow = (rowId: string, patch: Partial<KolamPackingLinkEditorRow>) => {
    onChange(rows.map(row => (row.id === rowId ? { ...row, ...patch } : row)));
  };

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <KolamCopyStack
          items={[
            {
              id: 'hint',
              text: packings.length
                ? 'Pilih kemasan untuk item utama atau varian.'
                : 'Belum ada bahan kemasan tersedia.',
              style: styles.hint,
            },
          ]}
        />
        <KolamButton
          disabled={disabled || packings.length === 0}
          intent="outline"
          label="Tambah Kemasan"
          onPress={() =>
            onChange([
              ...rows,
              {
                id: `packing-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                packingId: '',
                quantity: '1',
                variantId: '',
              },
            ])
          }
        />
      </View>
      {rows.length ? (
        <View style={styles.rowStack}>
          {rows.map(row => (
            <View key={row.id} style={styles.rowCard}>
              <View style={styles.packingField}>
                <KolamDropdownSelect
                  accessibilityLabel="Pilih kemasan"
                  label="Kemasan"
                  menuStyle={styles.dropdownMenu}
                  onChange={packingId => patchRow(row.id, { packingId })}
                  options={packingOptions}
                  searchable
                  searchPlaceholder="Cari kemasan..."
                  showLabelInTrigger={false}
                  value={row.packingId}
                />
              </View>
              <View style={styles.variantField}>
                <KolamDropdownSelect
                  accessibilityLabel="Pilih target kemasan"
                  label="Target"
                  menuStyle={styles.dropdownMenu}
                  onChange={variantId => patchRow(row.id, { variantId })}
                  options={variantOptions}
                  searchable={variants.length > 8}
                  searchPlaceholder="Cari varian..."
                  showLabelInTrigger={false}
                  value={row.variantId}
                />
              </View>
              <View style={styles.quantityField}>
                <KolamFormTextField
                  editable={!disabled}
                  keyboardType="numeric"
                  onChangeText={quantity => patchRow(row.id, { quantity })}
                  placeholder="Jumlah"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={row.quantity}
                />
              </View>
              <KolamDeleteButton
                disabled={disabled}
                intent="danger"
                label="Hapus"
                onPress={() => onChange(rows.filter(item => item.id !== row.id))}
              />
            </View>
          ))}
        </View>
      ) : (
        <KolamCopyStack
          items={[
            {
              id: 'empty',
              text: 'Belum ada kemasan terhubung.',
              style: styles.emptyText,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  hint: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  rowStack: {
    gap: 8,
  },
  rowCard: {
    alignItems: 'center',
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 10,
  },
  packingField: {
    flexBasis: 260,
    flexGrow: 1,
  },
  variantField: {
    flexBasis: 220,
    flexGrow: 1,
  },
  quantityField: {
    width: 130,
  },
  dropdownMenu: {
    maxHeight: 280,
    width: 360,
  },
  emptyText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
});
