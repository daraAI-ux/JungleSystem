import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  KOLAM_CAMPAIGN_DISCOUNT_TYPE_OPTIONS,
  KOLAM_CAMPAIGN_ROOT,
  KOLAM_CAMPAIGN_STATUS_FORM_OPTIONS,
  type KolamCampaignDiscountType,
  type KolamCampaignStatus,
} from '../domain/kolam-campaign';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import type { KolamCampaignController } from '../hooks/use-kolam-campaign-controller';
import { KolamButton } from './kolam-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDateField } from './kolam-date-field';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamSearchField } from './kolam-search-field';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

export function KolamCampaignForm({
  controller,
  onRouteChange,
}: {
  controller: KolamCampaignController;
  onRouteChange?: (route: string) => void;
}) {
  const { form } = controller;
  const isEdit = controller.mode === 'edit';
  const canSubmit = isEdit ? controller.canUpdate : controller.canCreate;

  if (isEdit && !controller.canUpdate) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState
          message="Anda tidak memiliki izin mengubah kampanye."
          title="Akses ditolak"
        />
        <KolamButton
          label="Kembali"
          onPress={() => onRouteChange?.(controller.onBackToList())}
        />
      </View>
    );
  }

  if (!isEdit && !controller.canCreate) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState
          message="Anda tidak memiliki izin membuat kampanye."
          title="Akses ditolak"
        />
        <KolamButton
          label="Kembali"
          onPress={() => onRouteChange?.(controller.onBackToList())}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.formContent}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <Text numberOfLines={1} style={styles.heading}>
            {isEdit ? 'Ubah Kampanye' : 'Kampanye Baru'}
          </Text>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              intent="outline"
              label="Batal"
              onPress={() => {
                if (isEdit && controller.selectedCampaign) {
                  onRouteChange?.(
                    `${KOLAM_CAMPAIGN_ROOT}/${encodeURIComponent(controller.selectedCampaign.id)}`,
                  );
                  return;
                }
                onRouteChange?.(controller.onBackToList());
              }}
            />
            <KolamButton
              disabled={controller.saving || !canSubmit}
              label={
                controller.saving
                  ? isEdit
                    ? 'Menyimpan…'
                    : 'Membuat…'
                  : isEdit
                    ? 'Simpan Kampanye'
                    : 'Buat Kampanye'
              }
              onPress={() => {
                void controller.onSave().then(nextRoute => {
                  if (nextRoute) {
                    onRouteChange?.(nextRoute);
                  }
                });
              }}
            />
          </View>
        </View>
      </View>

      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={4}
          style={styles.errorBadge}
        />
      ) : null}

      <CampaignFormSection
        description="Masukkan informasi dasar kampanye termasuk judul dan tanggal."
        title="Detail Kampanye"
      >
        <FieldShell label="Judul Kampanye" required>
          <KolamFormTextField
            onChangeText={value => controller.onChangeForm({ title: value })}
            placeholder="Masukkan judul kampanye (mis. Promo Pisang & Garam Spesial)"
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={form.title}
          />
        </FieldShell>
        <View style={styles.dateRow}>
          <View style={styles.dateCell}>
            <KolamDateField
              label="Tanggal Mulai"
              onChange={value => controller.onChangeForm({ startDate: value })}
              value={form.startDate}
            />
          </View>
          <View style={styles.dateCell}>
            <KolamDateField
              label="Tanggal Selesai"
              onChange={value => controller.onChangeForm({ endDate: value })}
              value={form.endDate}
            />
          </View>
        </View>
      </CampaignFormSection>

      <CampaignFormSection
        description="Atur jenis dan nilai diskon untuk kampanye ini"
        title="Pengaturan Diskon"
      >
        <KolamDropdownSelect
          label="Jenis Diskon"
          onChange={value =>
            controller.onChangeForm({
              discountType: value as KolamCampaignDiscountType,
            })
          }
          options={KOLAM_CAMPAIGN_DISCOUNT_TYPE_OPTIONS.map(option => ({
            label: option.label,
            value: option.value,
          }))}
          value={form.discountType}
        />
        <FieldShell
          label={
            form.discountType === 'fixed'
              ? 'Nominal Diskon (Rp)'
              : 'Persentase Diskon (%)'
          }
          required
        >
          <KolamFormTextField
            mode="numeric"
            onChangeText={value =>
              controller.onChangeForm({ discountValue: value })
            }
            placeholder={
              form.discountType === 'fixed'
                ? 'Masukkan nominal (mis. 5000)'
                : 'Masukkan persentase (mis. 10)'
            }
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={form.discountValue}
          />
        </FieldShell>
      </CampaignFormSection>

      <CampaignFormSection
        description="Atur status kampanye saat ini"
        title="Status Kampanye"
      >
        <KolamDropdownSelect
          label="Status"
          onChange={value =>
            controller.onChangeForm({
              status: value as KolamCampaignStatus,
            })
          }
          options={KOLAM_CAMPAIGN_STATUS_FORM_OPTIONS.map(option => ({
            label: option.label,
            value: option.value,
          }))}
          value={form.status}
        />
      </CampaignFormSection>

      <CampaignFormSection
        description="Pilih produk dan varian yang akan disertakan dalam kampanye ini"
        title="Produk Kampanye"
      >
        <KolamSearchField
          onChangeText={controller.onProductSearchChange}
          placeholder="Cari produk…"
          value={controller.productSearch}
        />
        {controller.loadingProducts ? (
          <Text style={styles.hint}>Memuat produk…</Text>
        ) : null}

        {form.products.map((row, index) => {
          const selected = controller.productOptions.find(
            option => option.id === row.productId,
          );
          const hasVariants = Boolean(selected?.variants.length);

          return (
            <View key={`product-row-${index}`} style={styles.productCard}>
              <View style={styles.productCardHeader}>
                <View style={styles.productCardTitleWrap}>
                  <Text style={styles.productCardTitle}>Produk {index + 1}</Text>
                  <Text style={styles.hint}>
                    Pilih satu produk, lalu persempit ke varian tertentu jika
                    diperlukan.
                  </Text>
                </View>
                <KolamButton
                  disabled={form.products.length === 1}
                  intent="outline"
                  label="Hapus"
                  onPress={() => controller.onRemoveProductRow(index)}
                />
              </View>

              <KolamDropdownSelect
                label="Pilih Produk"
                onChange={value => controller.onSetProductId(index, value)}
                options={controller.productOptions.map(option => ({
                  label: option.sku
                    ? `${option.name} (${option.sku})`
                    : option.name,
                  value: option.id,
                }))}
                value={row.productId}
              />

              {selected ? (
                <View style={styles.selectedProductMeta}>
                  {selected.thumbnailUri ? (
                    <KolamRemoteImage
                      accessibilityLabel={selected.name}
                      sourceUri={selected.thumbnailUri}
                      style={styles.thumb}
                    />
                  ) : (
                    <View style={styles.thumbPlaceholder} />
                  )}
                  <View style={styles.selectedProductCopy}>
                    <Text numberOfLines={2} style={styles.productName}>
                      {selected.name}
                    </Text>
                    <Text style={styles.hint}>
                      {selected.sku ? `SKU: ${selected.sku}` : 'Tanpa SKU'} |{' '}
                      {selected.variants.length} varian
                    </Text>
                    {selected.priceLabel ? (
                      <Text style={styles.priceLabel}>{selected.priceLabel}</Text>
                    ) : null}
                  </View>
                </View>
              ) : null}

              {hasVariants ? (
                <View style={styles.variantPanel}>
                  <View style={styles.variantHeader}>
                    <View style={styles.productCardTitleWrap}>
                      <Text style={styles.productCardTitle}>Varian Produk</Text>
                      <Text style={styles.hint}>
                        Kosongkan untuk menyertakan semua varian yang tersedia.
                      </Text>
                    </View>
                    <KolamStatusBadge
                      intent="info"
                      label={
                        row.variantIds.length
                          ? `${row.variantIds.length} terpilih`
                          : 'Semua terpilih'
                      }
                    />
                  </View>
                  <View style={styles.variantChips}>
                    {selected!.variants.map(variant => {
                      const active = row.variantIds.includes(variant.id);
                      return (
                        <Pressable
                          key={variant.id}
                          onPress={() =>
                            controller.onToggleVariant(index, variant.id)
                          }
                          style={[
                            styles.variantChip,
                            active ? styles.variantChipActive : null,
                          ]}
                        >
                          <Text
                            style={[
                              styles.variantChipText,
                              active ? styles.variantChipTextActive : null,
                            ]}
                          >
                            {variant.label}
                          </Text>
                          {variant.sku ? (
                            <Text style={styles.hint}>SKU: {variant.sku}</Text>
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}

              {selected && !hasVariants ? (
                <Text style={styles.infoBanner}>
                  Produk ini tidak memiliki varian — seluruh produk akan
                  disertakan dalam kampanye.
                </Text>
              ) : null}
            </View>
          );
        })}

        <KolamButton
          intent="outline"
          label="Tambah Produk Lain"
          onPress={controller.onAddProductRow}
        />
      </CampaignFormSection>
    </ScrollView>
  );
}

function CampaignFormSection({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <KolamContentFrame variant="nativeFormSection">
      <KolamCopyStack
        containerStyle={styles.sectionCopy}
        items={[
          { id: 'title', text: title, style: styles.sectionTitle },
          ...(description
            ? [
                {
                  id: 'description',
                  text: description,
                  style: styles.sectionDescription,
                },
              ]
            : []),
        ]}
      />
      <KolamContentFrame variant="nativeFormControls">{children}</KolamContentFrame>
    </KolamContentFrame>
  );
}

function FieldShell({
  children,
  label,
  required,
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <View style={settingsWebFormStyles.settingsWebFormField}>
      <KolamSettingsWebFieldLabel label={label} required={Boolean(required)} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 12,
    padding: 12,
  },
  formContent: {
    gap: 12,
    paddingBottom: 24,
  },
  heading: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  errorBadge: {
    alignSelf: 'stretch',
  },
  sectionCopy: {
    flex: 1,
    minWidth: 220,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  sectionDescription: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  dateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dateCell: {
    flexGrow: 1,
    minWidth: 180,
  },
  hint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  productCard: {
    borderColor: V.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  productCardHeader: {
    alignItems: 'flex-start',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  productCardTitleWrap: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  productCardTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  selectedProductMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  thumb: {
    borderRadius: 8,
    height: 40,
    width: 40,
  },
  thumbPlaceholder: {
    backgroundColor: V.colors.muted,
    borderRadius: 8,
    height: 40,
    width: 40,
  },
  selectedProductCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  productName: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  priceLabel: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  variantPanel: {
    backgroundColor: V.colors.muted,
    borderRadius: 10,
    gap: 8,
    padding: 10,
  },
  variantHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  variantChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variantChip: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: '100%',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  variantChipActive: {
    backgroundColor: V.colors.primary,
    borderColor: V.colors.primary,
  },
  variantChipText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  variantChipTextActive: {
    color: V.colors.primaryFg,
  },
  infoBanner: {
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});
