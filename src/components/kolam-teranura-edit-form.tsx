import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  createEmptyKolamTeranuraVariantFormRow,
  createEmptyKolamTeranuraVendorPriceFormRow,
  type KolamTeranuraExternalLinkFormRow,
  type KolamTeranuraFormState,
  type KolamTeranuraLinkName,
  type KolamTeranuraVariantFormRow,
  type KolamTeranuraVendorPriceFormRow,
} from '../domain/kolam-teranura-form';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { type KolamTeranuraController } from '../hooks/use-kolam-teranura-controller';
import { KolamBadge } from './kolam-badge';
import { KolamButton } from './kolam-button';
import { KolamCancelButton } from './kolam-cancel-button';
import { KolamCatalogTranslationsEditor } from './kolam-catalog-translations-editor';
import { KolamCommercialPolicyEditor } from './kolam-commercial-policy-editor';
import { KolamComponentOverridesEditor } from './kolam-component-overrides-editor';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamNativeFormSection } from './kolam-native-form-section';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { KolamSettingsWebFileField } from './kolam-settings-web-file-field';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamSwitch } from './kolam-switch';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

const EXTERNAL_LINK_OPTIONS: Array<{
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

export function TeranuraEditFormPage({
  controller,
  onCancel,
  onSaved,
}: {
  controller: KolamTeranuraController;
  onCancel: () => void;
  onSaved: (id: string) => void;
}) {
  const form = controller.form;

  if (!form) {
    return (
      <KolamDetailScrollSurface contentContainerStyle={styles.root}>
        <View style={styles.emptyHeaderRow}>
          <View style={styles.headingCopy}>
            <Text style={styles.eyebrow}>TERANURA</Text>
            <Text style={styles.title}>Edit Teranura</Text>
            <Text style={styles.description}>
              {controller.loading ? 'Memuat...' : 'Form belum siap.'}
            </Text>
          </View>
          <KolamCancelButton onPress={onCancel} />
        </View>
      </KolamDetailScrollSurface>
    );
  }

  const disabled = controller.saving;
  const hasVariants = form.hasVariants || form.variants.length > 0;
  const categoryOptions = controller.categories.filter(
    category => !form.categoryIds.includes(category.id),
  );
  const selectedCategories = controller.categories.filter(category =>
    form.categoryIds.includes(category.id),
  );
  const brandOptions = controller.brands.filter(
    brand => !form.brandIds.includes(brand.id),
  );
  const selectedBrands = controller.brands.filter(brand =>
    form.brandIds.includes(brand.id),
  );
  const tagOptions = controller.tags.filter(
    tag => !form.tagIds.includes(tag.id),
  );
  const selectedTags = controller.tags.filter(tag =>
    form.tagIds.includes(tag.id),
  );
  const unitOptions = [
    { label: 'Pilih satuan', value: '' },
    ...controller.units.map(unit => ({
      label: unit.initial ? `${unit.name} (${unit.initial})` : unit.name,
      value: unit.id,
    })),
  ];
  const locationOptions = [
    { label: 'Pilih lokasi', value: '' },
    ...controller.locations.map(location => ({
      label: location.label,
      value: location.id,
    })),
  ];
  const shippingOptions = [
    { label: 'Tambah metode pengiriman', value: '' },
    ...controller.shippingMethods
      .filter(method => !form.availableShippingMethodIds.includes(method.id))
      .map(method => ({ label: method.displayName, value: method.id })),
  ];
  const selectedShippingMethods = controller.shippingMethods.filter(method =>
    form.availableShippingMethodIds.includes(method.id),
  );
  const weightUnits = controller.units.filter(unit => unit.type === 'weight');
  const weightUnitSource = weightUnits.length ? weightUnits : controller.units;
  const dimensionUnits = controller.units.filter(
    unit => unit.type === 'length',
  );
  const dimensionUnitSource = dimensionUnits.length
    ? dimensionUnits
    : controller.units;
  const weightUnitOptions = [
    { label: 'Pilih satuan', value: '' },
    ...weightUnitSource.map(unit => ({
      label: unit.initial ? `${unit.name} (${unit.initial})` : unit.name,
      value: unit.id,
    })),
  ];
  const dimensionUnitOptions = [
    { label: 'Pilih satuan', value: '' },
    ...dimensionUnitSource.map(unit => ({
      label: unit.initial ? `${unit.name} (${unit.initial})` : unit.name,
      value: unit.id,
    })),
  ];
  const vendorOptions = [
    { label: 'Pilih pemasok', value: '' },
    ...controller.vendors.map(vendor => ({
      label: vendor.name,
      value: vendor.id,
    })),
  ];
  const packingNames =
    controller.selectedItem?.packings
      .map(line => line.name.trim())
      .filter(Boolean) ?? [];
  const attachedNames =
    controller.selectedItem?.attachedItems
      .map(item => item.targetName.trim() || item.typeLabel.trim())
      .filter(Boolean) ?? [];
  const existingPhotos = controller.selectedItem?.photos ?? [];
  const existingVideos = controller.selectedItem?.videos ?? [];
  const photoCount =
    existingPhotos.length + (form.photoLocalUri.trim() ? 1 : 0);
  const videoCount =
    existingVideos.length + (form.videoLocalUri.trim() ? 1 : 0);

  const patchForm = (patch: Partial<KolamTeranuraFormState>) => {
    controller.onChangeForm(patch);
  };

  const patchVariant = (
    variantId: string,
    patch: Partial<KolamTeranuraVariantFormRow>,
  ) => {
    patchForm({
      variants: form.variants.map(variant =>
        variant.id === variantId ? { ...variant, ...patch } : variant,
      ),
    });
  };

  const handleSave = () => {
    void controller.onSave().then(result => {
      if (result) {
        onSaved(result.id);
      }
    });
  };

  return (
    <KolamDetailScrollSurface contentContainerStyle={styles.root}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters} />
          <View style={kolamTableToolbarStyles.actions}>
            <KolamCancelButton disabled={disabled} onPress={onCancel} />
            <KolamButton
              disabled={disabled}
              intent="primary"
              label={disabled ? 'Menyimpan...' : 'Simpan'}
              onPress={handleSave}
            />
          </View>
        </View>
      </View>

      {controller.error ? (
        <Text style={styles.error}>{controller.error}</Text>
      ) : null}

      <KolamNativeFormSection
        section={{
          description: '',
          id: 'catalog-translations',
          title: 'Data Produk',
        }}
      >
        <View style={settingsWebFormStyles.settingsWebFormFields}>
          <View style={settingsWebFormStyles.settingsWebFormFieldsGrid}>
            <TeranuraEditSection title="Informasi Dasar">
              <View style={styles.productBasicInfoCard}>
                <View style={styles.twoColumnGrid}>
                  <View style={styles.productBasicInfoHalfField}>
                    <TeranuraFieldShell label="SKU" required>
                      <KolamFormTextField
                        editable={!disabled}
                        onChangeText={sku => patchForm({ sku })}
                        placeholder="SKU"
                        style={settingsWebFormStyles.settingsWebFormFieldValue}
                        value={form.sku}
                      />
                    </TeranuraFieldShell>
                  </View>
                  <View style={styles.productBasicInfoHalfField}>
                    <TeranuraFieldShell label="Satuan" required>
                      <KolamDropdownSelect
                        accessibilityLabel="Pilih satuan"
                        label="Satuan"
                        menuStyle={styles.longDropdownMenu}
                        onChange={unitId => patchForm({ unitId })}
                        options={unitOptions}
                        searchable
                        searchPlaceholder="Cari satuan..."
                        showLabelInTrigger={false}
                        value={form.unitId}
                      />
                    </TeranuraFieldShell>
                  </View>
                </View>

                <View style={styles.twoColumnGrid}>
                  <View style={styles.productBasicInfoHalfField}>
                    <TeranuraMultiSelectField
                      disabled={disabled}
                      emptyText="Belum ada kategori dipilih."
                      label="Kategori Produk"
                      onAdd={categoryId =>
                        patchForm({
                          categoryIds: [...form.categoryIds, categoryId],
                        })
                      }
                      onRemove={categoryId =>
                        patchForm({
                          categoryIds: form.categoryIds.filter(
                            id => id !== categoryId,
                          ),
                        })
                      }
                      options={categoryOptions.map(category => ({
                        id: category.id,
                        label: `${'  '.repeat(category.level)}${category.name}`,
                      }))}
                      selected={selectedCategories.map(category => ({
                        id: category.id,
                        label: category.name,
                      }))}
                      triggerLabel="Tambah kategori"
                    />
                  </View>
                  <View style={styles.productBasicInfoHalfField}>
                    <TeranuraMultiSelectField
                      disabled={disabled}
                      emptyText="Belum ada merek dipilih."
                      label="Brand"
                      onAdd={brandId =>
                        patchForm({
                          brandIds: [...form.brandIds, brandId],
                        })
                      }
                      onRemove={brandId =>
                        patchForm({
                          brandIds: form.brandIds.filter(id => id !== brandId),
                        })
                      }
                      options={brandOptions.map(brand => ({
                        id: brand.id,
                        label: brand.name,
                      }))}
                      selected={selectedBrands.map(brand => ({
                        id: brand.id,
                        label: brand.name,
                      }))}
                      triggerLabel="Tambah merek"
                    />
                  </View>
                </View>

                <View style={styles.twoColumnGrid}>
                  <View style={styles.productBasicInfoHalfField}>
                    <TeranuraMultiSelectField
                      disabled={disabled}
                      emptyText="Belum ada tag dipilih."
                      label="Tag"
                      onAdd={tagId =>
                        patchForm({
                          tagIds: [...form.tagIds, tagId],
                        })
                      }
                      onRemove={tagId =>
                        patchForm({
                          tagIds: form.tagIds.filter(id => id !== tagId),
                        })
                      }
                      options={tagOptions.map(tag => ({
                        id: tag.id,
                        label: tag.name,
                      }))}
                      selected={selectedTags.map(tag => ({
                        id: tag.id,
                        label: tag.name,
                      }))}
                      triggerLabel="Tambah tag"
                    />
                  </View>
                  <View style={styles.productBasicInfoHalfField}>
                    <TeranuraFieldShell label="Tautan Eksternal">
                      <TeranuraExternalLinksRowsEditor
                        disabled={disabled}
                        links={form.externalLinks}
                        onChange={externalLinks => patchForm({ externalLinks })}
                      />
                    </TeranuraFieldShell>
                  </View>
                </View>

                <View style={styles.twoColumnGrid}>
                  <View style={styles.productBasicInfoHalfField}>
                    <TeranuraFieldShell label="Lokasi">
                      <KolamDropdownSelect
                        label="Lokasi"
                        menuStyle={styles.longDropdownMenu}
                        onChange={locationId => patchForm({ locationId })}
                        options={locationOptions}
                        searchable
                        searchPlaceholder="Cari lokasi..."
                        showLabelInTrigger={false}
                        value={form.locationId}
                      />
                    </TeranuraFieldShell>
                  </View>
                </View>
              </View>
            </TeranuraEditSection>

            <TeranuraEditSection title="Media">
              <View style={styles.productBasicInfoCard}>
                <View style={styles.mediaPickerStack}>
                  <View style={styles.mediaUploadSection}>
                    <KolamSettingsWebFileField
                      accessibilityLabel="Foto produk"
                      actionLabel="Pilih file"
                      disabled={disabled}
                      emptyLabel="Foto belum dipilih"
                      fileCount={Math.min(photoCount, 10)}
                      fileMax={10}
                      onLocalValueChange={photoLocalUri =>
                        patchForm({ photoLocalUri })
                      }
                      onUpload={() => {
                        void controller.onPickPhoto();
                      }}
                      scope="teranura-photo"
                      title="Foto"
                      value={form.photoLocalUri}
                    />
                    {existingPhotos.length ? (
                      <View style={styles.existingMediaGrid}>
                        {existingPhotos.map((photoUri, index) => (
                          <KolamRemoteImage
                            accessibilityLabel={`Foto ${index + 1}`}
                            key={`${photoUri}-${index}`}
                            revision={`${controller.selectedItem?.id ?? ''}-${index}`}
                            scope="teranura"
                            sourceUri={photoUri}
                            style={styles.existingMediaImage}
                          />
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
                      onLocalValueChange={videoLocalUri =>
                        patchForm({ videoLocalUri })
                      }
                      onUpload={() => {
                        void controller.onPickVideo();
                      }}
                      previewKind="file"
                      scope="teranura-video"
                      title="Video"
                      value={form.videoLocalUri}
                    />
                    {existingVideos.length ? (
                      <View style={styles.existingMediaGrid}>
                        {existingVideos.map((videoUri, index) => (
                          <KolamCopyStack
                            key={`${videoUri}-${index}`}
                            items={[
                              {
                                id: `video-${index}`,
                                text: videoUri,
                                style: styles.fieldHint,
                              },
                            ]}
                          />
                        ))}
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            </TeranuraEditSection>

            <TeranuraEditSection title="Varian">
              <View style={styles.productBasicInfoCard}>
                <View style={styles.variantEditorPanel}>
                  <View style={styles.variantSwitchPanel}>
                    <KolamCopyStack
                      containerStyle={styles.variantSwitchCopy}
                      items={[
                        {
                          id: 'label',
                          text: 'Produk ini memiliki varian',
                          style: styles.variantTitle,
                        },
                      ]}
                    />
                    <KolamSwitch
                      accessibilityLabel="Aktifkan varian produk"
                      active={hasVariants}
                      disabled={disabled}
                      onPress={() => {
                        if (hasVariants) {
                          patchForm({
                            hasVariants: false,
                            variantConfigTier1Name: 'Varian',
                            variantConfigTier2Name: '',
                            variants: [],
                          });
                          return;
                        }
                        patchForm({
                          hasVariants: true,
                          variants:
                            form.variants.length > 0
                              ? form.variants
                              : [createEmptyKolamTeranuraVariantFormRow()],
                        });
                      }}
                    />
                  </View>

                  {hasVariants ? (
                    <View style={styles.variantConfiguratorCard}>
                      <View style={styles.twoColumnGrid}>
                        <View style={styles.productBasicInfoHalfField}>
                          <TeranuraFieldShell label="Varian Utama" required>
                            <KolamFormTextField
                              editable={!disabled}
                              onChangeText={variantConfigTier1Name =>
                                patchForm({ variantConfigTier1Name })
                              }
                              placeholder="Contoh: Ukuran"
                              style={
                                settingsWebFormStyles.settingsWebFormFieldValue
                              }
                              value={form.variantConfigTier1Name}
                            />
                          </TeranuraFieldShell>
                        </View>
                        <View style={styles.productBasicInfoHalfField}>
                          <TeranuraFieldShell label="Varian Kedua">
                            <KolamFormTextField
                              editable={!disabled}
                              onChangeText={variantConfigTier2Name =>
                                patchForm({ variantConfigTier2Name })
                              }
                              placeholder="Contoh: Warna"
                              style={
                                settingsWebFormStyles.settingsWebFormFieldValue
                              }
                              value={form.variantConfigTier2Name}
                            />
                          </TeranuraFieldShell>
                        </View>
                      </View>

                      <View style={styles.variantManagerHeader}>
                        <KolamCopyStack
                          items={[
                            {
                              id: 'title',
                              text: 'Daftar Varian',
                              style: styles.variantFieldPanelTitle,
                            },
                          ]}
                        />
                        <View style={styles.variantHeaderActions}>
                          <KolamBadge
                            intent="primary"
                            label={`${form.variants.length} varian`}
                          />
                          <KolamButton
                            disabled={disabled}
                            intent="outline"
                            label="Tambah Varian"
                            onPress={() =>
                              patchForm({
                                hasVariants: true,
                                variants: [
                                  ...form.variants,
                                  createEmptyKolamTeranuraVariantFormRow(),
                                ],
                              })
                            }
                          />
                        </View>
                      </View>

                      {form.variants.length ? (
                        <View style={styles.variantListShell}>
                          {form.variants.map((variant, index) => (
                            <View key={variant.id} style={styles.variantCard}>
                              <View style={styles.variantManagerHeader}>
                                <Text style={styles.variantTitle}>
                                  Varian {index + 1}
                                </Text>
                                <KolamButton
                                  disabled={disabled}
                                  intent="outline"
                                  label="Hapus"
                                  onPress={() => {
                                    const next = form.variants.filter(
                                      row => row.id !== variant.id,
                                    );
                                    patchForm({
                                      variants: next,
                                      hasVariants: next.length > 0,
                                    });
                                  }}
                                />
                              </View>
                              <View style={styles.twoColumnGrid}>
                                <View style={styles.productBasicInfoHalfField}>
                                  <TeranuraFieldShell label="Nilai Varian 1">
                                    <KolamFormTextField
                                      editable={!disabled}
                                      onChangeText={tier1Value =>
                                        patchVariant(variant.id, { tier1Value })
                                      }
                                      placeholder="Nilai varian 1"
                                      style={
                                        settingsWebFormStyles.settingsWebFormFieldValue
                                      }
                                      value={variant.tier1Value}
                                    />
                                  </TeranuraFieldShell>
                                </View>
                                <View style={styles.productBasicInfoHalfField}>
                                  <TeranuraFieldShell label="Nilai Varian 2">
                                    <KolamFormTextField
                                      editable={!disabled}
                                      onChangeText={tier2Value =>
                                        patchVariant(variant.id, { tier2Value })
                                      }
                                      placeholder="Nilai varian 2"
                                      style={
                                        settingsWebFormStyles.settingsWebFormFieldValue
                                      }
                                      value={variant.tier2Value}
                                    />
                                  </TeranuraFieldShell>
                                </View>
                              </View>
                              <View style={styles.twoColumnGrid}>
                                <View style={styles.productBasicInfoHalfField}>
                                  <TeranuraFieldShell label="SKU">
                                    <KolamFormTextField
                                      editable={!disabled}
                                      onChangeText={sku =>
                                        patchVariant(variant.id, { sku })
                                      }
                                      placeholder="SKU"
                                      style={
                                        settingsWebFormStyles.settingsWebFormFieldValue
                                      }
                                      value={variant.sku}
                                    />
                                  </TeranuraFieldShell>
                                </View>
                                <View style={styles.productBasicInfoHalfField}>
                                  <TeranuraFieldShell label="Ambang Stok Rendah">
                                    <KolamFormTextField
                                      editable={!disabled}
                                      keyboardType="numeric"
                                      onChangeText={lowStockThreshold =>
                                        patchVariant(variant.id, {
                                          lowStockThreshold,
                                        })
                                      }
                                      placeholder="0"
                                      style={
                                        settingsWebFormStyles.settingsWebFormFieldValue
                                      }
                                      value={variant.lowStockThreshold}
                                    />
                                  </TeranuraFieldShell>
                                </View>
                              </View>
                              <View style={styles.twoColumnGrid}>
                                <View style={styles.productBasicInfoHalfField}>
                                  <TeranuraFieldShell label="Harga">
                                    <KolamFormTextField
                                      editable={!disabled}
                                      keyboardType="numeric"
                                      onChangeText={price =>
                                        patchVariant(variant.id, { price })
                                      }
                                      style={
                                        settingsWebFormStyles.settingsWebFormFieldValue
                                      }
                                      value={variant.price}
                                    />
                                  </TeranuraFieldShell>
                                </View>
                                <View style={styles.productBasicInfoHalfField}>
                                  <TeranuraFieldShell label="Harga Jual">
                                    <KolamFormTextField
                                      editable={!disabled}
                                      keyboardType="numeric"
                                      onChangeText={priceToSell =>
                                        patchVariant(variant.id, {
                                          priceToSell,
                                        })
                                      }
                                      style={
                                        settingsWebFormStyles.settingsWebFormFieldValue
                                      }
                                      value={variant.priceToSell}
                                    />
                                  </TeranuraFieldShell>
                                </View>
                                <View style={styles.productBasicInfoHalfField}>
                                  <TeranuraFieldShell label="Harga Pasar">
                                    <KolamFormTextField
                                      editable={!disabled}
                                      keyboardType="numeric"
                                      onChangeText={marketPrice =>
                                        patchVariant(variant.id, {
                                          marketPrice,
                                        })
                                      }
                                      style={
                                        settingsWebFormStyles.settingsWebFormFieldValue
                                      }
                                      value={variant.marketPrice}
                                    />
                                  </TeranuraFieldShell>
                                </View>
                                <View style={styles.productBasicInfoHalfField}>
                                  <TeranuraFieldShell label="Harga Daring">
                                    <KolamFormTextField
                                      editable={!disabled}
                                      keyboardType="numeric"
                                      onChangeText={onlinePrice =>
                                        patchVariant(variant.id, {
                                          onlinePrice,
                                        })
                                      }
                                      style={
                                        settingsWebFormStyles.settingsWebFormFieldValue
                                      }
                                      value={variant.onlinePrice}
                                    />
                                  </TeranuraFieldShell>
                                </View>
                                <View style={styles.productBasicInfoHalfField}>
                                  <TeranuraFieldShell label="Harga Minimum">
                                    <KolamFormTextField
                                      editable={!disabled}
                                      keyboardType="numeric"
                                      onChangeText={minimumPriceToSales =>
                                        patchVariant(variant.id, {
                                          minimumPriceToSales,
                                        })
                                      }
                                      style={
                                        settingsWebFormStyles.settingsWebFormFieldValue
                                      }
                                      value={variant.minimumPriceToSales}
                                    />
                                  </TeranuraFieldShell>
                                </View>
                              </View>
                              <View style={styles.sellableSwitchRow}>
                                <KolamCopyStack
                                  items={[
                                    {
                                      id: 'points-label',
                                      text: 'Poin anggota',
                                      style: styles.variantTitle,
                                    },
                                  ]}
                                />
                                <KolamSwitch
                                  accessibilityLabel="Poin anggota varian"
                                  active={variant.memberPointsEnabled}
                                  disabled={disabled}
                                  onPress={() =>
                                    patchVariant(variant.id, {
                                      memberPointsEnabled:
                                        !variant.memberPointsEnabled,
                                    })
                                  }
                                />
                              </View>
                              {variant.memberPointsEnabled ? (
                                <TeranuraFieldShell label="Poin">
                                  <KolamFormTextField
                                    editable={!disabled}
                                    keyboardType="numeric"
                                    onChangeText={memberPoints =>
                                      patchVariant(variant.id, { memberPoints })
                                    }
                                    style={
                                      settingsWebFormStyles.settingsWebFormFieldValue
                                    }
                                    value={variant.memberPoints}
                                  />
                                </TeranuraFieldShell>
                              ) : null}
                            </View>
                          ))}
                        </View>
                      ) : (
                        <KolamCopyStack
                          items={[
                            {
                              id: 'empty-variants',
                              text: 'Belum ada varian.',
                              style: styles.fieldHint,
                            },
                          ]}
                        />
                      )}
                    </View>
                  ) : null}
                </View>
              </View>
            </TeranuraEditSection>

            <View style={styles.productEditTwoColumnSections}>
              <View style={styles.productEditTwoColumnSection}>
                <TeranuraEditSection title="Field Kustom">
                  <View style={styles.productBasicInfoCard}>
                    <KolamCopyStack
                      items={[
                        {
                          id: 'empty-custom-fields',
                          text: 'Belum ada editor field kustom aktif.',
                          style: styles.fieldHint,
                        },
                      ]}
                    />
                  </View>
                </TeranuraEditSection>
              </View>

              <View style={styles.productEditTwoColumnSection}>
                <TeranuraEditSection title="Penjualan dan Inventori">
                  <View style={styles.productBasicInfoCard}>
                    <TeranuraFieldShell label="Penjualan">
                      <View style={styles.grocerPricingPanel}>
                        <View style={styles.sellableSwitchRow}>
                          <KolamCopyStack
                            items={[
                              {
                                id: 'label',
                                text: 'Produk dijual',
                                style: styles.variantTitle,
                              },
                            ]}
                          />
                          <KolamSwitch
                            accessibilityLabel="Produk dijual"
                            active={form.sellable}
                            disabled={disabled}
                            onPress={() =>
                              patchForm({ sellable: !form.sellable })
                            }
                          />
                        </View>

                        <KolamDropdownSelect
                          accessibilityLabel="Tambah metode pengiriman"
                          label="Metode pengiriman tersedia"
                          menuStyle={styles.longDropdownMenu}
                          onChange={methodId => {
                            if (
                              !methodId ||
                              form.availableShippingMethodIds.includes(
                                methodId,
                              )
                            ) {
                              return;
                            }
                            patchForm({
                              availableShippingMethodIds: [
                                ...form.availableShippingMethodIds,
                                methodId,
                              ],
                            });
                          }}
                          options={shippingOptions}
                          searchable
                          searchPlaceholder="Cari metode pengiriman..."
                          showLabelInTrigger={false}
                          value=""
                        />
                        <View style={styles.selectedCategoryRow}>
                          {selectedShippingMethods.length ? (
                            selectedShippingMethods.map(method => (
                              <KolamButton
                                disabled={disabled}
                                intent="outline"
                                key={method.id}
                                label={`${method.displayName} x`}
                                onPress={() =>
                                  patchForm({
                                    availableShippingMethodIds:
                                      form.availableShippingMethodIds.filter(
                                        methodId => methodId !== method.id,
                                      ),
                                  })
                                }
                                style={styles.selectedCategoryButton}
                              />
                            ))
                          ) : (
                            <KolamCopyStack
                              items={[
                                {
                                  id: 'empty-shipping',
                                  text: 'Belum ada metode pengiriman dipilih.',
                                  style: styles.fieldHint,
                                },
                              ]}
                            />
                          )}
                        </View>
                      </View>
                    </TeranuraFieldShell>

                    {!hasVariants ? (
                      <TeranuraFieldShell label="Inventori Produk">
                        <View style={styles.pricingPanelStack}>
                          <View style={styles.variantFieldPanel}>
                            <KolamCopyStack
                              items={[
                                {
                                  id: 'title',
                                  text: 'Stok dan Peringatan',
                                  style: styles.variantFieldPanelTitle,
                                },
                              ]}
                            />
                            <TeranuraFieldShell label="Ambang Stok Rendah">
                              <KolamFormTextField
                                editable={!disabled}
                                keyboardType="numeric"
                                onChangeText={lowStockThreshold =>
                                  patchForm({ lowStockThreshold })
                                }
                                style={
                                  settingsWebFormStyles.settingsWebFormFieldValue
                                }
                                value={form.lowStockThreshold}
                              />
                            </TeranuraFieldShell>
                          </View>
                        </View>
                      </TeranuraFieldShell>
                    ) : null}
                  </View>
                </TeranuraEditSection>
              </View>
            </View>

            {!hasVariants ? (
              <TeranuraEditSection title="Bahan Penyusun">
                <View style={styles.productBasicInfoCard}>
                  <KolamComponentOverridesEditor
                    disabled={disabled}
                    onChange={componentRows => patchForm({ componentRows })}
                    products={controller.componentProducts}
                    rows={form.componentRows}
                  />
                </View>
              </TeranuraEditSection>
            ) : null}

            {!hasVariants ? (
              <TeranuraEditSection title="Harga">
                <View style={styles.productBasicInfoCard}>
                  <View style={styles.pricingPanelStack}>
                    <View style={styles.variantFieldPanel}>
                      <KolamCopyStack
                        items={[
                          {
                            id: 'title',
                            text: 'Harga Penjualan',
                            style: styles.variantFieldPanelTitle,
                          },
                        ]}
                      />
                      <View style={styles.twoColumnGrid}>
                        <View style={styles.productBasicInfoHalfField}>
                          <TeranuraFieldShell label="Harga">
                            <KolamFormTextField
                              editable={!disabled}
                              keyboardType="numeric"
                              onChangeText={price => patchForm({ price })}
                              style={
                                settingsWebFormStyles.settingsWebFormFieldValue
                              }
                              value={form.price}
                            />
                          </TeranuraFieldShell>
                        </View>
                        <View style={styles.productBasicInfoHalfField}>
                          <TeranuraFieldShell label="Harga Jual">
                            <KolamFormTextField
                              editable={!disabled}
                              keyboardType="numeric"
                              onChangeText={priceToSell =>
                                patchForm({ priceToSell })
                              }
                              style={
                                settingsWebFormStyles.settingsWebFormFieldValue
                              }
                              value={form.priceToSell}
                            />
                          </TeranuraFieldShell>
                        </View>
                        <View style={styles.productBasicInfoHalfField}>
                          <TeranuraFieldShell label="Harga Pasar">
                            <KolamFormTextField
                              editable={!disabled}
                              keyboardType="numeric"
                              onChangeText={marketPrice =>
                                patchForm({ marketPrice })
                              }
                              style={
                                settingsWebFormStyles.settingsWebFormFieldValue
                              }
                              value={form.marketPrice}
                            />
                          </TeranuraFieldShell>
                        </View>
                        <View style={styles.productBasicInfoHalfField}>
                          <TeranuraFieldShell label="Harga Daring">
                            <KolamFormTextField
                              editable={!disabled}
                              keyboardType="numeric"
                              onChangeText={onlinePrice =>
                                patchForm({ onlinePrice })
                              }
                              style={
                                settingsWebFormStyles.settingsWebFormFieldValue
                              }
                              value={form.onlinePrice}
                            />
                          </TeranuraFieldShell>
                        </View>
                        <View style={styles.productBasicInfoHalfField}>
                          <TeranuraFieldShell label="Harga Minimum">
                            <KolamFormTextField
                              editable={!disabled}
                              keyboardType="numeric"
                              onChangeText={minimumPriceToSales =>
                                patchForm({ minimumPriceToSales })
                              }
                              style={
                                settingsWebFormStyles.settingsWebFormFieldValue
                              }
                              value={form.minimumPriceToSales}
                            />
                          </TeranuraFieldShell>
                        </View>
                      </View>
                    </View>

                    <View style={styles.vendorPricePanel}>
                      <View style={styles.variantManagerHeader}>
                        <KolamCopyStack
                          items={[
                            {
                              id: 'title',
                              text: 'Harga Pemasok',
                              style: styles.variantTitle,
                            },
                          ]}
                        />
                        <KolamButton
                          disabled={disabled}
                          intent="primary"
                          label="Tambah Pemasok"
                          onPress={() =>
                            patchForm({
                              vendorPrices: [
                                ...form.vendorPrices,
                                createEmptyKolamTeranuraVendorPriceFormRow(),
                              ],
                            })
                          }
                        />
                      </View>
                      {form.vendorPrices.length ? (
                        form.vendorPrices.map((row, index) => (
                          <TeranuraVendorPriceRow
                            disabled={disabled}
                            index={index}
                            key={row.id}
                            onPatch={patch =>
                              patchForm({
                                vendorPrices: form.vendorPrices.map(item =>
                                  item.id === row.id
                                    ? { ...item, ...patch }
                                    : item,
                                ),
                              })
                            }
                            onRemove={() =>
                              patchForm({
                                vendorPrices: form.vendorPrices.filter(
                                  item => item.id !== row.id,
                                ),
                              })
                            }
                            row={row}
                            vendorOptions={vendorOptions}
                          />
                        ))
                      ) : (
                        <KolamCopyStack
                          items={[
                            {
                              id: 'empty-vendors',
                              text: 'Belum ada harga pemasok.',
                              style: styles.fieldHint,
                            },
                          ]}
                        />
                      )}
                    </View>

                    <KolamCommercialPolicyEditor
                      disabled={disabled}
                      memberPointsDisabled={!form.sellable}
                      onChange={value =>
                        patchForm({
                          commissionEnabled: value.commissionEnabled,
                          commissionType: value.commissionType,
                          commissionValue: value.commissionValue,
                          memberPointsEnabled: value.memberPointsEnabled,
                          memberPoints: value.memberPoints,
                        })
                      }
                      value={{
                        commissionEnabled: form.commissionEnabled,
                        commissionType: form.commissionType,
                        commissionValue: form.commissionValue,
                        memberPointsEnabled: form.memberPointsEnabled,
                        memberPoints: form.memberPoints,
                      }}
                    />
                  </View>
                </View>
              </TeranuraEditSection>
            ) : null}

            {!hasVariants ? (
              <TeranuraEditSection title="Logistik">
                <View style={styles.productBasicInfoCard}>
                  <View style={styles.pricingPanelStack}>
                    <View style={styles.variantFieldPanel}>
                      <KolamCopyStack
                        items={[
                          {
                            id: 'title',
                            text: 'Berat',
                            style: styles.variantFieldPanelTitle,
                          },
                        ]}
                      />
                      <View style={styles.twoColumnGrid}>
                        <View style={styles.productBasicInfoHalfField}>
                          <TeranuraFieldShell label="Nilai berat">
                            <KolamFormTextField
                              editable={!disabled}
                              keyboardType="numeric"
                              onChangeText={weightValue =>
                                patchForm({ weightValue })
                              }
                              placeholder="Nilai berat"
                              style={
                                settingsWebFormStyles.settingsWebFormFieldValue
                              }
                              value={form.weightValue}
                            />
                          </TeranuraFieldShell>
                        </View>
                        <View style={styles.productBasicInfoHalfField}>
                          <TeranuraFieldShell label="Satuan berat">
                            <KolamDropdownSelect
                              label="Satuan berat"
                              menuStyle={styles.longDropdownMenu}
                              onChange={weightUnitId =>
                                patchForm({ weightUnitId })
                              }
                              options={weightUnitOptions}
                              searchable
                              searchPlaceholder="Cari satuan..."
                              showLabelInTrigger={false}
                              value={form.weightUnitId}
                            />
                          </TeranuraFieldShell>
                        </View>
                      </View>
                    </View>

                    <View style={styles.variantFieldPanel}>
                      <KolamCopyStack
                        items={[
                          {
                            id: 'title',
                            text: 'Dimensi',
                            style: styles.variantFieldPanelTitle,
                          },
                        ]}
                      />
                      <View style={styles.logisticsDimensionGrid}>
                        <View style={styles.dimensionField}>
                          <TeranuraFieldShell label="Panjang">
                            <KolamFormTextField
                              editable={!disabled}
                              keyboardType="numeric"
                              onChangeText={dimensionLength =>
                                patchForm({ dimensionLength })
                              }
                              placeholder="Panjang"
                              style={
                                settingsWebFormStyles.settingsWebFormFieldValue
                              }
                              value={form.dimensionLength}
                            />
                          </TeranuraFieldShell>
                        </View>
                        <View style={styles.dimensionField}>
                          <TeranuraFieldShell label="Lebar">
                            <KolamFormTextField
                              editable={!disabled}
                              keyboardType="numeric"
                              onChangeText={dimensionWidth =>
                                patchForm({ dimensionWidth })
                              }
                              placeholder="Lebar"
                              style={
                                settingsWebFormStyles.settingsWebFormFieldValue
                              }
                              value={form.dimensionWidth}
                            />
                          </TeranuraFieldShell>
                        </View>
                        <View style={styles.dimensionField}>
                          <TeranuraFieldShell label="Tinggi">
                            <KolamFormTextField
                              editable={!disabled}
                              keyboardType="numeric"
                              onChangeText={dimensionHeight =>
                                patchForm({ dimensionHeight })
                              }
                              placeholder="Tinggi"
                              style={
                                settingsWebFormStyles.settingsWebFormFieldValue
                              }
                              value={form.dimensionHeight}
                            />
                          </TeranuraFieldShell>
                        </View>
                        <View style={styles.dimensionField}>
                          <TeranuraFieldShell label="Satuan dimensi">
                            <KolamDropdownSelect
                              label="Satuan dimensi"
                              menuStyle={styles.longDropdownMenu}
                              onChange={dimensionUnitId =>
                                patchForm({ dimensionUnitId })
                              }
                              options={dimensionUnitOptions}
                              searchable
                              searchPlaceholder="Cari satuan..."
                              showLabelInTrigger={false}
                              value={form.dimensionUnitId}
                            />
                          </TeranuraFieldShell>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </TeranuraEditSection>
            ) : null}

            {hasVariants ? (
              <TeranuraEditSection title="Komisi">
                <KolamCommercialPolicyEditor
                  disabled={disabled}
                  memberPointsDisabled={!form.sellable || hasVariants}
                  memberPointsHint="Produk ini memakai varian. Poin anggota diatur di tiap varian."
                  onChange={value =>
                    patchForm({
                      commissionEnabled: value.commissionEnabled,
                      commissionType: value.commissionType,
                      commissionValue: value.commissionValue,
                      memberPointsEnabled: value.memberPointsEnabled,
                      memberPoints: value.memberPoints,
                    })
                  }
                  value={{
                    commissionEnabled: form.commissionEnabled,
                    commissionType: form.commissionType,
                    commissionValue: form.commissionValue,
                    memberPointsEnabled: form.memberPointsEnabled,
                    memberPoints: form.memberPoints,
                  }}
                />
              </TeranuraEditSection>
            ) : null}

            <TeranuraEditSection title="SEO Google">
              <View style={styles.productBasicInfoCard}>
                <View style={styles.twoColumnGrid}>
                  <View style={styles.productBasicInfoHalfField}>
                    <TeranuraFieldShell label="Judul SEO">
                      <KolamFormTextField
                        editable={!disabled}
                        onChangeText={seoMetaTitle =>
                          patchForm({ seoMetaTitle })
                        }
                        placeholder="Judul SEO"
                        style={settingsWebFormStyles.settingsWebFormFieldValue}
                        value={form.seoMetaTitle}
                      />
                    </TeranuraFieldShell>
                  </View>
                  <View style={styles.productBasicInfoHalfField}>
                    <TeranuraFieldShell label="Kata Kunci">
                      <KolamFormTextField
                        editable={!disabled}
                        onChangeText={seoKeywords =>
                          patchForm({ seoKeywords })
                        }
                        placeholder="Kata kunci, pisahkan dengan koma"
                        style={settingsWebFormStyles.settingsWebFormFieldValue}
                        value={form.seoKeywords}
                      />
                    </TeranuraFieldShell>
                  </View>
                </View>
                <TeranuraFieldShell label="Deskripsi SEO">
                  <KolamFormTextField
                    editable={!disabled}
                    multiline
                    onChangeText={seoMetaDescription =>
                      patchForm({ seoMetaDescription })
                    }
                    placeholder="Deskripsi SEO"
                    style={[
                      settingsWebFormStyles.settingsWebFormFieldValue,
                      styles.seoTextArea,
                    ]}
                    value={form.seoMetaDescription}
                  />
                </TeranuraFieldShell>
              </View>
            </TeranuraEditSection>

            <TeranuraEditSection title="Keterangan tambahan">
              <View style={styles.productBasicInfoCard}>
                <TeranuraFieldShell label="Kemasan">
                  {packingNames.length ? (
                    packingNames.map((name, index) => (
                      <Text key={`packing-${index}`} style={styles.rowText}>
                        {name}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.fieldHint}>Belum ada kemasan.</Text>
                  )}
                </TeranuraFieldShell>
                <TeranuraFieldShell label="Item Terlampir">
                  {attachedNames.length ? (
                    attachedNames.map((name, index) => (
                      <Text key={`attached-${index}`} style={styles.rowText}>
                        {name}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.fieldHint}>
                      Belum ada item terlampir.
                    </Text>
                  )}
                </TeranuraFieldShell>
              </View>
            </TeranuraEditSection>

            <TeranuraEditSection title="Konten marketplace">
              <KolamCatalogTranslationsEditor
                editable={!disabled}
                kind="product"
                onChange={() => undefined}
                primaryProductLocale={{
                  name: form.name,
                  shortDescription: form.shortDescription,
                  description: form.description,
                  onChange: patch => patchForm(patch),
                }}
                translations={{}}
              />
            </TeranuraEditSection>
          </View>
        </View>
      </KolamNativeFormSection>
    </KolamDetailScrollSurface>
  );
}

function TeranuraEditSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <KolamContentFrame
      style={styles.productEditSection}
      variant="settingsWebConfig"
    >
      <KolamCopyStack
        containerStyle={styles.productEditSectionHeader}
        items={[
          { id: 'title', text: title, style: styles.productEditSectionTitle },
        ]}
      />
      <View style={styles.productEditSectionBody}>{children}</View>
    </KolamContentFrame>
  );
}

function TeranuraFieldShell({
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

function TeranuraMultiSelectField({
  disabled,
  emptyText,
  label,
  onAdd,
  onRemove,
  options,
  selected,
  triggerLabel,
}: {
  disabled: boolean;
  emptyText: string;
  label: string;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  options: Array<{ id: string; label: string }>;
  selected: Array<{ id: string; label: string }>;
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
            selected.map(item => (
              <KolamButton
                disabled={disabled}
                intent="outline"
                key={item.id}
                label={`${item.label} x`}
                onPress={() => onRemove(item.id)}
                style={styles.selectedCategoryButton}
              />
            ))
          ) : (
            <KolamCopyStack
              items={[
                {
                  id: `empty-${label}`,
                  text: emptyText,
                  style: styles.fieldHint,
                },
              ]}
            />
          )}
        </View>
      </View>
    </TeranuraFieldShell>
  );
}

function TeranuraExternalLinksRowsEditor({
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
            <KolamButton
              disabled={disabled}
              intent="outline"
              label="Hapus"
              onPress={() =>
                onChange(links.filter((_, linkIndex) => linkIndex !== index))
              }
              style={styles.externalLinkRemoveButton}
            />
          </View>
        ))
      ) : (
        <KolamCopyStack
          items={[
            {
              id: 'empty-links',
              text: 'Belum ada tautan eksternal.',
              style: styles.fieldHint,
            },
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
      <View style={styles.variantManagerHeader}>
        <Text style={styles.rowText}>{`Vendor ${index + 1}`}</Text>
        <KolamButton
          disabled={disabled}
          intent="outline"
          label="Hapus"
          onPress={onRemove}
        />
      </View>
      <View style={styles.twoColumnGrid}>
        <View style={styles.productBasicInfoHalfField}>
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
        <View style={styles.productBasicInfoHalfField}>
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
        <View style={styles.productBasicInfoHalfField}>
          <KolamFormTextField
            editable={!disabled}
            keyboardType="numeric"
            onChangeText={price => onPatch({ price })}
            placeholder="Harga"
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={row.price}
          />
        </View>
        <View style={styles.productBasicInfoHalfField}>
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

const styles = StyleSheet.create({
  root: {
    alignSelf: 'stretch',
    flexGrow: 1,
    gap: 16,
    minHeight: 0,
    overflow: 'visible',
    width: '100%',
  },
  emptyHeaderRow: {
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    minWidth: 0,
    width: '100%',
  },
  headingCopy: {
    flex: 1,
  },
  eyebrow: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0,
  },
  title: {
    color: V.colors.fg,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    marginTop: 2,
  },
  description: {
    color: V.colors.mutedFg,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  error: {
    color: V.colors.danger,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
  },
  productEditSection: {
    alignSelf: 'stretch',
    gap: 12,
    minWidth: 0,
    padding: 14,
    width: '100%',
  },
  productEditSectionHeader: {
    gap: 3,
  },
  productEditSectionTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  productEditSectionBody: {
    gap: 12,
  },
  productBasicInfoCard: {
    backgroundColor: '#f9fafb',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  productBasicInfoHalfField: {
    flexBasis: 0,
    flexGrow: 1,
    minWidth: 240,
  },
  productEditTwoColumnSections: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productEditTwoColumnSection: {
    flexBasis: 0,
    flexGrow: 1,
    minWidth: 360,
  },
  twoColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  longDropdownMenu: {
    width: 320,
  },
  categoryPickerStack: {
    gap: 8,
  },
  selectedCategoryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedCategoryButton: {
    minHeight: 30,
    paddingHorizontal: 10,
  },
  grocerPricingPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  sellableSwitchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 38,
  },
  fieldHint: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  rowText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  variantEditorPanel: {
    alignSelf: 'stretch',
    gap: 12,
    minWidth: 0,
    width: '100%',
  },
  variantSwitchPanel: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: 12,
  },
  variantSwitchCopy: {
    flex: 1,
    minWidth: 0,
  },
  variantTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
  },
  variantConfiguratorCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 16,
    padding: 14,
  },
  variantManagerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  variantHeaderActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variantListShell: {
    gap: 12,
  },
  variantCard: {
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  variantFieldPanel: {
    alignSelf: 'stretch',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    minWidth: 0,
    padding: 12,
    width: '100%',
  },
  variantFieldPanelTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  pricingPanelStack: {
    alignSelf: 'stretch',
    gap: 12,
    minWidth: 0,
    width: '100%',
  },
  logisticsDimensionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dimensionField: {
    flexBasis: 0,
    flexGrow: 1,
    minWidth: 140,
  },
  mediaPickerStack: {
    gap: 14,
  },
  mediaUploadSection: {
    gap: 8,
  },
  existingMediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  existingMediaImage: {
    borderRadius: 6,
    height: 72,
    width: 116,
  },
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
  externalLinksStack: {
    alignSelf: 'stretch',
    gap: 8,
    minWidth: 0,
    width: '100%',
  },
  externalLinkRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 8,
    minWidth: 0,
    width: '100%',
  },
  externalLinkTypeSelect: {
    flexBasis: 128,
    flexShrink: 0,
    minWidth: 120,
  },
  externalLinkDropdown: {
    alignSelf: 'stretch',
    maxWidth: '100%',
    minWidth: 0,
    width: '100%',
  },
  externalLinkDropdownTrigger: {
    maxWidth: '100%',
    minWidth: 0,
    width: '100%',
  },
  externalLinkDropdownTriggerText: {
    flexShrink: 1,
    maxWidth: '100%',
  },
  externalLinkInput: {
    flex: 1,
    minWidth: 80,
  },
  externalLinkRemoveButton: {
    flexShrink: 0,
    minHeight: 34,
  },
  externalLinkAddButton: {
    alignSelf: 'flex-start',
    minHeight: 34,
  },
  seoTextArea: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
});
