import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  getIucnConservationInfo,
  getIucnStatusLabel,
  type KolamIucnSpeciesUsageItem,
  type KolamIucnStatus,
  type KolamIucnStatusState,
} from '../domain/kolam-iucn-status';
import { getKolamFormSection } from '../domain/kolam-form';
import { getKolamTableColumns } from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamIucnStatusController,
  type KolamIucnStatusController,
} from '../hooks/use-kolam-iucn-status-controller';
import { KolamButton } from './kolam-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDataTableHeader } from './kolam-data-table-header';
import { KolamDataTableRowFrame } from './kolam-data-table-row-frame';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
  KolamPaginationSizeControl,
  KolamPaginationSummaryLabel,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamLabelFieldDetailOverview } from './kolam-label-field-detail-overview';
import { KolamNativeFormSection } from './kolam-native-form-section';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';

type IucnSortMode = 'order-asc' | 'name-asc' | 'name-desc' | 'newest';
type IucnStatusFilter = 'all' | KolamIucnStatusState;
type IucnImageFilter = 'all' | 'with-image' | 'without-image';

export function KolamIucnStatusSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamIucnStatusController(route);

  return (
    <KolamIucnShell controller={controller} onRouteChange={onRouteChange}>
      {controller.mode === 'list' ? (
        <KolamIucnList controller={controller} onRouteChange={onRouteChange} />
      ) : (
        <KolamIucnDetail controller={controller} />
      )}
    </KolamIucnShell>
  );
}

function KolamIucnShell({
  children,
  controller,
  onRouteChange,
}: {
  children: React.ReactNode;
  controller: KolamIucnStatusController;
  onRouteChange?: (route: string) => void;
}) {
  return (
    <View style={styles.surface}>
      <View style={styles.header}>
        <View style={styles.headerActions}>
          <KolamButton
            disabled={controller.loading}
            label="Refresh"
            onPress={() => {
              void controller.onRefresh();
            }}
          />
          {controller.mode === 'list' ? (
            <KolamButton
              intent="primary"
              label="Buat Baru"
              onPress={() => {
                controller.onCreateNew();
                onRouteChange?.('/iucn-status/baru');
              }}
            />
          ) : (
            <KolamButton
              label="Daftar"
              onPress={() => {
                controller.onBackToList();
                onRouteChange?.('/iucn-status');
              }}
            />
          )}
        </View>
      </View>
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}
      {children}
    </View>
  );
}

