import React from 'react';
import {
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
import {
  getKolamTableColumns,
  getKolamTableVisualContract,
  type KolamTableColumn,
} from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { getKolamFileUrl } from '../lib/file-url';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  useKolamStockOpnameController,
  type KolamStockOpnameController,
} from '../hooks/use-kolam-stock-opname-controller';
import { pickNativeAssetFile } from '../services/native-file-picker';
import { KolamButton } from './kolam-button';
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamResetButton } from './kolam-reset-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamConfirmDialog } from './kolam-confirm-dialog';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamCopyStack } from './kolam-copy-stack';
import {
  getKolamDataTableColumnStyle,
  KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  KOLAM_DATA_TABLE_COLUMN_GAP,
} from './kolam-data-table-column-style';
import { KolamDataTableHeader } from './kolam-data-table-header';
import { KolamDataTableRowFrame } from './kolam-data-table-row-frame';
import {
  KolamDataTableActionsTrack,
  KolamDataTableMainTrack,
} from './kolam-data-table-tracks';
import { KolamDateField } from './kolam-date-field';
import {
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamHoverTooltip } from './kolam-hover-tooltip';
import { KolamModalBackdrop } from './kolam-modal-backdrop';
import { KolamProfileAvatarContent } from './kolam-profile-avatar-content';
import { KolamSearchField } from './kolam-search-field';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamStockOpnameDetail } from './kolam-stock-opname-detail';
import { KolamTableFilterTrigger } from './kolam-table-filter-trigger';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

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
  const [tableBodyWidth, setTableBodyWidth] = React.useState(0);
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
  const listColumns = React.useMemo(
    () => fitStockOpnameListColumns(tableBodyWidth),
    [tableBodyWidth],
  );

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

  return (
    <View style={styles.listRoot}>
      <View style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <KolamSearchField
                containerStyle={kolamTableToolbarStyles.searchInput}
                onChangeText={setSearchInput}
                placeholder="Cari"
                value={searchInput}
              />
              <KolamTableFilterTrigger
                active={statusPanelOpen || Boolean(controller.filters.status)}
                label={statusFilterLabel}
                onPress={() => setStatusPanelOpen(current => !current)}
                open={statusPanelOpen}
                variant="quiet"
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
            <View style={kolamTableToolbarStyles.actions}>
              {filtersAppliedCount > 0 ? (
                <KolamResetButton
                  muted
                  onPress={() => {
                    setSearchInput('');
                    setStatusPanelOpen(false);
                    controller.onClearFilters();
                  }}
                  style={styles.toolbarButton}
                />
              ) : null}
              <KolamRefreshButton
                accessibilityLabel="Muat ulang"
                disabled={controller.loading}

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
                  tone="positive"
                  onPress={() =>
                    onRouteChange?.(`${KOLAM_STOCK_OPNAME_ROOT}/new`)
                  }
                  style={styles.toolbarButton}
                />
              ) : null}
            </View>
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
        onBodyWidthChange={setTableBodyWidth}
        style={styles.tableFrame}
      >
        <KolamDataTableHeader columns={listColumns} />
        {controller.items.length ? (
          controller.items.map(item => (
            <StockOpnameListRow
              canDelete={canDelete}
              columns={listColumns}
              item={item}
              key={item.id}
              onDelete={() => setDeleteTarget(item)}
              onOpen={() =>
                onRouteChange?.(`${KOLAM_STOCK_OPNAME_ROOT}/${item.id}`)
              }
            />
          ))
        ) : (
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
        )}
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
  columns,
  item,
  onDelete,
  onOpen,
}: {
  canDelete: boolean;
  columns: ReturnType<typeof getKolamTableColumns>;
  item: KolamStockOpname;
  onDelete: () => void;
  onOpen: () => void;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const columnOf = React.useCallback(
    (id: (typeof columns)[number]['id']) =>
      columns.find(column => column.id === id),
    [columns],
  );
  const primaryColumn = columnOf('primary');
  const statusColumn = columnOf('status');
  const createdColumn = columnOf('marketplace');
  const picColumn = columnOf('meta');
  const actionsColumn = columnOf('actions');

  return (
    <KolamDataTableRowFrame
      style={actionMenuOpen ? styles.activeActionRow : undefined}
    >
      <KolamDataTableMainTrack style={styles.mainTrackVisible}>
        <Pressable
          accessibilityRole="button"
          onPress={onOpen}
          style={[
            styles.listCell,
            styles.identityCell,
            primaryColumn ? getKolamDataTableColumnStyle(primaryColumn) : null,
          ]}
        >
          <Text numberOfLines={2} style={styles.primaryText}>
            {item.documentNumber || item.id}
          </Text>
        </Pressable>

        <View
          style={[
            styles.listCell,
            styles.statusCell,
            statusColumn ? getKolamDataTableColumnStyle(statusColumn) : null,
          ]}
        >
          <KolamStatusBadge
            intent={statusIntent(item.status)}
            label={item.statusLabel}
            style={styles.centerBadge}
          />
        </View>

        <View
          style={[
            styles.listCell,
            createdColumn ? getKolamDataTableColumnStyle(createdColumn) : null,
          ]}
        >
          <Text numberOfLines={2} style={styles.secondaryText}>
            {formatDateTime(item.createdAt)}
          </Text>
        </View>

        <View
          style={[
            styles.listCell,
            styles.picCell,
            picColumn ? getKolamDataTableColumnStyle(picColumn) : null,
            styles.overflowVisible,
          ]}
        >
          <StockOpnamePicAvatar item={item} />
        </View>
      </KolamDataTableMainTrack>

      <KolamDataTableActionsTrack
        style={styles.actionsTrack}
        width={Math.max(
          actionsColumn?.width ?? KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
          KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
        )}
      >
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
      </KolamDataTableActionsTrack>
    </KolamDataTableRowFrame>
  );
}

