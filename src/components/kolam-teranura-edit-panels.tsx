import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { appConfig } from '../config/app';
import type { KolamCustomField } from '../domain/kolam-custom-field';
import type { KolamPackingOption } from '../domain/kolam-packing-option';
import type { KolamProductOption } from '../domain/kolam-product-option';
import {
  createEmptyKolamTeranuraVendorPriceFormRow,
  type KolamTeranuraComponentFormRow,
  type KolamTeranuraExternalLinkFormRow,
  type KolamTeranuraGrocerPricingTierFormRow,
  type KolamTeranuraLinkName,
  type KolamTeranuraPackingLinkFormRow,
  type KolamTeranuraVariantFormRow,
  type KolamTeranuraVendorPriceFormRow,
} from '../domain/kolam-teranura-form';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  deleteKolamProductAsset,
  getKolamProductDetail,
  uploadKolamProductAsset,
} from '../services/kolam-product-api';
import { KolamButton } from './kolam-button';
import { KolamCategoryLabel } from './kolam-category-label';
import { KolamCommercialPolicyEditor } from './kolam-commercial-policy-editor';
import { KolamComponentOverridesEditor } from './kolam-component-overrides-editor';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDeleteButton } from './kolam-delete-button';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import {
  KolamEntityDetailAssetsPanel,
  type KolamEntityDetailAsset,
} from './kolam-entity-detail-assets-panel';
import { KolamFormTextField } from './kolam-form-text-field';
import {
  KolamGrocerPricingTiersEditor,
  createEmptyGrocerPricingTierRow,
} from './kolam-grocer-pricing-tiers-editor';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import { KolamMediaPlayer } from './kolam-media-player';
import {
  KolamPackingLinksEditor,
  type KolamPackingLinkVariantOption,
} from './kolam-packing-links-editor';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { KolamSettingsWebFileField } from './kolam-settings-web-file-field';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamSwitch } from './kolam-switch';
import { KolamUploadDeleteIcon } from './kolam-upload-delete-icon';

export const EXTERNAL_LINK_OPTIONS: Array<{
  label: string;
  value: KolamTeranuraLinkName;
}> = [
  { label: 'Pilih tipe tautan', value: '' },
  { label: 'Shopee', value: 'shopee' },
  { label: 'Tokopedia', value: 'tokopedia' },
  { label: 'Situs Web', value: 'website' },
  { label: 'Tautan POS', value: 'link_pos' },
  { label: 'Tautan Lain', value: 'other_link' },
];

export function TeranuraFieldShell({
  children,
  label,
  required = false,
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <View style={settingsWebFormStyles.settingsWebFormField}>
      <KolamSettingsWebFieldLabel label={label} required={required} />
      {children}
    </View>
  );
}

export function TeranuraMultiSelectField({
  disabled,
  emptyText,
  label,
  onAdd,
  onRemove,
  options,
  selected,
  tone,
  triggerLabel,
}: {
  disabled: boolean;
  emptyText: string;
  label: string;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  options: Array<{ id: string; label: string }>;
  selected: Array<{ id: string; label: string }>;
  tone?: 'category';
  triggerLabel: string;
}) {
  return (
    <TeranuraFieldShell label={label}>
      <View style={styles.categoryPickerStack}>
        <KolamDropdownSelect
          label={triggerLabel}
          menuStyle={styles.longDropdownMenu}
          onChange={value => {
            if (value) {
              onAdd(value);
            }
          }}
          options={[
            { label: triggerLabel, value: '' },
            ...options.map(option => ({
              label: option.label,
              value: option.id,
            })),
          ]}
          searchable
          searchPlaceholder={`Cari ${label.toLowerCase()}...`}
          showLabelInTrigger={false}
          value=""
        />
        <View style={styles.selectedCategoryRow}>
          {selected.length ? (
            selected.map(item =>
              tone === 'category' ? (
                <KolamCategoryLabel
                  key={item.id}
                  label={`${item.label} x`}
                  onPress={() => onRemove(item.id)}
                />
              ) : (
                <KolamButton
                  disabled={disabled}
                  intent="outline"
                  key={item.id}
                  label={`${item.label} x`}
                  onPress={() => onRemove(item.id)}
                  style={styles.selectedCategoryButton}
                />
              ),
            )
          ) : (
            <KolamCopyStack
              items={[
                { id: `empty-${label}`, text: emptyText, style: styles.fieldHint },
              ]}
            />
          )}
        </View>
      </View>
    </TeranuraFieldShell>
  );
}