function KolamIucnList({
  controller,
  onRouteChange,
}: {
  controller: KolamIucnStatusController;
  onRouteChange?: (route: string) => void;
}) {
  const [search, setSearch] = React.useState('');
  const [sortMode, setSortMode] = React.useState<IucnSortMode>('order-asc');
  const [statusFilter, setStatusFilter] = React.useState<IucnStatusFilter>('all');
  const [imageFilter, setImageFilter] = React.useState<IucnImageFilter>('all');
  const [pageSize, setPageSize] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamIucnStatus | null>(null);
  const summary = getIucnSummary(controller.items);
  const filteredItems = React.useMemo(
    () => filterIucnItems(controller.items, search, statusFilter, imageFilter),
    [controller.items, imageFilter, search, statusFilter],
  );
  const sortedItems = React.useMemo(
    () => sortIucnItems(filteredItems, sortMode),
    [filteredItems, sortMode],
  );
  const pageCount = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pagedItems = sortedItems.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  React.useEffect(() => {
    setPage(1);
  }, [imageFilter, pageSize, search, sortMode, statusFilter]);

  return (
    <View style={styles.stack}>
      <View style={styles.summaryGrid}>
        <SummaryTile label="Total Status" value={controller.items.length} />
        <SummaryTile label="Aktif" value={summary.active} />
        <SummaryTile label="Nonaktif" value={summary.inactive} />
        <SummaryTile label="Dengan Gambar" value={summary.withImage} />
      </View>
      <View style={styles.tableToolbar}>
        <KolamFormTextField
          onChangeText={setSearch}
          placeholder="Cari status IUCN..."
          style={styles.searchInput}
          value={search}
        />
        <KolamDropdownSelect<IucnSortMode>
          label="Urutan"
          onChange={setSortMode}
          options={[
            { label: 'Urutan IUCN', value: 'order-asc' },
            { label: 'Nama A-Z', value: 'name-asc' },
            { label: 'Nama Z-A', value: 'name-desc' },
            { label: 'Terbaru', value: 'newest' },
          ]}
          value={sortMode}
        />
        <KolamDropdownSelect<IucnStatusFilter>
          label="Status"
          onChange={setStatusFilter}
          options={[
            { label: 'Semua', value: 'all' },
            { label: 'Aktif', value: 'active' },
            { label: 'Nonaktif', value: 'inactive' },
          ]}
          value={statusFilter}
        />
        <KolamDropdownSelect<IucnImageFilter>
          label="Gambar"
          onChange={setImageFilter}
          options={[
            { label: 'Semua', value: 'all' },
            { label: 'Dengan gambar', value: 'with-image' },
            { label: 'Tanpa gambar', value: 'without-image' },
          ]}
          value={imageFilter}
        />
        <KolamPaginationSizeControl onChange={setPageSize} value={pageSize} />
        <KolamPaginationSummaryLabel
          page={safePage}
          pageSize={pageSize}
          total={sortedItems.length}
        />
      </View>
      <KolamContentFrame variant="settingsWebConfig">
        <KolamDataTableHeader columns={getKolamTableColumns('iucn-status')} />
        {pagedItems.length ? (
          pagedItems.map(item => (
            <KolamIucnRow
              item={item}
              key={item.id}
              onDelete={() => setDeleteCandidate(item)}
              onEdit={() => {
                void controller.onSelectItem(item);
                onRouteChange?.(`${getIucnRoute(item)}/edit`);
              }}
              onSelect={() => {
                void controller.onSelectItem(item);
                onRouteChange?.(getIucnRoute(item));
              }}
            />
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              compact
              message="Data Status IUCN belum tersedia dari cache atau backend."
              title={controller.loading ? 'Memuat status IUCN...' : 'Belum ada status IUCN'}
            />
          </View>
        )}
      </KolamContentFrame>
      {pageCount > 1 ? (
        <View style={styles.paginationRow}>
          <KolamButton
            disabled={safePage <= 1}
            label="Sebelumnya"
            onPress={() => setPage(current => Math.max(1, current - 1))}
          />
          <KolamCopyStack
            items={[{ id: 'page', text: `${safePage} / ${pageCount}`, style: styles.pageLabel }]}
          />
          <KolamButton
            disabled={safePage >= pageCount}
            label="Berikutnya"
            onPress={() => setPage(current => Math.min(pageCount, current + 1))}
          />
        </View>
      ) : null}
      <KolamDeleteConfirmDialog
        itemLabel={deleteCandidate?.name}
        itemType="status IUCN"
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          const item = deleteCandidate;
          setDeleteCandidate(null);

          if (!item) {
            return;
          }

          void controller.onDeleteItem(item).then(deleted => {
            if (deleted) {
              onRouteChange?.('/iucn-status');
            }
          });
        }}
        visible={Boolean(deleteCandidate)}
      />
    </View>
  );
}

