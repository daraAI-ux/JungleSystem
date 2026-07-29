import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  type KolamUserBooleanFilter,
  type KolamUserListItem,
  type KolamUserListPagination,
} from '../domain/kolam-user';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {getKolamUserList} from '../services/kolam-user-api';
import {KolamButton} from './kolam-button';
import {KolamCatalogListTableShell} from './kolam-catalog-list-table-shell';
import {KolamTableFooterControls} from './kolam-dropdown-select';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamFormTextField} from './kolam-form-text-field';
import {KolamTableFilterTrigger} from './kolam-table-filter-trigger';

const SEARCH_DEBOUNCE_MS = 350;

const EMPLOYEE_FILTER_OPTIONS: Array<{
  label: string;
  value: KolamUserBooleanFilter;
}> = [
  {label: 'Semua Status Karyawan', value: 'all'},
  {label: 'Karyawan', value: 'true'},
  {label: 'Bukan karyawan', value: 'false'},
];

const INITIAL_PAGINATION: KolamUserListPagination = {
  hasMore: false,
  limit: 10,
  nextStatus: false,
  page: 1,
  prevStatus: false,
  total: 0,
  totalPages: 1,
};

export function KolamUserSurface({
  onRouteChange,
  route: _route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const [items, setItems] = React.useState<KolamUserListItem[]>([]);
  const [pagination, setPagination] =
    React.useState<KolamUserListPagination>(INITIAL_PAGINATION);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [employeeFilter, setEmployeeFilter] =
    React.useState<KolamUserBooleanFilter>('all');
  const [activeFilterPanel, setActiveFilterPanel] = React.useState<
    'employee' | null
  >(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [search]);

  React.useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');

    void getKolamUserList({
      isEmployee: employeeFilter,
      limit: pageSize,
      page,
      search: debouncedSearch || undefined,
    })
      .then(result => {
        if (!active) {
          return;
        }
        setItems(result.items);
        setPagination(result.pagination);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setItems([]);
        setPagination(current => ({...current, page, limit: pageSize, total: 0}));
        setError('Gagal memuat daftar pengguna.');
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [debouncedSearch, employeeFilter, page, pageSize]);

  const emptyTitle = loading
    ? 'Memuat pengguna'
    : error
      ? 'Daftar pengguna belum termuat'
      : 'Belum ada pengguna';
  const emptyMessage = loading
    ? 'Mengambil data pengguna dari server.'
    : error || 'Tidak ada data pengguna pada halaman ini.';
  const employeeFilterLabel =
    EMPLOYEE_FILTER_OPTIONS.find(option => option.value === employeeFilter)
      ?.label ?? 'Semua Status Karyawan';
  const filtersAppliedCount =
    Number(Boolean(search.trim())) + Number(employeeFilter !== 'all');
  const safePage = Math.min(page, Math.max(1, pagination.totalPages));

  return (
    <View style={styles.surface}>
      <View style={styles.toolbarWrap}>
        <View style={styles.toolbarShell}>
          <View style={styles.filterRow}>
            <KolamFormTextField
              mode="search"
              onChangeText={setSearch}
              placeholder="Cari"
              style={styles.searchInput}
              value={search}
            />
            <KolamTableFilterTrigger
              active={activeFilterPanel === 'employee' || employeeFilter !== 'all'}
              label={employeeFilterLabel}
              onPress={() =>
                setActiveFilterPanel(current =>
                  current === 'employee' ? null : 'employee',
                )
              }
            />
          </View>
          <View style={styles.actionRow}>
            {filtersAppliedCount > 0 ? (
              <KolamButton
                label="Reset"
                muted
                onPress={() => {
                  setSearch('');
                  setDebouncedSearch('');
                  setEmployeeFilter('all');
                  setActiveFilterPanel(null);
                  setPage(1);
                }}
                style={styles.toolbarButton}
              />
            ) : null}
            <KolamButton
              intent="primary"
              label="Baru"
              onPress={() => onRouteChange?.('/list-of-users/users/create')}
              style={styles.toolbarButton}
            />
          </View>
        </View>
        {activeFilterPanel === 'employee' ? (
          <View style={[styles.filterOverlayPanel, styles.filterPanelEmployee]}>
            <View style={styles.filterPanelContent}>
              {EMPLOYEE_FILTER_OPTIONS.map(option => (
                <KolamButton
                  intent={option.value === employeeFilter ? 'primary' : 'plain'}
                  key={option.value}
                  label={option.label}
                  onPress={() => {
                    setEmployeeFilter(option.value);
                    setActiveFilterPanel(null);
                    setPage(1);
                  }}
                  style={styles.filterPanelOption}
                />
              ))}
            </View>
          </View>
        ) : null}
      </View>

      <KolamCatalogListTableShell
        footer={
          <KolamTableFooterControls
            onPageSizeChange={nextLimit => {
              setPageSize(nextLimit);
              setPage(1);
            }}
            page={safePage}
            pageSize={pageSize}
            total={pagination.total}
          />
        }
      >
        {items.length ? (
          <View style={styles.readyState}>
            <Text style={styles.readyTitle}>
              {items.length} pengguna siap ditampilkan
            </Text>
            <Text style={styles.readyDescription}>
              Data pengguna berhasil dimuat dari server.
            </Text>
          </View>
        ) : (
          <KolamEmptyState
            compact
            message={emptyMessage}
            title={emptyTitle}
          />
        )}
      </KolamCatalogListTableShell>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    gap: 12,
    width: '100%',
  },
  toolbarWrap: {
    elevation: 1000,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
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
    flexBasis: 220,
    flexGrow: 1,
    maxWidth: 360,
    minWidth: 180,
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
    padding: 6,
    position: 'absolute',
    shadowColor: V.colors.fg,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 16,
    top: 48,
    width: 240,
    zIndex: 120000,
  },
  filterPanelEmployee: {
    left: 226,
  },
  filterPanelContent: {
    gap: 4,
  },
  filterPanelOption: {
    justifyContent: 'flex-start',
  },
  readyState: {
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  readyTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '800',
  },
  readyDescription: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
});