export function TeranuraExternalLinksRowsEditor({
  disabled,
  links,
  onChange,
}: {
  disabled: boolean;
  links: KolamTeranuraExternalLinkFormRow[];
  onChange: (links: KolamTeranuraExternalLinkFormRow[]) => void;
}) {
  const updateRow = (
    index: number,
    patch: Partial<KolamTeranuraExternalLinkFormRow>,
  ) => {
    onChange(
      links.map((link, linkIndex) =>
        linkIndex === index ? { ...link, ...patch } : link,
      ),
    );
  };

  return (
    <View style={styles.externalLinksStack}>
      {links.length ? (
        links.map((link, index) => (
          <View key={`${index}-${link.name}`} style={styles.externalLinkRow}>
            <View style={styles.externalLinkTypeSelect}>
              <KolamDropdownSelect<KolamTeranuraLinkName>
                label="Tipe tautan"
                onChange={name => updateRow(index, { name })}
                options={EXTERNAL_LINK_OPTIONS}
                showLabelInTrigger={false}
                style={styles.externalLinkDropdown}
                triggerStyle={styles.externalLinkDropdownTrigger}
                triggerTextStyle={styles.externalLinkDropdownTriggerText}
                value={link.name}
              />
            </View>
            <KolamFormTextField
              editable={!disabled}
              mode="url"
              onChangeText={value => updateRow(index, { value })}
              placeholder="https://contoh.com"
              style={[
                settingsWebFormStyles.settingsWebFormFieldValue,
                styles.externalLinkInput,
              ]}
              value={link.value}
            />
            <KolamInteractionFrame
              accessibilityLabel="Hapus tautan"
              disabled={disabled}
              onPress={() =>
                onChange(links.filter((_, linkIndex) => linkIndex !== index))
              }
              style={[
                settingsWebFormStyles.settingsWebUploadDeleteButton,
                styles.externalLinkRemoveButton,
              ]}
            >
              <KolamUploadDeleteIcon />
            </KolamInteractionFrame>
          </View>
        ))
      ) : (
        <KolamCopyStack
          items={[
            { id: 'empty-links', text: 'Belum ada tautan eksternal.', style: styles.fieldHint },
          ]}
        />
      )}
      <KolamButton
        disabled={disabled}
        intent="secondary"
        label="Tambah tautan"
        onPress={() => onChange([...links, { name: '', value: '' }])}
        style={styles.externalLinkAddButton}
      />
    </View>
  );
}

export function TeranuraVendorPricesEditor({
  disabled,
  onChange,
  rows,
  vendorOptions,
}: {
  disabled: boolean;
  onChange: (rows: KolamTeranuraVendorPriceFormRow[]) => void;
  rows: KolamTeranuraVendorPriceFormRow[];
  vendorOptions: Array<{ label: string; value: string }>;
}) {
  return (
    <View style={styles.vendorPricePanel}>
      <View style={styles.rowManagerHeader}>
        <KolamCopyStack
          items={[{ id: 'title', text: 'Harga Pemasok', style: styles.panelTitle }]}
        />
        <KolamButton
          disabled={disabled}
          intent="primary"
          label="Tambah Pemasok"
          onPress={() =>
            onChange([...rows, createEmptyKolamTeranuraVendorPriceFormRow()])
          }
        />
      </View>
      {rows.length ? (
        rows.map((row, index) => (
          <TeranuraVendorPriceRow
            disabled={disabled}
            index={index}
            key={row.id}
            onPatch={patch =>
              onChange(
                rows.map(item => (item.id === row.id ? { ...item, ...patch } : item)),
              )
            }
            onRemove={() => onChange(rows.filter(item => item.id !== row.id))}
            row={row}
            vendorOptions={vendorOptions}
          />
        ))
      ) : (
        <KolamCopyStack
          items={[{ id: 'empty-vendors', text: 'Belum ada harga pemasok.', style: styles.fieldHint }]}
        />
      )}
    </View>
  );
}

function TeranuraVendorPriceRow({
  disabled,
  index,
  onPatch,
  onRemove,
  row,
  vendorOptions,
}: {
  disabled: boolean;
  index: number;
  onPatch: (patch: Partial<KolamTeranuraVendorPriceFormRow>) => void;
  onRemove: () => void;
  row: KolamTeranuraVendorPriceFormRow;
  vendorOptions: Array<{ label: string; value: string }>;
}) {
  return (
    <View style={styles.vendorPriceRow}>
      <View style={styles.rowManagerHeader}>
        <Text style={styles.rowText}>{`Vendor ${index + 1}`}</Text>
        <KolamButton disabled={disabled} intent="outline" label="Hapus" onPress={onRemove} />
      </View>
      <View style={styles.twoColumnGrid}>
        <View style={styles.halfField}>
          <KolamDropdownSelect
            label="Vendor"
            menuStyle={styles.longDropdownMenu}
            onChange={vendorId => onPatch({ vendorId })}
            options={vendorOptions}
            searchable
            searchPlaceholder="Cari pemasok..."
            showLabelInTrigger={false}
            value={row.vendorId}
          />
        </View>
        <View style={styles.halfField}>
          <KolamFormTextField
            editable={!disabled}
            mode="url"
            onChangeText={link => onPatch({ link })}
            placeholder="Link produk vendor"
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={row.link}
          />
        </View>
      </View>
      <View style={styles.twoColumnGrid}>
        <View style={styles.halfField}>
          <TeranuraPriceInput
            disabled={disabled}
            onChangeText={price => onPatch({ price })}
            value={row.price}
          />
        </View>
        <View style={styles.halfField}>
          <KolamFormTextField
            editable={!disabled}
            keyboardType="numeric"
            onChangeText={shippingCost => onPatch({ shippingCost })}
            placeholder="Ongkir"
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={row.shippingCost}
          />
        </View>
      </View>
    </View>
  );
}

export function TeranuraPriceInput({
  disabled,
  onChangeText,
  placeholder = '0',
  value,
}: {
  disabled: boolean;
  onChangeText: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <View style={styles.priceInputShell}>
      <Text style={styles.priceInputPrefix}>Rp</Text>
      <KolamFormTextField
        editable={!disabled}
        keyboardType="numeric"
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={[
          settingsWebFormStyles.settingsWebFormFieldValue,
          styles.priceInputField,
        ]}
        value={value}
      />
    </View>
  );
}

