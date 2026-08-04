import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  formatKolamLayananCommission,
  formatKolamLayananContractDuration,
  formatKolamLayananMemberPoints,
  formatKolamLayananPricingMethod,
  getKolamLayananStandardPrice,
  getKolamLayananTaskTypeLabel,
  hasKolamLayananVolumePricing,
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
import { KolamHtmlContent } from './kolam-html-content';
import {
  KolamPricingMetric,
  KolamPricingMetricsGrid,
} from './kolam-pricing-metric-grid';
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
  if (controller.mode === 'unsupported') {
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

  const brandsLabel =
    service.brands.map(brand => brand.name).filter(Boolean).join(', ') ||
    'Belum diisi';
  const taskLabel =
    service.enclosureTaskTypeKeys
      .map(getKolamLayananTaskTypeLabel)
      .filter(Boolean)
      .join(', ') ||
    (service.taskType
      ? getKolamLayananTaskTypeLabel(service.taskType)
      : 'Belum diisi');
  const enclosureLabel =
    service.enclosureTypes.join(', ') || 'Belum diisi';
  const visitsLabel =
    service.visitsPerMonth != null && service.visitsPerMonth > 0
      ? String(service.visitsPerMonth)
      : 'Belum diisi';
  const packageCode =
    service.packageCode && service.packageCode !== '—'
      ? service.packageCode
      : '';
  const volumePricing = hasKolamLayananVolumePricing(service);
  const standardPrice = getKolamLayananStandardPrice(service);
  const costM3 = service.costM3 ?? 0;
  const costKm = service.costKm ?? 0;
  const priceM3 = service.priceM3 ?? 0;
  const priceKm = service.priceKm ?? 0;
  const marginM3 = priceM3 - costM3;
  const marginKm = priceKm - costKm;
  const marginPctM3 = costM3 > 0 ? (marginM3 / costM3) * 100 : 0;
  const marginPctKm = costKm > 0 ? (marginKm / costKm) * 100 : 0;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.statusStrip}>
        <View style={styles.statusStripItem}>
          <Text style={styles.statusStripLabel}>Status jual</Text>
          <KolamStatusBadge
            intent={service.sellable ? 'success' : 'secondary'}
            label={service.sellable ? 'Dijual' : 'Nonaktif'}
          />
        </View>
        <View style={[styles.statusStripItem, styles.statusStripDivider]}>
          <Text style={styles.statusStripLabel}>Komisi</Text>
          <Text style={styles.statusStripValue}>
            {formatKolamLayananCommission(service)}
          </Text>
        </View>
        <View style={styles.statusStripItem}>
          <Text style={styles.statusStripLabel}>Poin</Text>
          <Text style={[styles.statusStripValue, styles.statusStripPoints]}>
            {formatKolamLayananMemberPoints(service)}
          </Text>
        </View>
      </View>

      <View style={styles.detailColumns}>
        <View style={styles.detailMain}>
          <FormSection title="Informasi layanan">
            {service.description.trim() ? (
              <View style={styles.descriptionPreview}>
                <KolamHtmlContent html={service.description} />
              </View>
            ) : (
              <Text style={styles.metaText}>Belum diisi</Text>
            )}
            <KolamDescriptionList
              rows={[
                desc('sku', 'SKU', service.sku && service.sku !== '—' ? service.sku : 'Belum diisi'),
                desc('brands', 'Merek', brandsLabel),
                desc('tasks', 'Tipe task kandang', taskLabel),
                desc('enclosures', 'Tipe kandang', enclosureLabel),
                desc('visits', 'Kunjungan per bulan', visitsLabel),
                desc(
                  'onsite',
                  'Kunjungan lapangan',
                  service.requiresOnSiteVisit ? 'Wajib' : 'Tidak wajib',
                ),
                desc(
                  'delivery',
                  'Termasuk pengiriman',
                  service.includesDelivery ? 'Ya' : 'Tidak',
                ),
              ]}
            />
          </FormSection>
        </View>

        <View style={styles.detailSide}>
          <FormSection
            description={formatKolamLayananPricingMethod(service)}
            title="Harga & HPP"
          >
            {volumePricing ? (
              <KolamPricingMetricsGrid compact>
                <KolamPricingMetric label="HPP per m³">
                  <Text style={styles.metricMuted}>
                    {formatRupiah(costM3)}
                    <Text style={styles.metricSuffix}> /m³</Text>
                  </Text>
                </KolamPricingMetric>
                <KolamPricingMetric label="Harga jual per m³">
                  <Text style={styles.metricSuccess}>
                    {formatRupiah(priceM3)}
                    <Text style={styles.metricSuffix}> /m³</Text>
                  </Text>
                </KolamPricingMetric>
                <KolamPricingMetric label="HPP per km">
                  <Text style={styles.metricMuted}>
                    {formatRupiah(costKm)}
                    <Text style={styles.metricSuffix}> /km</Text>
                  </Text>
                </KolamPricingMetric>
                <KolamPricingMetric label="Harga jual per km">
                  <Text style={styles.metricSuccess}>
                    {formatRupiah(priceKm)}
                    <Text style={styles.metricSuffix}> /km</Text>
                  </Text>
                </KolamPricingMetric>
                {priceM3 > 0 ? (
                  <KolamPricingMetric fullWidth label="Margin per m³">
                    <Text
                      style={
                        marginM3 >= 0
                          ? styles.metricSuccess
                          : styles.metricDanger
                      }
                    >
                      {formatRupiah(marginM3)}
                      {costM3 > 0
                        ? ` (${marginPctM3.toFixed(1)}%)`
                        : ''}
                    </Text>
                  </KolamPricingMetric>
                ) : null}
                {priceKm > 0 ? (
                  <KolamPricingMetric fullWidth label="Margin per km">
                    <Text
                      style={
                        marginKm >= 0
                          ? styles.metricSuccess
                          : styles.metricDanger
                      }
                    >
                      {formatRupiah(marginKm)}
                      {costKm > 0
                        ? ` (${marginPctKm.toFixed(1)}%)`
                        : ''}
                    </Text>
                  </KolamPricingMetric>
                ) : null}
              </KolamPricingMetricsGrid>
            ) : (
              <KolamPricingMetricsGrid compact>
                <KolamPricingMetric label="Harga jual standar">
                  <Text
                    style={
                      standardPrice > 0
                        ? styles.metricSuccess
                        : styles.metricMuted
                    }
                  >
                    {standardPrice > 0 ? formatRupiah(standardPrice) : '—'}
                  </Text>
                </KolamPricingMetric>
                <KolamPricingMetric label="Harga online">
                  <Text
                    style={
                      (service.onlinePrice ?? 0) > 0
                        ? styles.primaryText
                        : styles.metricMuted
                    }
                  >
                    {(service.onlinePrice ?? 0) > 0
                      ? formatRupiah(service.onlinePrice!)
                      : '—'}
                  </Text>
                </KolamPricingMetric>
              </KolamPricingMetricsGrid>
            )}
          </FormSection>

          <FormSection title="Paket penjualan">
            <KolamDescriptionList
              rows={[
                desc(
                  'packageCode',
                  'Kode paket',
                  packageCode || 'Belum diisi',
                ),
                desc(
                  'packageActive',
                  'Status paket',
                  packageCode
                    ? service.packageActive
                      ? 'Aktif'
                      : 'Nonaktif'
                    : 'Belum diisi',
                ),
                desc(
                  'contract',
                  'Durasi kontrak',
                  formatKolamLayananContractDuration(
                    service.contractDurationValue,
                    service.contractDurationUnit,
                  ),
                ),
              ]}
            />
            {packageCode ? (
              <View style={styles.inlineBadgeRow}>
                <KolamStatusBadge
                  intent={service.packageActive ? 'success' : 'secondary'}
                  label={service.packageActive ? 'Paket aktif' : 'Paket nonaktif'}
                />
              </View>
            ) : null}
          </FormSection>
        </View>
      </View>
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
  statusStrip: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statusStripItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  statusStripDivider: {
    borderLeftColor: V.colors.border,
    borderLeftWidth: 1,
    paddingLeft: 12,
  },
  statusStripLabel: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  statusStripValue: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  statusStripPoints: {
    color: V.colors.success,
  },
  detailColumns: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailMain: {
    flexBasis: 420,
    flexGrow: 2,
    gap: 12,
    minWidth: 280,
  },
  detailSide: {
    flexBasis: 280,
    flexGrow: 1,
    gap: 12,
    minWidth: 240,
  },
  descriptionPreview: {
    marginBottom: 8,
    minHeight: 40,
  },
  inlineBadgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  metricSuccess: {
    color: V.colors.success,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  metricMuted: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  metricDanger: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  metricSuffix: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '400',
  },
});
