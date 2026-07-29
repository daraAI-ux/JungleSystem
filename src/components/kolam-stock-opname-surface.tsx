import React from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  KOLAM_STOCK_OPNAME_LINE_TARGET_LABELS,
  KOLAM_STOCK_OPNAME_ROOT,
  KOLAM_STOCK_OPNAME_STATUS_OPTIONS,
  hasKolamStockOpnamePermission,
  stockOpnameUserDisplayName,
  type KolamStockOpname,
  type KolamStockOpnameLineTargetType,
  type KolamStockOpnameStatus,
} from '../domain/kolam-stock-opname';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  useKolamStockOpnameController,
  type KolamStockOpnameController,
} from '../hooks/use-kolam-stock-opname-controller';
import { pickNativeAssetFile } from '../services/native-file-picker';
import { KolamButton } from './kolam-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamChevronIcon } from './kolam-chevron-icon';
import { KolamConfirmDialog } from './kolam-confirm-dialog';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDateField } from './kolam-date-field';
import {
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamModalBackdrop } from './kolam-modal-backdrop';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamStockOpnameDetail } from './kolam-stock-opname-detail';

const LIST_COLUMNS = [
  { id: 'document', label: 'Dokumen', flex: 1.2 },
  { id: 'status', label: 'Status', flex: 1 },
  { id: 'created', label: 'Dibuat', flex: 1.1 },
  { id: 'owner', label: 'PIC', flex: 1 },
  { id: 'actions', label: '', flex: 0.45 },
] as const;

const IMPORT_TARGET_OPTIONS: Array<{
  label: string;
  value: KolamStockOpnameLineTargetType;
}> = [
  { label: KOLAM_STOCK_OPNAME_LINE_TARGET_LABELS.product, value: 'product' },
  { label: KOLAM_STOCK_OPNAME_LINE_TARGET_LABELS.raw, value: 'raw' },
  { label: KOLAM_STOCK_OPNAME_LINE_TARGET_LABELS.species, value: 'species' },
  { label: KOLAM_STOCK_OPNAME_LINE_TARGET_LABELS.packing, value: 'packing' },
];

/**
 * Stock Opname dokumen — list + create + detail (paritas FE `/stock-opname`).
 */
export function KolamStockOpnameSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamStockOpnameController(route);

  return (
    <View
      style={[
        styles.surface,
        controller.mode === 'list' ? styles.listSurface : null,
      ]}
    >
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
          style={styles.errorBadge}
        />
      ) : null}
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}

      {controller.mode === 'list' ? (
        <KolamStockOpnameList
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : null}

      {controller.mode === 'new' ? (
        <KolamStockOpnameCreateForm
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : null}

      {controller.mode === 'detail' ? (
        <KolamStockOpnameDetail
          documentId={controller.documentId}
          onRouteChange={onRouteChange}
        />
      ) : null}
    </View>
  );
}