export function TeranuraChipListEditor({
  disabled,
  onChange,
  placeholder,
  values,
}: {
  disabled: boolean;
  onChange: (values: string[]) => void;
  placeholder: string;
  values: string[];
}) {
  const [draft, setDraft] = React.useState('');
  const commit = () => {
    const clean = draft.trim();
    if (clean && !values.includes(clean)) {
      onChange([...values, clean]);
    }
    setDraft('');
  };

  return (
    <View style={styles.chipListStack}>
      <View style={styles.selectedCategoryRow}>
        {values.map(value => (
          <KolamButton
            disabled={disabled}
            intent="outline"
            key={value}
            label={`${value} x`}
            onPress={() => onChange(values.filter(item => item !== value))}
            style={styles.selectedCategoryButton}
          />
        ))}
      </View>
      <View style={styles.chipAddRow}>
        <KolamFormTextField
          editable={!disabled}
          onChangeText={setDraft}
          onSubmitEditing={commit}
          placeholder={placeholder}
          style={[settingsWebFormStyles.settingsWebFormFieldValue, styles.chipAddInput]}
          value={draft}
        />
        <KolamButton disabled={disabled || !draft.trim()} intent="secondary" label="Tambah" onPress={commit} />
      </View>
    </View>
  );
}

export function TeranuraVariantConfiguratorCard({
  baseSku,
  disabled,
  onApplyCombinations,
  onChangeTier1Name,
  onChangeTier1Values,
  onChangeTier2Enabled,
  onChangeTier2Name,
  onChangeTier2Values,
  tier1Name,
  tier1Values,
  tier2Enabled,
  tier2Name,
  tier2Values,
}: {
  baseSku: string;
  disabled: boolean;
  onApplyCombinations: () => void;
  onChangeTier1Name: (value: string) => void;
  onChangeTier1Values: (values: string[]) => void;
  onChangeTier2Enabled: (enabled: boolean) => void;
  onChangeTier2Name: (value: string) => void;
  onChangeTier2Values: (values: string[]) => void;
  tier1Name: string;
  tier1Values: string[];
  tier2Enabled: boolean;
  tier2Name: string;
  tier2Values: string[];
}) {
  return (
    <View style={styles.configuratorCard}>
      <View style={styles.twoColumnGrid}>
        <View style={styles.halfField}>
          <TeranuraFieldShell label="Nama Varian Utama" required>
            <KolamFormTextField
              editable={!disabled}
              onChangeText={onChangeTier1Name}
              placeholder="Contoh: Ukuran"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={tier1Name}
            />
          </TeranuraFieldShell>
        </View>
        <View style={styles.halfField}>
          <TeranuraFieldShell label="Nilai Varian Utama">
            <TeranuraChipListEditor
              disabled={disabled}
              onChange={onChangeTier1Values}
              placeholder="Tambah nilai, lalu Enter"
              values={tier1Values}
            />
          </TeranuraFieldShell>
        </View>
      </View>
      <View style={styles.sellableSwitchRow}>
        <KolamCopyStack
          items={[{ id: 'label', text: 'Varian Kedua', style: styles.panelTitle }]}
        />
        <KolamSwitch
          accessibilityLabel="Aktifkan varian kedua"
          active={tier2Enabled}
          disabled={disabled}
          onPress={() => onChangeTier2Enabled(!tier2Enabled)}
        />
      </View>
      {tier2Enabled ? (
        <View style={styles.twoColumnGrid}>
          <View style={styles.halfField}>
            <TeranuraFieldShell label="Nama Varian Kedua">
              <KolamFormTextField
                editable={!disabled}
                onChangeText={onChangeTier2Name}
                placeholder="Contoh: Warna"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={tier2Name}
              />
            </TeranuraFieldShell>
          </View>
          <View style={styles.halfField}>
            <TeranuraFieldShell label="Nilai Varian Kedua">
              <TeranuraChipListEditor
                disabled={disabled}
                onChange={onChangeTier2Values}
                placeholder="Tambah nilai, lalu Enter"
                values={tier2Values}
              />
            </TeranuraFieldShell>
          </View>
        </View>
      ) : null}
      <KolamCopyStack
        items={[
          {
            id: 'sku-pattern-hint',
            text: `Pola SKU varian: ${baseSku.trim() || 'SKU'}-TIER1${
              tier2Enabled ? '-TIER2' : ''
            }`,
            style: styles.fieldHint,
          },
        ]}
      />
      <KolamButton
        disabled={disabled || !tier1Values.length}
        intent="primary"
        label="Terapkan Kombinasi Varian"
        onPress={onApplyCombinations}
        style={styles.applyCombinationsButton}
      />
    </View>
  );
}

type TeranuraVariantTab = 'pricing' | 'vendor' | 'specs' | 'media' | 'advanced';

const VARIANT_TABS: Array<{ id: TeranuraVariantTab; label: string }> = [
  { id: 'pricing', label: 'Harga' },
  { id: 'vendor', label: 'Pemasok' },
  { id: 'specs', label: 'Spesifikasi' },
  { id: 'media', label: 'Media' },
  { id: 'advanced', label: 'Lanjutan' },
];

