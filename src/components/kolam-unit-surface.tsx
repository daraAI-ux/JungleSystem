import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  getUnitTypeLabel,
  type KolamUnit,
  type KolamUnitStatus,
  type KolamUnitType,
} from '../domain/kolam-unit';
import { getKolamFormSection } from '../domain/kolam-form';
import { getKolamTableColumns } from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamUnitController,
  type KolamUnitController,
} from '../hooks/use-kolam-unit-controller';
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
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';

type UnitSortMode = 'name-asc' | 'name-desc' | 'initial-asc' | 'newest';
type UnitStatusFilter = 'all' | KolamUnitStatus;
type UnitTypeFilter = 'all' | KolamUnitType;

export function KolamUnitSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamUnitController(route);

  return (
    <KolamUnitShell controller={controller} onRouteChange={onRouteChange}>
      {controller.mode === 'list' ? (
        <KolamUnitList controller={controller} onRouteChange={onRouteChange} />
      ) : (
        <KolamUnitDetail controller={controller} />
      )}
    </KolamUnitShell>
  );
}

function KolamUnitShell({
  children,
  controller,
  onRouteChange,
}: {
  children: React.ReactNode;
  controller: KolamUnitController;
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
                onRouteChange?.('/units/baru');
              }}
            />
          ) : (
            <KolamButton
              label="Daftar"
              onPress={() => {
                controller.onBackToList();
                onRouteChange?.('/units');
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

function KolamUnitList({
  controller,
  onRouteChange,
}: {
  controller: KolamUnitController;
  onRouteChange?: (route: string) => void;
}) {
  const [search, setSearch] = React.useState('');
  const [sortMode, setSortMode] = React.useState<UnitSortMode>('name-asc');
  const [statusFilter, setStatusFilter] =
    React.useState<UnitStatusFilter>('all');
  const [typeFilter, setTypeFilter] = React.useState<UnitTypeFilter>('all');
  const [pageSize, setPageSize] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamUnit | null>(null);
  const summary = getUnitSummary(controller.units);
  const filteredUnits = React.useMemo(
    () => filterUnits(controller.units, search, statusFilter, typeFilter),
    [controller.units, search, statusFilter, typeFilter],
  );
  const sortedUnits = React.useMemo(
    () => sortUnits(filteredUnits, sortMode),
    [filteredUnits, sortMode],
  );
  const pageCount = Math.max(1, Math.ceil(sortedUnits.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pagedUnits = sortedUnits.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  React.useEffect(() => {
    setPage(1);
  }, [pageSize, search, sortMode, statusFilter, typeFilter]);

  return (
    <View style={styles.stack}>
      <View style={styles.summaryGrid}>
        <SummaryTile label="Total Satuan" value={controller.units.length} />
        <SummaryTile label="Aktif" value={summary.active} />
        <SummaryTile label="Nonaktif" value={summary.inactive} />
        <SummaryTile label="Satuan Dasar" value={summary.base} />
      </View>
      <View style={styles.tableToolbar}>
        <KolamFormTextField
          onChangeText={setSearch}
          placeholder="Cari satuan..."
          style={styles.searchInput}
          value={search}
        />
        <KolamDropdownSelect<UnitSortMode>
          label="Urutan"
          onChange={setSortMode}
          options={[
            { label: 'Nama A-Z', value: 'name-asc' },
            { label: 'Nama Z-A', value: 'name-desc' },
            { label: 'Inisial A-Z', value: 'initial-asc' },
            { label: 'Terbaru', value: 'newest' },
          ]}
          value={sortMode}
        />
        <KolamDropdownSelect<UnitStatusFilter>
          label="Status"
          onChange={setStatusFilter}
          options={[
            { label: 'Semua', value: 'all' },
            { label: 'Aktif', value: 'active' },
            { label: 'Nonaktif', value: 'inactive' },
          ]}
          value={statusFilter}
        />
        <KolamDropdownSelect<UnitTypeFilter>
          label="Tipe"
          onChange={setTypeFilter}
          options={[
            { label: 'Semua', value: 'all' },
            { label: 'Berat', value: 'weight' },
            { label: 'Volume', value: 'volume' },
            { label: 'Panjang', value: 'length' },
            { label: 'Luas', value: 'area' },
            { label: 'Lainnya', value: 'other' },
          ]}
          value={typeFilter}
        />
        <KolamPaginationSizeControl onChange={setPageSize} value={pageSize} />
        <KolamPaginationSummaryLabel
          page={safePage}
          pageSize={pageSize}
          total={sortedUnits.length}
        />
      </View>
      <KolamContentFrame variant="settingsWebConfig">
        <KolamDataTableHeader columns={getKolamTableColumns('unit')} />
        {pagedUnits.length ? (
          pagedUnits.map(unit => (
            <KolamUnitRow
              key={unit.id}
              onDelete={() => setDeleteCandidate(unit)}
              onEdit={() => {
                void controller.onSelectUnit(unit);
                onRouteChange?.(`${getUnitRoute(unit)}/edit`);
              }}
              onSelect={() => {
                void controller.onSelectUnit(unit);
                onRouteChange?.(getUnitRoute(unit));
              }}
              unit={unit}
            />
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              compact
              message="Data Satuan belum tersedia dari cache atau backend."
              title={controller.loading ? 'Memuat satuan...' : 'Belum ada satuan'}
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
            items={[
              {
                id: 'page',
                text: `${safePage} / ${pageCount}`,
                style: styles.pageLabel,
              },
            ]}
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
        itemType="satuan"
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          const unit = deleteCandidate;
          setDeleteCandidate(null);

          if (!unit) {
            return;
          }

          void controller.onDeleteUnit(unit).then(deleted => {
            if (deleted) {
              onRouteChange?.('/units');
            }
          });
        }}
        visible={Boolean(deleteCandidate)}
      />
    </View>
  );
}

function KolamUnitRow({
  onDelete,
  onEdit,
  onSelect,
  unit,
}: {
  onDelete: () => void;
  onEdit: () => void;
  onSelect: () => void;
  unit: KolamUnit;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);

  return (
    <KolamDataTableRowFrame style={actionMenuOpen && styles.activeActionRow}>
      <View style={styles.nameCell}>
        <KolamCopyStack
          items={[
            { id: 'name', text: unit.name, style: styles.rowTitle },
            {
              id: 'category',
              text: unit.category || 'Satuan pengukuran',
              style: styles.rowMeta,
            },
          ]}
        />
      </View>
      <View style={styles.initialCell}>
        <View style={styles.initialChip}>
          <KolamCopyStack
            items={[
              {
                id: 'initial',
                text: unit.initial || '-',
                style: styles.initialText,
              },
            ]}
          />
        </View>
      </View>
      <View style={styles.typeCell}>
        <KolamStatusBadge
          intent={getUnitTypeIntent(unit.type)}
          label={getUnitTypeLabel(unit.type)}
        />
      </View>
      <View style={styles.baseCell}>
        <KolamStatusBadge
          intent={unit.isBase ? 'success' : 'muted'}
          label={unit.isBase ? 'Ya' : 'Tidak'}
        />
      </View>
      <View style={styles.statusCell}>
        <KolamStatusBadge
          intent={unit.status === 'active' ? 'success' : 'warning'}
          label={getUnitStatusLabel(unit.status)}
        />
      </View>
      <View style={styles.overflowCell}>
        <KolamOverflowMenuButton
          accessibilityLabel={`Menu ${unit.name}`}
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

function KolamUnitDetail({ controller }: { controller: KolamUnitController }) {
  const unit = controller.selectedUnit;
  const editable = controller.isEditable;

  if (!unit && controller.mode !== 'new') {
    return (
      <KolamEmptyState
        message="Pilih salah satu satuan dari daftar untuk melihat detail."
        title="Belum ada satuan dipilih"
      />
    );
  }

  return (
    <View style={styles.stack}>
      {!editable && unit ? (
        <>
          <View style={styles.detailActions}>
            <KolamButton intent="primary" label="Edit" onPress={controller.onEdit} />
          </View>
          <KolamLabelFieldDetailOverview
            hero={<UnitHero unit={unit} />}
            meta={[
              { label: 'Nama', value: unit.name },
              { label: 'Simbol/Inisial', value: unit.initial || '-' },
              { label: 'Tipe', value: getUnitTypeLabel(unit.type) },
              { label: 'Kategori', value: unit.category || '-' },
              { label: 'Satuan Dasar', value: unit.isBase ? 'Ya' : 'Tidak' },
              ...(unit.createdAt
                ? [{ label: 'Dibuat', value: formatDateTime(unit.createdAt) }]
                : []),
              ...(unit.updatedAt
                ? [{ label: 'Diperbarui', value: formatDateTime(unit.updatedAt) }]
                : []),
            ]}
            metrics={[
              { label: 'Inisial', value: unit.initial || '-' },
              { label: 'Tipe', value: getUnitTypeLabel(unit.type) },
              { label: 'Dasar', value: unit.isBase ? 1 : 0 },
            ]}
            sections={[
              {
                description: 'Metadata satuan dari backend Kolam',
                emptyText: 'Tidak ada metadata tambahan',
                items: [
                  { title: `ID: ${unit.id}` },
                  { title: `Status: ${getUnitStatusLabel(unit.status)}` },
                  ...(unit.category ? [{ title: `Kategori: ${unit.category}` }] : []),
                ],
                title: 'Metadata',
                total: unit.category ? 3 : 2,
              },
            ]}
            status={{
              intent: unit.status === 'active' ? 'success' : 'warning',
              label: getUnitStatusLabel(unit.status),
            }}
          />
        </>
      ) : (
        <KolamUnitForm controller={controller} />
      )}
    </View>
  );
}

function KolamUnitForm({ controller }: { controller: KolamUnitController }) {
  const form = controller.form;

  return (
    <KolamNativeFormSection section={getKolamFormSection('unit-detail')}>
      <View style={settingsWebFormStyles.settingsWebFormFields}>
        <View style={settingsWebFormStyles.settingsWebFormFieldsGrid}>
          <View style={styles.formSplitRow}>
            <View style={styles.formSplitCell}>
              <FieldShell label="Nama" required>
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={name => controller.onChangeForm({ name })}
                  placeholder="contoh: kilogram"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.name}
                />
              </FieldShell>
            </View>
            <View style={styles.formSplitCell}>
              <FieldShell label="Simbol/Inisial" required>
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={initial => controller.onChangeForm({ initial })}
                  placeholder="contoh: kg"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.initial}
                />
              </FieldShell>
            </View>
          </View>
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

function UnitHero({ unit }: { unit: KolamUnit }) {
  return (
    <View style={styles.unitHero}>
      <KolamCopyStack
        items={[
          { id: 'initial', text: unit.initial || '-', style: styles.heroInitial },
          { id: 'name', text: unit.name, style: styles.heroName },
        ]}
      />
    </View>
  );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryTile}>
      <KolamCopyStack
        items={[
          { id: 'value', text: value, style: styles.summaryValue },
          { id: 'label', text: label, style: styles.summaryLabel },
        ]}
      />
    </View>
  );
}

function getUnitSummary(units: KolamUnit[]) {
  return units.reduce(
    (summary, unit) => {
      summary[unit.status] += 1;
      if (unit.isBase) {
        summary.base += 1;
      }

      return summary;
    },
    { active: 0, inactive: 0, base: 0 },
  );
}

function filterUnits(
  units: KolamUnit[],
  search: string,
  statusFilter: UnitStatusFilter,
  typeFilter: UnitTypeFilter,
) {
  const query = search.trim().toLowerCase();

  return units.filter(unit => {
    if (statusFilter !== 'all' && unit.status !== statusFilter) {
      return false;
    }

    if (typeFilter !== 'all' && unit.type !== typeFilter) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [unit.name, unit.initial, unit.category, getUnitTypeLabel(unit.type)]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
}

function sortUnits(units: KolamUnit[], sortMode: UnitSortMode) {
  return [...units].sort((left, right) => {
    if (sortMode === 'newest') {
      return (
        getUnitTime(right) - getUnitTime(left) ||
        left.name.localeCompare(right.name)
      );
    }

    if (sortMode === 'initial-asc') {
      return (
        left.initial.localeCompare(right.initial) ||
        left.name.localeCompare(right.name)
      );
    }

    return sortMode === 'name-desc'
      ? right.name.localeCompare(left.name)
      : left.name.localeCompare(right.name);
  });
}

function getUnitTime(unit: KolamUnit) {
  const timestamp = Date.parse(unit.createdAt ?? unit.updatedAt ?? '');
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getUnitRoute(unit: KolamUnit) {
  return `/units/${encodeURIComponent(unit.name || unit.id)}`;
}

function getUnitStatusLabel(status: KolamUnitStatus) {
  return status === 'inactive' ? 'Nonaktif' : 'Aktif';
}

function getUnitTypeIntent(type: KolamUnitType | null) {
  switch (type) {
    case 'weight':
      return 'primary';
    case 'volume':
      return 'info';
    case 'length':
      return 'warning';
    case 'area':
      return 'outline';
    case 'other':
    default:
      return 'muted';
  }
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

const styles = StyleSheet.create({
  surface: {
    gap: 14,
  },
  header: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    gap: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  errorBadge: {
    alignSelf: 'flex-start',
    maxWidth: 760,
  },
  stack: {
    gap: 14,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryTile: {
    minWidth: 150,
    flexGrow: 1,
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
    marginTop: 3,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  tableToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    zIndex: 8,
  },
  searchInput: {
    width: 240,
  },
  emptyWrap: {
    minHeight: 220,
    justifyContent: 'center',
  },
  activeActionRow: {
    zIndex: 1000,
    elevation: 30,
  },
  nameCell: {
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
    fontSize: 11,
    fontWeight: '700',
  },
  initialCell: {
    width: 140,
    alignItems: 'flex-start',
  },
  initialChip: {
    minHeight: 28,
    minWidth: 58,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.secondary,
  },
  initialText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  typeCell: {
    width: 120,
    alignItems: 'flex-start',
  },
  baseCell: {
    width: 116,
    alignItems: 'flex-start',
  },
  statusCell: {
    width: 116,
    alignItems: 'flex-end',
  },
  overflowCell: {
    width: 64,
    alignItems: 'flex-end',
    zIndex: 1100,
    elevation: 30,
  },
  paginationRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  pageLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  detailActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  unitHero: {
    width: 168,
    minHeight: 96,
    gap: 8,
    padding: 14,
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    justifyContent: 'center',
  },
  heroInitial: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 28,
    fontWeight: '900',
  },
  heroName: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
  },
  formSplitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 14,
  },
  formSplitCell: {
    minWidth: 260,
    flex: 1,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 16,
  },
});
