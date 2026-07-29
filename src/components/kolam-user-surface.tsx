import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  getKolamUserAccountStatusLabel,
  getKolamUserIdFromRoute,
  getKolamUserRouteMode,
  type KolamUserBooleanFilter,
  type KolamUserCreatePayload,
  type KolamUserListItem,
  type KolamUserListPagination,
  type KolamUserRoleOption,
} from '../domain/kolam-user';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {
  createKolamUser,
  getKolamUserDetail,
  getKolamUserList,
  getKolamUserRoles,
  updateKolamUser,
} from '../services/kolam-user-api';
import {KolamButton} from './kolam-button';
import {KolamCatalogListTableShell} from './kolam-catalog-list-table-shell';
import {KolamConfirmDialog} from './kolam-confirm-dialog';
import {KolamContentFrame} from './kolam-content-frame';
import {
  KolamDropdownSelect,
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

const EMPTY_CREATE_USER_FORM: KolamUserCreatePayload = {
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  phone_number: '',
  role: '',
  username: '',
};

type KolamUserEditForm = {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  phone_number: string;
  role: string;
  timezone: string;
  username: string;
};

const TIMEZONE_OPTIONS = [
  {value: 'UTC-12:00', label: 'UTC-12:00 - Baker Island'},
  {value: 'UTC-11:00', label: 'UTC-11:00 - American Samoa, Niue'},
  {value: 'UTC-10:00', label: 'UTC-10:00 - Hawaii, Cook Islands'},
  {value: 'UTC-09:30', label: 'UTC-09:30 - Marquesas Islands'},
  {value: 'UTC-09:00', label: 'UTC-09:00 - Alaska, Gambier Islands'},
  {value: 'UTC-08:00', label: 'UTC-08:00 - Pacific Time (US & Canada)'},
  {value: 'UTC-07:00', label: 'UTC-07:00 - Mountain Time (US & Canada), Mexico'},
  {value: 'UTC-06:00', label: 'UTC-06:00 - Central Time (US & Canada), Mexico'},
  {value: 'UTC-05:00', label: 'UTC-05:00 - Eastern Time (US & Canada), Colombia'},
  {value: 'UTC-04:00', label: 'UTC-04:00 - Atlantic Time, Venezuela, Bolivia'},
  {value: 'UTC-03:30', label: 'UTC-03:30 - Newfoundland'},
  {value: 'UTC-03:00', label: 'UTC-03:00 - Brazil, Argentina, Uruguay'},
  {value: 'UTC-02:00', label: 'UTC-02:00 - South Georgia Islands'},
  {value: 'UTC-01:00', label: 'UTC-01:00 - Azores, Cape Verde'},
  {value: 'UTC+00:00', label: 'UTC+00:00 - London, Dublin, Lisbon, Morocco'},
  {value: 'UTC+01:00', label: 'UTC+01:00 - Central Europe, West Africa'},
  {value: 'UTC+02:00', label: 'UTC+02:00 - Eastern Europe, South Africa'},
  {value: 'UTC+03:00', label: 'UTC+03:00 - Moscow, Turkey, East Africa'},
  {value: 'UTC+03:30', label: 'UTC+03:30 - Iran'},
  {value: 'UTC+04:00', label: 'UTC+04:00 - UAE, Azerbaijan, Mauritius'},
  {value: 'UTC+04:30', label: 'UTC+04:30 - Afghanistan'},
  {value: 'UTC+05:00', label: 'UTC+05:00 - Pakistan, Kazakhstan, Uzbekistan'},
  {value: 'UTC+05:30', label: 'UTC+05:30 - India, Sri Lanka'},
  {value: 'UTC+05:45', label: 'UTC+05:45 - Nepal'},
  {value: 'UTC+06:00', label: 'UTC+06:00 - Bangladesh, Bhutan, Kyrgyzstan'},
  {value: 'UTC+06:30', label: 'UTC+06:30 - Myanmar, Cocos Islands'},
  {value: 'UTC+07:00', label: 'UTC+07:00 - Thailand, Vietnam, Cambodia, Laos'},
  {value: 'UTC+08:00', label: 'UTC+08:00 - China, Singapore, Malaysia, Indonesia (West)'},
  {value: 'UTC+08:30', label: 'UTC+08:30 - North Korea'},
  {value: 'UTC+08:45', label: 'UTC+08:45 - Eucla, Australia'},
  {value: 'UTC+09:00', label: 'UTC+09:00 - Japan, South Korea, Indonesia (Central)'},
  {value: 'UTC+09:30', label: 'UTC+09:30 - Australia (Central)'},
  {value: 'UTC+10:00', label: 'UTC+10:00 - Australia (East), Papua New Guinea'},
  {value: 'UTC+10:30', label: 'UTC+10:30 - Lord Howe Island'},
  {value: 'UTC+11:00', label: 'UTC+11:00 - Solomon Islands, New Caledonia'},
  {value: 'UTC+12:00', label: 'UTC+12:00 - New Zealand, Fiji, Marshall Islands'},
  {value: 'UTC+12:45', label: 'UTC+12:45 - Chatham Islands'},
  {value: 'UTC+13:00', label: 'UTC+13:00 - Samoa, Tonga'},
  {value: 'UTC+14:00', label: 'UTC+14:00 - Line Islands, Kiribati'},
] as const;

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
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const routeMode = getKolamUserRouteMode(route);

  if (routeMode === 'create') {
    return <KolamUserCreateSurface onRouteChange={onRouteChange} />;
  }

  if (routeMode === 'detail') {
    return (
      <KolamUserDetailSurface
        onRouteChange={onRouteChange}
        userId={getKolamUserIdFromRoute(route)}
      />
    );
  }

  if (routeMode === 'edit') {
    return (
      <KolamUserEditSurface
        onRouteChange={onRouteChange}
        userId={getKolamUserIdFromRoute(route)}
      />
    );
  }

  return <KolamUserListSurface onRouteChange={onRouteChange} />;
}

