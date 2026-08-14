import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
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
  type KolamLayananPendingService,
  type KolamLayananService,
  type KolamLayananServiceProductComponent,
} from '../domain/kolam-layanan';
import {
  KOLAM_TASK_CATEGORY_BUCKET_LABEL,
  KOLAM_TASK_MANAGER_ROOT,
} from '../domain/kolam-task-manager';
import type { KolamUserListItem } from '../domain/kolam-user';
import { formatRupiah } from '../lib/money';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import type { KolamLayananController } from '../hooks/use-kolam-layanan-controller';
import { spawnKolamLayananServiceTask } from '../services/kolam-layanan-api';
import { getKolamUserList } from '../services/kolam-user-api';
import { KolamButton } from './kolam-button';
import {KolamCancelButton} from './kolam-cancel-button';
import {KolamSaveButton} from './kolam-save-button';
import {KolamDaftarButton} from './kolam-daftar-button';
import {KolamDetailButton} from './kolam-detail-button';
import {KolamEditButton} from './kolam-edit-button';
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
import { KolamDescriptionList } from './kolam-description-list';
import {
  KolamDetailMetaStrip,
  KolamDetailMetaStripItem,
  kolamDetailMetaStripStyles,
} from './kolam-detail-meta-strip';
import { KolamDetailTermsTemplatesPanel } from './kolam-detail-more-panels';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamRupiahField } from './kolam-rupiah-field';
import { KolamHtmlContent } from './kolam-html-content';
import { KolamModalBackdrop } from './kolam-modal-backdrop';
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
            <KolamRefreshButton
              accessibilityLabel="Refresh"
              disabled={controller.loading || controller.saving}

              onPress={() => {
                void controller.onRefresh();
              }}
            />
            <KolamDaftarButton
              onPress={() => {
                controller.onBackToList();
                onRouteChange?.(KOLAM_LAYANAN_ROOT);
              }}
            />
            {controller.mode === 'detail' ? (
              <KolamEditButton
                intent="primary"
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
              <KolamSaveButton
                disabled={controller.saving}
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
          onRouteChange={onRouteChange}
          relatedVouchers={controller.relatedVouchers}
          relatedVouchersLoading={controller.relatedVouchersLoading}
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
            <KolamDaftarButton
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
  onRouteChange,
  relatedVouchers,
  relatedVouchersLoading,
  service,
}: {
  loading: boolean;
  onRouteChange?: (route: string) => void;
  relatedVouchers: KolamLayananPendingService[];
  relatedVouchersLoading: boolean;
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
  const productComponents = service.productComponents ?? [];
  const rawMaterials = productComponents.filter(
    item => item.inventoryKind === 'raw',
  );
  const finishedProducts = productComponents.filter(
    item => item.inventoryKind === 'product',
  );

  return (
    <KolamDetailScrollSurface contentContainerStyle={styles.content}>
      <KolamDetailMetaStrip>
        <KolamDetailMetaStripItem label="Status jual">
          <KolamStatusBadge
            intent={service.sellable ? 'success' : 'secondary'}
            label={service.sellable ? 'Dijual' : 'Nonaktif'}
          />
        </KolamDetailMetaStripItem>
        <KolamDetailMetaStripItem label="Komisi">
          <Text style={kolamDetailMetaStripStyles.stripValue}>
            {formatKolamLayananCommission(service)}
          </Text>
        </KolamDetailMetaStripItem>
        <KolamDetailMetaStripItem label="Poin">
          <Text
            style={[
              kolamDetailMetaStripStyles.stripValue,
              styles.statusStripPoints,
            ]}
          >
            {formatKolamLayananMemberPoints(service)}
          </Text>
        </KolamDetailMetaStripItem>
      </KolamDetailMetaStrip>

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

          <FormSection
            description={
              relatedVouchersLoading
                ? 'Memuat…'
                : `${relatedVouchers.length} voucher terkait layanan ini`
            }
            title="Voucher layanan"
          >
            {relatedVouchersLoading ? (
              <Text style={styles.metaText}>Memuat voucher…</Text>
            ) : relatedVouchers.length === 0 ? (
              <Text style={styles.emptyPanel}>
                Belum ada voucher untuk layanan ini.
              </Text>
            ) : (
              <View style={styles.detailTable}>
                <View style={styles.detailTableHeader}>
                  <Text style={[styles.detailTableHead, styles.colSerial]}>
                    Serial
                  </Text>
                  <Text style={[styles.detailTableHead, styles.colStatus]}>
                    Status
                  </Text>
                  <Text style={[styles.detailTableHead, styles.colInvoice]}>
                    Faktur
                  </Text>
                  <Text style={[styles.detailTableHead, styles.colCustomer]}>
                    Customer
                  </Text>
                  <Text style={[styles.detailTableHead, styles.colType]}>
                    Tipe
                  </Text>
                  <Text style={[styles.detailTableHead, styles.colDate]}>
                    Tanggal beli
                  </Text>
                  <View style={styles.colAction} />
                </View>
                {relatedVouchers.map(item => (
                  <View key={item.id} style={styles.detailTableRow}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.detailTableCell,
                        styles.colSerial,
                        styles.monoCell,
                      ]}
                    >
                      {item.serviceSerial || '—'}
                    </Text>
                    <View style={[styles.colStatus, styles.badgeCell]}>
                      <KolamStatusBadge
                        intent={
                          item.status === 'initiated' ? 'success' : 'secondary'
                        }
                        label={
                          item.status === 'initiated'
                            ? 'Aktif'
                            : 'Menunggu aktivasi'
                        }
                      />
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.detailTableCell,
                        styles.colInvoice,
                        styles.monoCell,
                      ]}
                    >
                      {item.invoiceCode || '—'}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.detailTableCell, styles.colCustomer]}
                    >
                      {item.customerName || '—'}
                    </Text>
                    <View style={[styles.colType, styles.badgeCell]}>
                      {item.taskType ? (
                        <KolamStatusBadge
                          intent={
                            item.taskType === 'dosing' ? 'info' : 'secondary'
                          }
                          label={getKolamLayananTaskTypeLabel(item.taskType)}
                        />
                      ) : (
                        <Text style={styles.detailTableCell}>—</Text>
                      )}
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.detailTableCell,
                        styles.colDate,
                        styles.metaText,
                      ]}
                    >
                      {formatDetailDate(item.purchasedAt)}
                    </Text>
                    <View style={[styles.colAction, styles.actionCell]}>
                      <KolamDetailButton
                        onPress={() =>
                          onRouteChange?.(
                            `${KOLAM_LAYANAN_ROOT}/voucher/${item.id}`,
                          )
                        }
                        size="sm"
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </FormSection>

          {productComponents.length > 0 ? (
            <FormSection
              description={`${productComponents.length} komponen stok gudang Kolam`}
              title="Material per kunjungan"
            >
              {rawMaterials.length > 0 ? (
                <ServiceProductComponentsBlock
                  rows={rawMaterials}
                  title="Bahan baku"
                />
              ) : null}
              {finishedProducts.length > 0 ? (
                <ServiceProductComponentsBlock
                  rows={finishedProducts}
                  title="Produk jadi"
                />
              ) : null}
            </FormSection>
          ) : null}

          <KolamDetailTermsTemplatesPanel
            itemId={service.id}
            itemLabel="layanan"
            itemType="service"
          />
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
                  'contract',
                  'Durasi kontrak',
                  formatKolamLayananContractDuration(
                    service.contractDurationValue,
                    service.contractDurationUnit,
                  ),
                ),
              ]}
            />
          </FormSection>

          <ServiceTasksPanel
            onRouteChange={onRouteChange}
            serviceId={service.id}
            serviceName={service.name}
          />
        </View>
      </View>
    </KolamDetailScrollSurface>
  );
}