export function TeranuraVariantCard({
  componentProducts,
  customFields,
  disabled,
  existingPhotos,
  index,
  isMediaSelected,
  onChangeVariantPhotoLocalUri,
  onDelete,
  onPatch,
  onSelectForMedia,
  variant,
  variantPhotoLocalUri,
  vendorOptions,
  weightUnitOptions,
}: {
  componentProducts: KolamProductOption[];
  customFields: KolamCustomField[];
  disabled: boolean;
  existingPhotos: string[];
  index: number;
  isMediaSelected: boolean;
  onChangeVariantPhotoLocalUri: (localUri: string) => void;
  onDelete: () => void;
  onPatch: (patch: Partial<KolamTeranuraVariantFormRow>) => void;
  onSelectForMedia: () => void;
  variant: KolamTeranuraVariantFormRow;
  variantPhotoLocalUri: string;
  vendorOptions: Array<{ label: string; value: string }>;
  weightUnitOptions: Array<{ label: string; value: string }>;
}) {
  const [activeTab, setActiveTab] = React.useState<TeranuraVariantTab>('pricing');
  const title = [variant.tier1Value, variant.tier2Value].filter(Boolean).join(' / ') || `Varian ${index + 1}`;

  return (
    <View style={styles.variantCard}>
      <View style={styles.rowManagerHeader}>
        <Text style={styles.variantTitle}>{title}</Text>
        <KolamDeleteButton disabled={disabled} label="Hapus Varian" onPress={onDelete} />
      </View>
      <View style={styles.variantTabHeader}>
        {VARIANT_TABS.map(tab => (
          <KolamButton
            intent={activeTab === tab.id ? 'primary' : 'outline'}
            key={tab.id}
            label={tab.label}
            onPress={() => setActiveTab(tab.id)}
            style={styles.variantTabButton}
          />
        ))}
      </View>

      {activeTab === 'pricing' ? (
        <View style={styles.variantTabPanel}>
          <View style={styles.twoColumnGrid}>
            <View style={styles.halfField}>
              <TeranuraFieldShell label="Nilai Varian Utama">
                <KolamFormTextField
                  editable={!disabled}
                  onChangeText={tier1Value => onPatch({ tier1Value })}
                  placeholder="Nilai varian utama"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={variant.tier1Value}
                />
              </TeranuraFieldShell>
            </View>
            <View style={styles.halfField}>
              <TeranuraFieldShell label="Nilai Varian Kedua">
                <KolamFormTextField
                  editable={!disabled}
                  onChangeText={tier2Value => onPatch({ tier2Value })}
                  placeholder="Nilai varian kedua"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={variant.tier2Value}
                />
              </TeranuraFieldShell>
            </View>
          </View>
          <View style={styles.twoColumnGrid}>
            <View style={styles.halfField}>
              <TeranuraFieldShell label="SKU">
                <KolamFormTextField
                  editable={!disabled}
                  onChangeText={sku => onPatch({ sku })}
                  placeholder="SKU"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={variant.sku}
                />
              </TeranuraFieldShell>
            </View>
            <View style={styles.halfField}>
              <TeranuraFieldShell label="Ambang Stok Rendah">
                <KolamFormTextField
                  editable={!disabled}
                  keyboardType="numeric"
                  onChangeText={lowStockThreshold => onPatch({ lowStockThreshold })}
                  placeholder="0"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={variant.lowStockThreshold}
                />
              </TeranuraFieldShell>
            </View>
          </View>
          <View style={styles.twoColumnGrid}>
            <View style={styles.halfField}>
              <TeranuraFieldShell label="Harga">
                <TeranuraPriceInput disabled={disabled} onChangeText={price => onPatch({ price })} value={variant.price} />
              </TeranuraFieldShell>
            </View>
            <View style={styles.halfField}>
              <TeranuraFieldShell label="Harga Jual">
                <TeranuraPriceInput disabled={disabled} onChangeText={priceToSell => onPatch({ priceToSell })} value={variant.priceToSell} />
              </TeranuraFieldShell>
            </View>
            <View style={styles.halfField}>
              <TeranuraFieldShell label="Harga Pasar">
                <TeranuraPriceInput disabled={disabled} onChangeText={marketPrice => onPatch({ marketPrice })} value={variant.marketPrice} />
              </TeranuraFieldShell>
            </View>
            <View style={styles.halfField}>
              <TeranuraFieldShell label="Harga Daring">
                <TeranuraPriceInput disabled={disabled} onChangeText={onlinePrice => onPatch({ onlinePrice })} value={variant.onlinePrice} />
              </TeranuraFieldShell>
            </View>
            <View style={styles.halfField}>
              <TeranuraFieldShell label="Harga Minimum">
                <TeranuraPriceInput disabled={disabled} onChangeText={minimumPriceToSales => onPatch({ minimumPriceToSales })} value={variant.minimumPriceToSales} />
              </TeranuraFieldShell>
            </View>
            <View style={styles.halfField}>
              <TeranuraFieldShell label="Minimum Pesanan">
                <KolamFormTextField
                  editable={!disabled}
                  keyboardType="numeric"
                  onChangeText={minimumOrderQty => onPatch({ minimumOrderQty })}
                  placeholder="1"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={variant.minimumOrderQty}
                />
              </TeranuraFieldShell>
            </View>
          </View>
          <TeranuraFieldShell label="Harga Grosir Bertingkat">
            <KolamGrocerPricingTiersEditor
              disabled={disabled}
              onChange={grocerPricingTiers => onPatch({ grocerPricingTiers })}
              rows={variant.grocerPricingTiers}
            />
          </TeranuraFieldShell>
        </View>
      ) : null}

      {activeTab === 'vendor' ? (
        <View style={styles.variantTabPanel}>
          <TeranuraVendorPricesEditor
            disabled={disabled}
            onChange={vendorPrices => onPatch({ vendorPrices })}
            rows={variant.vendorPrices}
            vendorOptions={vendorOptions}
          />
        </View>
      ) : null}

      {activeTab === 'specs' ? (
        <View style={styles.variantTabPanel}>
          <View style={styles.twoColumnGrid}>
            <View style={styles.halfField}>
              <TeranuraFieldShell label="Nilai berat">
                <KolamFormTextField
                  editable={!disabled}
                  keyboardType="numeric"
                  onChangeText={weightValue => onPatch({ weightValue })}
                  placeholder="Nilai berat"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={variant.weightValue}
                />
              </TeranuraFieldShell>
            </View>
            <View style={styles.halfField}>
              <TeranuraFieldShell label="Satuan berat">
                <KolamDropdownSelect
                  label="Satuan berat"
                  menuStyle={styles.longDropdownMenu}
                  onChange={weightUnitId => onPatch({ weightUnitId })}
                  options={weightUnitOptions}
                  searchable
                  searchPlaceholder="Cari satuan..."
                  showLabelInTrigger={false}
                  value={variant.weightUnitId}
                />
              </TeranuraFieldShell>
            </View>
          </View>
          <View style={styles.dimensionRow}>
            <View style={styles.dimensionField}>
              <TeranuraFieldShell label="Panjang">
                <KolamFormTextField
                  editable={!disabled}
                  keyboardType="numeric"
                  onChangeText={dimensionLength => onPatch({ dimensionLength })}
                  placeholder="Panjang"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={variant.dimensionLength}
                />
              </TeranuraFieldShell>
            </View>
            <View style={styles.dimensionField}>
              <TeranuraFieldShell label="Lebar">
                <KolamFormTextField
                  editable={!disabled}
                  keyboardType="numeric"
                  onChangeText={dimensionWidth => onPatch({ dimensionWidth })}
                  placeholder="Lebar"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={variant.dimensionWidth}
                />
              </TeranuraFieldShell>
            </View>
            <View style={styles.dimensionField}>
              <TeranuraFieldShell label="Tinggi">
                <KolamFormTextField
                  editable={!disabled}
                  keyboardType="numeric"
                  onChangeText={dimensionHeight => onPatch({ dimensionHeight })}
                  placeholder="Tinggi"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={variant.dimensionHeight}
                />
              </TeranuraFieldShell>
            </View>
          </View>
          <TeranuraCustomFieldRowsEditor
            customFields={customFields}
            disabled={disabled}
            onChange={customFieldValues => onPatch({ customFieldValues })}
            values={variant.customFieldValues}
          />
        </View>
      ) : null}

      {activeTab === 'media' ? (
        <View style={styles.variantTabPanel}>
          {!isMediaSelected ? (
            <KolamButton
              disabled={disabled}
              intent="outline"
              label="Pilih varian ini untuk unggah foto"
              onPress={onSelectForMedia}
            />
          ) : (
            <KolamSettingsWebFileField
              accessibilityLabel="Foto varian"
              actionLabel="Pilih file"
              disabled={disabled}
              emptyLabel="Foto varian belum dipilih"
              onLocalValueChange={onChangeVariantPhotoLocalUri}
              onUpload={() => undefined}
              scope="teranura-variant-photo"
              title="Foto Varian"
              value={variantPhotoLocalUri}
            />
          )}
          {existingPhotos.length ? (
            <View style={styles.existingMediaGrid}>
              {existingPhotos.map((photoUri, photoIndex) => (
                <Text key={`${photoUri}-${photoIndex}`} style={styles.fieldHint}>
                  {photoUri}
                </Text>
              ))}
            </View>
          ) : (
            <KolamCopyStack
              items={[{ id: 'empty-variant-photos', text: 'Belum ada foto varian.', style: styles.fieldHint }]}
            />
          )}
        </View>
      ) : null}

      {activeTab === 'advanced' ? (
        <View style={styles.variantTabPanel}>
          <KolamCommercialPolicyEditor
            commissionHidden
            disabled={disabled}
            memberPointsHint="Poin anggota khusus untuk varian ini."
            onChange={value =>
              onPatch({
                memberPointsEnabled: value.memberPointsEnabled,
                memberPoints: value.memberPoints,
              })
            }
            value={{
              commissionEnabled: false,
              commissionType: 'percentage',
              commissionValue: '0',
              memberPointsEnabled: variant.memberPointsEnabled,
              memberPoints: variant.memberPoints,
            }}
          />
          <TeranuraFieldShell label="Bahan Penyusun Varian">
            <KolamComponentOverridesEditor
              disabled={disabled}
              onChange={componentOverrides => onPatch({ componentOverrides })}
              products={componentProducts}
              rows={variant.componentOverrides}
            />
          </TeranuraFieldShell>
          <TeranuraFieldShell label="Tautan Eksternal Varian">
            <TeranuraExternalLinksRowsEditor
              disabled={disabled}
              links={variant.externalLinks}
              onChange={externalLinks => onPatch({ externalLinks })}
            />
          </TeranuraFieldShell>
        </View>
      ) : null}
    </View>
  );
}