function KolamStockOpnameCreateForm({
  controller,
  onRouteChange,
}: {
  controller: KolamStockOpnameController;
  onRouteChange?: (route: string) => void;
}) {
  const { authUser } = useKolamAuthContext();
  const canCreate = hasKolamStockOpnamePermission(
    authUser?.permissions,
    'create',
    authUser?.roleKey,
  );
  const [note, setNote] = React.useState('');

  if (!canCreate) {
    return (
      <View style={styles.createRoot}>
        <KolamCardFrame style={styles.createCard} variant="compact">
          <Text style={styles.createTitle}>Tidak diizinkan</Text>
          <Text style={styles.createHint}>
            Anda tidak punya izin membuat draf stock opname.
          </Text>
          <KolamButton
            label="Kembali ke daftar"
            onPress={() => onRouteChange?.(KOLAM_STOCK_OPNAME_ROOT)}
          />
        </KolamCardFrame>
      </View>
    );
  }

  return (
    <View style={styles.createRoot}>
      <KolamCardFrame style={styles.createCard} variant="compact">
        <Text style={styles.createTitle}>Stock opname baru</Text>
        <Text style={styles.createHint}>
          Halaman ini hanya membuat nomor dokumen (draf). Barang / SKU diisi di
          langkah berikutnya.
        </Text>
        <View style={styles.createSteps}>
          <Text style={styles.createStep}>
            1. Isi catatan (opsional) lalu klik Buat draf.
          </Text>
          <Text style={styles.createStep}>
            2. Isi PIC dan pelaksana, lalu tambah baris barang.
          </Text>
          <Text style={styles.createStep}>
            3. Kirim untuk review, lalu posting ke stok saat siap.
          </Text>
        </View>
        <Text style={styles.fieldLabel}>Catatan (opsional)</Text>
        <KolamFormTextField
          multiline
          numberOfLines={4}
          onChangeText={setNote}
          placeholder="Contoh: Opname rak A1 / minggu ke-14"
          style={styles.createNote}
          value={note}
        />
        <View style={styles.createActions}>
          <KolamButton
            label="Batal"
            muted
            onPress={() => onRouteChange?.(KOLAM_STOCK_OPNAME_ROOT)}
          />
          <KolamButton
            disabled={controller.creating}
            intent="primary"
            label={
              controller.creating
                ? 'Membuat…'
                : 'Buat draf & lanjut isi barang'
            }
            onPress={() => {
              void controller.onCreate(note).then(doc => {
                if (doc) {
                  onRouteChange?.(
                    `${KOLAM_STOCK_OPNAME_ROOT}/${encodeURIComponent(doc.id)}`,
                  );
                }
              });
            }}
          />
        </View>
      </KolamCardFrame>
    </View>
  );
}