function KolamIucnRow({
  item,
  onDelete,
  onEdit,
  onSelect,
}: {
  item: KolamIucnStatus;
  onDelete: () => void;
  onEdit: () => void;
  onSelect: () => void;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const info = getIucnConservationInfo(item.abbreviation);

  return (
    <KolamDataTableRowFrame style={actionMenuOpen && styles.activeActionRow}>
      <View style={styles.imageCell}>
        <IucnImageBadge item={item} size="small" />
      </View>
      <View style={styles.abbreviationCell}>
        <View style={[styles.abbreviationBadge, { borderColor: info.color }]}>
          <KolamCopyStack
            items={[{ id: 'abbr', text: item.abbreviation || '-', style: styles.abbreviationText }]}
          />
        </View>
      </View>
      <View style={styles.identityCell}>
        <KolamCopyStack
          containerStyle={styles.identityCopy}
          items={[
            { id: 'name', text: item.name, style: styles.rowTitle },
            {
              id: 'label',
              text: info.label || '-',
              style: styles.rowMeta,
              textProps: { ellipsizeMode: 'tail', numberOfLines: 1 },
            },
          ]}
        />
      </View>
      <View style={styles.orderCell}>
        <KolamCopyStack
          items={[{ id: 'order', text: String(item.order), style: styles.amountText }]}
        />
      </View>
      <View style={styles.statusCell}>
        <KolamStatusBadge
          intent={item.status === 'active' ? 'success' : 'warning'}
          label={getIucnStatusLabel(item.status)}
        />
      </View>
      <View style={styles.overflowCell}>
        <KolamOverflowMenuButton
          accessibilityLabel={`Menu ${item.name}`}
          actions={[
            { label: 'Lihat', onPress: onSelect },
            { label: 'Rubah', onPress: onEdit },
            { label: 'Hapus', onPress: onDelete, tone: 'danger' },
          ]}
          onOpenChange={setActionMenuOpen}
        />
      </View>
    </KolamDataTableRowFrame>
  );
}

function KolamIucnDetail({
  controller,
}: {
  controller: KolamIucnStatusController;
}) {
  const item = controller.selectedItem;
  const editable = controller.isEditable;

  if (!item && controller.mode !== 'new') {
    return (
      <KolamEmptyState
        message="Pilih salah satu status IUCN dari daftar untuk melihat detail."
        title="Belum ada status IUCN dipilih"
      />
    );
  }

  return (
    <View style={styles.stack}>
      {!editable && item ? (
        <>
          <View style={styles.detailActions}>
            <KolamButton intent="primary" label="Edit" onPress={controller.onEdit} />
          </View>
          <KolamLabelFieldDetailOverview
            hero={<IucnHero item={item} />}
            meta={[
              { label: 'Singkatan', value: item.abbreviation || '-' },
              { label: 'Label IUCN', value: getIucnConservationInfo(item.abbreviation).label },
              { label: 'Gambar', value: item.image ? 'Tersimpan lokal/cache' : 'Belum ada gambar' },
              ...(item.createdBy ? [{ label: 'Pembuat', value: item.createdBy }] : []),
              ...(item.updatedAt ? [{ label: 'Diperbarui', value: formatDateTime(item.updatedAt) }] : []),
            ]}
            metrics={[
              { label: 'Urutan', value: item.order },
              { label: 'Species', value: item.species.length },
              { label: 'Gambar', value: item.image ? 1 : 0 },
            ]}
            sections={[
              {
                description: 'Keterangan status konservasi berdasarkan singkatan IUCN.',
                emptyText: 'Belum ada keterangan konservasi.',
                items: getConservationItems(item),
                title: 'Konservasi',
                total: getConservationItems(item).length,
              },
              {
                description: 'Spesies yang diklasifikasikan dengan status IUCN ini.',
                emptyText: 'Belum ada spesies dengan status ini.',
                items: item.species.map(species => ({
                  meta: [species.commonName, species.sku ? `SKU: ${species.sku}` : '']
                    .filter(Boolean)
                    .join('\n'),
                  title: species.scientificName || species.commonName || species.id,
                })),
                title: 'Species',
                total: item.species.length,
              },
            ]}
            status={{
              intent: item.status === 'active' ? 'success' : 'warning',
              label: getIucnStatusLabel(item.status),
            }}
          />
        </>
      ) : (
        <KolamIucnForm controller={controller} />
      )}
    </View>
  );
}

function KolamIucnForm({
  controller,
}: {
  controller: KolamIucnStatusController;
}) {
  const form = controller.form;

  return (
    <KolamNativeFormSection section={getKolamFormSection('iucn-status-detail')}>
      <View style={settingsWebFormStyles.settingsWebFormFields}>
        <View style={settingsWebFormStyles.settingsWebFormFieldsGrid}>
          <View style={styles.formSplitRow}>
            <View style={styles.formSplitCell}>
              <FieldShell label="Nama" required>
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={name => controller.onChangeForm({ name })}
                  placeholder="mis. Risiko Rendah"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.name}
                />
              </FieldShell>
            </View>
            <View style={styles.formSplitCell}>
              <FieldShell label="Singkatan" required>
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={abbreviation =>
                    controller.onChangeForm({ abbreviation: abbreviation.toUpperCase() })
                  }
                  placeholder="mis. LC"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.abbreviation}
                />
              </FieldShell>
            </View>
          </View>
          <FieldShell label="Status" required>
            <View style={styles.segmentRow}>
              {(['active', 'inactive'] as KolamIucnStatusState[]).map(status => (
                <KolamButton
                  intent={form.status === status ? 'primary' : 'outline'}
                  key={status}
                  label={getIucnStatusLabel(status)}
                  onPress={() => controller.onChangeForm({ status })}
                />
              ))}
            </View>
          </FieldShell>
          <FieldShell label="Gambar Badge">
            <View style={styles.imagePickerRow}>
              <KolamFormTextField
                editable={!controller.saving}
                mode="url"
                onChangeText={imageLocalUri => controller.onChangeForm({ imageLocalUri })}
                placeholder="Pilih file gambar dari komputer"
                style={[settingsWebFormStyles.settingsWebFormFieldValue, styles.imagePickerInput]}
                value={form.imageLocalUri}
              />
              <KolamButton
                disabled={controller.saving}
                label="Pilih Gambar"
                onPress={() => {
                  void controller.onPickImage();
                }}
              />
            </View>
          </FieldShell>
        </View>
        <View style={styles.formActions}>
          <KolamButton
            disabled={controller.saving}
            label="Batal"
            onPress={controller.onBackToList}
          />
          <KolamButton
            disabled={controller.saving}
            intent="primary"
            label={controller.saving ? 'Menyimpan...' : 'Simpan'}
            onPress={() => {
              void controller.onSave();
            }}
          />
        </View>
      </View>
    </KolamNativeFormSection>
  );
}

