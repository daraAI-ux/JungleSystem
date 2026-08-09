import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  createEmptyKolamTeranuraVariantFormRow,
  createKolamTeranuraVariantCombinationRows,
  type KolamTeranuraFormState,
  type KolamTeranuraVariantFormRow,
} from '../domain/kolam-teranura-form';
import type { KolamTeranura } from '../domain/kolam-teranura';
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
import { KolamDetailTermsTemplatesPanel } from './kolam-detail-more-panels';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamGrocerPricingTiersEditor } from './kolam-grocer-pricing-tiers-editor';
import { KolamNativeFormSection } from './kolam-native-form-section';
import {KolamPageIdentityHeader} from './kolam-page-identity-header';
import { KolamSaveButton } from './kolam-save-button';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamSwitch } from './kolam-switch';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';
import {
  TeranuraCustomFieldRowsEditor,
  TeranuraExternalLinksRowsEditor,
  TeranuraFieldShell,
  TeranuraLinkedProductAssetsPanel,
  TeranuraMediaSection,
  TeranuraMultiSelectField,
  TeranuraPackingLinksPanel,
  TeranuraPriceInput,
  TeranuraVariantCard,
  TeranuraVariantConfiguratorCard,
  TeranuraVendorPricesEditor,
} from './kolam-teranura-edit-panels';

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
        <KolamPageIdentityHeader
          eyebrow="TERANURA"
          moduleIcon="teranura"
          placement="workspace"
          subtitle={controller.loading ? 'Memuat...' : 'Form belum siap.'}
          title="Edit Teranura"
        />
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters} />
            <View style={kolamTableToolbarStyles.actions}>
              <KolamCancelButton onPress={onCancel} />
            </View>
          </View>
        </View>
      </KolamDetailScrollSurface>
    );
  }

  const disabled = controller.saving;
  const hasVariants = form.hasVariants || form.variants.length > 0;
  const selectedItem = controller.selectedItem;

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
  const locationOptions = [
    { label: 'Pilih lokasi', value: '' },
    ...controller.locations.map(location => ({
      label: location.label,
      value: location.id,
    })),
  ];
  const unitOptions = [
    { label: 'Pilih satuan', value: '' },
    ...controller.units.map(unit => ({
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
  const weightUnitOptions = unitOptions;
  const dimensionUnitOptions = unitOptions;

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

  const toggleVariants = () => {
    if (hasVariants) {
      patchForm({
        hasVariants: false,
        selectedVariantId: '',
        variantConfigTier1Name: 'Varian',
        variantConfigTier2Name: '',
        variantConfigTier1Values: [],
        variantConfigTier2Values: [],
        variantConfigTier2Enabled: false,
        variants: [],
      });
      return;
    }
    patchForm({ hasVariants: true });
  };

  const applyVariantCombinations = (
    tier1Values: string[],
    tier2Values: string[],
  ) => {
    patchForm({
      hasVariants: true,
      variantConfigTier1Values: tier1Values,
      variantConfigTier2Values: tier2Values,
      variants: createKolamTeranuraVariantCombinationRows(
        form.sku,
        tier1Values,
        form.variantConfigTier2Enabled,
        tier2Values,
        form.variants,
      ),
    });
  };

  const findVariantPhotos = (variantId: string): string[] =>
    selectedItem?.variants.find(variant => variant.id === variantId)
      ?.photos ?? [];

  const packingVariantOptions = form.variants.map((variant, index) => ({
    id: variant.id,
    label:
      [variant.tier1Value, variant.tier2Value].filter(Boolean).join(' / ') ||
      `Varian ${index + 1}`,
  }));

  const termsItemId = selectedItem?.linkedProductId || selectedItem?.id || '';

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
            <KolamSaveButton
              disabled={disabled}
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
          description:
            'Kelola data utama, relasi master, penjualan, dan deskripsi produk.',
          id: 'catalog-translations',
          title: 'Data Produk',
        }}
      >
        <View style={settingsWebFormStyles.settingsWebFormFields}>
          <View style={settingsWebFormStyles.settingsWebFormFieldsGrid}>
            <TeranuraEditSection
              description="Kode identitas internal. Nama dan deskripsi diatur per bahasa di tab Konten Marketplace."
              title="Informasi Dasar"
            >
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
                  <View style={styles.productBasicInfoHalfField} />
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
                      tone="category"
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
                  <View style={styles.productBasicInfoHalfField} />
                </View>
              </View>
            </TeranuraEditSection>

            <TeranuraEditSection
              description="Thumbnail, foto, dan video produk utama."
              title="Media"
            >
              <View style={styles.productBasicInfoCard}>
                <TeranuraMediaSection
                  disabled={disabled}
                  existingPhotos={selectedItem?.photos ?? []}
                  existingVideos={selectedItem?.videos ?? []}
                  onChangePhotoLocalUri={photoLocalUri =>
                    patchForm({ photoLocalUri })
                  }
                  onChangeVideoLocalUri={videoLocalUri =>
                    patchForm({ videoLocalUri })
                  }
                  onDeletePhoto={index => {
                    void controller.onDeletePhoto(index);
                  }}
                  onDeleteVideo={index => {
                    void controller.onDeleteVideo(index);
                  }}
                  onPickPhoto={() => {
                    void controller.onPickPhoto();
                  }}
                  onPickVideo={() => {
                    void controller.onPickVideo();
                  }}
                  photoLocalUri={form.photoLocalUri}
                  videoLocalUri={form.videoLocalUri}
                />
              </View>
            </TeranuraEditSection>

            <TeranuraEditSection
              description="Aktifkan varian jika produk memiliki beberapa variasi atau beberapa SKU."
              title="Varian"
            >
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
                        {
                          id: 'hint',
                          text: 'Beberapa SKU untuk ukuran, warna, tipe, atau kemasan berbeda.',
                          style: styles.fieldHint,
                        },
                      ]}
                    />
                    <KolamSwitch
                      accessibilityLabel="Aktifkan varian produk"
                      active={hasVariants}
                      disabled={disabled}
                      onPress={toggleVariants}
                    />
                  </View>

                  {hasVariants ? (
                    <View style={styles.variantInfoPanel}>
                      <KolamCopyStack
                        items={[
                          {
                            id: 'title',
                            text: 'Harga dikelola oleh varian',
                            style: styles.variantInfoTitle,
                          },
                          {
                            id: 'hint',
                            text: 'Saat varian aktif, harga dan pemasok root disembunyikan. Atur harga dan pemasok per varian di bawah.',
                            style: styles.variantInfoHint,
                          },
                        ]}
                      />
                    </View>
                  ) : null}

                  {hasVariants ? (
                    <>
                      <TeranuraVariantConfiguratorCard
                        baseSku={form.sku}
                        disabled={disabled}
                        onApplyCombinations={() =>
                          applyVariantCombinations(
                            form.variantConfigTier1Values,
                            form.variantConfigTier2Values,
                          )
                        }
                        onChangeTier1Name={variantConfigTier1Name =>
                          patchForm({ variantConfigTier1Name })
                        }
                        onChangeTier1Values={variantConfigTier1Values =>
                          patchForm({ variantConfigTier1Values })
                        }
                        onChangeTier2Enabled={variantConfigTier2Enabled =>
                          patchForm({ variantConfigTier2Enabled })
                        }
                        onChangeTier2Name={variantConfigTier2Name =>
                          patchForm({ variantConfigTier2Name })
                        }
                        onChangeTier2Values={variantConfigTier2Values =>
                          patchForm({ variantConfigTier2Values })
                        }
                        tier1Name={form.variantConfigTier1Name}
                        tier1Values={form.variantConfigTier1Values}
                        tier2Enabled={form.variantConfigTier2Enabled}
                        tier2Name={form.variantConfigTier2Name}
                        tier2Values={form.variantConfigTier2Values}
                      />

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
                            <TeranuraVariantCard
                              componentProducts={controller.componentProducts}
                              customFields={controller.customFields}
                              disabled={disabled}
                              existingPhotos={findVariantPhotos(variant.id)}
                              index={index}
                              isMediaSelected={
                                form.selectedVariantId === variant.id
                              }
                              key={variant.id}
                              onChangeVariantPhotoLocalUri={variantPhotoLocalUri =>
                                patchForm({ variantPhotoLocalUri })
                              }
                              onDelete={() => {
                                const next = form.variants.filter(
                                  row => row.id !== variant.id,
                                );
                                patchForm({
                                  variants: next,
                                  hasVariants: next.length > 0,
                                });
                              }}
                              onPatch={patch =>
                                patchVariant(variant.id, patch)
                              }
                              onSelectForMedia={() =>
                                patchForm({
                                  selectedVariantId: variant.id,
                                  variantPhotoLocalUri: '',
                                })
                              }
                              variant={variant}
                              variantPhotoLocalUri={
                                form.selectedVariantId === variant.id
                                  ? form.variantPhotoLocalUri
                                  : ''
                              }
                              vendorOptions={vendorOptions}
                              weightUnitOptions={weightUnitOptions}
                            />
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
                    </>
                  ) : null}
                </View>
              </View>
            </TeranuraEditSection>

            <View style={styles.productEditTwoColumnSections}>
              <View style={styles.productEditTwoColumnSection}>
                <TeranuraEditSection
                  description="Pilih profil spesifikasi atau field manual untuk produk ini."
                  title="Field Kustom"
                >
                  <View style={styles.productBasicInfoCard}>
                    <TeranuraCustomFieldRowsEditor
                      customFields={controller.customFields}
                      disabled={disabled}
                      onChange={customFieldValues =>
                        patchForm({ customFieldValues })
                      }
                      values={form.customFieldValues}
                    />
                  </View>
                </TeranuraEditSection>
              </View>

              <View style={styles.productEditTwoColumnSection}>
                <TeranuraEditSection
                  description="Aktifkan penjualan, pilih satuan, dan metode pengiriman."
                  title="Penjualan dan Inventori"
                >
                  <View style={styles.productBasicInfoCard}>
                    <TeranuraRootSalesPanel
                      controller={controller}
                      disabled={disabled}
                      form={form}
                      patchForm={patchForm}
                      unitOptions={unitOptions}
                    />
                    {!hasVariants ? (
                      <TeranuraRootInventoryPanel
                        disabled={disabled}
                        form={form}
                        patchForm={patchForm}
                      />
                    ) : null}
                  </View>
                </TeranuraEditSection>
              </View>
            </View>

            {!hasVariants ? (
              <TeranuraEditSection
                description="Komponen produksi untuk produk tanpa varian."
                title="Bahan Penyusun"
              >
                <View style={styles.productBasicInfoCard}>
                  <TeranuraFieldShell label="Bahan Penyusun Root">
                    <View style={styles.grocerPricingPanel}>
                      <KolamComponentOverridesEditor
                        disabled={disabled}
                        onChange={componentRows => patchForm({ componentRows })}
                        products={controller.componentProducts}
                        rows={form.componentRows}
                      />
                    </View>
                  </TeranuraFieldShell>
                </View>
              </TeranuraEditSection>
            ) : null}

            {!hasVariants ? (
              <TeranuraEditSection
                description="Harga jual, aturan pesanan, dan harga grosir untuk produk tanpa varian."
                title="Harga"
              >
                <View style={styles.productBasicInfoCard}>
                  <TeranuraFieldShell label="Harga Produk">
                    <View style={styles.pricingPanelStack}>
                      <TeranuraFieldPanel
                        description="Harga yang dipakai katalog, POS, toko daring, dan pembanding marketplace."
                        title="Harga Penjualan"
                      >
                        <View style={styles.twoColumnGrid}>
                          <TeranuraPriceField
                            disabled={disabled}
                            hint="Harga utama yang tampil di katalog dan POS."
                            label="Harga Jual"
                            onChangeText={priceToSell =>
                              patchForm({ priceToSell })
                            }
                            value={form.priceToSell}
                          />
                          <TeranuraPriceField
                            disabled={disabled}
                            hint="Harga daring untuk toko daring atau kanal digital."
                            label="Harga Daring"
                            onChangeText={onlinePrice =>
                              patchForm({ onlinePrice })
                            }
                            value={form.onlinePrice}
                          />
                          <TeranuraPriceField
                            disabled={disabled}
                            hint="Harga pembanding pasar, bukan harga jual utama."
                            label="Harga Pasar"
                            onChangeText={marketPrice =>
                              patchForm({ marketPrice })
                            }
                            value={form.marketPrice}
                          />
                          <TeranuraPriceField
                            disabled={disabled}
                            hint="Batas harga terendah yang masih boleh dijual."
                            label="Harga Minimum"
                            onChangeText={minimumPriceToSales =>
                              patchForm({ minimumPriceToSales })
                            }
                            value={form.minimumPriceToSales}
                          />
                        </View>
                      </TeranuraFieldPanel>
                    </View>
                  </TeranuraFieldShell>

                  <View style={styles.pricingHalfRow}>
                    <View style={styles.pricingHalfColumn}>
                      <TeranuraFieldPanel
                        description="Aturan jumlah minimum saat produk dibeli."
                        title="Aturan Pesanan"
                      >
                        <View style={styles.twoColumnGrid}>
                          <TeranuraCompactField label="Minimum Pesanan">
                            <KolamFormTextField
                              editable={!disabled}
                              keyboardType="numeric"
                              onChangeText={minimumOrderQty =>
                                patchForm({ minimumOrderQty })
                              }
                              style={
                                settingsWebFormStyles.settingsWebFormFieldValue
                              }
                              value={form.minimumOrderQty}
                            />
                          </TeranuraCompactField>
                        </View>
                      </TeranuraFieldPanel>
                    </View>
                    <View style={styles.pricingHalfColumn}>
                      <TeranuraFieldPanel
                        description="Harga per unit berdasarkan jumlah pembelian. Berlaku untuk produk tanpa varian."
                        title="Harga Bertingkat / Grosir Produk"
                      >
                        <KolamGrocerPricingTiersEditor
                          disabled={disabled}
                          onChange={grocerPricingTiers =>
                            patchForm({ grocerPricingTiers })
                          }
                          rows={form.grocerPricingTiers}
                        />
                      </TeranuraFieldPanel>
                    </View>
                  </View>

                  <TeranuraVendorPricesEditor
                    disabled={disabled}
                    onChange={vendorPrices => patchForm({ vendorPrices })}
                    rows={form.vendorPrices}
                    vendorOptions={vendorOptions}
                  />

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
              </TeranuraEditSection>
            ) : null}

            {!hasVariants ? (
              <TeranuraEditSection
                description="Berat dan dimensi produk tanpa varian."
                title="Logistik"
              >
                <View style={styles.productBasicInfoCard}>
                  <View style={styles.pricingPanelStack}>
                    <TeranuraFieldPanel
                      description="Opsional untuk pengiriman dan logistik."
                      title="Berat"
                    >
                      <View style={styles.twoColumnGrid}>
                        <TeranuraCompactField label="Nilai berat">
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
                        </TeranuraCompactField>
                        <TeranuraCompactField label="Satuan berat">
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
                        </TeranuraCompactField>
                      </View>
                    </TeranuraFieldPanel>

                    <TeranuraFieldPanel
                      description="Opsional untuk kemasan dan penyimpanan."
                      title="Dimensi"
                    >
                      <View style={styles.logisticsDimensionGrid}>
                        <TeranuraCompactField label="Panjang">
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
                        </TeranuraCompactField>
                        <TeranuraCompactField label="Lebar">
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
                        </TeranuraCompactField>
                        <TeranuraCompactField label="Tinggi">
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
                        </TeranuraCompactField>
                        <TeranuraCompactField label="Satuan dimensi">
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
                        </TeranuraCompactField>
                      </View>
                    </TeranuraFieldPanel>
                  </View>
                </View>
              </TeranuraEditSection>
            ) : null}

            {hasVariants ? (
              <TeranuraEditSection
                description="Komisi transaksi produk."
                title="Komisi"
              >
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

            <TeranuraEditSection
              description="Judul, kata kunci, dan deskripsi SEO Google."
              title="SEO Google"
            >
              <View style={styles.productBasicInfoCard}>
                <View style={styles.variantPricingPanel}>
                  <View style={styles.variantTabHeader}>
                    <KolamCopyStack
                      items={[
                        {
                          id: 'summary',
                          text: selectedItem?.seo.lastSeoScore
                            ? `Skor SEO terakhir: ${selectedItem.seo.lastSeoScore}/100`
                            : 'Skor SEO belum tersedia.',
                          style: styles.fieldHint,
                        },
                      ]}
                    />
                  </View>
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
              </View>
            </TeranuraEditSection>

            <TeranuraEditSection
              description="Item terlampir, kemasan, dan syarat ketentuan produk."
              title="Keterangan tambahan"
            >
              <View style={styles.productBasicInfoCard}>
                <View style={styles.pricingHalfRow}>
                  <View style={styles.pricingHalfColumn}>
                    <TeranuraAttachedItemsPanel item={selectedItem} />
                  </View>
                  <View style={styles.pricingHalfColumn}>
                    {termsItemId ? (
                      <KolamDetailTermsTemplatesPanel
                        itemId={termsItemId}
                        itemLabel="produk"
                        itemType="product"
                      />
                    ) : (
                      <TeranuraFieldShell label="Syarat dan Ketentuan">
                        <KolamCopyStack
                          items={[
                            {
                              id: 'empty-terms',
                              text: 'Simpan Teranura terlebih dahulu untuk melihat template S&K aktif.',
                              style: styles.fieldHint,
                            },
                          ]}
                        />
                      </TeranuraFieldShell>
                    )}
                  </View>
                </View>
                <View style={styles.pricingHalfRow}>
                  <View style={styles.pricingHalfColumn}>
                    <TeranuraFieldShell label="Bahan Kemasan">
                      <View style={styles.grocerPricingPanel}>
                        <KolamCopyStack
                          items={[
                            {
                              id: 'hint',
                              text: 'Kemasan default untuk checkout.',
                              style: styles.fieldHint,
                            },
                          ]}
                        />
                        <TeranuraPackingLinksPanel
                          disabled={disabled}
                          onChange={packingLinks => patchForm({ packingLinks })}
                          packings={controller.packingOptions}
                          rows={form.packingLinks}
                          variants={packingVariantOptions}
                        />
                      </View>
                    </TeranuraFieldShell>
                  </View>
                  <View style={styles.pricingHalfColumn}>
                    <TeranuraFieldShell label="Aset Produk Terhubung">
                      {selectedItem?.linkedProductId ? (
                        <TeranuraLinkedProductAssetsPanel
                          linkedProductId={selectedItem.linkedProductId}
                        />
                      ) : (
                        <KolamCopyStack
                          items={[
                            {
                              id: 'empty-assets',
                              text: 'Teranura ini belum terhubung ke produk. Aset tidak tersedia.',
                              style: styles.fieldHint,
                            },
                          ]}
                        />
                      )}
                    </TeranuraFieldShell>
                  </View>
                </View>
              </View>
            </TeranuraEditSection>

            <TeranuraEditSection
              description="Terjemahan katalog untuk webstore dan marketplace."
              title="Konten marketplace"
            >
              <KolamCatalogTranslationsEditor
                editable={!disabled}
                kind="product"
                onChange={translations => patchForm({ translations })}
                primaryProductLocale={{
                  name: form.name,
                  shortDescription: form.shortDescription,
                  description: form.description,
                  onChange: patch => patchForm(patch),
                }}
                translations={form.translations}
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
  description,
  title,
}: {
  children: React.ReactNode;
  description?: string;
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
          ...(description
            ? [
                {
                  id: 'description',
                  text: description,
                  style: styles.productEditSectionDescription,
                },
              ]
            : []),
        ]}
      />
      <View style={styles.productEditSectionBody}>{children}</View>
    </KolamContentFrame>
  );
}