export function TeranuraCustomFieldRowsEditor({
  customFields,
  disabled,
  onChange,
  values,
}: {
  customFields: KolamCustomField[];
  disabled: boolean;
  onChange: (values: unknown[]) => void;
  values: unknown[];
}) {
  const [enabled, setEnabled] = React.useState(values.length > 0);
  const rows = values
    .map(entry => asRecord(entry))
    .map(row => ({ row, field: customFields.find(field => field.id === getFieldId(row)) }))
    .filter(entry => entry.field) as Array<{
    row: Record<string, unknown>;
    field: KolamCustomField;
  }>;
  const usedIds = new Set(rows.map(entry => entry.field.id));
  const availableFields = customFields.filter(field => !usedIds.has(field.id));

  const patchRow = (fieldId: string, value: unknown) => {
    const next = values.map(entry => {
      const row = asRecord(entry);
      return getFieldId(row) === fieldId ? { ...row, value } : entry;
    });
    onChange(next);
  };

  const addField = (fieldId: string) => {
    const field = customFields.find(item => item.id === fieldId);
    if (!field) {
      return;
    }
    onChange([...values, { field: fieldId, value: createDefaultCustomFieldValue(field) }]);
  };

  const removeField = (fieldId: string) => {
    onChange(values.filter(entry => getFieldId(asRecord(entry)) !== fieldId));
  };

  return (
    <View style={styles.customFieldPanel}>
      <View style={styles.sellableSwitchRow}>
        <KolamCopyStack items={[{ id: 'label', text: 'Gunakan Field Kustom', style: styles.panelTitle }]} />
        <KolamSwitch
          accessibilityLabel="Gunakan field kustom"
          active={enabled}
          disabled={disabled}
          onPress={() => {
            const next = !enabled;
            setEnabled(next);
            if (!next) {
              onChange([]);
            }
          }}
        />
      </View>
      {enabled ? (
        <>
          <KolamDropdownSelect
            accessibilityLabel="Tambah field kustom"
            label="Tambah field kustom"
            menuStyle={styles.longDropdownMenu}
            onChange={fieldId => {
              if (fieldId) {
                addField(fieldId);
              }
            }}
            options={[
              { label: 'Pilih field kustom', value: '' },
              ...availableFields.map(field => ({ label: field.fieldLabel, value: field.id })),
            ]}
            searchable
            searchPlaceholder="Cari field kustom..."
            showLabelInTrigger={false}
            value=""
          />
          {rows.length ? (
            <View style={styles.customFieldRowStack}>
              {rows.map(({ row, field }) => (
                <View key={field.id} style={styles.customFieldRow}>
                  <View style={styles.customFieldRowHeader}>
                    <Text style={styles.customFieldRowLabel}>{field.fieldLabel}</Text>
                    <KolamDeleteButton disabled={disabled} label="Hapus" onPress={() => removeField(field.id)} />
                  </View>
                  <TeranuraCustomFieldValueInput
                    disabled={disabled}
                    field={field}
                    onChange={value => patchRow(field.id, value)}
                    value={row.value}
                  />
                </View>
              ))}
            </View>
          ) : (
            <KolamCopyStack
              items={[{ id: 'empty-custom-fields', text: 'Belum ada field kustom dipilih.', style: styles.fieldHint }]}
            />
          )}
        </>
      ) : null}
    </View>
  );
}

