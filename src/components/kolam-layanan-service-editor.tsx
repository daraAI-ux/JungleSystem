import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  formatKolamLayananUnitPrice,
  getKolamLayananTaskTypeLabel,
  KOLAM_LAYANAN_CONTRACT_DURATION_UNIT_OPTIONS,
  KOLAM_LAYANAN_ENCLOSURE_TYPE_OPTIONS,
  KOLAM_LAYANAN_ROOT,
  KOLAM_LAYANAN_TASK_TYPE_OPTIONS,
  type KolamLayananService,
} from '../domain/kolam-layanan';
import { formatRupiah } from '../lib/money';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import type { KolamLayananController } from '../hooks/use-kolam-layanan-controller';
import { KolamButton } from './kolam-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDescriptionList } from './kolam-description-list';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamSelectorChip } from './kolam-selector-chip';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamSwitch } from './kolam-switch';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

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
      <Text style={styles.fieldLabel}>
        {label}
        {required ? ' *' : ''}
      </Text>
      {children}
    </View>
  );
}

function FormSection({
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
            ? [{ id: 'description', text: description, style: styles.metaText }]
            : []),
        ]}
      />
      <View style={styles.sectionBody}>{children}</View>
    </KolamContentFrame>
  );
}

export function KolamLayananServiceEditor({
  controller,
  onRouteChange,
  route,
}: {
  controller: KolamLayananController;
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  if (
    controller.mode === 'langganan' ||
    controller.mode === 'unsupported'
  ) {
    return (
      <KolamLayananDeferredPlaceholder
        mode={controller.mode}
        onRouteChange={onRouteChange}
        route={route}
      />
    );
  }

  const title =
    controller.mode === 'create'
      ? 'Layanan baru'
      : controller.mode === 'edit'
        ? 'Ubah layanan'
        : controller.selectedService?.name || 'Detail layanan';

  return (
    <View style={styles.surface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.toolbarTitle}>
              {title}
            </Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              disabled={controller.loading || controller.saving}
              label="Refresh"
              onPress={() => {
                void controller.onRefresh();
              }}
            />
            <KolamButton
              label="Daftar"
              onPress={() => {
                controller.onBackToList();
                onRouteChange?.(KOLAM_LAYANAN_ROOT);
              }}
            />
            {controller.mode === 'detail' ? (
              <KolamButton
                intent="primary"
                label="Ubah"
                onPress={() => {
                  controller.onEdit();
                  if (controller.selectedService?.id) {
                    onRouteChange?.(
                      `${KOLAM_LAYANAN_ROOT}/${controller.selectedService.id}/edit`,
                    );
                  }
                }}
              />
            ) : null}
            {controller.mode === 'create' || controller.mode === 'edit' ? (
              <KolamButton
                disabled={controller.saving}
                intent="primary"
                label={controller.saving ? 'Menyimpan…' : 'Simpan'}
                onPress={() => {
                  void controller.onSave().then(id => {
                    if (id) {
                      onRouteChange?.(`${KOLAM_LAYANAN_ROOT}/${id}`);
                    }
                  });
                }}
              />
            ) : null}
          </View>
        </View>
      </View>

      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
          style={styles.errorBadge}
        />
      ) : null}

      {controller.mode === 'detail' ? (
        <KolamLayananServiceDetail
          loading={controller.loading}
          service={controller.selectedService}
        />
      ) : (
        <KolamLayananServiceForm controller={controller} />
      )}
    </View>
  );
}

