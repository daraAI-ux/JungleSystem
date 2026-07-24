import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { KolamProductOption } from '../domain/kolam-product-option';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamButton } from './kolam-button';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamFormTextField } from './kolam-form-text-field';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';

export interface KolamComponentOverrideEditorRow {
  id: string;
  productId: string;
  quantity: string;
}

export function KolamComponentOverridesEditor({
  disabled = false,
  onChange,
  products,
  rows,
}: {
  disabled?: boolean;
  onChange: (rows: KolamComponentOverrideEditorRow[]) => void;
  products: KolamProductOption[];
  rows: KolamComponentOverrideEditorRow[];
}) {
  const productOptions = React.useMemo(
    () => [
      { label: 'Pilih bahan baku', value: '' },
      ...products.map(product => ({
        label: product.sku ? `${product.name} (${product.sku})` : product.name,
        value: product.id,
      })),
    ],
    [products],
  );

  const patchRow = (
    rowId: string,
    patch: Partial<KolamComponentOverrideEditorRow>,
  ) => {
    onChange(rows.map(row => (row.id === rowId ? { ...row, ...patch } : row)));
  };

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <KolamCopyStack
          items={[
            {
              id: 'hint',
              text: products.length
                ? 'BOM varian memakai bahan baku dari backend/cache lokal.'
                : 'Daftar bahan baku belum tersedia dari cache atau backend.',
              style: styles.hint,
            },
          ]}
        />
        <KolamButton
          disabled={disabled || products.length === 0}
          intent="outline"
          label="Tambah Komponen"
          onPress={() =>
            onChange([
              ...rows,
              {
                id: `component-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                productId: '',
                quantity: '1',
              },
            ])
          }
        />
      </View>
      {rows.length ? (
        <View style={styles.rowStack}>
          {rows.map(row => (
            <View key={row.id} style={styles.rowCard}>
              <View style={styles.productField}>
                <KolamDropdownSelect
                  accessibilityLabel="Pilih bahan baku komponen"
                  label="Bahan baku"
                  menuStyle={styles.dropdownMenu}
                  onChange={productId => patchRow(row.id, { productId })}
                  options={productOptions}
                  searchable
                  searchPlaceholder="Cari bahan baku..."
                  showLabelInTrigger={false}
                  value={row.productId}
                />
              </View>
              <View style={styles.quantityField}>
                <KolamFormTextField
                  editable={!disabled}
                  keyboardType="numeric"
                  onChangeText={quantity => patchRow(row.id, { quantity })}
                  placeholder="Qty"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={row.quantity}
                />
              </View>
              <KolamButton
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
              text: 'Belum ada override komponen. Varian memakai HPP/vendor jika tidak ada BOM.',
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
  productField: {
    flexBasis: 280,
    flexGrow: 1,
  },
  quantityField: {
    width: 120,
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