function StockOpnamePicAvatar({ item }: { item: KolamStockOpname }) {
  const name =
    stockOpnameUserDisplayName(item.owner) ||
    item.owner?.email ||
    'Tanpa PIC';
  const photoUri = getKolamFileUrl(item.owner?.photo);
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || '?';

  return (
    <KolamHoverTooltip
      align="center"
      containerStyle={styles.picTooltip}
      label={name}
    >
      <View accessibilityLabel={`PIC ${name}`} style={styles.picAvatar}>
        <KolamProfileAvatarContent
          imageStyle={styles.picAvatarImage}
          imageUrl={photoUri}
          initials={initials}
          textStyle={styles.picAvatarText}
        />
      </View>
    </KolamHoverTooltip>
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

function fitStockOpnameListColumns(containerWidth: number): KolamTableColumn[] {
  const base = getKolamTableColumns('stock-opname');
  if (containerWidth <= 0) {
    return base;
  }

  const gap = KOLAM_DATA_TABLE_COLUMN_GAP;
  const paddingX = getKolamTableVisualContract().body.cellPaddingX * 2;
  const actionsWidth = KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH;
  const gapsTotal = gap * Math.max(0, base.length - 1);
  const contentBudget = Math.max(
    0,
    containerWidth - paddingX - gapsTotal - actionsWidth,
  );
  const contentColumns = base.filter(column => column.id !== 'actions');
  const equalWidth = Math.max(
    72,
    Math.floor(contentBudget / Math.max(1, contentColumns.length)),
  );
  let remainder = contentBudget - equalWidth * contentColumns.length;
  const lastContentId = contentColumns[contentColumns.length - 1]?.id;

  return base.map(column => {
    if (column.id === 'actions') {
      return { ...column, width: actionsWidth };
    }

    const extra = column.id === lastContentId ? remainder : 0;
    if (column.id === lastContentId) {
      remainder = 0;
    }

    return {
      ...column,
      width: equalWidth + extra,
    };
  });
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
    gap: 14,
  },
  listSurface: {
    gap: 14,
    overflow: 'visible',
  },
  listRoot: {
    gap: 14,
    overflow: 'visible',
  },
  errorBadge: {
    alignSelf: 'stretch',
  },
  toolbarWrap: {
    elevation: 1000,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
  },
  dateField: {
    flexGrow: 0,
    flexShrink: 0,
    maxWidth: 160,
    minWidth: 110,
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
    overflow: 'visible',
  },
  listCell: {
    gap: 2,
    justifyContent: 'center',
    minWidth: 0,
  },
  identityCell: {
    alignItems: 'flex-start',
  },
  statusCell: {
    alignItems: 'center',
  },
  centerBadge: {
    alignSelf: 'center',
  },
  mainTrackVisible: {
    overflow: 'visible',
  },
  overflowVisible: {
    overflow: 'visible',
    zIndex: 9000,
  },
  picCell: {
    alignItems: 'center',
  },
  picTooltip: {
    alignSelf: 'center',
  },
  activeActionRow: {
    elevation: 30,
    overflow: 'visible',
    zIndex: 1000,
  },
  picAvatar: {
    alignItems: 'center',
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.border,
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 32,
  },
  picAvatarImage: {
    borderRadius: 16,
    height: 32,
    width: 32,
  },
  picAvatarText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  actionsTrack: {
    justifyContent: 'center',
  },
  primaryText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    textAlign: 'center',
  },
  emptyWrap: {
    paddingVertical: 24,
  },
  paginationBar: {
    alignItems: 'center',
    flexDirection: 'row',
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
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  importDialog: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    maxWidth: '92%',
    padding: 16,
    width: 420,
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
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  fileName: {
    color: V.colors.fg,
    flex: 1,
    fontSize: 12,
  },
  dangerText: {
    color: V.colors.danger,
    fontSize: 12,
  },
  importActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 4,
  },
});