function FieldShell({
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

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryTile}>
      <KolamCopyStack
        items={[
          { id: 'value', text: String(value), style: styles.summaryValue },
          { id: 'label', text: label, style: styles.summaryLabel },
        ]}
      />
    </View>
  );
}

function IucnImageBadge({
  item,
  size,
}: {
  item: KolamIucnStatus;
  size: 'small' | 'large';
}) {
  const info = getIucnConservationInfo(item.abbreviation);
  const sizeStyle = size === 'large' ? styles.imageLarge : styles.imageSmall;

  return (
    <View style={[styles.imageBox, sizeStyle, { borderColor: info.color }]}>
      <KolamRemoteImage
        accessibilityLabel={`Gambar ${item.abbreviation}`}
        resizeMode="contain"
        revision={item.updatedAt ?? item.image ?? undefined}
        scope="iucn-status"
        sourceUri={item.imageUri}
        style={StyleSheet.absoluteFill}
      />
      {!item.imageUri ? (
        <KolamCopyStack
          items={[{ id: 'abbr', text: item.abbreviation || '-', style: styles.imageFallbackText }]}
        />
      ) : null}
    </View>
  );
}

function IucnHero({ item }: { item: KolamIucnStatus }) {
  const info = getIucnConservationInfo(item.abbreviation);

  return (
    <View style={styles.heroWrap}>
      <IucnImageBadge item={item} size="large" />
      <KolamCopyStack
        items={[
          { id: 'abbr', text: item.abbreviation || '-', style: [styles.heroAbbr, { color: info.color }] },
          { id: 'name', text: item.name, style: styles.heroName },
        ]}
      />
    </View>
  );
}

