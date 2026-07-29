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
import {KolamConfirmDialog} from './kolam-confirm-dialog';
import {
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import {KolamDataTableRowFrame} from './kolam-data-table-row-frame';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamFormTextField} from './kolam-form-text-field';
import {KolamStatusBadge} from './kolam-status-badge';
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

const USER_LIST_COLUMNS = [
  {id: 'name', label: 'Nama', flex: 1.35, align: 'left'},
  {id: 'email', label: 'Email', flex: 1.2, align: 'left'},
  {id: 'phone', label: 'Phone', flex: 0.9, align: 'left'},
  {id: 'role', label: 'Peran', flex: 0.8, align: 'left'},
  {id: 'employee', label: 'Status Karyawan', flex: 1, align: 'left'},
  {id: 'access', label: 'Akses', flex: 1.05, align: 'left'},
  {id: 'actions', label: 'Aksi', flex: 0.4, align: 'right'},
] as const;

type UserListColumnId = (typeof USER_LIST_COLUMNS)[number]['id'];

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
  const [deleteTarget, setDeleteTarget] =
    React.useState<KolamUserListItem | null>(null);
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
      : debouncedSearch
        ? `Tidak ada pengguna untuk "${debouncedSearch}"`
        : 'Belum ada pengguna';
  const emptyMessage = loading
    ? 'Mengambil data pengguna dari server.'
    : error ||
      (debouncedSearch
        ? 'Coba kata kunci lain.'
        : 'Tidak ada data pengguna pada halaman ini.');
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
        <View style={styles.userHeaderRow}>
          {USER_LIST_COLUMNS.map(column => (
            <View
              key={column.id}
              style={[
                styles.userListCell,
                {flex: column.flex},
                column.align === 'right' && styles.userListCellRight,
              ]}>
              <Text
                style={[
                  styles.userHeaderCellText,
                  column.align === 'right' && styles.userTextRight,
                ]}>
                {column.label}
              </Text>
            </View>
          ))}
        </View>
        {items.length ? (
          items.map(user => (
            <KolamUserListRow
              key={user.id}
              onDeleteRequest={setDeleteTarget}
              onRouteChange={onRouteChange}
              user={user}
            />
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              compact
              message={emptyMessage}
              title={emptyTitle}
            />
          </View>
        )}
      </KolamCatalogListTableShell>
      <KolamConfirmDialog
        cancelLabel="Batal"
        confirmLabel="Tutup"
        destructive
        message={
          deleteTarget
            ? `Penghapusan pengguna "${deleteTarget.displayName}" belum diaktifkan karena backend melakukan pembersihan permanen. Aksi ini membutuhkan approval khusus sebelum disambungkan.`
            : 'Penghapusan pengguna belum diaktifkan karena backend melakukan pembersihan permanen.'
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => setDeleteTarget(null)}
        title="Konfirmasi hapus pengguna"
        visible={Boolean(deleteTarget)}
      />
    </View>
  );
}

function KolamUserListRow({
  onDeleteRequest,
  onRouteChange,
  user,
}: {
  onDeleteRequest: (user: KolamUserListItem) => void;
  onRouteChange?: (route: string) => void;
  user: KolamUserListItem;
}) {
  const userRouteId = encodeURIComponent(user.id);

  return (
    <KolamDataTableRowFrame style={styles.userListRow}>
      <View style={getUserListCellStyle('name')}>
        <Text numberOfLines={2} style={styles.userNameText}>
          {user.displayName}
        </Text>
        {user.username ? (
          <Text numberOfLines={1} style={styles.userSubText}>
            @{user.username}
          </Text>
        ) : null}
      </View>
      <View style={getUserListCellStyle('email')}>
        <Text numberOfLines={1} style={styles.userMetaText}>
          {user.email || '-'}
        </Text>
      </View>
      <View style={getUserListCellStyle('phone')}>
        <Text numberOfLines={1} style={styles.userMetaText}>
          {user.phoneNumber || '-'}
        </Text>
      </View>
      <View style={getUserListCellStyle('role')}>
        <Text numberOfLines={1} style={styles.userMetaText}>
          {user.roleLabel || '-'}
        </Text>
      </View>
      <View style={getUserListCellStyle('employee')}>
        <KolamStatusBadge
          intent={user.isEmployee ? 'success' : 'secondary'}
          label={user.isEmployee ? 'Karyawan' : 'Bukan karyawan'}
          numberOfLines={1}
        />
      </View>
      <View style={getUserListCellStyle('access')}>
        {user.accessBadges.length ? (
          <View style={styles.accessBadgeRow}>
            {user.accessBadges.map(access => (
              <KolamStatusBadge
                intent="secondary"
                key={access.id}
                label={access.label}
                numberOfLines={1}
                style={styles.accessBadge}
              />
            ))}
          </View>
        ) : (
          <Text numberOfLines={1} style={styles.userMetaText}>
            -
          </Text>
        )}
      </View>
      <View style={getUserListCellStyle('actions')}>
        <KolamOverflowMenuButton
          accessibilityLabel={`Menu ${user.displayName}`}
          actions={[
            {
              label: 'Lihat',
              onPress: () =>
                onRouteChange?.(`/list-of-users/users/${userRouteId}`),
            },
            {
              label: 'Rubah',
              onPress: () =>
                onRouteChange?.(`/list-of-users/users/${userRouteId}/edit`),
            },
            {
              label: 'Hapus',
              onPress: () => onDeleteRequest(user),
              tone: 'danger',
            },
          ]}
        />
      </View>
    </KolamDataTableRowFrame>
  );
}

function getUserListCellStyle(columnId: UserListColumnId) {
  const column = USER_LIST_COLUMNS.find(item => item.id === columnId);

  return [
    styles.userListCell,
    {flex: column?.flex ?? 1},
    column?.align === 'right' && styles.userListCellRight,
  ];
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
  userHeaderRow: {
    alignItems: 'center',
    backgroundColor: V.colors.tableHeader,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 52,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  userHeaderCellText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  userListRow: {
    alignItems: 'center',
    gap: 8,
  },
  userListCell: {
    minWidth: 0,
  },
  userListCellRight: {
    alignItems: 'flex-end',
  },
  userTextRight: {
    textAlign: 'right',
  },
  userNameText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  userMetaText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
  },
  userSubText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 2,
  },
  accessBadgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  accessBadge: {
    maxWidth: 96,
  },
  emptyWrap: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
});
