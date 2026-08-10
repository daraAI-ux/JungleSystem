import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import {
  KOLAM_VOUCHER_APPLICABLE_TO_OPTIONS,
  KOLAM_VOUCHER_DISCOUNT_TYPE_OPTIONS,
  KOLAM_VOUCHER_ROOT,
  type KolamVoucherApplicableTo,
  type KolamVoucherDiscountType,
  type KolamVoucherPickerOption,
} from '../domain/kolam-voucher';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import type { KolamVoucherController } from '../hooks/use-kolam-voucher-controller';
import { KolamButton } from './kolam-button';
import {KolamCancelButton} from './kolam-cancel-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDateField } from './kolam-date-field';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import {KolamNotesField} from './kolam-notes-field';
import { KolamRupiahField } from './kolam-rupiah-field';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

export function KolamVoucherForm({
  controller,
  onRouteChange,
}: {
  controller: KolamVoucherController;
  onRouteChange?: (route: string) => void;
}) {
  const { form } = controller;
  const isEdit = controller.mode === 'edit';
  const canSubmit = isEdit ? controller.canUpdate : controller.canCreate;

  if (isEdit && !controller.canUpdate) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState
          message="Anda tidak memiliki izin mengubah voucher."
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
          message="Anda tidak memiliki izin membuat voucher."
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
    <KolamDetailScrollSurface contentContainerStyle={styles.formContent}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <Text numberOfLines={1} style={styles.heading}>
            {isEdit ? 'Ubah Voucher' : 'Buat Voucher Baru'}
          </Text>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamCancelButton
              onPress={() => {
                if (isEdit && controller.selectedVoucher) {
                  onRouteChange?.(
                    `${KOLAM_VOUCHER_ROOT}/${encodeURIComponent(controller.selectedVoucher.id)}`,
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
                    ? 'Simpan Perubahan'
                    : 'Buat Voucher'
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

      <VoucherFormSection
        description="Kode yang diketik pelanggan saat checkout dan catatan internal untuk tim Anda."
        title="Informasi Dasar"
      >
        <LabeledField label="Kode Voucher">
          <KolamFormTextField
            autoCapitalize="characters"
            editable={!isEdit}
            onChangeText={value => controller.onChangeForm('code', value)}
            placeholder="mis. WELCOME10"
            value={form.code}
          />
          {isEdit ? (
            <Text style={styles.hint}>
              Kode tidak dapat diubah setelah dibuat.
            </Text>
          ) : null}
        </LabeledField>
        <LabeledField label="Judul Voucher">
          <KolamFormTextField
            onChangeText={value => controller.onChangeForm('title', value)}
            placeholder="mis. Diskon Pelanggan Baru 10%"
            value={form.title}
          />
        </LabeledField>
        <KolamNotesField
            label="Deskripsi Internal"
            onChangeText={value =>
              controller.onChangeForm('description', value)
            }
            placeholder="Catatan internal (tidak ditampilkan ke pelanggan)"
            value={form.description}
          />
      </VoucherFormSection>

      <VoucherFormSection
        description="Rentang tanggal saat voucher ini dapat digunakan."
        title="Periode Berlaku"
      >
        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <KolamDateField
              label="Tanggal Mulai"
              onChange={value => controller.onChangeForm('startDate', value)}
              value={form.startDate}
            />
          </View>
          <View style={styles.dateField}>
            <KolamDateField
              label="Tanggal Akhir"
              onChange={value => controller.onChangeForm('endDate', value)}
              value={form.endDate}
            />
          </View>
        </View>
      </VoucherFormSection>

      <VoucherFormSection
        description="Mengatur berapa banyak uang yang dihemat pelanggan saat menerapkan voucher ini."
        title="Pengaturan Diskon"
      >
        <KolamDropdownSelect
          label="Tipe Diskon"
          onChange={value =>
            controller.onChangeForm(
              'discountType',
              value as KolamVoucherDiscountType,
            )
          }
          options={KOLAM_VOUCHER_DISCOUNT_TYPE_OPTIONS.map(option => ({
            label: option.label,
            value: option.value,
          }))}
          value={form.discountType}
        />
        <LabeledField
          label={
            form.discountType === 'percentage'
              ? 'Persentase Diskon (%)'
              : 'Nominal Diskon'
          }
        >
          {form.discountType === 'percentage' ? (
            <KolamFormTextField
              mode="numeric"
              onChangeText={value =>
                controller.onChangeForm('discountValue', value)
              }
              value={form.discountValue}
            />
          ) : (
            <KolamRupiahField
              onChangeValue={value =>
                controller.onChangeForm('discountValue', String(value))
              }
              value={Number(form.discountValue) || 0}
            />
          )}
        </LabeledField>
        {form.discountType === 'percentage' ? (
          <LabeledField label="Batas Maksimum Diskon">
            <KolamRupiahField
              onChangeValue={value =>
                controller.onChangeForm('maxDiscountAmount', String(value))
              }
              value={Number(form.maxDiscountAmount) || 0}
            />
            <Text style={styles.hint}>0 = tanpa batas maksimum.</Text>
          </LabeledField>
        ) : null}
        <LabeledField label="Minimum Pembelian">
          <KolamRupiahField
            onChangeValue={value =>
              controller.onChangeForm('minPurchaseAmount', String(value))
            }
            value={Number(form.minPurchaseAmount) || 0}
          />
          <Text style={styles.hint}>0 = tanpa minimum pembelian.</Text>
        </LabeledField>
      </VoucherFormSection>

      <VoucherFormSection
        description="Pilih item mana yang dapat menggunakan voucher ini. Filter pelanggan bersifat opsional."
        title="Cakupan Voucher"
      >
        <KolamDropdownSelect
          label="Berlaku Untuk"
          onChange={value =>
            controller.onChangeForm(
              'applicableTo',
              value as KolamVoucherApplicableTo,
            )
          }
          options={KOLAM_VOUCHER_APPLICABLE_TO_OPTIONS.map(option => ({
            label: option.label,
            value: option.value,
          }))}
          value={form.applicableTo}
        />

        {form.applicableTo === 'products' ? (
          <ScopeIdPicker
            label="Produk yang Memenuhi Syarat"
            loading={controller.loadingOptions}
            onAdd={controller.onAddProductId}
            onRemove={controller.onRemoveProductId}
            options={controller.productOptions}
            selectedIds={form.applicableProductIds}
          />
        ) : null}

        {form.applicableTo === 'species' ? (
          <ScopeIdPicker
            label="Spesies yang Memenuhi Syarat"
            loading={controller.loadingOptions}
            onAdd={controller.onAddSpeciesId}
            onRemove={controller.onRemoveSpeciesId}
            options={controller.speciesOptions}
            selectedIds={form.applicableSpeciesIds}
          />
        ) : null}

        <ScopeIdPicker
          hint="Kosongkan agar semua pelanggan dapat menukarkan."
          label="Pelanggan yang Memenuhi Syarat (opsional)"
          loading={controller.loadingOptions}
          onAdd={controller.onAddCustomerId}
          onRemove={controller.onRemoveCustomerId}
          options={controller.customerOptions}
          selectedIds={form.applicableCustomerIds}
        />
      </VoucherFormSection>

      <VoucherFormSection
        description="Mengatur berapa kali voucher ini dapat ditukarkan secara keseluruhan dan per pelanggan."
        title="Batas Penggunaan"
      >
        <LabeledField label="Batas Penukaran Total">
          <KolamFormTextField
            mode="numeric"
            onChangeText={value => controller.onChangeForm('usageLimit', value)}
            value={form.usageLimit}
          />
          <Text style={styles.hint}>0 = tanpa batas total.</Text>
        </LabeledField>
        <LabeledField label="Penukaran per Pelanggan">
          <KolamFormTextField
            mode="numeric"
            onChangeText={value =>
              controller.onChangeForm('usageLimitPerUser', value)
            }
            value={form.usageLimitPerUser}
          />
          <Text style={styles.hint}>0 = tanpa batas per pelanggan.</Text>
        </LabeledField>
        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.switchTitle}>Pesanan Pertama Saja</Text>
            <Text style={styles.hint}>
              Khusus pelanggan yang belum pernah bertransaksi.
            </Text>
          </View>
          <Switch
            onValueChange={value =>
              controller.onChangeForm('firstOrderOnly', value)
            }
            value={form.firstOrderOnly}
          />
        </View>
      </VoucherFormSection>

      <VoucherFormSection
        description="Mengatur apakah voucher ini saat ini dapat digunakan oleh pelanggan."
        title="Status Aktivasi"
      >
        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.switchTitle}>
              {form.status === 'active' ? 'Voucher Aktif' : 'Voucher Nonaktif'}
            </Text>
            <Text style={styles.hint}>
              {form.status === 'active'
                ? 'Pelanggan dapat memakai voucher ini (selama periode berlaku).'
                : 'Voucher dinonaktifkan sementara tanpa dihapus.'}
            </Text>
          </View>
          <Switch
            onValueChange={value =>
              controller.onChangeForm('status', value ? 'active' : 'inactive')
            }
            value={form.status === 'active'}
          />
        </View>
      </VoucherFormSection>
    </KolamDetailScrollSurface>
  );
}

function ScopeIdPicker({
  hint,
  label,
  loading,
  onAdd,
  onRemove,
  options,
  selectedIds,
}: {
  hint?: string;
  label: string;
  loading?: boolean;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  options: KolamVoucherPickerOption[];
  selectedIds: string[];
}) {
  const selectedSet = new Set(selectedIds);
  const available = options.filter(option => !selectedSet.has(option.id));
  const selected = selectedIds
    .map(id => options.find(option => option.id === id) ?? { id, label: id })
    .filter(Boolean);

  return (
    <View style={styles.scopeBlock}>
      <Text style={styles.scopeLabel}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {loading ? <Text style={styles.hint}>Memuat opsi…</Text> : null}
      <KolamDropdownSelect
        label="Tambah"
        onChange={value => {
          if (value) {
            onAdd(value);
          }
        }}
        options={[
          { label: 'Pilih untuk menambah…', value: '' },
          ...available.map(option => ({
            label: option.sublabel
              ? `${option.label} · ${option.sublabel}`
              : option.label,
            value: option.id,
          })),
        ]}
        searchable
        searchPlaceholder="Cari…"
        showLabelInTrigger={false}
        value=""
      />
      {selected.length === 0 ? (
        <Text style={styles.hint}>Belum ada yang dipilih.</Text>
      ) : (
        <View style={styles.chipWrap}>
          {selected.map(item => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() => onRemove(item.id)}
              style={styles.chip}
            >
              <Text numberOfLines={1} style={styles.chipText}>
                {item.label}
              </Text>
              <Text style={styles.chipRemove}>×</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function VoucherFormSection({
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
      <View style={styles.sectionBody}>{children}</View>
    </KolamContentFrame>
  );
}

function LabeledField({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <View style={settingsWebFormStyles.settingsWebFormField}>
      <KolamSettingsWebFieldLabel label={label} required={false} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 12,
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
    fontWeight: '800',
  },
  errorBadge: {
    alignSelf: 'stretch',
  },
  sectionCopy: {
    gap: 4,
    marginBottom: 10,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '800',
  },
  sectionDescription: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  sectionBody: {
    gap: 12,
  },
  dateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dateField: {
    flexGrow: 1,
    minWidth: 180,
  },
  hint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 15,
  },
  switchRow: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  switchCopy: {
    flex: 1,
    gap: 2,
  },
  switchTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  scopeBlock: {
    gap: 8,
  },
  scopeLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    maxWidth: '100%',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    maxWidth: 220,
  },
  chipRemove: {
    color: V.colors.mutedFg,
    fontSize: 14,
    fontWeight: '700',
  },
});