function TeranuraCustomFieldValueInput({
  disabled,
  field,
  onChange,
  value,
}: {
  disabled: boolean;
  field: KolamCustomField;
  onChange: (value: unknown) => void;
  value: unknown;
}) {
  if (field.fieldType === 'boolean') {
    return (
      <KolamSwitch
        accessibilityLabel={field.fieldLabel}
        active={Boolean(value)}
        disabled={disabled}
        onPress={() => onChange(!value)}
      />
    );
  }

  if (field.fieldType === 'select') {
    return (
      <KolamDropdownSelect
        label={field.fieldLabel}
        menuStyle={styles.longDropdownMenu}
        onChange={next => onChange(next)}
        options={[
          { label: 'Pilih opsi', value: '' },
          ...field.options.map(option => ({ label: option, value: option })),
        ]}
        showLabelInTrigger={false}
        value={typeof value === 'string' ? value : ''}
      />
    );
  }

  if (field.fieldType === 'range') {
    const range = asRecord(value);
    return (
      <View style={styles.twoColumnGrid}>
        <View style={styles.halfField}>
          <KolamFormTextField
            editable={!disabled}
            keyboardType="numeric"
            onChangeText={min => onChange({ ...range, min })}
            placeholder="Min"
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={typeof range.min === 'string' || typeof range.min === 'number' ? String(range.min) : ''}
          />
        </View>
        <View style={styles.halfField}>
          <KolamFormTextField
            editable={!disabled}
            keyboardType="numeric"
            onChangeText={max => onChange({ ...range, max })}
            placeholder="Max"
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={typeof range.max === 'string' || typeof range.max === 'number' ? String(range.max) : ''}
          />
        </View>
      </View>
    );
  }

  return (
    <KolamFormTextField
      editable={!disabled}
      keyboardType={field.fieldType === 'number' ? 'numeric' : 'default'}
      onChangeText={onChange}
      placeholder={field.fieldLabel}
      style={settingsWebFormStyles.settingsWebFormFieldValue}
      value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
    />
  );
}