function KolamStockOpnameList({
  controller,
  onRouteChange,
}: {
  controller: KolamStockOpnameController;
  onRouteChange?: (route: string) => void;
}) {
  const [searchInput, setSearchInput] = React.useState(controller.filters.search);
  const [statusPanelOpen, setStatusPanelOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<KolamStockOpname | null>(
    null,
  );
  const { authUser } = useKolamAuthContext();
  const canCreate = hasKolamStockOpnamePermission(
    authUser?.permissions,
    'create',
    authUser?.roleKey,
  );
  const canDelete = hasKolamStockOpnamePermission(
    authUser?.permissions,
    'delete',
    authUser?.roleKey,
  );
  const pageCount = Math.max(1, controller.pagination.totalPages);
  const safePage = Math.min(Math.max(controller.pagination.page, 1), pageCount);
  const filtersAppliedCount = [
    controller.filters.search,
    controller.filters.status,
    controller.filters.startDate,
    controller.filters.endDate,
  ].filter(Boolean).length;

  React.useEffect(() => {
    setSearchInput(controller.filters.search);
  }, [controller.filters.search]);

  React.useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput !== controller.filters.search) {
        controller.onChangeFilters({ search: searchInput });
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [
    controller.filters.search,
    controller.onChangeFilters,
    searchInput,
  ]);

  const statusFilterLabel = !controller.filters.status
    ? 'Status'
    : KOLAM_STOCK_OPNAME_STATUS_OPTIONS.find(
        option => option.id === controller.filters.status,
      )?.name ?? 'Status';

  const statusOptions = React.useMemo(
    () =>
      KOLAM_STOCK_OPNAME_STATUS_OPTIONS.map(option => ({
        label: option.name,
        value: option.id,
      })),
    [],
  );

  const renderRow = React.useCallback(
    ({ item }: { item: KolamStockOpname }) => (
      <StockOpnameListRow
        canDelete={canDelete}
        item={item}
        onDelete={() => setDeleteTarget(item)}
        onOpen={() =>
          onRouteChange?.(`${KOLAM_STOCK_OPNAME_ROOT}/${item.id}`)
        }
      />
    ),
    [canDelete, onRouteChange],
  );

  return (
    <View style={styles.listRoot}>
      <View style={styles.toolbarWrap}>
        <View style={styles.toolbarShell}>
          <View style={styles.filterRow}>
            <KolamFormTextField
              onChangeText={setSearchInput}
              placeholder="Cari"
              style={styles.searchInput}
              value={searchInput}
            />
            <KolamButton
              icon={
                <KolamChevronIcon
                  color={
                    statusPanelOpen || controller.filters.status
                      ? V.colors.primaryFg
                      : V.colors.success
                  }
                  direction="down"
                  size="menu-sm"
                />
              }
              intent={
                statusPanelOpen || controller.filters.status
                  ? 'primary'
                  : 'secondary'
              }
              label={statusFilterLabel}
              onPress={() => setStatusPanelOpen(current => !current)}
              style={[
                styles.filterTrigger,
                (statusPanelOpen || controller.filters.status) &&
                  styles.filterTriggerActive,
              ]}
              textStyle={[
                styles.filterTriggerText,
                (statusPanelOpen || controller.filters.status) &&
                  styles.filterTriggerTextActive,
              ]}
            />
            <KolamDateField
              accessibilityLabel="Tanggal mulai"
              label="Dari"
              onChange={value => {
                setStatusPanelOpen(false);
                controller.onChangeFilters({ startDate: value });
              }}
              placeholder="Dari"
              showLabelInTrigger={false}
              style={styles.dateField}
              value={controller.filters.startDate}
            />
            <KolamDateField
              accessibilityLabel="Tanggal sampai"
              label="Sampai"
              onChange={value => {
                setStatusPanelOpen(false);
                controller.onChangeFilters({ endDate: value });
              }}
              placeholder="Sampai"
              showLabelInTrigger={false}
              style={styles.dateField}
              value={controller.filters.endDate}
            />
          </View>
          <View style={styles.actionRow}>
            {filtersAppliedCount > 0 ? (
              <KolamButton
                label="Reset"
                muted
                onPress={() => {
                  setSearchInput('');
                  setStatusPanelOpen(false);
                  controller.onClearFilters();
                }}
                style={styles.toolbarButton}
              />
            ) : null}
            <KolamButton
              disabled={controller.loading}
              label="Muat ulang"
              onPress={() => {
                void controller.onRefresh();
              }}
              style={styles.toolbarButton}
            />
            <KolamButton
              disabled={controller.exporting || controller.loading}
              label={controller.exporting ? 'Mengekspor…' : 'Ekspor'}
              onPress={() => {
                void controller.onExport();
              }}
              style={styles.toolbarButton}
            />
            {canCreate ? (
              <KolamButton
                disabled={controller.importing}
                label="Impor"
                onPress={() => {
                  setStatusPanelOpen(false);
                  setImportOpen(true);
                }}
                style={styles.toolbarButton}
              />
            ) : null}
            {canCreate ? (
              <KolamButton
                intent="primary"
                label="Baru"
                onPress={() =>
                  onRouteChange?.(`${KOLAM_STOCK_OPNAME_ROOT}/new`)
                }
                style={styles.toolbarButton}
              />
            ) : null}
          </View>
        </View>

        {statusPanelOpen ? (
          <View style={styles.filterOverlayPanel}>
            <ScrollView
              contentContainerStyle={styles.filterPanelContent}
              keyboardShouldPersistTaps="handled"
              style={styles.filterPanelScroll}
            >
              {statusOptions.map(option => {
                const selected =
                  (controller.filters.status || 'all') === option.value;
                return (
                  <KolamButton
                    intent={selected ? 'primary' : 'plain'}
                    key={option.value}
                    label={option.label}
                    onPress={() => {
                      controller.onChangeFilters({
                        status:
                          option.value === 'all'
                            ? ''
                            : (option.value as KolamStockOpnameStatus),
                      });
                      setStatusPanelOpen(false);
                    }}
                    style={styles.filterPanelOption}
                  />
                );
              })}
            </ScrollView>
            <View style={styles.filterPanelFooter}>
              <KolamButton
                label="Tutup"
                onPress={() => setStatusPanelOpen(false)}
              />
            </View>
          </View>
        ) : null}
      </View>

      <KolamCatalogListTableShell
        footer={
          <KolamTableFooterControls
            onPageSizeChange={controller.onLimitChange}
            page={controller.pagination.page}
            pageSize={controller.pagination.limit}
            total={controller.pagination.total}
          >
            {pageCount > 1 ? (
              <View style={styles.paginationBar}>
                <KolamButton
                  disabled={safePage <= 1 || controller.loading}
                  label="Sebelumnya"
                  onPress={() =>
                    controller.onPageChange(Math.max(1, safePage - 1))
                  }
                />
                <KolamCopyStack
                  items={[
                    {
                      id: 'page',
                      text: `${safePage} / ${pageCount}`,
                      style: styles.pageLabel,
                    },
                  ]}
                />
                <KolamButton
                  disabled={safePage >= pageCount || controller.loading}
                  label="Berikutnya"
                  onPress={() =>
                    controller.onPageChange(Math.min(pageCount, safePage + 1))
                  }
                />
              </View>
            ) : null}
          </KolamTableFooterControls>
        }
        style={styles.tableFrame}
      >
        <FlatList
          data={controller.items}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <KolamEmptyState
                compact
                message="Buat draf baru atau impor Excel, atau sesuaikan filter."
                title={
                  controller.loading
                    ? 'Memuat dokumen stock opname…'
                    : 'Belum ada dokumen'
                }
              />
            </View>
          }
          ListHeaderComponent={
            <View style={styles.headerRow}>
              {LIST_COLUMNS.map(column => (
                <View
                  key={column.id}
                  style={[styles.cell, { flex: column.flex }]}
                >
                  {column.label ? (
                    <Text style={styles.headerCellText}>{column.label}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          }
          removeClippedSubviews={false}
          renderItem={renderRow}
          style={styles.listFlatList}
          contentContainerStyle={styles.listContent}
        />
      </KolamCatalogListTableShell>

      <KolamConfirmDialog
        confirmLabel={controller.deleting ? 'Menghapus…' : 'Hapus'}
        destructive
        message={`Hapus dokumen ${
          deleteTarget?.documentNumber || ''
        } beserta seluruh barisnya? Tindakan ini tidak bisa dibatalkan.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) {
            return;
          }
          void controller.onDelete(deleteTarget.id).then(ok => {
            if (ok) {
              setDeleteTarget(null);
            }
          });
        }}
        title="Hapus stock opname"
        visible={Boolean(deleteTarget)}
      />

      <StockOpnameImportDialog
        importing={controller.importing}
        onImport={async input => {
          const header = await controller.onImport(input);
          if (header) {
            setImportOpen(false);
            onRouteChange?.(`${KOLAM_STOCK_OPNAME_ROOT}/${header.id}`);
          }
        }}
        onOpenChange={setImportOpen}
        visible={importOpen}
      />
    </View>
  );
}

function StockOpnameListRow({
  canDelete,
  item,
  onDelete,
  onOpen,
}: {
  canDelete: boolean;
  item: KolamStockOpname;
  onDelete: () => void;
  onOpen: () => void;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);

  return (
    <View style={[styles.row, actionMenuOpen ? styles.activeActionRow : null]}>
      <Pressable
        accessibilityRole="button"
        onPress={onOpen}
        style={({ pressed }) => [
          styles.rowMain,
          pressed ? styles.rowPressed : null,
        ]}
      >
        <View style={[styles.cell, { flex: 1.2 }]}>
          <Text numberOfLines={2} style={styles.primaryText}>
            {item.documentNumber || item.id}
          </Text>
        </View>
        <View style={[styles.cell, { flex: 1 }]}>
          <KolamStatusBadge
            intent={statusIntent(item.status)}
            label={item.statusLabel}
          />
        </View>
        <View style={[styles.cell, { flex: 1.1 }]}>
          <Text style={styles.secondaryText}>
            {formatDateTime(item.createdAt)}
          </Text>
        </View>
        <View style={[styles.cell, { flex: 1 }]}>
          <Text numberOfLines={2} style={styles.secondaryText}>
            {stockOpnameUserDisplayName(item.owner) || '—'}
          </Text>
        </View>
      </Pressable>
      <View style={styles.overflowCell}>
        <KolamOverflowMenuButton
          accessibilityLabel={`Aksi ${item.documentNumber}`}
          actions={[
            {
              label: 'Lihat',
              onPress: onOpen,
            },
            ...(item.status === 'cancelled' && canDelete
              ? [
                  {
                    label: 'Hapus',
                    tone: 'danger' as const,
                    onPress: onDelete,
                  },
                ]
              : []),
          ]}
          onOpenChange={setActionMenuOpen}
        />
      </View>
    </View>
  );
}

function StockOpnameImportDialog({
  importing,
  onImport,
  onOpenChange,
  visible,
}: {
  importing: boolean;
  onImport: (input: {
    fileUri: string;
    fileName?: string;
    targetType: KolamStockOpnameLineTargetType;
  }) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  visible: boolean;
}) {
  const [targetType, setTargetType] =
    React.useState<KolamStockOpnameLineTargetType>('product');
  const [fileUri, setFileUri] = React.useState('');
  const [fileName, setFileName] = React.useState('');
  const [pickError, setPickError] = React.useState('');

  React.useEffect(() => {
    if (!visible) {
      setTargetType('product');
      setFileUri('');
      setFileName('');
      setPickError('');
    }
  }, [visible]);

  return (
    <Modal
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}
      transparent
      visible={visible}
    >
      <View style={styles.importOverlay}>
        <KolamModalBackdrop onPress={() => onOpenChange(false)} />
        <View
          accessibilityLabel="Impor stock opname"
          style={styles.importDialog}
        >
          <Text style={styles.sectionTitle}>Impor stock opname</Text>
          <Text style={styles.muted}>
            Unggah Excel untuk membuat draf baru. Kolom wajib: Name/Nama,
            Stock/Jumlah.
          </Text>

          <Text style={styles.fieldLabel}>Tipe barang</Text>
          <View style={styles.importTargetRow}>
            {IMPORT_TARGET_OPTIONS.map(option => (
              <KolamButton
                intent={targetType === option.value ? 'primary' : 'secondary'}
                key={option.value}
                label={option.label}
                onPress={() => setTargetType(option.value)}
                style={styles.importTargetButton}
              />
            ))}
          </View>

          <Text style={styles.fieldLabel}>File Excel</Text>
          {fileUri ? (
            <View style={styles.fileRow}>
              <Text numberOfLines={1} style={styles.fileName}>
                {fileName || fileUri}
              </Text>
              <KolamButton
                label="Ganti"
                onPress={() => {
                  setFileUri('');
                  setFileName('');
                }}
              />
            </View>
          ) : (
            <KolamButton
              label="Pilih file .xlsx"
              onPress={() => {
                setPickError('');
                void pickNativeAssetFile()
                  .then(result => {
                    if (result.cancelled) {
                      return;
                    }
                    const uri = result.uri || result.path || '';
                    if (!uri) {
                      setPickError('File tidak valid');
                      return;
                    }
                    setFileUri(uri);
                    setFileName(result.name || 'stock-opname-import.xlsx');
                  })
                  .catch(err => {
                    setPickError(
                      err instanceof Error
                        ? err.message
                        : 'Gagal memilih file',
                    );
                  });
              }}
            />
          )}
          {pickError ? (
            <Text style={styles.dangerText}>{pickError}</Text>
          ) : null}

          <View style={styles.importActions}>
            <KolamButton
              label="Batal"
              onPress={() => onOpenChange(false)}
            />
            <KolamButton
              disabled={!fileUri || importing}
              intent="primary"
              label={importing ? 'Mengimpor…' : 'Impor'}
              onPress={() => {
                void onImport({
                  fileUri,
                  fileName,
                  targetType,
                });
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function statusIntent(
  status: string,
): 'success' | 'warning' | 'danger' | 'info' | 'secondary' {
  switch (status) {
    case 'posted':
    case 'partially_posted':
      return 'success';
    case 'ready_to_post':
      return 'info';
    case 'in_review':
      return 'warning';
    case 'rejected':
    case 'cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
}

function formatDateTime(value: string) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

const styles = StyleSheet.create({
  surface: {
    gap: 12,
  },
  listSurface: {
    flex: 1,
    minHeight: 0,
    overflow: 'visible',
  },
  listRoot: {
    flex: 1,
    minHeight: 0,
    gap: 12,
    overflow: 'visible',
  },
  errorBadge: {
    alignSelf: 'flex-start',
  },
  toolbarWrap: {
    position: 'relative',
    zIndex: 100000,
    elevation: 1000,
    overflow: 'visible',
  },
  toolbarShell: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'space-between',
    overflow: 'visible',
    padding: 4,
  },
  filterRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    minWidth: 280,
    overflow: 'visible',
  },
  actionRow: {
    alignItems: 'center',
    borderLeftColor: V.colors.border,
    borderLeftWidth: 1,
    flexDirection: 'row',
    flexShrink: 0,
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
    paddingLeft: 8,
  },
  searchInput: {
    flexBasis: 140,
    flexGrow: 1,
    maxWidth: 220,
    minWidth: 120,
  },
  filterTrigger: {
    backgroundColor: V.colors.successSoft,
    borderColor: V.colors.success,
    flexBasis: 0,
    flexGrow: 1,
    minHeight: 34,
    minWidth: 120,
    paddingHorizontal: 8,
  },
  filterTriggerActive: {
    backgroundColor: V.colors.success,
    borderColor: V.colors.success,
  },
  filterTriggerText: {
    color: V.colors.success,
    fontWeight: '800',
  },
  filterTriggerTextActive: {
    color: V.colors.primaryFg,
  },
  dateField: {
    flexBasis: 0,
    flexGrow: 1,
    minWidth: 110,
    maxWidth: 160,
  },
  toolbarButton: {
    flexShrink: 0,
    minHeight: 34,
    paddingHorizontal: 10,
  },
  filterOverlayPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 1200,
    left: 148,
    padding: 6,
    position: 'absolute',
    shadowColor: V.colors.fg,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    top: 48,
    width: 240,
    zIndex: 120000,
  },
  filterPanelScroll: {
    maxHeight: 280,
  },
  filterPanelContent: {
    gap: 4,
  },
  filterPanelOption: {
    justifyContent: 'flex-start',
  },
  filterPanelFooter: {
    alignItems: 'flex-end',
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    marginTop: 6,
    paddingTop: 6,
  },
  tableFrame: {
    minHeight: 0,
  },
  listFlatList: {
    flexGrow: 0,
  },
  listContent: {
    flexGrow: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: V.colors.border,
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 4,
  },
  headerCellText: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: V.colors.border,
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 4,
    overflow: 'visible',
    zIndex: 1,
  },
  activeActionRow: {
    zIndex: 1000,
    elevation: 30,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  rowPressed: {
    backgroundColor: V.colors.muted,
  },
  cell: {
    minWidth: 0,
  },
  overflowCell: {
    width: 48,
    alignItems: 'flex-end',
    zIndex: 1100,
    elevation: 30,
  },
  primaryText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryText: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  emptyWrap: {
    paddingVertical: 24,
  },
  paginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  createRoot: {
    gap: 12,
    maxWidth: 560,
  },
  createCard: {
    gap: 12,
  },
  createTitle: {
    color: V.colors.fg,
    fontSize: 16,
    fontWeight: '700',
  },
  createHint: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 17,
  },
  createSteps: {
    gap: 4,
  },
  createStep: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 17,
  },
  fieldLabel: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '600',
  },
  createNote: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  createActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '700',
  },
  muted: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 17,
  },
  importOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importDialog: {
    width: 420,
    maxWidth: '92%',
    gap: 10,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: V.colors.border,
    backgroundColor: V.colors.bg,
  },
  importTargetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  importTargetButton: {
    minHeight: 32,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileName: {
    flex: 1,
    color: V.colors.fg,
    fontSize: 12,
  },
  dangerText: {
    color: V.colors.danger,
    fontSize: 12,
  },
  importActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
});