function TeranuraFieldPanel({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <View style={styles.variantFieldPanel}>
      <KolamCopyStack
        items={[
          { id: 'title', text: title, style: styles.variantFieldPanelTitle },
          ...(description
            ? [{ id: 'description', text: description, style: styles.fieldHint }]
            : []),
        ]}
      />
      <View style={styles.variantFieldPanelBody}>{children}</View>
    </View>
  );
}

function TeranuraPriceField({
  disabled,
  hint,
  label,
  onChangeText,
  value,
}: {
  disabled: boolean;
  hint?: string;
  label: string;
  onChangeText: (value: string) => void;
  value: string;
}) {
  return (
    <View style={styles.productBasicInfoHalfField}>
      <TeranuraFieldShell label={label}>
        <TeranuraPriceInput
          disabled={disabled}
          onChangeText={onChangeText}
          value={value}
        />
        {hint ? (
          <KolamCopyStack
            items={[{ id: 'hint', text: hint, style: styles.fieldHint }]}
          />
        ) : null}
      </TeranuraFieldShell>
    </View>
  );
}

function TeranuraCompactField({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <View style={styles.productBasicInfoHalfField}>
      <TeranuraFieldShell label={label}>{children}</TeranuraFieldShell>
    </View>
  );
}

function TeranuraRootSalesPanel({
  controller,
  disabled,
  form,
  patchForm,
  unitOptions,
}: {
  controller: KolamTeranuraController;
  disabled: boolean;
  form: KolamTeranuraFormState;
  patchForm: (patch: Partial<KolamTeranuraFormState>) => void;
  unitOptions: Array<{ label: string; value: string }>;
}) {
  const shippingOptions = [
    { label: 'Tambah metode pengiriman', value: '' },
    ...controller.shippingMethods
      .filter(method => !form.availableShippingMethodIds.includes(method.id))
      .map(method => ({ label: method.displayName, value: method.id })),
  ];
  const selectedMethods = controller.shippingMethods.filter(method =>
    form.availableShippingMethodIds.includes(method.id),
  );

  return (
    <TeranuraFieldShell label="Penjualan dan Satuan">
      <View style={styles.grocerPricingPanel}>
        <View style={styles.twoColumnGrid}>
          <View style={styles.inlineFieldGroup}>
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
                onPress={() => patchForm({ sellable: !form.sellable })}
              />
            </View>
          </View>
          <View style={styles.inlineFieldGroup}>
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
            <KolamCopyStack
              items={[{ id: 'unit-hint', text: 'Satuan.', style: styles.fieldHint }]}
            />
          </View>
        </View>
        <KolamDropdownSelect
          accessibilityLabel="Tambah metode pengiriman"
          label="Metode pengiriman tersedia"
          menuStyle={styles.longDropdownMenu}
          onChange={methodId => {
            if (!methodId || form.availableShippingMethodIds.includes(methodId)) {
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
          {selectedMethods.length ? (
            selectedMethods.map(method => (
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
  );
}

function TeranuraRootInventoryPanel({
  disabled,
  form,
  patchForm,
}: {
  disabled: boolean;
  form: KolamTeranuraFormState;
  patchForm: (patch: Partial<KolamTeranuraFormState>) => void;
}) {
  return (
    <TeranuraFieldShell label="Inventori Produk">
      <View style={styles.pricingPanelStack}>
        <TeranuraFieldPanel
          description="Batas peringatan stok rendah untuk produk tanpa varian."
          title="Stok dan Peringatan"
        >
          <View style={styles.twoColumnGrid}>
            <TeranuraCompactField label="Ambang Stok Rendah">
              <KolamFormTextField
                editable={!disabled}
                keyboardType="numeric"
                onChangeText={lowStockThreshold =>
                  patchForm({ lowStockThreshold })
                }
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={form.lowStockThreshold}
              />
            </TeranuraCompactField>
          </View>
        </TeranuraFieldPanel>
      </View>
    </TeranuraFieldShell>
  );
}

function TeranuraAttachedItemsPanel({ item }: { item: KolamTeranura | null }) {
  const attachedItems = item?.attachedItems ?? [];

  return (
    <TeranuraFieldShell label="Produk Kompatibel">
      <View style={styles.variantPricingPanel}>
        <KolamCopyStack
          items={[
            {
              id: 'summary',
              text: attachedItems.length
                ? `${attachedItems.length} item terhubung ke Teranura ini.`
                : item
                ? 'Belum ada produk kompatibel atau pengganti.'
                : 'Simpan Teranura terlebih dahulu untuk menambahkan item terlampir.',
              style: styles.fieldHint,
            },
          ]}
        />
        {attachedItems.map(entry => (
          <View key={entry.id} style={styles.attachedItemRow}>
            <KolamCopyStack
              items={[
                {
                  id: 'name',
                  text: entry.targetName || entry.typeLabel,
                  style: styles.variantTitle,
                },
                {
                  id: 'meta',
                  text: [
                    entry.typeLabel,
                    entry.itemType === 'species' ? 'Spesies' : 'Produk',
                    entry.targetSku ? `SKU: ${entry.targetSku}` : '',
                    entry.note,
                  ]
                    .filter(Boolean)
                    .join(' - '),
                  style: styles.fieldHint,
                },
              ]}
            />
          </View>
        ))}
      </View>
    </TeranuraFieldShell>
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
    paddingVertical: 14,
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
  productEditSectionDescription: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  productEditSectionBody: {
    gap: 12,
  },
  productBasicInfoCard: {
    alignSelf: 'stretch',
    backgroundColor: '#f9fafb',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    minWidth: 0,
    padding: 12,
    width: '100%',
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
  inlineFieldGroup: {
    flexBasis: 0,
    flexGrow: 1,
    gap: 6,
    minWidth: 220,
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
  variantInfoPanel: {
    backgroundColor: V.colors.infoSoft,
    borderColor: V.colors.info,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  variantInfoTitle: {
    color: V.colors.info,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  variantInfoHint: {
    color: V.colors.info,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
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
  variantFieldPanelBody: {
    gap: 10,
  },
  variantPricingPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  variantTabHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  attachedItemRow: {
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
    padding: 10,
  },
  pricingPanelStack: {
    alignSelf: 'stretch',
    gap: 12,
    minWidth: 0,
    width: '100%',
  },
  pricingHalfRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pricingHalfColumn: {
    flexBasis: 0,
    flexGrow: 1,
    minWidth: 280,
  },
  logisticsDimensionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  seoTextArea: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
});