function getConservationItems(item: KolamIucnStatus) {
  const info = getIucnConservationInfo(item.abbreviation);
  return [
    { title: 'Label', value: info.label },
    ...(info.description ? [{ title: 'Deskripsi', meta: info.description }] : []),
    { title: 'Singkatan', value: item.abbreviation || '-' },
  ];
}

function getIucnRoute(item: KolamIucnStatus) {
  return `/iucn-status/${encodeURIComponent(item.abbreviation || item.name || item.id)}`;
}

function getIucnSummary(items: KolamIucnStatus[]) {
  return items.reduce(
    (summary, item) => ({
      active: summary.active + (item.status === 'active' ? 1 : 0),
      inactive: summary.inactive + (item.status === 'inactive' ? 1 : 0),
      withImage: summary.withImage + (item.image ? 1 : 0),
    }),
    { active: 0, inactive: 0, withImage: 0 },
  );
}

function filterIucnItems(
  items: KolamIucnStatus[],
  search: string,
  statusFilter: IucnStatusFilter,
  imageFilter: IucnImageFilter,
) {
  const query = search.trim().toLowerCase();

  return items.filter(item => {
    const matchesSearch = query
      ? [item.name, item.abbreviation, getIucnConservationInfo(item.abbreviation).label]
          .join(' ')
          .toLowerCase()
          .includes(query)
      : true;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesImage =
      imageFilter === 'all' ||
      (imageFilter === 'with-image' ? Boolean(item.image) : !item.image);

    return matchesSearch && matchesStatus && matchesImage;
  });
}

function sortIucnItems(items: KolamIucnStatus[], sortMode: IucnSortMode) {
  const next = [...items];
  switch (sortMode) {
    case 'name-desc':
      return next.sort((left, right) => right.name.localeCompare(left.name));
    case 'name-asc':
      return next.sort((left, right) => left.name.localeCompare(right.name));
    case 'newest':
      return next.sort((left, right) =>
        String(right.updatedAt ?? '').localeCompare(String(left.updatedAt ?? '')),
      );
    case 'order-asc':
    default:
      return next.sort((left, right) => left.order - right.order || left.name.localeCompare(right.name));
  }
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  surface: {
    gap: 14,
  },
  header: {
    alignItems: 'flex-end',
  },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  errorBadge: {
    alignSelf: 'flex-start',
  },
  stack: {
    gap: 14,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryTile: {
    minWidth: 170,
    flexGrow: 1,
    gap: 6,
    padding: 14,
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  summaryValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 22,
    fontWeight: '900',
  },
  summaryLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  tableToolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    minWidth: 220,
    flexGrow: 1,
  },
  emptyWrap: {
    minHeight: 220,
    justifyContent: 'center',
  },
  activeActionRow: {
    zIndex: 20,
  },
  imageCell: {
    width: 72,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  abbreviationCell: {
    width: 118,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  abbreviationBadge: {
    alignSelf: 'flex-start',
    minWidth: 46,
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  abbreviationText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  identityCell: {
    flex: 1,
    minWidth: 220,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  rowMeta: {
    marginTop: 2,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  orderCell: {
    width: 90,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  amountText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'right',
  },
  statusCell: {
    width: 116,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  overflowCell: {
    width: 64,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  pageLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  detailActions: {
    alignItems: 'flex-end',
  },
  formSplitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formSplitCell: {
    minWidth: 260,
    flex: 1,
  },
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imagePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  imagePickerInput: {
    flex: 1,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  imageBox: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: V.colors.secondary,
  },
  imageSmall: {
    width: 38,
    height: 38,
  },
  imageLarge: {
    width: 84,
    height: 84,
  },
  imageFallbackText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  heroWrap: {
    width: 160,
    gap: 10,
  },
  heroAbbr: {
    fontFamily: V.fontFamily,
    fontSize: 22,
    fontWeight: '900',
  },
  heroName: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '900',
  },
});