function KolamLayananDeferredPlaceholder({
  mode,
  onRouteChange,
  route,
}: {
  mode: string;
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const title =
    mode === 'langganan'
      ? 'Detail langganan'
      : mode === 'voucher'
        ? 'Detail voucher'
        : mode === 'execution'
          ? 'Detail eksekusi kunjungan'
          : 'Layanan';

  return (
    <View style={styles.surface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.toolbarTitle}>
              {title}
            </Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              label="Daftar"
              onPress={() => onRouteChange?.(KOLAM_LAYANAN_ROOT)}
            />
          </View>
        </View>
      </View>
      <KolamEmptyState
        message={`Halaman ${route} menyusul di batch berikutnya.`}
        title="Segera hadir"
      />
    </View>
  );
}

function KolamLayananServiceDetail({
  loading,
  service,
}: {
  loading: boolean;
  service: KolamLayananService | null;
}) {
  if (loading && !service) {
    return (
      <KolamEmptyState message="Memuat detail layanan…" title="Memuat" />
    );
  }
  if (!service) {
    return (
      <KolamEmptyState
        message="Layanan tidak ditemukan."
        title="Tidak ada data"
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.stripRow}>
        <KolamStatusBadge
          intent={service.sellable ? 'success' : 'secondary'}
          label={service.sellable ? 'Dijual' : 'Nonaktif'}
        />
        <KolamStatusBadge
          intent="info"
          label={getKolamLayananTaskTypeLabel(service.taskType)}
        />
      </View>

      <FormSection title="Informasi layanan">
        <KolamDescriptionList
          rows={[
            desc('sku', 'SKU', service.sku),
            desc(
              'brands',
              'Merek',
              service.brands.map(brand => brand.name).join(', ') || '—',
            ),
            desc(
              'tasks',
              'Tipe task',
              service.enclosureTaskTypeKeys
                .map(getKolamLayananTaskTypeLabel)
                .join(', ') || '—',
            ),
            desc(
              'enclosures',
              'Tipe kandang',
              service.enclosureTypes.join(', ') || '—',
            ),
            desc(
              'visits',
              'Kunjungan / bulan',
              service.visitsPerMonth != null
                ? String(service.visitsPerMonth)
                : '—',
            ),
            desc(
              'package',
              'Kode paket',
              service.packageCode,
            ),
            desc(
              'contract',
              'Durasi kontrak',
              service.contractDurationValue != null
                ? `${service.contractDurationValue} ${service.contractDurationUnit || ''}`
                : '—',
            ),
            desc(
              'description',
              'Deskripsi',
              service.description || 'Belum diisi',
            ),
          ]}
        />
      </FormSection>

      <FormSection title="Harga">
        <KolamDescriptionList
          rows={[
            desc(
              'price',
              'Harga dasar',
              service.price != null ? formatRupiah(service.price) : '—',
            ),
            desc(
              'priceM3',
              'Jual /m³',
              formatKolamLayananUnitPrice(service.priceM3, 'm3'),
            ),
            desc(
              'priceKm',
              'Jual /km',
              formatKolamLayananUnitPrice(service.priceKm, 'km'),
            ),
            desc(
              'costM3',
              'HPP /m³',
              service.costM3 != null ? formatRupiah(service.costM3) : '—',
            ),
            desc(
              'costKm',
              'HPP /km',
              service.costKm != null ? formatRupiah(service.costKm) : '—',
            ),
          ]}
        />
      </FormSection>

      <FormSection title="Komisi & poin">
        <KolamDescriptionList
          rows={[
            desc(
              'commission',
              'Komisi',
              service.commissionEnabled
                ? `${service.commissionType === 'fixed' ? formatRupiah(service.commissionValue) : `${service.commissionValue}%`}`
                : 'Nonaktif',
            ),
            desc(
              'points',
              'Poin member',
              service.memberPointsEnabled
                ? String(service.memberPoints)
                : 'Nonaktif',
            ),
          ]}
        />
      </FormSection>
    </ScrollView>
  );
}

function KolamLayananServiceForm({
  controller,
}: {
  controller: KolamLayananController;
}) {
  const form = controller.form;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <FormSection
        description="Nama, SKU, merek, dan status jual."
        title="Informasi dasar"
      >
        <FieldShell label="Nama" required>
          <KolamFormTextField
            onChangeText={value => controller.onChangeForm({ name: value })}
            placeholder="Nama paket layanan"
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={form.name}
          />
        </FieldShell>
        <FieldShell label="SKU" required>
          <KolamFormTextField
            onChangeText={value => controller.onChangeForm({ sku: value })}
            placeholder="SVC-001"
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={form.sku}
          />
        </FieldShell>
        <FieldShell label="Deskripsi">
          <KolamFormTextField
            multiline
            onChangeText={value =>
              controller.onChangeForm({ description: value })
            }
            placeholder="Opsional"
            style={[
              settingsWebFormStyles.settingsWebFormFieldValue,
              settingsWebFormStyles.settingsWebFormFieldValueTextarea,
            ]}
            value={form.description}
          />
        </FieldShell>
        <FieldShell label="Merek" required>
          <View style={styles.chipRow}>
            {controller.brandOptions.map(brand => (
              <KolamSelectorChip
                active={form.brandIds.includes(brand.id)}
                key={brand.id}
                label={brand.name}
                onPress={() => controller.onToggleBrand(brand.id)}
              />
            ))}
          </View>
          {!controller.brandOptions.length ? (
            <Text style={styles.metaText}>Daftar merek kosong.</Text>
          ) : null}
        </FieldShell>
        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.primaryText}>Dijual</Text>
            <Text style={styles.metaText}>
              Nonaktif tidak muncul di picker penjualan.
            </Text>
          </View>
          <KolamSwitch
            active={form.sellable}
            onPress={() =>
              controller.onChangeForm({ sellable: !form.sellable })
            }
          />
        </View>
      </FormSection>

      <FormSection
        description="Tipe task dosing/pemeliharaan dan tipe kandang yang didukung."
        title="Template layanan"
      >
        <FieldShell label="Tipe task" required>
          <View style={styles.chipRow}>
            {KOLAM_LAYANAN_TASK_TYPE_OPTIONS.map(option => (
              <KolamSelectorChip
                active={form.enclosureTaskTypeKeys.includes(option.id)}
                key={option.id}
                label={option.label}
                onPress={() => controller.onToggleTaskTypeKey(option.id)}
              />
            ))}
          </View>
        </FieldShell>
        <KolamDropdownSelect
          label="Task utama"
          onChange={value => controller.onChangeForm({ taskType: value })}
          options={[
            { label: 'Otomatis (pertama)', value: '' },
            ...form.enclosureTaskTypeKeys.map(key => ({
              label: getKolamLayananTaskTypeLabel(key),
              value: key,
            })),
          ]}
          value={form.taskType}
        />
        <FieldShell label="Tipe kandang" required>
          <View style={styles.chipRow}>
            {KOLAM_LAYANAN_ENCLOSURE_TYPE_OPTIONS.map(option => (
              <KolamSelectorChip
                active={form.enclosureTypes.includes(option)}
                key={option}
                label={option}
                onPress={() => controller.onToggleEnclosureType(option)}
              />
            ))}
          </View>
        </FieldShell>
        <FieldShell label="Kunjungan per bulan">
          <KolamFormTextField
            mode="numeric"
            onChangeText={value =>
              controller.onChangeForm({ visitsPerMonth: value })
            }
            placeholder="0"
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={form.visitsPerMonth}
          />
        </FieldShell>
      </FormSection>

      <FormSection
        description="Kode paket dan durasi kontrak yang di-snapshot ke voucher."
        title="Paket penjualan"
      >
        <FieldShell label="Kode paket">
          <KolamFormTextField
            autoCapitalize="characters"
            onChangeText={value =>
              controller.onChangeForm({ packageCode: value.toUpperCase() })
            }
            placeholder="SV-001"
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={form.packageCode}
          />
        </FieldShell>
        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.primaryText}>Paket aktif</Text>
            <Text style={styles.metaText}>Bisa dijual sebagai paket.</Text>
          </View>
          <KolamSwitch
            active={form.packageActive}
            onPress={() =>
              controller.onChangeForm({ packageActive: !form.packageActive })
            }
          />
        </View>
        <FieldShell label="Durasi kontrak">
          <KolamFormTextField
            mode="numeric"
            onChangeText={value =>
              controller.onChangeForm({ contractDurationValue: value })
            }
            placeholder="1"
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={form.contractDurationValue}
          />
        </FieldShell>
        <KolamDropdownSelect
          label="Satuan durasi"
          onChange={value =>
            controller.onChangeForm({
              contractDurationUnit:
                value as typeof form.contractDurationUnit,
            })
          }
          options={KOLAM_LAYANAN_CONTRACT_DURATION_UNIT_OPTIONS.map(option => ({
            label: option.label,
            value: option.id,
          }))}
          value={form.contractDurationUnit}
        />
      </FormSection>

      <FormSection description="Harga dasar dan harga per volume/jarak." title="Harga">
        <FieldShell label="Harga dasar (Rp)">
          <KolamFormTextField
            mode="numeric"
            onChangeText={value => controller.onChangeForm({ price: value })}
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={form.price}
          />
        </FieldShell>
        <FieldShell label="Jual /m³">
          <KolamFormTextField
            mode="numeric"
            onChangeText={value => controller.onChangeForm({ priceM3: value })}
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={form.priceM3}
          />
        </FieldShell>
        <FieldShell label="Jual /km">
          <KolamFormTextField
            mode="numeric"
            onChangeText={value => controller.onChangeForm({ priceKm: value })}
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={form.priceKm}
          />
        </FieldShell>
        <FieldShell label="HPP /m³">
          <KolamFormTextField
            mode="numeric"
            onChangeText={value => controller.onChangeForm({ costM3: value })}
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={form.costM3}
          />
        </FieldShell>
        <FieldShell label="HPP /km">
          <KolamFormTextField
            mode="numeric"
            onChangeText={value => controller.onChangeForm({ costKm: value })}
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={form.costKm}
          />
        </FieldShell>
      </FormSection>

      <FormSection title="Komisi & poin member">
        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.primaryText}>Komisi aktif</Text>
          </View>
          <KolamSwitch
            active={form.commissionEnabled}
            onPress={() =>
              controller.onChangeForm({
                commissionEnabled: !form.commissionEnabled,
              })
            }
          />
        </View>
        {form.commissionEnabled ? (
          <>
            <KolamDropdownSelect
              label="Tipe komisi"
              onChange={value =>
                controller.onChangeForm({
                  commissionType: value as 'percentage' | 'fixed',
                })
              }
              options={[
                { label: 'Persentase', value: 'percentage' },
                { label: 'Nominal tetap', value: 'fixed' },
              ]}
              value={form.commissionType}
            />
            <FieldShell
              label={
                form.commissionType === 'fixed'
                  ? 'Nilai komisi (Rp)'
                  : 'Nilai komisi (%)'
              }
            >
              <KolamFormTextField
                mode="numeric"
                onChangeText={value =>
                  controller.onChangeForm({ commissionValue: value })
                }
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={form.commissionValue}
              />
            </FieldShell>
          </>
        ) : null}
        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.primaryText}>Poin member</Text>
          </View>
          <KolamSwitch
            active={form.memberPointsEnabled}
            onPress={() =>
              controller.onChangeForm({
                memberPointsEnabled: !form.memberPointsEnabled,
              })
            }
          />
        </View>
        {form.memberPointsEnabled ? (
          <FieldShell label="Jumlah poin">
            <KolamFormTextField
              mode="numeric"
              onChangeText={value =>
                controller.onChangeForm({ memberPoints: value })
              }
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={form.memberPoints}
            />
          </FieldShell>
        ) : null}
      </FormSection>
    </ScrollView>
  );
}

function desc(id: string, label: string, value: string) {
  return { id, label, meta: '', tone: 'default' as const, value };
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 8,
  },
  content: {
    gap: 16,
    paddingBottom: 32,
    paddingHorizontal: 8,
  },
  toolbarTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 420,
  },
  errorBadge: {
    alignSelf: 'stretch',
    marginHorizontal: 4,
  },
  sectionCopy: {
    gap: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '700',
  },
  sectionBody: {
    gap: 12,
  },
  fieldLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  switchCopy: {
    flex: 1,
    gap: 2,
  },
  primaryText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  metaText: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  stripRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 8,
  },
});