function ServiceTasksPanel({
  onRouteChange,
  serviceId,
  serviceName,
}: {
  onRouteChange?: (route: string) => void;
  serviceId: string;
  serviceName: string;
}) {
  const { authUser } = useKolamAuthContext();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [assignedToId, setAssignedToId] = React.useState('');
  const [staff, setStaff] = React.useState<KolamUserListItem[]>([]);
  const [staffLoading, setStaffLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const defaultTitle = `Layanan: ${serviceName}`;
  const staffOptions = React.useMemo(
    () =>
      staff.map(user => ({
        label: user.displayName || user.username || user.email || user.id,
        value: user.id,
      })),
    [staff],
  );

  React.useEffect(() => {
    if (!open) {
      return;
    }
    let cancelled = false;
    setStaffLoading(true);
    setError('');
    void getKolamUserList({
      isEmployee: 'true',
      limit: 200,
      page: 1,
    })
      .then(result => {
        if (cancelled) {
          return;
        }
        setStaff(result.items);
        const currentId = authUser?.id?.trim() || '';
        setAssignedToId(prev => {
          if (currentId && result.items.some(user => user.id === currentId)) {
            return currentId;
          }
          if (prev && result.items.some(user => user.id === prev)) {
            return prev;
          }
          return result.items[0]?.id || '';
        });
      })
      .catch(err => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Gagal memuat daftar PIC.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setStaffLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [authUser?.id, open]);

  const closeModal = () => {
    if (saving) {
      return;
    }
    setOpen(false);
    setError('');
    setTitle('');
  };

  const onCreate = async () => {
    if (!assignedToId.trim()) {
      setError('PIC wajib dipilih.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const result = await spawnKolamLayananServiceTask({
        serviceId,
        assignedToId: assignedToId.trim(),
        title: title.trim() || defaultTitle,
      });
      setOpen(false);
      setTitle('');
      if (result.taskId) {
        onRouteChange?.(`${KOLAM_TASK_MANAGER_ROOT}/${result.taskId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat tugas.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <FormSection
        description={`Kategori ${KOLAM_TASK_CATEGORY_BUCKET_LABEL.project} — otomatis saat kunjungan berjalan, atau buat manual.`}
        title="Tugas layanan"
      >
        <KolamButton
          intent="outline"
          label="Buat tugas"
          onPress={() => setOpen(true)}
        />
      </FormSection>

      <Modal
        animationType="fade"
        onRequestClose={closeModal}
        transparent
        visible={open}
      >
        <View style={styles.spawnOverlay}>
          <KolamModalBackdrop onPress={closeModal} />
          <View
            accessibilityLabel="Tugas untuk layanan"
            style={styles.spawnDialog}
          >
            <KolamCopyStack
              items={[
                {
                  id: 'title',
                  text: 'Tugas untuk layanan',
                  style: styles.spawnDialogTitle,
                },
              ]}
            />
            <FieldShell label="Judul">
              <KolamFormTextField
                onChangeText={setTitle}
                placeholder={defaultTitle}
                value={title}
              />
            </FieldShell>
            <FieldShell label="PIC" required>
              <KolamDropdownSelect
                accessibilityLabel="PIC"
                label={staffLoading ? 'Memuat PIC…' : 'Pilih PIC'}
                onChange={setAssignedToId}
                options={staffOptions}
                searchable
                value={assignedToId}
              />
            </FieldShell>
            {error ? <Text style={styles.spawnError}>{error}</Text> : null}
            <View style={styles.spawnActions}>
              <KolamCancelButton
                disabled={saving}
                onPress={closeModal}
              />
              <KolamSaveButton
                disabled={saving || staffLoading}
                label={saving ? 'Menyimpan…' : 'Simpan'}
                onPress={() => {
                  void onCreate();
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function ServiceProductComponentsBlock({
  rows,
  title,
}: {
  rows: KolamLayananServiceProductComponent[];
  title: string;
}) {
  return (
    <View style={styles.materialBlock}>
      <Text style={styles.materialBlockTitle}>{title}</Text>
      <View style={styles.detailTable}>
        <View style={styles.detailTableHeader}>
          <Text style={[styles.detailTableHead, styles.colName]}>Nama</Text>
          <Text style={[styles.detailTableHead, styles.colCode]}>Kode</Text>
          <Text style={[styles.detailTableHead, styles.colQty]}>Qty</Text>
          <Text style={[styles.detailTableHead, styles.colStock]}>Stok</Text>
          <Text style={[styles.detailTableHead, styles.colBrand]}>Merek</Text>
          <Text style={[styles.detailTableHead, styles.colPrice]}>Harga</Text>
        </View>
        {rows.map(row => (
          <View key={row.key} style={styles.detailTableRow}>
            <Text numberOfLines={2} style={[styles.detailTableCell, styles.colName]}>
              {row.productName}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.detailTableCell, styles.colCode, styles.monoCell]}
            >
              {row.productCode}
            </Text>
            <Text numberOfLines={1} style={[styles.detailTableCell, styles.colQty]}>
              {row.quantityPerExecution}
              {row.unitLabel && row.unitLabel !== '—'
                ? ` ${row.unitLabel}`
                : ''}
            </Text>
            <Text
              numberOfLines={1}
              style={[
                styles.detailTableCell,
                styles.colStock,
                row.stock === 0 ? styles.metricDanger : styles.detailTableCell,
              ]}
            >
              {row.stock == null ? '—' : String(row.stock)}
            </Text>
            <Text numberOfLines={1} style={[styles.detailTableCell, styles.colBrand]}>
              {row.brandName}
            </Text>
            <Text numberOfLines={1} style={[styles.detailTableCell, styles.colPrice]}>
              {row.price != null ? formatRupiah(row.price) : '—'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function formatDetailDate(value?: string | null) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function KolamLayananServiceForm({
  controller,
}: {
  controller: KolamLayananController;
}) {
  const form = controller.form;
  const brandDropdownOptions = React.useMemo(() => {
    const selectedNames = form.brandIds
      .map(
        id =>
          controller.brandOptions.find(brand => brand.id === id)?.name || '',
      )
      .filter(Boolean);
    return [
      {
        label: selectedNames.length
          ? selectedNames.join(', ')
          : 'Pilih merek…',
        value: '',
      },
      ...controller.brandOptions.map(brand => ({
        label: form.brandIds.includes(brand.id)
          ? `✓ ${brand.name}`
          : brand.name,
        value: brand.id,
      })),
    ];
  }, [controller.brandOptions, form.brandIds]);

  return (
    <KolamDetailScrollSurface contentContainerStyle={styles.content}>
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
          {controller.brandOptions.length ? (
            <KolamDropdownSelect
              accessibilityLabel="Merek"
              label="Merek"
              onChange={value => {
                if (value) {
                  controller.onToggleBrand(value);
                }
              }}
              options={brandDropdownOptions}
              searchable
              searchPlaceholder="Cari merek…"
              value=""
            />
          ) : (
            <Text style={styles.metaText}>Daftar merek kosong.</Text>
          )}
          {form.brandIds.length ? (
            <Text style={styles.metaText}>
              {form.brandIds.length} merek dipilih — pilih lagi untuk
              menambah/menghapus.
            </Text>
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
        <FieldShell label="Harga dasar">
          <KolamRupiahField
            onChangeValue={value => controller.onChangeForm({ price: String(value) })}
            value={Number(form.price) || 0}
          />
        </FieldShell>
        <FieldShell label="Jual /m³">
          <KolamRupiahField
            onChangeValue={value => controller.onChangeForm({ priceM3: String(value) })}
            value={Number(form.priceM3) || 0}
          />
        </FieldShell>
        <FieldShell label="Jual /km">
          <KolamRupiahField
            onChangeValue={value => controller.onChangeForm({ priceKm: String(value) })}
            value={Number(form.priceKm) || 0}
          />
        </FieldShell>
        <FieldShell label="HPP /m³">
          <KolamRupiahField
            onChangeValue={value => controller.onChangeForm({ costM3: String(value) })}
            value={Number(form.costM3) || 0}
          />
        </FieldShell>
        <FieldShell label="HPP /km">
          <KolamRupiahField
            onChangeValue={value => controller.onChangeForm({ costKm: String(value) })}
            value={Number(form.costKm) || 0}
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
                  ? 'Nilai komisi'
                  : 'Nilai komisi (%)'
              }
            >
              {form.commissionType === 'fixed' ? (
                <KolamRupiahField
                  onChangeValue={value =>
                    controller.onChangeForm({ commissionValue: String(value) })
                  }
                  value={Number(form.commissionValue) || 0}
                />
              ) : (
                <KolamFormTextField
                  mode="numeric"
                  onChangeText={value =>
                    controller.onChangeForm({ commissionValue: value })
                  }
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.commissionValue}
                />
              )}
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
    </KolamDetailScrollSurface>
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
    alignItems: 'stretch',
    gap: 16,
    paddingBottom: 32,
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
    minWidth: 0,
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
  emptyPanel: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    color: V.colors.mutedFg,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 20,
    textAlign: 'center',
  },
  detailTable: {
    alignSelf: 'stretch',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 0,
    overflow: 'hidden',
    width: '100%',
  },
  detailTableHeader: {
    alignItems: 'center',
    backgroundColor: V.colors.tableHeader,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  detailTableRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  detailTableHead: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailTableCell: {
    color: V.colors.fg,
    fontSize: 12,
    minWidth: 0,
  },
  monoCell: {
    fontFamily: V.fontFamily,
    fontVariant: ['tabular-nums'],
  },
  badgeCell: {
    justifyContent: 'center',
  },
  actionCell: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  colSerial: { flex: 1.35, minWidth: 0 },
  colStatus: { flexGrow: 0, flexShrink: 0, width: 96 },
  colInvoice: { flex: 1.15, minWidth: 0 },
  colCustomer: { flex: 1, minWidth: 0 },
  colType: { flexGrow: 0, flexShrink: 0, width: 104 },
  colDate: { flexGrow: 0, flexShrink: 0, width: 88 },
  colAction: { flexGrow: 0, flexShrink: 0, width: 72 },
  colName: { flex: 1.4, minWidth: 0 },
  colCode: { flex: 0.85, minWidth: 0 },
  colQty: { flex: 0.55, minWidth: 0 },
  colStock: { flexGrow: 0, flexShrink: 0, width: 48 },
  colBrand: { flex: 0.8, minWidth: 0 },
  colPrice: { flex: 0.75, minWidth: 0 },
  materialBlock: {
    gap: 6,
    marginTop: 4,
  },
  materialBlockTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  spawnOverlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  spawnDialog: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    maxWidth: '86%',
    padding: 18,
    shadowColor: V.colors.fg,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    width: 420,
  },
  spawnDialogTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 17,
    fontWeight: '900',
  },
  spawnError: {
    color: V.colors.danger,
    fontSize: 12,
  },
  spawnActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
});
