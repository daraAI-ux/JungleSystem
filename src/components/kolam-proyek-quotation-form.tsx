import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatRupiah } from '../lib/money';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import type { KolamProyekController } from '../hooks/use-kolam-proyek-controller';
import { KolamButton } from './kolam-button';
import {KolamDeleteButton} from './kolam-delete-button';
import {KolamCancelButton} from './kolam-cancel-button';
import {KolamSaveButton} from './kolam-save-button';
import { KolamDateField } from './kolam-date-field';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import {KolamNotesField} from './kolam-notes-field';
import { KolamRupiahField } from './kolam-rupiah-field';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

export function KolamProyekQuotationForm({
  controller,
}: {
  controller: KolamProyekController;
}) {
  const { form } = controller;
  const isEdit = controller.mode === 'edit';
  const canSubmit = isEdit ? controller.canUpdate : controller.canCreate;
  const contractValue = Number(String(form.contractValueText).replace(/[^\d.-]/g, '')) || 0;
  const minDpRaw = Number(form.minDpValueText) || 0;
  const dpPreview =
    form.paymentMode === 'staged' && form.minDpType === 'percentage' && contractValue > 0
      ? Math.round((contractValue * minDpRaw) / 100)
      : minDpRaw;

  const customerSelectOptions = useMemo(
    () => [
      { label: '— Pilih pelanggan —', value: '' },
      ...controller.customerOptions.map(option => ({
        label: option.sublabel
          ? `${option.label} · ${option.sublabel}`
          : option.label,
        value: option.id,
      })),
    ],
    [controller.customerOptions],
  );

  const staffSelectOptions = useMemo(() => {
    const exclude = form.clientUserId;
    return [
      { label: '— Pilih designer / PIC —', value: '' },
      ...controller.staffOptions
        .filter(option => option.id !== exclude)
        .map(option => ({
          label: option.sublabel
            ? `${option.label} · ${option.sublabel}`
            : option.label,
          value: option.id,
        })),
    ];
  }, [controller.staffOptions, form.clientUserId]);

  const termsSelectOptions = useMemo(
    () => [
      { label: '— Tidak pakai T&C —', value: '' },
      ...controller.termsOptions.map(option => ({
        label: option.label,
        value: option.id,
      })),
    ],
    [controller.termsOptions],
  );

  if (isEdit && !controller.canUpdate) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState
          message="Anda tidak memiliki izin mengubah surat penawaran proyek."
          title="Akses ditolak"
        />
        <KolamButton label="Kembali" onPress={controller.onBackToList} />
      </View>
    );
  }

  if (!isEdit && !controller.canCreate) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState
          message="Anda tidak memiliki izin membuat surat penawaran proyek."
          title="Akses ditolak"
        />
        <KolamButton label="Kembali" onPress={controller.onBackToList} />
      </View>
    );
  }

  return (
    <KolamDetailScrollSurface contentContainerStyle={styles.formContent}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <Text numberOfLines={1} style={styles.heading}>
            {isEdit ? 'Edit surat penawaran' : 'Surat penawaran baru'}
          </Text>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamCancelButton
              onPress={controller.onBackToList}
            />
            <KolamSaveButton
              disabled={controller.saving || !canSubmit}
              label={
                controller.saving
                  ? 'Menyimpan…'
                  : isEdit
                    ? 'Simpan'
                    : 'Buat draft'
              }
              onPress={() => {
                void controller.onSaveQuotation();
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
          style={styles.banner}
        />
      ) : null}
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
          style={styles.banner}
        />
      ) : null}
      {controller.loadingOptions ? (
        <Text style={styles.hint}>Memuat pilihan pelanggan / PIC / T&C…</Text>
      ) : null}

      <FormSection
        description="Pelanggan, PIC, nilai kontrak, dan metode pembayaran."
        title="Surat penawaran"
      >
        <Field label="Pelanggan" required>
          <KolamDropdownSelect
            label="Pelanggan"
            onChange={value => controller.onFormChange({ clientUserId: value })}
            options={customerSelectOptions}
            searchable
            searchPlaceholder="Cari pelanggan…"
            showLabelInTrigger={false}
            style={styles.select}
            value={form.clientUserId}
          />
        </Field>

        <Field label="Designer / PIC (staff)" required>
          <KolamDropdownSelect
            label="PIC"
            onChange={value => {
              const picked = controller.staffOptions.find(
                option => option.id === value,
              );
              controller.onFormChange({
                designerUserId: value,
                designerName: picked?.label || '',
              });
            }}
            options={staffSelectOptions}
            searchable
            searchPlaceholder="Cari staff…"
            showLabelInTrigger={false}
            style={styles.select}
            value={form.designerUserId}
          />
        </Field>

        <Field label="Nilai kontrak" required>
          <KolamRupiahField
            onChangeValue={value =>
              controller.onFormChange({ contractValueText: String(value) })
            }
            placeholder="0"
            value={Number(form.contractValueText) || 0}
          />
        </Field>

        <Field label="Metode pembayaran">
          <KolamDropdownSelect
            label="Pembayaran"
            onChange={value =>
              controller.onFormChange({
                paymentMode: value === 'staged' ? 'staged' : 'full',
              })
            }
            options={[
              { label: 'Lunas di muka', value: 'full' },
              { label: 'DP berjenjang', value: 'staged' },
            ]}
            showLabelInTrigger={false}
            style={styles.select}
            value={form.paymentMode}
          />
        </Field>

        {form.paymentMode === 'staged' ? (
          <>
            <Field label="Tipe DP">
              <KolamDropdownSelect
                label="Tipe DP"
                onChange={value =>
                  controller.onFormChange({
                    minDpType: value === 'fixed' ? 'fixed' : 'percentage',
                  })
                }
                options={[
                  { label: 'Persentase (%)', value: 'percentage' },
                  { label: 'Nominal (Rp)', value: 'fixed' },
                ]}
                showLabelInTrigger={false}
                style={styles.select}
                value={form.minDpType}
              />
            </Field>
            <Field
              label={
                form.minDpType === 'percentage'
                  ? 'DP minimum (%)'
                  : 'DP minimum'
              }
              required
            >
              {form.minDpType === 'percentage' ? (
                <KolamFormTextField
                  mode="numeric"
                  onChangeText={value =>
                    controller.onFormChange({ minDpValueText: value })
                  }
                  placeholder="50"
                  value={form.minDpValueText}
                />
              ) : (
                <KolamRupiahField
                  onChangeValue={value =>
                    controller.onFormChange({ minDpValueText: String(value) })
                  }
                  placeholder="0"
                  value={Number(form.minDpValueText) || 0}
                />
              )}
              {contractValue > 0 ? (
                <Text style={styles.hint}>
                  ≈ {formatRupiah(dpPreview)} · min.{' '}
                  {formatRupiah(Math.ceil(contractValue * 0.5))}
                </Text>
              ) : null}
            </Field>
          </>
        ) : (
          <Text style={styles.hint}>
            Setelah klien setuju, proyek siap dikerjakan tanpa menunggu DP.
          </Text>
        )}

        <Field label="Deskripsi proyek">
          <KolamFormTextField
            multiline
            onChangeText={value =>
              controller.onFormChange({ progressNote: value })
            }
            placeholder="Tulis deskripsi proyek…"
            value={form.progressNote}
          />
        </Field>

        <Field label="Lama pengerjaan (hari)">
          <KolamFormTextField
            mode="numeric"
            onChangeText={value =>
              controller.onFormChange({ maxWorkDaysText: value })
            }
            placeholder="Opsional"
            value={form.maxWorkDaysText}
          />
        </Field>

        <Field label="Target selesai">
          <KolamDateField
            label="Target selesai"
            onChange={value =>
              controller.onFormChange({ targetCompletionDate: value })
            }
            showLabelInTrigger={false}
            style={styles.select}
            value={form.targetCompletionDate}
          />
        </Field>

        <Field label="Referensi desain (URL)">
          <KolamFormTextField
            mode="url"
            onChangeText={value =>
              controller.onFormChange({ designReferenceEmbedUrl: value })
            }
            placeholder="URL share/embed publik"
            value={form.designReferenceEmbedUrl}
          />
        </Field>

        <Field label="Terms of Service">
          <KolamDropdownSelect
            label="T&C"
            onChange={value =>
              controller.onFormChange({ termsTemplateId: value })
            }
            options={termsSelectOptions}
            searchable
            searchPlaceholder="Cari template…"
            showLabelInTrigger={false}
            style={styles.select}
            value={form.termsTemplateId}
          />
        </Field>
      </FormSection>

      <FormSection
        description="Default DA 20% / PIC 80%. Dikunci setelah accrual pertama."
        title="Komisi"
      >
        <View style={styles.row2}>
          <View style={styles.col}>
            <Field label="Tipe DA">
              <KolamDropdownSelect
                label="DA"
                onChange={value =>
                  controller.onFormChange({
                    daType: value === 'fixed' ? 'fixed' : 'percentage',
                  })
                }
                options={[
                  { label: 'Persentase', value: 'percentage' },
                  { label: 'Nominal', value: 'fixed' },
                ]}
                showLabelInTrigger={false}
                style={styles.select}
                value={form.daType}
              />
            </Field>
          </View>
          <View style={styles.col}>
            <Field label={form.daType === 'percentage' ? 'Nilai DA (%)' : 'Nilai DA'}>
              {form.daType === 'percentage' ? (
                <KolamFormTextField
                  mode="numeric"
                  onChangeText={value =>
                    controller.onFormChange({ daValueText: value })
                  }
                  value={form.daValueText}
                />
              ) : (
                <KolamRupiahField
                  onChangeValue={value =>
                    controller.onFormChange({ daValueText: String(value) })
                  }
                  value={Number(form.daValueText) || 0}
                />
              )}
            </Field>
          </View>
        </View>
        <View style={styles.row2}>
          <View style={styles.col}>
            <Field label="Tipe PIC">
              <KolamDropdownSelect
                label="PIC komisi"
                onChange={value =>
                  controller.onFormChange({
                    designerType: value === 'fixed' ? 'fixed' : 'percentage',
                  })
                }
                options={[
                  { label: 'Persentase', value: 'percentage' },
                  { label: 'Nominal', value: 'fixed' },
                ]}
                showLabelInTrigger={false}
                style={styles.select}
                value={form.designerType}
              />
            </Field>
          </View>
          <View style={styles.col}>
            <Field
              label={
                form.designerType === 'percentage'
                  ? 'Nilai PIC (%)'
                  : 'Nilai PIC'
              }
            >
              {form.designerType === 'percentage' ? (
                <KolamFormTextField
                  mode="numeric"
                  onChangeText={value =>
                    controller.onFormChange({ designerValueText: value })
                  }
                  value={form.designerValueText}
                />
              ) : (
                <KolamRupiahField
                  onChangeValue={value =>
                    controller.onFormChange({ designerValueText: String(value) })
                  }
                  value={Number(form.designerValueText) || 0}
                />
              )}
            </Field>
          </View>
        </View>
      </FormSection>

      <FormSection
        description="Item kustom pada surat penawaran (opsional). HPP produk toko menyusul di batch berikutnya."
        title="Item kustom"
      >
        {form.items.length === 0 ? (
          <Text style={styles.hint}>Belum ada item kustom.</Text>
        ) : (
          form.items.map(item => (
            <View key={item.key} style={styles.itemCard}>
              <Field label="Nama item" required>
                <KolamFormTextField
                  onChangeText={value =>
                    controller.onPatchFormItem(item.key, {
                      customName: value,
                    })
                  }
                  placeholder="Nama"
                  value={item.customName}
                />
              </Field>
              <View style={styles.row2}>
                <View style={styles.col}>
                  <Field label="Qty">
                    <KolamFormTextField
                      mode="numeric"
                      onChangeText={value =>
                        controller.onPatchFormItem(item.key, {
                          quantityText: value,
                        })
                      }
                      value={item.quantityText}
                    />
                  </Field>
                </View>
                <View style={styles.col}>
                  <Field label="Harga satuan">
                    <KolamFormTextField
                      mode="numeric"
                      onChangeText={value =>
                        controller.onPatchFormItem(item.key, {
                          unitPriceText: value,
                        })
                      }
                      value={item.unitPriceText}
                    />
                  </Field>
                </View>
              </View>
              <KolamNotesField
                label="Catatan"
                onChangeText={value =>
                  controller.onPatchFormItem(item.key, { note: value })
                }
                placeholder="Opsional"
                value={item.note}
              />
              <KolamDeleteButton
                intent="outline"
                label="Hapus item"
                onPress={() => controller.onRemoveFormItem(item.key)}
              />
            </View>
          ))
        )}
        <KolamButton
          intent="outline"
          label="Tambah item kustom"
          onPress={controller.onAddFormItem}
        />
      </FormSection>
    </KolamDetailScrollSurface>
  );
}

function FormSection({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Field({
  children,
  label,
  required,
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <View style={styles.field}>
      <KolamSettingsWebFieldLabel label={label} required={Boolean(required)} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 12,
    padding: 16,
  },
  formContent: {
    gap: 16,
    padding: 16,
    paddingBottom: 40,
  },
  heading: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '800',
  },
  banner: {
    alignSelf: 'stretch',
  },
  hint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 18,
  },
  section: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 14,
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
    lineHeight: 18,
  },
  sectionBody: {
    gap: 12,
    marginTop: 4,
  },
  field: {
    gap: 6,
  },
  select: {
    alignSelf: 'stretch',
    minWidth: 220,
  },
  row2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  col: {
    flex: 1,
    gap: 12,
    minWidth: 180,
  },
  itemCard: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
});