function KolamUserCreateSurface({
  onRouteChange,
}: {
  onRouteChange?: (route: string) => void;
}) {
  const [form, setForm] = React.useState<KolamUserCreatePayload>({
    ...EMPTY_CREATE_USER_FORM,
  });
  const [roles, setRoles] = React.useState<KolamUserRoleOption[]>([]);
  const [rolesLoading, setRolesLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;

    setRolesLoading(true);

    void getKolamUserRoles()
      .then(result => {
        if (active) {
          setRoles(result);
        }
      })
      .catch(() => {
        if (active) {
          setRoles([]);
          setError('Gagal memuat daftar peran.');
        }
      })
      .finally(() => {
        if (active) {
          setRolesLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const setField = (field: keyof KolamUserCreatePayload, value: string) => {
    setForm(current => ({...current, [field]: value}));
    setError('');
    setMessage('');
  };

  const handleSubmit = async () => {
    const validationError = validateCreateUserForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      await createKolamUser({
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        password: form.password,
        phone_number: form.phone_number.trim(),
        role: form.role.trim(),
        username: form.username.trim(),
      });
      setMessage('Pengguna berhasil dibuat.');
      setForm({...EMPTY_CREATE_USER_FORM});
      onRouteChange?.('/list-of-users');
    } catch (err) {
      setError(getUserFormErrorMessage(err, 'Gagal membuat pengguna.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.detailSurface}>
      <View style={styles.detailActionRow}>
        <KolamButton
          disabled={saving}
          label="Daftar"
          onPress={() => onRouteChange?.('/list-of-users')}
        />
        <KolamButton
          disabled={saving}
          intent="primary"
          label={saving ? 'Membuat...' : 'Buat Pengguna'}
          onPress={handleSubmit}
        />
      </View>

      <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
        <View style={styles.detailTitleBlock}>
          <Text style={styles.detailTitle}>Buat Pengguna Baru</Text>
          <Text style={styles.detailSubtitle}>
            Tambahkan pengguna baru ke sistem
          </Text>
        </View>

        {error ? <Text style={styles.formErrorText}>{error}</Text> : null}
        {message ? <Text style={styles.formSuccessText}>{message}</Text> : null}

        <View style={styles.formGrid}>
          <UserFormField label="Username" required>
            <KolamFormTextField
              editable={!saving}
              onChangeText={value => setField('username', value)}
              style={styles.formInput}
              value={form.username}
            />
          </UserFormField>
          <UserFormField label="Nama Depan" required>
            <KolamFormTextField
              editable={!saving}
              onChangeText={value => setField('first_name', value)}
              style={styles.formInput}
              value={form.first_name}
            />
          </UserFormField>
          <UserFormField label="Nama Belakang" required>
            <KolamFormTextField
              editable={!saving}
              onChangeText={value => setField('last_name', value)}
              style={styles.formInput}
              value={form.last_name}
            />
          </UserFormField>
          <UserFormField label="Email" required>
            <KolamFormTextField
              editable={!saving}
              mode="email"
              onChangeText={value => setField('email', value)}
              style={styles.formInput}
              value={form.email}
            />
          </UserFormField>
          <UserFormField label="Kata Sandi" required>
            <KolamFormTextField
              editable={!saving}
              mode="password"
              onChangeText={value => setField('password', value)}
              style={styles.formInput}
              value={form.password}
            />
          </UserFormField>
          <UserFormField label="Nomor Telepon" required>
            <KolamFormTextField
              editable={!saving}
              onChangeText={value => setField('phone_number', value)}
              style={styles.formInput}
              value={form.phone_number}
            />
          </UserFormField>
          <View style={styles.formFieldWide}>
            <UserFormField label="Peran" required>
              <KolamDropdownSelect
                label="Peran"
                onChange={value => setField('role', value)}
                options={[
                  {label: rolesLoading ? 'Memuat peran...' : 'Pilih Role', value: ''},
                  ...roles.map(role => ({
                    label: role.name || role.key,
                    value: role.key,
                  })),
                ]}
                value={form.role}
              />
            </UserFormField>
          </View>
        </View>
      </KolamContentFrame>
    </View>
  );
}

function KolamUserListSurface({
  onRouteChange,
}: {
  onRouteChange?: (route: string) => void;
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

function KolamUserDetailSurface({
  onRouteChange,
  userId,
}: {
  onRouteChange?: (route: string) => void;
  userId: string;
}) {
  const [user, setUser] = React.useState<KolamUserListItem | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;

    if (!userId) {
      setUser(null);
      setError('ID pengguna tidak valid.');
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError('');

    void getKolamUserDetail(userId)
      .then(result => {
        if (!active) {
          return;
        }
        setUser(result);
        if (!result) {
          setError('Pengguna tidak ditemukan.');
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
          setError('Gagal memuat detail pengguna.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [userId]);

  if (loading || error || !user) {
    return (
      <View style={styles.detailSurface}>
        <KolamContentFrame
          style={styles.detailCard}
          variant="settingsWebConfig"
        >
          <KolamEmptyState
            compact
            message={error || 'Mengambil data pengguna dari server.'}
            title={
              loading
                ? 'Memuat detail pengguna'
                : error || 'Pengguna tidak ditemukan'
            }
          />
        </KolamContentFrame>
      </View>
    );
  }

  const encodedUserId = encodeURIComponent(user.id);

  return (
    <View style={styles.detailSurface}>
      <View style={styles.detailActionRow}>
        <KolamButton
          label="Daftar"
          onPress={() => onRouteChange?.('/list-of-users')}
        />
        <KolamButton
          intent="primary"
          label="Rubah"
          onPress={() =>
            onRouteChange?.(`/list-of-users/users/${encodedUserId}/edit`)
          }
        />
      </View>

      <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
        <View style={styles.detailTitleBlock}>
          <Text style={styles.detailTitle}>{user.displayName}</Text>
          {user.username ? (
            <Text style={styles.detailSubtitle}>@{user.username}</Text>
          ) : null}
        </View>
        <View style={styles.detailGrid}>
          <View style={styles.detailPanel}>
            <Text style={styles.detailPanelTitle}>Identitas</Text>
            <DetailRow label="Nama" value={user.displayName} />
            <DetailRow label="Username" value={user.username || '-'} />
            <DetailRow label="Email" value={user.email || '-'} />
            <DetailRow label="Nomor Telepon" value={user.phoneNumber || '-'} />
            <DetailRow label="Zona Waktu" value={user.timezone || '-'} />
          </View>

          <View style={styles.detailPanel}>
            <Text style={styles.detailPanelTitle}>Peran dan Flag</Text>
            <DetailBadgeRow
              label="Peran"
              badges={[{intent: 'secondary', label: user.roleLabel || '-'}]}
            />
            <DetailBadgeRow
              label="Status Karyawan"
              badges={[
                {
                  intent: user.isEmployee ? 'success' : 'secondary',
                  label: user.isEmployee ? 'Karyawan' : 'Bukan karyawan',
                },
              ]}
            />
            <DetailBadgeRow
              label="Flag"
              badges={[
                ...(user.isOwner
                  ? [{intent: 'primary' as const, label: 'Pemilik'}]
                  : []),
                ...(user.csActive
                  ? [{intent: 'success' as const, label: 'CS Aktif'}]
                  : []),
                ...(!user.isOwner && !user.csActive
                  ? [{intent: 'secondary' as const, label: '-'}]
                  : []),
              ]}
            />
          </View>

          <View style={styles.detailPanel}>
            <Text style={styles.detailPanelTitle}>Akses</Text>
            <DetailBadgeRow
              label="Akses POS"
              badges={[
                {
                  intent: user.accessPos ? 'success' : 'danger',
                  label: user.accessPos ? 'Memiliki Akses' : 'Tidak Ada Akses',
                },
              ]}
            />
            <DetailBadgeRow
              label="Akses Inventori"
              badges={[
                {
                  intent: user.accessInventory ? 'success' : 'danger',
                  label: user.accessInventory
                    ? 'Memiliki Akses'
                    : 'Tidak Ada Akses',
                },
              ]}
            />
            <DetailBadgeRow
              label="Akses AM"
              badges={[
                {
                  intent: user.accessAm ? 'success' : 'danger',
                  label: user.accessAm ? 'Memiliki Akses' : 'Tidak Ada Akses',
                },
              ]}
            />
          </View>

          <View style={styles.detailPanel}>
            <Text style={styles.detailPanelTitle}>Status Akun</Text>
            <DetailBadgeRow
              label="Status Akun"
              badges={[
                {
                  intent: getUserAccountStatusIntent(user),
                  label: getKolamUserAccountStatusLabel(user),
                },
              ]}
            />
            <DetailBadgeRow
              label="Status Online"
              badges={[
                {
                  intent: user.statusOnline ? 'success' : 'secondary',
                  label: user.statusOnline ? 'Online' : 'Offline',
                },
              ]}
            />
            <DetailRow
              label="Tanggal Resign"
              value={formatUserDateTime(user.resignedAt)}
            />
            <DetailRow
              label="Terakhir Online"
              value={formatUserDateTime(user.lastOnline)}
            />
          </View>

          <View style={styles.detailPanel}>
            <Text style={styles.detailPanelTitle}>Timestamps</Text>
            <DetailRow
              label="Dibuat Pada"
              value={formatUserDateTime(user.createdAt)}
            />
            <DetailRow
              label="Terakhir Diperbarui"
              value={formatUserDateTime(user.updatedAt)}
            />
          </View>
        </View>
      </KolamContentFrame>
    </View>
  );
}

function KolamUserEditSurface({
  onRouteChange,
  userId,
}: {
  onRouteChange?: (route: string) => void;
  userId: string;
}) {
  const [user, setUser] = React.useState<KolamUserListItem | null>(null);
  const [form, setForm] = React.useState<KolamUserEditForm>({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    phone_number: '',
    role: '',
    timezone: 'UTC+08:00',
    username: '',
  });
  const [roles, setRoles] = React.useState<KolamUserRoleOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [rolesLoading, setRolesLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;

    if (!userId) {
      setUser(null);
      setError('ID pengguna tidak valid.');
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError('');
    setMessage('');

    void getKolamUserDetail(userId)
      .then(result => {
        if (!active) {
          return;
        }
        setUser(result);
        if (result) {
          setForm(getUserEditFormFromUser(result));
        }
        if (!result) {
          setError('Pengguna tidak ditemukan.');
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
          setError('Gagal memuat data pengguna.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [userId]);

  React.useEffect(() => {
    let active = true;

    setRolesLoading(true);

    void getKolamUserRoles()
      .then(result => {
        if (active) {
          setRoles(result);
        }
      })
      .catch(() => {
        if (active) {
          setRoles([]);
          setError('Gagal memuat daftar peran.');
        }
      })
      .finally(() => {
        if (active) {
          setRolesLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading || error || !user) {
    return (
      <View style={styles.detailSurface}>
        <KolamContentFrame
          style={styles.detailCard}
          variant="settingsWebConfig"
        >
          <KolamEmptyState
            compact
            message={error || 'Mengambil data pengguna dari server.'}
            title={
              loading
                ? 'Memuat form pengguna'
                : error || 'Pengguna tidak ditemukan'
            }
          />
        </KolamContentFrame>
      </View>
    );
  }

  const encodedUserId = encodeURIComponent(user.id);
  const setField = (field: keyof KolamUserEditForm, value: string) => {
    setForm(current => ({...current, [field]: value}));
    setError('');
    setMessage('');
  };

  const handleSubmit = async () => {
    const validationError = validateEditUserForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const updated = await updateKolamUser({
        id: user.id,
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone_number: form.phone_number.trim(),
        role: form.role.trim(),
        timezone: form.timezone.trim(),
        username: form.username.trim() || undefined,
        ...(form.password.trim() ? {password: form.password} : {}),
      });
      const nextUser = updated ?? user;

      setUser(nextUser);
      setForm(getUserEditFormFromUser(nextUser));
      setMessage('Pengguna berhasil diperbarui.');
    } catch (err) {
      setError(getUserFormErrorMessage(err, 'Gagal memperbarui pengguna.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.detailSurface}>
      <View style={styles.detailActionRow}>
        <KolamButton
          disabled={saving}
          label="Daftar"
          onPress={() => onRouteChange?.('/list-of-users')}
        />
        <KolamButton
          disabled={saving}
          label="Detail"
          onPress={() =>
            onRouteChange?.(`/list-of-users/users/${encodedUserId}`)
          }
        />
        <KolamButton
          disabled={saving}
          intent="primary"
          label={saving ? 'Menyimpan...' : 'Simpan'}
          onPress={handleSubmit}
        />
      </View>

      <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
        <View style={styles.detailTitleBlock}>
          <Text style={styles.detailTitle}>Rubah Pengguna</Text>
          <Text style={styles.detailSubtitle}>
            Data pengguna dari server.
          </Text>
        </View>

        {error ? <Text style={styles.formErrorText}>{error}</Text> : null}
        {message ? <Text style={styles.formSuccessText}>{message}</Text> : null}

        <View style={styles.formGrid}>
          <UserFormField label="Username">
            <KolamFormTextField
              editable={!saving}
              onChangeText={value => setField('username', value)}
              style={styles.formInput}
              value={form.username}
            />
          </UserFormField>
          <View style={styles.formFieldWide}>
            <UserFormField label="Zona Waktu" required>
              <KolamDropdownSelect
                label="Zona Waktu"
                onChange={value => setField('timezone', value)}
                options={TIMEZONE_OPTIONS.map(timezone => ({
                  label: timezone.label,
                  value: timezone.value,
                }))}
                value={form.timezone}
              />
            </UserFormField>
          </View>
          <UserFormField label="Nama Depan" required>
            <KolamFormTextField
              editable={!saving}
              onChangeText={value => setField('first_name', value)}
              style={styles.formInput}
              value={form.first_name}
            />
          </UserFormField>
          <UserFormField label="Nama Belakang" required>
            <KolamFormTextField
              editable={!saving}
              onChangeText={value => setField('last_name', value)}
              style={styles.formInput}
              value={form.last_name}
            />
          </UserFormField>
          <UserFormField label="Email" required>
            <KolamFormTextField
              editable={!saving}
              mode="email"
              onChangeText={value => setField('email', value)}
              style={styles.formInput}
              value={form.email}
            />
          </UserFormField>
          <UserFormField label="Nomor Telepon" required>
            <KolamFormTextField
              editable={!saving}
              onChangeText={value => setField('phone_number', value)}
              style={styles.formInput}
              value={form.phone_number}
            />
          </UserFormField>
          <UserFormField label="Kata Sandi">
            <KolamFormTextField
              editable={!saving}
              mode="password"
              onChangeText={value => setField('password', value)}
              style={styles.formInput}
              value={form.password}
            />
          </UserFormField>
          <View style={styles.formFieldWide}>
            <UserFormField label="Peran" required>
              <KolamDropdownSelect
                label="Peran"
                onChange={value => setField('role', value)}
                options={[
                  {label: rolesLoading ? 'Memuat peran...' : 'Pilih Role', value: ''},
                  ...roles.map(role => ({
                    label: role.name || role.key,
                    value: role.key,
                  })),
                ]}
                value={form.role}
              />
            </UserFormField>
          </View>
        </View>
      </KolamContentFrame>
    </View>
  );
}

function DetailRow({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.detailValue}>
        {value || '-'}
      </Text>
    </View>
  );
}

function DetailBadgeRow({
  badges,
  label,
}: {
  badges: Array<{
    intent: React.ComponentProps<typeof KolamStatusBadge>['intent'];
    label: string;
  }>;
  label: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.detailBadgeRow}>
        {badges.map((badge, index) => (
          <KolamStatusBadge
            intent={badge.intent}
            key={`${badge.label}-${index}`}
            label={badge.label}
            numberOfLines={1}
          />
        ))}
      </View>
    </View>
  );
}

function UserFormField({
  children,
  label,
  required = false,
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>
        {label}
        {required ? <Text style={styles.formRequired}> *</Text> : null}
      </Text>
      {children}
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

function getUserAccountStatusIntent(
  user: KolamUserListItem,
): React.ComponentProps<typeof KolamStatusBadge>['intent'] {
  if (user.resignedAt || user.accountRestricted) {
    return 'danger';
  }

  return 'success';
}

function formatUserDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function validateCreateUserForm(form: KolamUserCreatePayload) {
  if (!form.username.trim()) {
    return 'Username wajib diisi';
  }

  if (!form.first_name.trim()) {
    return 'Nama depan wajib diisi';
  }

  if (!form.last_name.trim()) {
    return 'Nama belakang wajib diisi';
  }

  if (!form.email.trim()) {
    return 'Email wajib diisi';
  }

  if (!form.password.trim()) {
    return 'Kata sandi wajib diisi';
  }

  if (form.password.length < 6) {
    return 'Kata sandi minimal 6 karakter';
  }

  if (!form.phone_number.trim()) {
    return 'Nomor telepon wajib diisi';
  }

  if (!form.role.trim()) {
    return 'Peran wajib dipilih';
  }

  return '';
}

function getUserEditFormFromUser(user: KolamUserListItem): KolamUserEditForm {
  return {
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    password: '',
    phone_number: user.phoneNumber,
    role: user.role?.key ?? '',
    timezone: user.timezone || 'UTC+08:00',
    username: user.username,
  };
}

function validateEditUserForm(form: KolamUserEditForm) {
  if (!form.first_name.trim()) {
    return 'Nama depan wajib diisi';
  }

  if (!form.last_name.trim()) {
    return 'Nama belakang wajib diisi';
  }

  if (!form.email.trim()) {
    return 'Email wajib diisi';
  }

  if (!form.phone_number.trim()) {
    return 'Nomor telepon wajib diisi';
  }

  if (!form.timezone.trim()) {
    return 'Zona waktu wajib dipilih';
  }

  if (!form.role.trim()) {
    return 'Peran wajib dipilih';
  }

  if (form.password.trim() && form.password.length < 6) {
    return 'Kata sandi minimal 6 karakter';
  }

  return '';
}

function getUserFormErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return fallback;
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
  detailSurface: {
    gap: 12,
    width: '100%',
  },
  detailActionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  detailCard: {
    gap: 18,
    padding: 18,
  },
  detailTitleBlock: {
    gap: 4,
  },
  detailTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  detailSubtitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailPanel: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 320,
    flexGrow: 1,
    gap: 10,
    padding: 14,
  },
  detailPanelTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 22,
  },
  detailRow: {
    gap: 4,
  },
  detailLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  detailValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
  },
  detailBadgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formField: {
    flexBasis: 280,
    flexGrow: 1,
    gap: 6,
  },
  formFieldWide: {
    flexBasis: '100%',
    flexGrow: 1,
  },
  formLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  formRequired: {
    color: V.colors.danger,
  },
  formInput: {
    minHeight: 38,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  formInputReadOnly: {
    backgroundColor: V.colors.tableHeader,
    color: V.colors.mutedFg,
  },
  formErrorText: {
    borderColor: V.colors.danger,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  formSuccessText: {
    borderColor: V.colors.success,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.success,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