export function TeranuraMediaSection({
  disabled,
  existingPhotos,
  existingVideos,
  onChangePhotoLocalUri,
  onChangeVideoLocalUri,
  onDeletePhoto,
  onDeleteVideo,
  onPickPhoto,
  onPickVideo,
  photoLocalUri,
  videoLocalUri,
}: {
  disabled: boolean;
  existingPhotos: string[];
  existingVideos: string[];
  onChangePhotoLocalUri: (uri: string) => void;
  onChangeVideoLocalUri: (uri: string) => void;
  onDeletePhoto: (index: number) => void;
  onDeleteVideo: (index: number) => void;
  onPickPhoto: () => void;
  onPickVideo: () => void;
  photoLocalUri: string;
  videoLocalUri: string;
}) {
  const [deletePhotoIndex, setDeletePhotoIndex] = React.useState<number | null>(null);
  const [deleteVideoIndex, setDeleteVideoIndex] = React.useState<number | null>(null);
  const photoCount = existingPhotos.length + (photoLocalUri.trim() ? 1 : 0);
  const videoCount = existingVideos.length + (videoLocalUri.trim() ? 1 : 0);

  return (
    <View style={styles.mediaPickerStack}>
      <View style={styles.mediaUploadSection}>
        <KolamSettingsWebFileField
          accessibilityLabel="Foto produk"
          actionLabel="Pilih file"
          disabled={disabled}
          emptyLabel="Foto belum dipilih"
          fileCount={Math.min(photoCount, 10)}
          fileMax={10}
          onLocalValueChange={onChangePhotoLocalUri}
          onUpload={onPickPhoto}
          scope="teranura-photo"
          title="Foto"
          value={photoLocalUri}
        />
        {existingPhotos.length ? (
          <View style={styles.existingMediaGrid}>
            {existingPhotos.map((photoUri, index) => (
              <View key={`${photoUri}-${index}`} style={styles.existingMediaCard}>
                <Text numberOfLines={1} style={styles.existingMediaLabel}>
                  {photoUri.split(/[\\/]/).pop() || `Foto ${index + 1}`}
                </Text>
                <KolamDeleteButton
                  disabled={disabled}
                  label="Hapus"
                  onPress={() => setDeletePhotoIndex(index)}
                  style={styles.existingMediaDeleteButton}
                />
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.mediaUploadSection}>
        <KolamSettingsWebFileField
          accessibilityLabel="Video produk"
          actionLabel="Pilih file"
          disabled={disabled}
          emptyLabel="Video belum dipilih"
          fileCount={Math.min(videoCount, 1)}
          fileMax={1}
          fileTypeLabel="Tipe file yang diterima: MP4, MOV, WEBM"
          onLocalValueChange={onChangeVideoLocalUri}
          onUpload={onPickVideo}
          previewKind="file"
          scope="teranura-video"
          title="Video"
          value={videoLocalUri}
        />
        {existingVideos.length ? (
          <View style={styles.existingMediaGrid}>
            {existingVideos.map((videoUri, index) => (
              <View key={`${videoUri}-${index}`} style={styles.existingVideoCard}>
                <KolamMediaPlayer kind="video" style={styles.existingVideoPlayer} title={`Video ${index + 1}`} uri={videoUri} />
                <KolamDeleteButton
                  disabled={disabled}
                  label="Hapus"
                  onPress={() => setDeleteVideoIndex(index)}
                  style={styles.existingMediaDeleteButton}
                />
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <TeranuraDeleteConfirm
        onCancel={() => setDeletePhotoIndex(null)}
        onConfirm={() => {
          if (deletePhotoIndex !== null) {
            onDeletePhoto(deletePhotoIndex);
          }
          setDeletePhotoIndex(null);
        }}
        subject="foto ini"
        visible={deletePhotoIndex !== null}
      />
      <TeranuraDeleteConfirm
        onCancel={() => setDeleteVideoIndex(null)}
        onConfirm={() => {
          if (deleteVideoIndex !== null) {
            onDeleteVideo(deleteVideoIndex);
          }
          setDeleteVideoIndex(null);
        }}
        subject="video ini"
        visible={deleteVideoIndex !== null}
      />
    </View>
  );
}

function TeranuraDeleteConfirm({
  onCancel,
  onConfirm,
  subject,
  visible,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  subject: string;
  visible: boolean;
}) {
  return (
    <KolamDeleteConfirmDialog
      itemLabel={subject}
      itemType="media"
      onCancel={onCancel}
      onConfirm={onConfirm}
      visible={visible}
    />
  );
}

export function TeranuraLinkedProductAssetsPanel({ linkedProductId }: { linkedProductId: string }) {
  const [assets, setAssets] = React.useState<KolamEntityDetailAsset[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState('');

  React.useEffect(() => {
    let disposed = false;
    setLoading(true);
    setLoadError('');
    getKolamProductDetail(linkedProductId)
      .then(product => {
        if (!disposed) {
          setAssets(product.assets);
        }
      })
      .catch(err => {
        if (!disposed) {
          setLoadError(err instanceof Error ? err.message : 'Gagal memuat aset produk terhubung.');
        }
      })
      .finally(() => {
        if (!disposed) {
          setLoading(false);
        }
      });
    return () => {
      disposed = true;
    };
  }, [linkedProductId]);

  const handleUpload = React.useCallback(
    async (title: string, localUri: string) => {
      const product = await uploadKolamProductAsset(linkedProductId, title, localUri);
      return product.assets;
    },
    [linkedProductId],
  );

  const handleDelete = React.useCallback(
    async (assetId: string) => {
      const product = await deleteKolamProductAsset(linkedProductId, assetId);
      return product.assets;
    },
    [linkedProductId],
  );

  const handleDownload = React.useCallback(
    (asset: KolamEntityDetailAsset) => {
      const base = appConfig.kolamApiBaseUrl.replace(/\/$/, '');
      void Linking.openURL(
        `${base}/products/${encodeURIComponent(linkedProductId)}/assets/${encodeURIComponent(asset.id)}/download`,
      );
    },
    [linkedProductId],
  );

  if (loading) {
    return (
      <KolamCopyStack items={[{ id: 'loading', text: 'Memuat aset produk terhubung...', style: styles.fieldHint }]} />
    );
  }

  if (loadError) {
    return <KolamCopyStack items={[{ id: 'error', text: loadError, style: styles.fieldHint }]} />;
  }

  return (
    <KolamEntityDetailAssetsPanel
      assets={assets}
      deleteAsset={handleDelete}
      downloadAsset={handleDownload}
      itemType="aset"
      uploadAsset={handleUpload}
    />
  );
}

export function TeranuraPackingLinksPanel({
  disabled,
  onChange,
  packings,
  rows,
  variants,
}: {
  disabled: boolean;
  onChange: (rows: KolamTeranuraPackingLinkFormRow[]) => void;
  packings: KolamPackingOption[];
  rows: KolamTeranuraPackingLinkFormRow[];
  variants: KolamPackingLinkVariantOption[];
}) {
  return (
    <KolamPackingLinksEditor
      disabled={disabled}
      onChange={onChange}
      packings={packings}
      rootTargetLabel="Teranura utama"
      rows={rows}
      variants={variants}
    />
  );
}

function createDefaultCustomFieldValue(field: KolamCustomField) {
  if (field.fieldType === 'boolean') {
    return false;
  }
  if (field.fieldType === 'range') {
    return { min: '', max: '' };
  }
  return '';
}

function getFieldId(row: Record<string, unknown>) {
  const value = row.field;
  if (typeof value === 'string') {
    return value;
  }
  const record = asRecord(value);
  return String(record._id ?? record.id ?? '');
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export { createEmptyGrocerPricingTierRow };
export type { KolamTeranuraComponentFormRow, KolamTeranuraGrocerPricingTierFormRow };

const styles = StyleSheet.create({
  categoryPickerStack: { gap: 8 },
  selectedCategoryRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectedCategoryButton: { minHeight: 30, paddingHorizontal: 10 },
  longDropdownMenu: { width: 320 },
  fieldHint: { color: V.colors.mutedFg, fontSize: 12, fontWeight: '700', lineHeight: 18 },
  rowText: { color: V.colors.fg, fontSize: 13, fontWeight: '700', lineHeight: 18 },
  twoColumnGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  halfField: { flexBasis: 0, flexGrow: 1, minWidth: 220 },
  externalLinksStack: { alignSelf: 'stretch', gap: 8, minWidth: 0, width: '100%' },
  externalLinkRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 8,
    minWidth: 0,
    width: '100%',
  },
  externalLinkTypeSelect: { flexBasis: 128, flexShrink: 0, minWidth: 120 },
  externalLinkDropdown: { alignSelf: 'stretch', maxWidth: '100%', minWidth: 0, width: '100%' },
  externalLinkDropdownTrigger: { maxWidth: '100%', minWidth: 0, width: '100%' },
  externalLinkDropdownTriggerText: { flexShrink: 1, maxWidth: '100%' },
  externalLinkInput: { flex: 1, minWidth: 80 },
  externalLinkRemoveButton: { flexShrink: 0, minHeight: 34 },
  externalLinkAddButton: { alignSelf: 'flex-start', minHeight: 34 },
  vendorPricePanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  vendorPriceRow: {
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    gap: 10,
    padding: 10,
  },
  rowManagerHeader: { alignItems: 'center', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  panelTitle: { color: V.colors.fg, fontSize: 13, fontWeight: '900', lineHeight: 18 },
  priceInputShell: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.input,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
  },
  priceInputPrefix: { color: V.colors.mutedFg, fontSize: 13, fontWeight: '800' },
  priceInputField: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    flex: 1,
    paddingHorizontal: 0,
  },
  chipListStack: { gap: 8 },
  chipAddRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  chipAddInput: { flex: 1 },
  configuratorCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 16,
    padding: 14,
  },
  sellableSwitchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 38,
  },
  applyCombinationsButton: { alignSelf: 'flex-start' },
  variantCard: {
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  variantTitle: { color: V.colors.fg, fontSize: 13, fontWeight: '900' },
  variantTabHeader: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  variantTabButton: { minHeight: 30, paddingHorizontal: 10 },
  variantTabPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  dimensionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  dimensionField: { flexBasis: 0, flexGrow: 1, minWidth: 140 },
  existingMediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  existingMediaCard: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    minWidth: 180,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  existingMediaLabel: { color: V.colors.fg, flex: 1, fontSize: 12, fontWeight: '700' },
  existingMediaDeleteButton: { minHeight: 26, paddingHorizontal: 8 },
  existingVideoCard: { gap: 6, minWidth: 240 },
  existingVideoPlayer: { borderRadius: 6, height: 140, width: 240 },
  mediaPickerStack: { gap: 14 },
  mediaUploadSection: { gap: 8 },
  customFieldPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  customFieldRowStack: { gap: 8 },
  customFieldRow: {
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    gap: 8,
    padding: 10,
  },
  customFieldRowHeader: { alignItems: 'center', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  customFieldRowLabel: { color: V.colors.fg, fontSize: 13, fontWeight: '800' },
});
