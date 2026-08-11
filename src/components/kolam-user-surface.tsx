import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useKolamAuthContext} from '../context/kolam-app-contexts';
import {
  getKolamUserAccountStatusLabel,
  getKolamUserIdFromRoute,
  getKolamUserRouteMode,
  type KolamKasbonPendingSummary,
  type KolamUserAttendanceRecord,
  type KolamUserAttendanceSettings,
  type KolamUserBonusItem,
  type KolamUserBooleanFilter,
  type KolamUserBiodata,
  type KolamUserBiodataAddress,
  type KolamUserBiodataEmergencyContact,
  type KolamUserCreatePayload,
  type KolamUserDeductionItem,
  type KolamUserEmployeeProfile,
  type KolamUserEmployeeSchedule,
  type KolamUserFaceEnrollment,
  type KolamUserKasbonItem,
  type KolamUserListItem,
  type KolamUserListPagination,
  type KolamUserRatingListResult,
  type KolamUserRatingSummary,
  type KolamUserRoleOption,
} from '../domain/kolam-user';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {formatRupiah, formatRupiahCompactCurrency} from '../lib/money';
import {
  hasSettingsPermission,
  isSettingsSuperAdminRoleKey,
} from '../domain/settings-surface';
import {getKolamFileUrl} from '../lib/file-url';
import {resolveProfilePhotoUrl} from '../services/auth-api';
import {
  createKolamUser,
  deleteKolamUser,
  getKolamKasbonPendingSummary,
  getKolamUserAttendanceRecords,
  getKolamUserAttendanceSettings,
  getKolamUserBonusList,
  getKolamUserDeductionList,
  getKolamUserDetail,
  getKolamUserFaceEnrollment,
  getKolamUserKasbonList,
  getKolamUserList,
  getKolamUserRatingList,
  getKolamUserRatingSummary,
  getKolamUserRoles,
  resignKolamUser,
  updateKolamUser,
  updateKolamUserSalary,
  uploadKolamUserBiodataKtp,
} from '../services/kolam-user-api';
import {pickNativeImageFile} from '../services/native-file-picker';
import {KolamButton} from './kolam-button';
import {KolamSaveButton} from './kolam-save-button';
import {KolamDaftarButton} from './kolam-daftar-button';
import {KolamEditButton} from './kolam-edit-button';
import {KolamConfirmDialog} from './kolam-confirm-dialog';
import {KolamContentFrame} from './kolam-content-frame';
import {KolamDetailSummaryCard} from './kolam-detail-summary-card';
import {
  KolamDropdownSelect,
  KolamTableRowActionMenu,
} from './kolam-dropdown-select';
import {KolamDateField} from './kolam-date-field';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamFormTextField} from './kolam-form-text-field';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import {KolamNotesField} from './kolam-notes-field';
import {KolamRemoteImage} from './kolam-remote-image';
import {KolamStatusBadge} from './kolam-status-badge';
import {KolamTableFilterTrigger} from './kolam-table-filter-trigger';
import {KolamToggleRow} from './kolam-toggle-row';

const SEARCH_DEBOUNCE_MS = 350;
const USER_DEDUCTION_TABLE_PAGE_SIZE = 10;
const USER_KASBON_TABLE_PAGE_SIZE = 10;

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

const EMPTY_KASBON_PENDING_SUMMARY: KolamKasbonPendingSummary = {
  byUser: {},
  total: 0,
};

const EMPTY_USER_PAYROLL_SUMMARY = {
  bonuses: [] as KolamUserBonusItem[],
  deductions: [] as KolamUserDeductionItem[],
  kasbons: [] as KolamUserKasbonItem[],
};

const EMPTY_USER_RATING_SUMMARY: KolamUserRatingSummary = {
  averageRating: 0,
  counts: [1, 2, 3, 4, 5].map(rating => ({count: 0, rating})),
  totalRatings: 0,
};

const EMPTY_USER_RATING_LIST: KolamUserRatingListResult = {
  items: [],
  limit: 10,
  page: 1,
  total: 0,
};

const EMPTY_USER_ATTENDANCE_SETTINGS: KolamUserAttendanceSettings = {
  payrollCutoffDay: 28,
  requireFace: false,
  timezone: '',
  workStartTime: '',
};

const EMPTY_USER_BIODATA: KolamUserBiodata = {
  address: {
    city: '',
    postalCode: '',
    province: '',
    street: '',
  },
  dateOfBirth: '',
  emergencyContact: {
    name: '',
    phone: '',
    relation: '',
  },
  gender: '',
  maritalStatus: '',
  nationalId: '',
  photoKTP: '',
  photoKtpUri: '',
  placeOfBirth: '',
  religion: '',
  taxNumber: '',
};

type KolamUserEmployeeForm = Omit<
  KolamUserEmployeeProfile,
  'salary' | 'salaryDate' | 'yearIn'
> & {
  salary: string;
  salaryDate: string;
  yearIn: string;
};

const EMPTY_USER_EMPLOYEE: KolamUserEmployeeForm = {
  department: '',
  employeeNumber: '',
  firstTimeWorking: false,
  hireDate: '',
  isPkp: false,
  pkpNotes: '',
  position: '',
  salary: '',
  salaryDate: '',
  schedule: {
    shiftEnd: '18:00',
    shiftStart: '09:00',
    type: 'full_time',
    workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  },
  status: 'active',
  yearIn: '',
};

const EMPLOYEE_WORK_DAYS = [
  {id: 'Mon', label: 'Sen'},
  {id: 'Tue', label: 'Sel'},
  {id: 'Wed', label: 'Rab'},
  {id: 'Thu', label: 'Kam'},
  {id: 'Fri', label: 'Jum'},
  {id: 'Sat', label: 'Sab'},
  {id: 'Sun', label: 'Min'},
] as const;

type KolamUserEditForm = {
  account_restricted: boolean;
  access_am: boolean;
  access_inventory: boolean;
  access_pos: boolean;
  biodata: KolamUserBiodata;
  csActive: boolean;
  email: string;
  employee: KolamUserEmployeeForm;
  first_name: string;
  isEmployee: boolean;
  isOwner: boolean;
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
        <KolamDaftarButton
          disabled={saving}
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
          <UserFormField label="Nama Pengguna" required>
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
                  {label: rolesLoading ? 'Memuat peran...' : 'Pilih Peran', value: ''},
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
  const {authUser} = useKolamAuthContext();
  const [items, setItems] = React.useState<KolamUserListItem[]>([]);
  const [pagination, setPagination] =
    React.useState<KolamUserListPagination>(INITIAL_PAGINATION);
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [employeeFilter, setEmployeeFilter] =
    React.useState<KolamUserBooleanFilter>('all');
  const [activeFilterPanel, setActiveFilterPanel] = React.useState<
    'employee' | null
  >(null);
  const [deleteTarget, setDeleteTarget] =
    React.useState<KolamUserListItem | null>(null);
  const [deletingUser, setDeletingUser] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState('');
  const [kasbonPendingSummary, setKasbonPendingSummary] =
    React.useState<KolamKasbonPendingSummary>(EMPTY_KASBON_PENDING_SUMMARY);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const permissionContext = React.useMemo(
    () => ({
      permissions: authUser?.permissions,
      roleKey: authUser?.roleKey,
    }),
    [authUser?.permissions, authUser?.roleKey],
  );
  const canVerifyKasbon =
    isSettingsSuperAdminRoleKey(authUser?.roleKey ?? '') ||
    hasSettingsPermission(permissionContext, 'kasbon', 'verify');
  const canDeleteUser =
    isSettingsSuperAdminRoleKey(authUser?.roleKey ?? '') ||
    hasSettingsPermission(permissionContext, 'user', 'delete_by_admin');
  const currentUserId = String(authUser?.id ?? '');

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
      order: 'asc',
      page,
      search: debouncedSearch || undefined,
      sort: 'first_name',
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

  React.useEffect(() => {
    let active = true;

    if (!canVerifyKasbon) {
      setKasbonPendingSummary(EMPTY_KASBON_PENDING_SUMMARY);
      return () => {
        active = false;
      };
    }

    const loadPendingSummary = () => {
      void getKolamKasbonPendingSummary()
        .then(result => {
          if (active) {
            setKasbonPendingSummary(result);
          }
        })
        .catch(() => {
          if (active) {
            setKasbonPendingSummary(EMPTY_KASBON_PENDING_SUMMARY);
          }
        });
    };

    loadPendingSummary();
    const interval = setInterval(loadPendingSummary, 60000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [canVerifyKasbon]);

  const emptyTitle = loading
    ? 'Memuat pengguna'
    : error
      ? 'Daftar pengguna belum termuat'
      : debouncedSearch
        ? `Tidak ada pengguna untuk "${debouncedSearch}"`
        : 'Belum ada pengguna';
  const employeeFilterLabel =
    EMPLOYEE_FILTER_OPTIONS.find(option => option.value === employeeFilter)
      ?.label ?? 'Semua Status Karyawan';
  const safePage = Math.min(page, Math.max(1, pagination.totalPages));
  const userTableColumns = React.useMemo(
    () => createUserListColumns(kasbonPendingSummary),
    [kasbonPendingSummary],
  );
  const handleDeleteUser = async () => {
    if (!deleteTarget || deletingUser) {
      return;
    }

    setDeletingUser(true);
    setDeleteError('');

    try {
      await deleteKolamUser(deleteTarget.id);
      setDeleteTarget(null);
      setItems(current => current.filter(item => item.id !== deleteTarget.id));
      setPagination(current => ({
        ...current,
        total: Math.max(0, current.total - 1),
      }));
    } catch (err) {
      setDeleteError(
        getUserFormErrorMessage(err, 'Gagal menghapus pengguna.'),
      );
    } finally {
      setDeletingUser(false);
    }
  };

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
            {canVerifyKasbon && kasbonPendingSummary.total > 0 ? (
              <KolamStatusBadge
                intent="danger"
                label={`${kasbonPendingSummary.total} kasbon`}
                numberOfLines={1}
                style={styles.kasbonSummaryBadge}
              />
            ) : null}
            <KolamButton
              intent="primary"
              label="Baru"
              tone="positive"
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

      <KolamListTableComposition
        columns={userTableColumns}
        emptyTitle={emptyTitle}
        getRowKey={user => user.id}
        loading={loading}
        pagination={{
          onPageChange: setPage,
          page: safePage,
          pageSize,
          total: pagination.total,
        }}
        renderActions={user => (
          <KolamUserListActions
            canDeleteUser={canDeleteUser}
            currentUserId={currentUserId}
            onDeleteRequest={target => {
              setDeleteError('');
              setDeleteTarget(target);
            }}
            onRouteChange={onRouteChange}
            user={user}
          />
        )}
        rowStyle={styles.userListRow}
        rows={loading ? [] : items}
      />
      <KolamConfirmDialog
        cancelLabel={deletingUser ? 'Tunggu' : 'Batal'}
        confirmLabel={deletingUser ? 'Menghapus...' : 'Hapus permanen'}
        destructive
        message={
          deleteTarget
            ? `Hapus permanen pengguna "${deleteTarget.displayName}"? Backend akan menjalankan hard cleanup: unlink referensi transaksi/ownership/notifikasi, menghapus kandang/species/user storage/cart milik user, menghapus dokumen user, dan membersihkan file terkait. Aksi ini tidak bisa dibatalkan.${deleteError ? `\n\n${deleteError}` : ''}`
            : 'Pilih pengguna yang akan dihapus permanen.'
        }
        onCancel={() => {
          if (!deletingUser) {
            setDeleteTarget(null);
            setDeleteError('');
          }
        }}
        onConfirm={() => {
          void handleDeleteUser();
        }}
        title="Hapus permanen pengguna"
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
  const {authUser} = useKolamAuthContext();
  const [user, setUser] = React.useState<KolamUserListItem | null>(null);
  const [payrollSummary, setPayrollSummary] = React.useState(
    EMPTY_USER_PAYROLL_SUMMARY,
  );
  const [deductionPage, setDeductionPage] = React.useState(1);
  const [kasbonPage, setKasbonPage] = React.useState(1);
  const [payrollLoading, setPayrollLoading] = React.useState(false);
  const [payrollError, setPayrollError] = React.useState('');
  const [ratingSummary, setRatingSummary] = React.useState(
    EMPTY_USER_RATING_SUMMARY,
  );
  const [ratingList, setRatingList] = React.useState(EMPTY_USER_RATING_LIST);
  const [ratingLoading, setRatingLoading] = React.useState(false);
  const [ratingError, setRatingError] = React.useState('');
  const [attendanceSettings, setAttendanceSettings] = React.useState(
    EMPTY_USER_ATTENDANCE_SETTINGS,
  );
  const [attendanceRecords, setAttendanceRecords] = React.useState<
    KolamUserAttendanceRecord[]
  >([]);
  const [faceEnrollment, setFaceEnrollment] =
    React.useState<KolamUserFaceEnrollment | null>(null);
  const [attendancePeriodKey, setAttendancePeriodKey] = React.useState('');
  const [attendanceLoading, setAttendanceLoading] = React.useState(false);
  const [attendanceError, setAttendanceError] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const permissionContext = React.useMemo(
    () => ({
      permissions: authUser?.permissions,
      roleKey: authUser?.roleKey,
    }),
    [authUser?.permissions, authUser?.roleKey],
  );
  const currentUserId = String(authUser?.id ?? '');
  const isSuperAdmin = isSettingsSuperAdminRoleKey(authUser?.roleKey ?? '');
  const canViewSalary =
    Boolean(user?.id) &&
    (currentUserId === String(user?.id) ||
      isSuperAdmin ||
      hasSettingsPermission(permissionContext, 'user', 'view_salary'));
  const canViewKasbon =
    Boolean(user?.id) &&
    (currentUserId === String(user?.id) ||
      isSuperAdmin ||
      hasSettingsPermission(permissionContext, 'kasbon', 'view'));
  const canViewBonus =
    Boolean(user?.isEmployee) &&
    (isSuperAdmin || hasSettingsPermission(permissionContext, 'salary', 'view'));
  const canViewDeductions =
    Boolean(user?.isEmployee) &&
    (isSuperAdmin ||
      hasSettingsPermission(permissionContext, 'salary_deduction', 'view'));
  const canViewRating =
    Boolean(user?.isEmployee) &&
    (isSuperAdmin || hasSettingsPermission(permissionContext, 'chat', 'view'));
  const canViewAttendance =
    Boolean(user?.isEmployee) &&
    (isSuperAdmin ||
      hasSettingsPermission(permissionContext, 'salary', 'view') ||
      hasSettingsPermission(permissionContext, 'staff_attendance', 'view'));
  const deductionColumns = React.useMemo<
    Array<KolamListTableColumn<KolamUserDeductionItem>>
  >(
    () => [
      {
        align: 'left',
        flex: 1.45,
        id: 'code',
        label: 'Kode',
        render: item => (
          <Text style={styles.userMetaText}>
            {item.code || 'Potongan'}
          </Text>
        ),
      },
      {
        align: 'center',
        flex: 0.65,
        id: 'amount',
        label: 'Jumlah',
        render: item => (
          <Text style={[styles.payrollEntryAmount, styles.userTableTextCenter]}>
            {formatUserCurrency(item.amount)}
          </Text>
        ),
      },
      {
        align: 'center',
        flex: 1.25,
        id: 'reason',
        label: 'Alasan',
        render: item => (
          <Text
            numberOfLines={2}
            style={[styles.detailSubtitle, styles.userTableTextCenter]}>
            {item.reason || item.rejectionReason || '-'}
          </Text>
        ),
      },
      {
        align: 'center',
        flex: 0.75,
        id: 'status',
        label: 'Status',
        render: item => (
          <View style={styles.userTableBadgeCell}>
            <KolamStatusBadge
              intent={getPayrollStatusIntent(item.status)}
              label={formatPayrollStatus(item.status)}
              numberOfLines={1}
              style={styles.userTableBadge}
            />
          </View>
        ),
      },
      {
        align: 'center',
        flex: 0.95,
        id: 'created',
        label: 'Dibuat',
        render: item => (
          <Text style={[styles.detailSubtitle, styles.userTableTextCenter]}>
            {formatUserDateTime(item.createdAt)}
          </Text>
        ),
      },
      {
        align: 'center',
        flex: 0.95,
        id: 'reviewed',
        label: 'Direview',
        render: item => (
          <Text style={[styles.detailSubtitle, styles.userTableTextCenter]}>
            {formatUserDateTime(item.reviewedAt)}
          </Text>
        ),
      },
    ],
    [],
  );
  const kasbonColumns = React.useMemo<
    Array<KolamListTableColumn<KolamUserKasbonItem>>
  >(
    () => [
      {
        align: 'left',
        flex: 1.35,
        id: 'code',
        label: 'Kode',
        render: item => (
          <Text style={styles.userMetaText}>{item.code || 'Kasbon'}</Text>
        ),
      },
      {
        align: 'center',
        flex: 0.7,
        id: 'amount',
        label: 'Jumlah',
        render: item => (
          <Text style={[styles.payrollEntryAmount, styles.userTableTextCenter]}>
            {formatUserCurrency(item.amount)}
          </Text>
        ),
      },
      {
        align: 'center',
        flex: 1.2,
        id: 'payment',
        label: 'Pembayaran',
        render: item => (
          <Text
            numberOfLines={2}
            style={[styles.detailSubtitle, styles.userTableTextCenter]}>
            {formatKasbonPaymentInfo(item)}
          </Text>
        ),
      },
      {
        align: 'center',
        flex: 1.15,
        id: 'reason',
        label: 'Alasan',
        render: item => (
          <Text
            numberOfLines={2}
            style={[styles.detailSubtitle, styles.userTableTextCenter]}>
            {item.reason || item.rejectionReason || '-'}
          </Text>
        ),
      },
      {
        align: 'center',
        flex: 0.75,
        id: 'status',
        label: 'Status',
        render: item => (
          <View style={styles.userTableBadgeCell}>
            <KolamStatusBadge
              intent={getPayrollStatusIntent(item.status)}
              label={formatPayrollStatus(item.status)}
              numberOfLines={1}
              style={styles.userTableBadge}
            />
          </View>
        ),
      },
      {
        align: 'center',
        flex: 0.9,
        id: 'month',
        label: 'Bulan',
        render: item => (
          <Text style={[styles.detailSubtitle, styles.userTableTextCenter]}>
            {item.forMonth
              ? formatUserLongDate(item.forMonth)
              : formatUserDateTime(item.createdAt)}
          </Text>
        ),
      },
    ],
    [],
  );
  const visibleDeductions = React.useMemo(() => {
    const pageStart = (deductionPage - 1) * USER_DEDUCTION_TABLE_PAGE_SIZE;

    return payrollSummary.deductions.slice(
      pageStart,
      pageStart + USER_DEDUCTION_TABLE_PAGE_SIZE,
    );
  }, [deductionPage, payrollSummary.deductions]);
  const visibleKasbons = React.useMemo(() => {
    const pageStart = (kasbonPage - 1) * USER_KASBON_TABLE_PAGE_SIZE;

    return payrollSummary.kasbons.slice(
      pageStart,
      pageStart + USER_KASBON_TABLE_PAGE_SIZE,
    );
  }, [kasbonPage, payrollSummary.kasbons]);

  React.useEffect(() => {
    const maxPage = Math.max(
      1,
      Math.ceil(
        payrollSummary.deductions.length / USER_DEDUCTION_TABLE_PAGE_SIZE,
      ),
    );

    if (deductionPage > maxPage) {
      setDeductionPage(maxPage);
    }
  }, [deductionPage, payrollSummary.deductions.length]);

  React.useEffect(() => {
    const maxPage = Math.max(
      1,
      Math.ceil(payrollSummary.kasbons.length / USER_KASBON_TABLE_PAGE_SIZE),
    );

    if (kasbonPage > maxPage) {
      setKasbonPage(maxPage);
    }
  }, [kasbonPage, payrollSummary.kasbons.length]);

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

  React.useEffect(() => {
    let active = true;

    if (!user?.id || !user.isEmployee) {
      setPayrollSummary(EMPTY_USER_PAYROLL_SUMMARY);
      setPayrollLoading(false);
      setPayrollError('');
      return () => {
        active = false;
      };
    }

    const requests = [
      canViewBonus
        ? getKolamUserBonusList(user.id).catch(() => [] as KolamUserBonusItem[])
        : Promise.resolve([] as KolamUserBonusItem[]),
      canViewDeductions
        ? getKolamUserDeductionList(user.id).catch(
            () => [] as KolamUserDeductionItem[],
          )
        : Promise.resolve([] as KolamUserDeductionItem[]),
      canViewKasbon
        ? getKolamUserKasbonList(user.id).catch(() => [] as KolamUserKasbonItem[])
        : Promise.resolve([] as KolamUserKasbonItem[]),
    ] as const;

    if (!canViewBonus && !canViewDeductions && !canViewKasbon) {
      setPayrollSummary(EMPTY_USER_PAYROLL_SUMMARY);
      setPayrollLoading(false);
      setPayrollError('');
      return () => {
        active = false;
      };
    }

    setPayrollLoading(true);
    setPayrollError('');

    void Promise.all(requests)
      .then(([bonuses, deductions, kasbons]) => {
        if (active) {
          setPayrollSummary({bonuses, deductions, kasbons});
        }
      })
      .catch(() => {
        if (active) {
          setPayrollSummary(EMPTY_USER_PAYROLL_SUMMARY);
          setPayrollError('Gagal memuat data payroll.');
        }
      })
      .finally(() => {
        if (active) {
          setPayrollLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [
    canViewBonus,
    canViewDeductions,
    canViewKasbon,
    user?.id,
    user?.isEmployee,
  ]);

  React.useEffect(() => {
    let active = true;

    if (!user?.id || !canViewRating) {
      setRatingSummary(EMPTY_USER_RATING_SUMMARY);
      setRatingList(EMPTY_USER_RATING_LIST);
      setRatingLoading(false);
      setRatingError('');
      return () => {
        active = false;
      };
    }

    setRatingLoading(true);
    setRatingError('');

    void Promise.all([
      getKolamUserRatingSummary(user.id),
      getKolamUserRatingList(user.id, {limit: 10, page: 1}),
    ])
      .then(([summary, list]) => {
        if (active) {
          setRatingSummary(summary);
          setRatingList(list);
        }
      })
      .catch(() => {
        if (active) {
          setRatingSummary(EMPTY_USER_RATING_SUMMARY);
          setRatingList(EMPTY_USER_RATING_LIST);
          setRatingError('Gagal memuat data rating chat.');
        }
      })
      .finally(() => {
        if (active) {
          setRatingLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [canViewRating, user?.id]);

  React.useEffect(() => {
    let active = true;

    if (!user?.id || !canViewAttendance) {
      setAttendanceSettings(EMPTY_USER_ATTENDANCE_SETTINGS);
      setAttendanceRecords([]);
      setFaceEnrollment(null);
      setAttendancePeriodKey('');
      setAttendanceLoading(false);
      setAttendanceError('');
      return () => {
        active = false;
      };
    }

    setAttendanceLoading(true);
    setAttendanceError('');

    void getKolamUserAttendanceSettings()
      .then(settings => {
        const periodKey = getCurrentAttendancePeriodKey(
          settings.payrollCutoffDay,
        );

        return Promise.all([
          Promise.resolve(settings),
          Promise.resolve(periodKey),
          getKolamUserAttendanceRecords(user.id, periodKey),
          getKolamUserFaceEnrollment(user.id).catch(() => null),
        ]);
      })
      .then(([settings, periodKey, records, enrollment]) => {
        if (active) {
          setAttendanceSettings(settings);
          setAttendancePeriodKey(periodKey);
          setAttendanceRecords(records);
          setFaceEnrollment(enrollment);
        }
      })
      .catch(() => {
        if (active) {
          setAttendanceSettings(EMPTY_USER_ATTENDANCE_SETTINGS);
          setAttendanceRecords([]);
          setFaceEnrollment(null);
          setAttendancePeriodKey('');
          setAttendanceError('Gagal memuat data absensi karyawan.');
        }
      })
      .finally(() => {
        if (active) {
          setAttendanceLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [canViewAttendance, user?.id]);

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
  const profilePhotoUrl = resolveProfilePhotoUrl(user.profilePicture);

  return (
    <View style={styles.detailSurface}>
      <View style={styles.detailActionRow}>
        <KolamDaftarButton
          onPress={() => onRouteChange?.('/list-of-users')}
        />
        <KolamEditButton
          intent="primary"
          onPress={() =>
            onRouteChange?.(`/list-of-users/users/${encodedUserId}/edit`)
          }
        />
      </View>

      <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
        <KolamDetailSummaryCard
          description="Data profil utama pengguna"
          fieldColumns={3}
          fields={[
            {
              id: 'name',
              label: 'Nama',
              value: user.displayName,
            },
            {
              id: 'email',
              label: 'Email',
              value: user.email || '-',
            },
            {
              id: 'phone',
              label: 'Nomor Telepon',
              value: user.phoneNumber || '-',
            },
            {
              id: 'role',
              label: 'Peran',
              value: (
                <KolamStatusBadge
                  intent="secondary"
                  label={user.roleLabel || '-'}
                />
              ),
            },
            {
              id: 'employee-status',
              label: 'Status Karyawan',
              value: (
                <KolamStatusBadge
                  intent={user.isEmployee ? 'success' : 'secondary'}
                  label={user.isEmployee ? 'Karyawan' : 'Bukan karyawan'}
                />
              ),
            },
            {
              id: 'flags',
              label: 'Flag',
              value: (
                <View style={styles.detailBadgeRow}>
                  {[
                    ...(user.isOwner
                      ? [{intent: 'primary' as const, label: 'Pemilik'}]
                      : []),
                    ...(user.isEmployee
                      ? [{intent: 'secondary' as const, label: 'Karyawan'}]
                      : []),
                    ...(user.csActive
                      ? [{intent: 'success' as const, label: 'CS Aktif'}]
                      : []),
                    ...(!user.isOwner && !user.isEmployee && !user.csActive
                      ? [{intent: 'secondary' as const, label: '-'}]
                      : []),
                  ].map(flag => (
                    <KolamStatusBadge
                      intent={flag.intent}
                      key={flag.label}
                      label={flag.label}
                    />
                  ))}
                </View>
              ),
            },
            {
              id: 'gender',
              label: 'Jenis Kelamin',
              value: formatUserGender(user.biodata.gender),
            },
            {
              id: 'birth-date',
              label: 'Tanggal Lahir',
              value: formatUserLongDate(user.biodata.dateOfBirth),
            },
            {
              id: 'birth-place',
              label: 'Tempat Lahir',
              value: user.biodata.placeOfBirth || '-',
            },
            {
              id: 'marital-status',
              label: 'Status Pernikahan',
              value: formatUserMaritalStatus(user.biodata.maritalStatus),
            },
            {
              id: 'religion',
              label: 'Agama',
              value: user.biodata.religion || '-',
            },
            {
              id: 'national-id',
              label: 'NIK (KTP)',
              value: user.biodata.nationalId || '-',
            },
            {
              id: 'tax-number',
              label: 'NPWP',
              value: user.biodata.taxNumber || '-',
            },
            {
              id: 'address',
              label: 'Alamat',
              value: formatUserAddress(user.biodata.address),
            },
            {
              id: 'emergency-contact',
              label: 'Kontak Darurat',
              value: formatUserEmergencyContact(user.biodata.emergencyContact),
            },
          ]}
          leading={
            <View style={styles.userProfileBlock}>
              {profilePhotoUrl ? (
                <KolamRemoteImage
                  accessibilityLabel={`Foto profil ${user.displayName}`}
                  resizeMode="cover"
                  scope="user-profile"
                  sourceUri={profilePhotoUrl}
                  style={styles.userProfileImage}
                />
              ) : (
                <View style={styles.userProfileFallback}>
                  <Text style={styles.userProfileInitials}>
                    {getUserInitials(user.displayName)}
                  </Text>
                </View>
              )}
            </View>
          }
          sections={
            user.biodata.photoKtpUri
              ? [
                  {
                    id: 'ktp-photo',
                    title: 'Foto KTP',
                    content: (
                      <KolamRemoteImage
                        accessibilityLabel={`Foto KTP ${user.displayName}`}
                        resizeMode="cover"
                        scope="user-ktp"
                        sourceUri={user.biodata.photoKtpUri}
                        style={styles.userKtpImage}
                      />
                    ),
                  },
                ]
              : undefined
          }
          style={styles.userSummaryCard}
          title="Informasi dasar"
        />

        <KolamDetailSummaryCard
          description="Status akun dan data kepegawaian"
          fieldColumns={4}
          fields={[
            {
              id: 'account-status',
              label: 'Status Akun',
              value: (
                <KolamStatusBadge
                  intent={getUserAccountStatusIntent(user)}
                  label={getKolamUserAccountStatusLabel(user)}
                />
              ),
            },
            ...(user.resignedAt
              ? [
                  {
                    id: 'resigned-at',
                    label: 'Tanggal Resign',
                    value: formatUserDateTime(user.resignedAt),
                  },
                ]
              : []),
            {
              id: 'cs-assignment',
              label: 'Assign sebagai CS',
              value: (
                <KolamStatusBadge
                  intent={user.csActive ? 'success' : 'secondary'}
                  label={user.csActive ? 'CS Aktif' : 'Tidak Ditugaskan'}
                />
              ),
            },
            {
              id: 'online-status',
              label: 'Status Online',
              value: (
                <KolamStatusBadge
                  intent={user.statusOnline ? 'success' : 'secondary'}
                  label={user.statusOnline ? 'Online' : 'Offline'}
                />
              ),
            },
            {
              id: 'last-online',
              label: 'Terakhir Online',
              value: formatUserDateTime(user.lastOnline),
            },
            {
              id: 'created-at',
              label: 'Dibuat Pada',
              value: formatUserDateTime(user.createdAt),
            },
            {
              id: 'updated-at',
              label: 'Terakhir Diperbarui',
              value: formatUserDateTime(user.updatedAt),
            },
            {
              id: 'access-pos',
              label: 'Akses POS',
              value: (
                <KolamStatusBadge
                  intent={user.accessPos ? 'success' : 'danger'}
                  label={user.accessPos ? 'Memiliki Akses' : 'Tidak Ada Akses'}
                />
              ),
            },
            {
              id: 'access-inventory',
              label: 'Akses Inventori',
              value: (
                <KolamStatusBadge
                  intent={user.accessInventory ? 'success' : 'danger'}
                  label={
                    user.accessInventory ? 'Memiliki Akses' : 'Tidak Ada Akses'
                  }
                />
              ),
            },
            {
              id: 'access-am',
              label: 'Akses AM',
              value: (
                <KolamStatusBadge
                  intent={user.accessAm ? 'success' : 'danger'}
                  label={user.accessAm ? 'Memiliki Akses' : 'Tidak Ada Akses'}
                />
              ),
            },
            ...(user.isEmployee
              ? [
                  {
                    id: 'employee-number',
                    label: 'Nomor Karyawan',
                    value: user.employee.employeeNumber || '-',
                  },
                  {
                    id: 'position',
                    label: 'Jabatan',
                    value: user.employee.position || '-',
                  },
                  {
                    id: 'department',
                    label: 'Departemen',
                    value: user.employee.department || '-',
                  },
                  {
                    id: 'employee-status',
                    label: 'Status',
                    value: (
                      <KolamStatusBadge
                        intent={getUserEmployeeStatusIntent(user.employee.status)}
                        label={formatUserEmployeeStatus(user.employee.status)}
                      />
                    ),
                  },
                  {
                    id: 'hire-date',
                    label: 'Tanggal Mulai Bekerja',
                    value: formatUserLongDate(user.employee.hireDate),
                  },
                  {
                    id: 'work-duration',
                    label: 'Masa Kerja',
                    value: formatUserWorkDuration(user.employee.hireDate),
                  },
                  {
                    id: 'first-time-working',
                    label: 'Pekerjaan Pertama',
                    value: (
                      <KolamStatusBadge
                        intent={
                          user.employee.firstTimeWorking
                            ? 'success'
                            : 'secondary'
                        }
                        label={user.employee.firstTimeWorking ? 'Ya' : 'Tidak'}
                      />
                    ),
                  },
                  {
                    id: 'schedule',
                    label: 'Jadwal',
                    value: formatUserScheduleType(user.employee.schedule.type),
                  },
                  {
                    id: 'shift-hours',
                    label: 'Jam Shift',
                    value: formatUserShiftRange(user.employee.schedule),
                  },
                  {
                    id: 'work-days',
                    label: 'Hari Kerja',
                    value: formatUserWorkDays(user.employee.schedule.workDays),
                  },
                  ...(canViewSalary
                    ? [
                        {
                          id: 'salary',
                          label: 'Gaji Bulanan',
                          value: formatUserCurrency(user.employee.salary),
                        },
                        {
                          id: 'salary-date',
                          label: 'Tanggal Gajian',
                          value:
                            user.employee.salaryDate == null
                              ? '-'
                              : `Tanggal ${user.employee.salaryDate} setiap bulan`,
                        },
                      ]
                    : []),
                  {
                    id: 'pkp-status',
                    label: 'Status PKP',
                    value: (
                      <KolamStatusBadge
                        intent={user.employee.isPkp ? 'success' : 'secondary'}
                        label={
                          user.employee.isPkp
                            ? 'PKP berlaku'
                            : 'Bukan PKP / tidak berlaku'
                        }
                      />
                    ),
                  },
                  ...(user.employee.isPkp && user.employee.pkpNotes
                    ? [
                        {
                          id: 'pkp-notes',
                          label: 'Catatan PKP',
                          value: user.employee.pkpNotes,
                        },
                      ]
                    : []),
                ]
              : []),
          ]}
          style={styles.userSummaryCard}
          title="Status akun & karyawan"
        />

        {user.isEmployee && canViewDeductions ? (
          <View style={styles.detailPanel}>
            <Text style={styles.detailPanelTitle}>Potongan Gaji</Text>
            <KolamListTableComposition
              columns={deductionColumns}
              emptyTitle={
                payrollLoading
                  ? 'Memuat potongan gaji...'
                  : 'Tidak ada pengajuan potongan gaji.'
              }
              getRowKey={item => item.id || item.code}
              loading={payrollLoading}
              pagination={{
                onPageChange: setDeductionPage,
                page: deductionPage,
                pageSize: USER_DEDUCTION_TABLE_PAGE_SIZE,
                total: payrollSummary.deductions.length,
              }}
              rows={payrollLoading ? [] : visibleDeductions}
            />
          </View>
        ) : null}

        {user.isEmployee && canViewKasbon ? (
          <View style={styles.detailPanel}>
            <Text style={styles.detailPanelTitle}>
              Kasbon (Uang Muka Gaji)
            </Text>
            <KolamListTableComposition
              columns={kasbonColumns}
              emptyTitle={
                payrollLoading
                  ? 'Memuat kasbon...'
                  : 'Tidak ada pengajuan kasbon.'
              }
              getRowKey={item => item.id || item.code}
              loading={payrollLoading}
              pagination={{
                onPageChange: setKasbonPage,
                page: kasbonPage,
                pageSize: USER_KASBON_TABLE_PAGE_SIZE,
                total: payrollSummary.kasbons.length,
              }}
              rows={payrollLoading ? [] : visibleKasbons}
            />
          </View>
        ) : null}

        {user.isEmployee && canViewBonus ? (
          <View style={styles.detailGrid}>
            <View style={styles.detailPanel}>
              <Text style={styles.detailPanelTitle}>Riwayat Bonus</Text>
              {payrollLoading ? (
                <Text style={styles.detailSubtitle}>Memuat bonus...</Text>
              ) : payrollSummary.bonuses.length ? (
                payrollSummary.bonuses.map(item => (
                  <View key={item.id || item.code} style={styles.payrollEntry}>
                    <View style={styles.payrollEntryHeader}>
                      <Text numberOfLines={1} style={styles.payrollEntryTitle}>
                        {item.code || 'Bonus'}
                      </Text>
                      <KolamStatusBadge
                        intent={getPayrollStatusIntent(item.status)}
                        label={formatPayrollStatus(item.status)}
                        numberOfLines={1}
                      />
                    </View>
                    <Text style={styles.payrollEntryAmount}>
                      {formatUserCurrency(item.amount)}
                    </Text>
                    <Text numberOfLines={2} style={styles.detailSubtitle}>
                      {item.reason || '-'}
                    </Text>
                    <Text style={styles.payrollEntryDate}>
                      {formatUserDateTime(item.executedAt || item.createdAt)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.detailSubtitle}>
                  Belum ada bonus yang diberikan.
                </Text>
              )}
            </View>
          </View>
        ) : null}
        {user.isEmployee &&
        (canViewBonus || canViewDeductions || canViewKasbon) &&
        payrollError ? (
          <Text style={styles.formErrorText}>{payrollError}</Text>
        ) : null}

        {user.isEmployee && (canViewRating || canViewAttendance) ? (
          <View style={styles.detailGrid}>
            {canViewRating ? (
              <View style={styles.detailPanel}>
                <Text style={styles.detailPanelTitle}>Chat Rating</Text>
                {ratingLoading ? (
                  <Text style={styles.detailSubtitle}>Memuat rating chat...</Text>
                ) : ratingSummary.totalRatings > 0 ? (
                  <>
                    <View style={styles.ratingSummaryRow}>
                      <Text style={styles.ratingScore}>
                        {ratingSummary.averageRating.toFixed(1)}
                      </Text>
                      <View style={styles.ratingSummaryCopy}>
                        <Text style={styles.ratingStars}>
                          {formatUserRatingStars(ratingSummary.averageRating)}
                        </Text>
                        <Text style={styles.detailSubtitle}>
                          {ratingSummary.totalRatings} rating
                        </Text>
                      </View>
                    </View>
                    {ratingSummary.counts
                      .slice()
                      .sort((a, b) => b.rating - a.rating)
                      .map(item => (
                        <View key={item.rating} style={styles.ratingCountRow}>
                          <Text style={styles.ratingCountLabel}>
                            {item.rating} bintang
                          </Text>
                          <View style={styles.ratingBarTrack}>
                            <View
                              style={[
                                styles.ratingBarFill,
                                {
                                  width: `${Math.min(
                                    100,
                                    ratingSummary.totalRatings
                                      ? (item.count /
                                          ratingSummary.totalRatings) *
                                          100
                                      : 0,
                                  )}%`,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.ratingCountValue}>
                            {item.count}
                          </Text>
                        </View>
                      ))}
                  </>
                ) : (
                  <Text style={styles.detailSubtitle}>Belum ada rating.</Text>
                )}
                {ratingError ? (
                  <Text style={styles.formErrorText}>{ratingError}</Text>
                ) : null}
              </View>
            ) : null}

            {canViewRating && ratingList.items.length ? (
              <View style={styles.detailPanel}>
                <Text style={styles.detailPanelTitle}>Rating Terbaru</Text>
                {ratingList.items.map(item => (
                  <View key={item.id || item.createdAt} style={styles.payrollEntry}>
                    <View style={styles.payrollEntryHeader}>
                      <Text style={styles.payrollEntryTitle}>
                        {formatUserRatingStars(item.rating)}
                      </Text>
                      <Text style={styles.payrollEntryDate}>
                        {formatUserDateTime(item.createdAt)}
                      </Text>
                    </View>
                    <Text numberOfLines={3} style={styles.detailValue}>
                      {item.comment || 'Tanpa komentar'}
                    </Text>
                    <Text numberOfLines={2} style={styles.detailSubtitle}>
                      {[item.contactName, item.platform, item.lastMessagePreview]
                        .filter(Boolean)
                        .join(' - ') || '-'}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {canViewAttendance ? (
              <View style={styles.detailPanel}>
                <Text style={styles.detailPanelTitle}>Absensi Karyawan</Text>
                {attendanceLoading ? (
                  <Text style={styles.detailSubtitle}>Memuat absensi...</Text>
                ) : (
                  <>
                    <DetailRow
                      label="Periode Gaji"
                      value={
                        attendancePeriodKey
                          ? formatAttendancePeriodLabel(
                              attendancePeriodKey,
                              attendanceSettings.payrollCutoffDay,
                            )
                          : '-'
                      }
                    />
                    <DetailRow
                      label="Face Enrollment"
                      value={formatFaceEnrollment(faceEnrollment)}
                    />
                    {faceEnrollment?.photoPath ? (
                      <DetailRow
                        label="Foto Referensi"
                        numberOfLines={2}
                        value={faceEnrollment.photoPath}
                      />
                    ) : null}
                    {attendanceRecords.length ? (
                      attendanceRecords.map(item => (
                        <View
                          key={item.id || item.dateKey}
                          style={styles.attendanceEntry}
                        >
                          <View style={styles.payrollEntryHeader}>
                            <Text style={styles.payrollEntryTitle}>
                              {formatAttendanceDate(item.dateKey)}
                            </Text>
                            <KolamStatusBadge
                              intent={getAttendanceStatusIntent(item.status)}
                              label={formatAttendanceStatus(item.status)}
                              numberOfLines={1}
                            />
                          </View>
                          <View style={styles.attendanceMetaGrid}>
                            <DetailRow
                              label="Check-in"
                              value={formatUserDateTime(item.checkInAt)}
                            />
                            <DetailRow
                              label="Check-out"
                              value={formatUserDateTime(item.checkOutAt)}
                            />
                            <DetailRow
                              label="Potongan"
                              value={formatAttendanceDeduction(item)}
                            />
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.detailSubtitle}>
                        Belum ada catatan absensi pada periode ini.
                      </Text>
                    )}
                  </>
                )}
                {attendanceError ? (
                  <Text style={styles.formErrorText}>{attendanceError}</Text>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}
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
  const {authUser} = useKolamAuthContext();
  const [user, setUser] = React.useState<KolamUserListItem | null>(null);
  const [form, setForm] = React.useState<KolamUserEditForm>({
    account_restricted: false,
    access_am: false,
    access_inventory: false,
    access_pos: false,
    biodata: EMPTY_USER_BIODATA,
    csActive: false,
    email: '',
    employee: EMPTY_USER_EMPLOYEE,
    first_name: '',
    isEmployee: false,
    isOwner: false,
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
  const [uploadingKtp, setUploadingKtp] = React.useState(false);
  const [resigning, setResigning] = React.useState(false);
  const [resignConfirmVisible, setResignConfirmVisible] = React.useState(false);
  const [ktpPreviewUri, setKtpPreviewUri] = React.useState('');
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

  React.useEffect(() => {
    setKtpPreviewUri(user?.biodata.photoKtpUri ?? '');
  }, [user?.biodata.photoKtpUri]);

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
  const permissionContext = {
    permissions: authUser?.permissions,
    roleKey: authUser?.roleKey,
  };
  const canToggleOwner = isSettingsSuperAdminRoleKey(authUser?.roleKey ?? '');
  const canAccess =
    canToggleOwner ||
    hasSettingsPermission(permissionContext, 'user', 'update_by_admin');
  const canToggleEmployee =
    canToggleOwner ||
    hasSettingsPermission(permissionContext, 'user', 'flag_employee');
  const currentUserId = String(authUser?.id ?? '');
  const canViewSalary =
    Boolean(user.id) &&
    currentUserId !== String(user.id) &&
    (canToggleOwner ||
      hasSettingsPermission(permissionContext, 'user', 'view_salary'));
  const isResigned = Boolean(user.resignedAt);
  const isSelfUser = currentUserId === String(user.id);
  const isTargetSuperAdmin = isSettingsSuperAdminRoleKey(user.role?.key ?? '');
  const canResetPassword = canToggleOwner;
  const canResign = canAccess && !isResigned && !isSelfUser && !isTargetSuperAdmin;
  const canShowResignInfo = !isResigned && !isSelfUser && !isTargetSuperAdmin;
  const formDisabled = saving || resigning || isResigned || !canAccess;

  if (!canAccess) {
    return (
      <View style={styles.detailSurface}>
        <KolamContentFrame
          style={styles.detailCard}
          variant="settingsWebConfig"
        >
          <KolamEmptyState
            compact
            message="Akun ini tidak memiliki izin user:update_by_admin untuk rubah pengguna."
            title="Akses ditolak"
          />
        </KolamContentFrame>
      </View>
    );
  }

  const setField = (field: keyof KolamUserEditForm, value: string) => {
    setForm(current => ({...current, [field]: value}));
    setError('');
    setMessage('');
  };
  const setBooleanField = (
    field: Extract<
      keyof KolamUserEditForm,
      | 'account_restricted'
      | 'access_am'
      | 'access_inventory'
      | 'access_pos'
      | 'csActive'
      | 'isEmployee'
      | 'isOwner'
    >,
    value: boolean,
  ) => {
    setForm(current => ({...current, [field]: value}));
    setError('');
    setMessage('');
  };
  const setBiodataField = (
    field: Exclude<keyof KolamUserBiodata, 'address' | 'emergencyContact'>,
    value: string,
  ) => {
    setForm(current => ({
      ...current,
      biodata: {...current.biodata, [field]: value},
    }));
    setError('');
    setMessage('');
  };
  const setBiodataAddressField = (
    field: keyof KolamUserBiodataAddress,
    value: string,
  ) => {
    setForm(current => ({
      ...current,
      biodata: {
        ...current.biodata,
        address: {...current.biodata.address, [field]: value},
      },
    }));
    setError('');
    setMessage('');
  };
  const setBiodataEmergencyContactField = (
    field: keyof KolamUserBiodataEmergencyContact,
    value: string,
  ) => {
    setForm(current => ({
      ...current,
      biodata: {
        ...current.biodata,
        emergencyContact: {
          ...current.biodata.emergencyContact,
          [field]: value,
        },
      },
    }));
    setError('');
    setMessage('');
  };
  const setEmployeeField = (
    field: Exclude<keyof KolamUserEmployeeForm, 'schedule'>,
    value: string | boolean,
  ) => {
    setForm(current => ({
      ...current,
      employee: {...current.employee, [field]: value},
    }));
    setError('');
    setMessage('');
  };
  const setEmployeeScheduleField = (
    field: Exclude<keyof KolamUserEmployeeSchedule, 'workDays'>,
    value: string,
  ) => {
    setForm(current => ({
      ...current,
      employee: {
        ...current.employee,
        schedule: {...current.employee.schedule, [field]: value},
      },
    }));
    setError('');
    setMessage('');
  };
  const toggleEmployeeWorkDay = (day: string) => {
    setForm(current => {
      const workDays = current.employee.schedule.workDays.includes(day)
        ? current.employee.schedule.workDays.filter(item => item !== day)
        : [...current.employee.schedule.workDays, day];

      return {
        ...current,
        employee: {
          ...current.employee,
          schedule: {...current.employee.schedule, workDays},
        },
      };
    });
    setError('');
    setMessage('');
  };

  const handleUploadKtp = async () => {
    if (formDisabled || uploadingKtp) {
      return;
    }

    try {
      const picked = await pickNativeImageFile();
      const localUri =
        picked.uri ||
        (picked.path ? `file:///${picked.path.replace(/\\/g, '/')}` : '');

      if (picked.cancelled || !localUri) {
        return;
      }

      setUploadingKtp(true);
      setError('');
      setMessage('');
      setKtpPreviewUri(localUri);

      const uploaded = await uploadKolamUserBiodataKtp(user.id, localUri);
      const nextUser = uploaded ?? (await getKolamUserDetail(user.id)) ?? user;

      setUser(nextUser);
      setForm(getUserEditFormFromUser(nextUser));
      setKtpPreviewUri(nextUser.biodata.photoKtpUri);
      setMessage('Foto KTP berhasil diunggah.');
    } catch (err) {
      setKtpPreviewUri(user.biodata.photoKtpUri);
      setError(getUserFormErrorMessage(err, 'Gagal mengunggah foto KTP.'));
    } finally {
      setUploadingKtp(false);
    }
  };

  const handleSubmit = async () => {
    if (!canAccess) {
      setError('Akses rubah pengguna ditolak.');
      return;
    }

    if (isResigned) {
      setError('Pengguna sudah resign dan tidak dapat diubah.');
      return;
    }

    const validationError = validateEditUserForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    const salaryValue = getOptionalEmployeeSalary(form.employee.salary);
    const salaryDateValue = getOptionalEmployeeSalaryDate(
      form.employee.salaryDate,
    );

    if (
      canViewSalary &&
      form.employee.salary.trim() &&
      salaryValue === undefined
    ) {
      setError('Gaji bulanan harus berupa angka tidak negatif');
      return;
    }

    if (
      canViewSalary &&
      form.employee.salaryDate.trim() &&
      salaryDateValue === undefined
    ) {
      setError('Tanggal pembayaran gaji harus antara 1 sampai 31');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const updated = await updateKolamUser({
        id: user.id,
        account_restricted: form.account_restricted,
        access_am: form.access_am,
        access_inventory: form.access_inventory,
        access_pos: form.access_pos,
        csActive: form.csActive,
        biodata: getUserBiodataPayload(form.biodata),
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        ...(canToggleEmployee ? {isEmployee: form.isEmployee} : {}),
        ...(canToggleEmployee && form.isEmployee
          ? {
              employee: getUserEmployeePayload(form.employee, {
                includeSalaryDate: canViewSalary,
              }),
            }
          : {}),
        ...(canToggleOwner ? {isOwner: form.isOwner} : {}),
        last_name: form.last_name.trim(),
        phone_number: form.phone_number.trim(),
        role: form.role.trim(),
        timezone: form.timezone.trim(),
        username: form.username.trim() || undefined,
        ...(canResetPassword && form.password.trim()
          ? {password: form.password}
          : {}),
      });
      let nextUser = updated ?? user;

      if (canViewSalary && form.isEmployee && salaryValue !== undefined) {
        await updateKolamUserSalary({salary: salaryValue, userId: user.id});
        nextUser = (await getKolamUserDetail(user.id)) ?? nextUser;
      }

      setUser(nextUser);
      setForm(getUserEditFormFromUser(nextUser));
      setMessage('Pengguna berhasil diperbarui.');
    } catch (err) {
      setError(getUserFormErrorMessage(err, 'Gagal memperbarui pengguna.'));
    } finally {
      setSaving(false);
    }
  };

  const handleResignUser = async () => {
    if (!canResign || resigning) {
      return;
    }

    setResigning(true);
    setError('');
    setMessage('');

    try {
      const result = await resignKolamUser(user.id);
      const nextUser = (await getKolamUserDetail(user.id)) ?? user;
      const revokedCount = result.forfeit.revokedCount;
      const unexpectedIncomeText = result.forfeit.unexpectedIncomeId
        ? ' Cek Pemasukan tak terduga.'
        : '';

      setUser(nextUser);
      setForm(getUserEditFormFromUser(nextUser));
      setResignConfirmVisible(false);
      setMessage(
        revokedCount > 0
          ? `Karyawan di-resign. ${revokedCount} komisi accrued dibatalkan.${unexpectedIncomeText}`
          : 'Karyawan di-resign. Semua akses dicabut.',
      );
    } catch (err) {
      setError(getUserFormErrorMessage(err, 'Gagal resign karyawan.'));
    } finally {
      setResigning(false);
    }
  };

  return (
    <View style={styles.detailSurface}>
      <View style={styles.detailActionRow}>
        <KolamDaftarButton
          disabled={saving}
          onPress={() => onRouteChange?.('/list-of-users')}
        />
        <KolamButton
          disabled={saving}
          label="Detail"
          onPress={() =>
            onRouteChange?.(`/list-of-users/users/${encodedUserId}`)
          }
        />
        <KolamSaveButton
          disabled={formDisabled}
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
        {isResigned ? (
          <View style={styles.resignStatusCard}>
            <Text style={styles.resignStatusTitle}>Sudah resign</Text>
            <Text style={styles.resignStatusText}>
              Akses pengguna sudah dicabut sejak{' '}
              {formatUserDateTime(user.resignedAt)}. Akun tidak dihapus agar
              histori tetap tersimpan.
            </Text>
          </View>
        ) : null}

        <View style={styles.formGrid}>
          <View style={styles.formFieldWide}>
            <View style={styles.accessSectionHeader}>
              <Text style={styles.detailPanelTitle}>Informasi Dasar</Text>
              <Text style={styles.detailSubtitle}>
                Perbarui informasi pribadi pengguna.
              </Text>
            </View>
          </View>
          <UserFormField label="Nama Pengguna">
            <KolamFormTextField
              editable={!formDisabled}
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
              editable={!formDisabled}
              onChangeText={value => setField('first_name', value)}
              style={styles.formInput}
              value={form.first_name}
            />
          </UserFormField>
          <UserFormField label="Nama Belakang" required>
            <KolamFormTextField
              editable={!formDisabled}
              onChangeText={value => setField('last_name', value)}
              style={styles.formInput}
              value={form.last_name}
            />
          </UserFormField>
          <UserFormField label="Email" required>
            <KolamFormTextField
              editable={!formDisabled}
              mode="email"
              onChangeText={value => setField('email', value)}
              style={styles.formInput}
              value={form.email}
            />
          </UserFormField>
          <UserFormField label="Nomor Telepon" required>
            <KolamFormTextField
              editable={!formDisabled}
              onChangeText={value => setField('phone_number', value)}
              style={styles.formInput}
              value={form.phone_number}
            />
          </UserFormField>
          <View style={styles.formFieldWide}>
            <View style={styles.accessSectionHeader}>
              <Text style={styles.detailPanelTitle}>Peran & Izin Akses</Text>
              <Text style={styles.detailSubtitle}>
                Atur peran dan izin akses pengguna.
              </Text>
            </View>
            <UserFormField label="Peran" required>
              <KolamDropdownSelect
                label="Peran"
                onChange={value => setField('role', value)}
                options={[
                  {label: rolesLoading ? 'Memuat peran...' : 'Pilih Peran', value: ''},
                  ...roles.map(role => ({
                    label: role.name || role.key,
                    value: role.key,
                  })),
                ]}
                value={form.role}
              />
            </UserFormField>
          </View>
          <View style={styles.formFieldWide}>
            <View style={styles.accessSectionHeader}>
              <Text style={styles.detailPanelTitle}>Status dan Akses</Text>
              <Text style={styles.detailSubtitle}>
                Perubahan akses akan langsung memengaruhi kemampuan pengguna.
              </Text>
            </View>
            <View style={styles.accessToggleGrid}>
              <KolamToggleRow
                active={!form.account_restricted}
                description={
                  form.account_restricted ? 'Akun dibatasi' : 'Akun aktif'
                }
                disabled={formDisabled}
                label="Status Akun"
                onPress={() =>
                  setBooleanField(
                    'account_restricted',
                    !form.account_restricted,
                  )
                }
              />
              <KolamToggleRow
                active={form.access_pos}
                description="Izinkan pengguna mengakses sistem Point of Sale"
                disabled={formDisabled}
                label="Akses POS"
                onPress={() => setBooleanField('access_pos', !form.access_pos)}
              />
              <KolamToggleRow
                active={form.access_inventory}
                description="Izinkan pengguna mengakses Manajemen Inventori"
                disabled={formDisabled}
                label="Akses Inventori"
                onPress={() =>
                  setBooleanField('access_inventory', !form.access_inventory)
                }
              />
              <KolamToggleRow
                active={form.access_am}
                description="Izinkan pengguna mengakses Automation Management"
                disabled={formDisabled}
                label="Akses AM"
                onPress={() => setBooleanField('access_am', !form.access_am)}
              />
              {canToggleEmployee ? (
                <KolamToggleRow
                  active={form.isEmployee}
                  description="Tandai pengguna ini sebagai karyawan perusahaan"
                  disabled={formDisabled}
                  label="Status Karyawan"
                  onPress={() =>
                    setBooleanField('isEmployee', !form.isEmployee)
                  }
                />
              ) : null}
              <KolamToggleRow
                active={form.csActive}
                description="Izinkan pengguna membalas chat pelanggan di Inbox"
                disabled={formDisabled}
                label="CS Aktif"
                onPress={() => setBooleanField('csActive', !form.csActive)}
              />
              {canToggleOwner ? (
                <KolamToggleRow
                  active={form.isOwner}
                  description="Tandai pengguna ini sebagai pemilik perusahaan"
                  disabled={formDisabled}
                  label="Status Pemilik"
                  onPress={() => setBooleanField('isOwner', !form.isOwner)}
                />
              ) : null}
            </View>
          </View>
          {canToggleEmployee && form.isEmployee ? (
            <>
              <View style={styles.formFieldWide}>
                <View style={styles.accessSectionHeader}>
                  <Text style={styles.detailPanelTitle}>Detail Karyawan</Text>
                  <Text style={styles.detailSubtitle}>
                    Informasi organisasi dan jadwal kerja.
                  </Text>
                </View>
              </View>
              <UserFormField label="Nomor Karyawan">
                <KolamFormTextField
                  editable={!formDisabled}
                  onChangeText={value =>
                    setEmployeeField('employeeNumber', value)
                  }
                  style={styles.formInput}
                  value={form.employee.employeeNumber}
                />
              </UserFormField>
              <View style={styles.formField}>
                <UserFormField label="Status Kepegawaian">
                  <KolamDropdownSelect
                    label="Status Kepegawaian"
                    onChange={value => setEmployeeField('status', value)}
                    options={[
                      {label: 'Aktif', value: 'active'},
                      {label: 'Nonaktif', value: 'inactive'},
                      {label: 'Diberhentikan', value: 'terminated'},
                    ]}
                    value={form.employee.status}
                  />
                </UserFormField>
              </View>
              <UserFormField label="Jabatan">
                <KolamFormTextField
                  editable={!formDisabled}
                  onChangeText={value => setEmployeeField('position', value)}
                  style={styles.formInput}
                  value={form.employee.position}
                />
              </UserFormField>
              <UserFormField label="Departemen">
                <KolamFormTextField
                  editable={!formDisabled}
                  onChangeText={value => setEmployeeField('department', value)}
                  style={styles.formInput}
                  value={form.employee.department}
                />
              </UserFormField>
              <UserFormField label="Tanggal Mulai Bekerja">
                <KolamDateField
                  label="Tanggal Mulai Bekerja"
                  onChange={value => setEmployeeField('hireDate', value)}
                  showLabelInTrigger={false}
                  value={form.employee.hireDate}
                />
              </UserFormField>
              <UserFormField label="Tahun Masuk">
                <KolamFormTextField
                  editable={!formDisabled}
                  mode="numeric"
                  onChangeText={value => setEmployeeField('yearIn', value)}
                  style={styles.formInput}
                  value={form.employee.yearIn}
                />
              </UserFormField>
              {canViewSalary ? (
                <>
                  <UserFormField label="Gaji Bulanan (IDR)">
                    <KolamFormTextField
                      editable={!formDisabled}
                      mode="numeric"
                      onChangeText={value => setEmployeeField('salary', value)}
                      placeholder="mis. 5000000"
                      style={styles.formInput}
                      value={form.employee.salary}
                    />
                  </UserFormField>
                  <UserFormField label="Tanggal Pembayaran Gaji">
                    <KolamFormTextField
                      editable={!formDisabled}
                      mode="numeric"
                      onChangeText={value =>
                        setEmployeeField('salaryDate', value)
                      }
                      placeholder="mis. 25"
                      style={styles.formInput}
                      value={form.employee.salaryDate}
                    />
                  </UserFormField>
                </>
              ) : null}
              <View style={styles.formFieldWide}>
              <KolamToggleRow
                  active={form.employee.firstTimeWorking}
                  description="Ini adalah pekerjaan pertama mereka"
                  disabled={formDisabled}
                  label="Pekerjaan Pertama"
                  onPress={() =>
                    setEmployeeField(
                      'firstTimeWorking',
                      !form.employee.firstTimeWorking,
                    )
                  }
                />
              </View>
              <View style={styles.formFieldWide}>
                <KolamToggleRow
                  active={form.employee.isPkp}
                  description="Tandai jika karyawan memiliki PKP aktif"
                  disabled={formDisabled}
                  label="Status PKP Berlaku"
                  onPress={() =>
                    setEmployeeField('isPkp', !form.employee.isPkp)
                  }
                />
              </View>
              {form.employee.isPkp ? (
                <KolamNotesField
                  editable={!formDisabled}
                  label="Catatan PKP"
                  onChangeText={value => setEmployeeField('pkpNotes', value)}
                  value={form.employee.pkpNotes}
                />
              ) : null}
              <View style={styles.formField}>
                <UserFormField label="Tipe Jadwal">
                  <KolamDropdownSelect
                    label="Tipe Jadwal"
                    onChange={value => setEmployeeScheduleField('type', value)}
                    options={[
                      {label: 'Penuh Waktu', value: 'full_time'},
                      {label: 'Paruh Waktu', value: 'part_time'},
                      {label: 'Kontrak', value: 'contract'},
                    ]}
                    value={form.employee.schedule.type}
                  />
                </UserFormField>
              </View>
              <UserFormField label="Mulai Shift">
                <KolamFormTextField
                  editable={!formDisabled}
                  onChangeText={value =>
                    setEmployeeScheduleField('shiftStart', value)
                  }
                  style={styles.formInput}
                  value={form.employee.schedule.shiftStart}
                />
              </UserFormField>
              <UserFormField label="Selesai Shift">
                <KolamFormTextField
                  editable={!formDisabled}
                  onChangeText={value =>
                    setEmployeeScheduleField('shiftEnd', value)
                  }
                  style={styles.formInput}
                  value={form.employee.schedule.shiftEnd}
                />
              </UserFormField>
              <View style={styles.formFieldWide}>
                <Text style={styles.formSubsectionTitle}>Hari Kerja</Text>
                <View style={styles.workDayRow}>
                  {EMPLOYEE_WORK_DAYS.map(day => {
                    const selected =
                      form.employee.schedule.workDays.includes(day.id);

                    return (
                      <KolamButton
                        disabled={formDisabled}
                        intent={selected ? 'primary' : 'secondary'}
                        key={day.id}
                        label={day.label}
                        onPress={() => toggleEmployeeWorkDay(day.id)}
                        style={styles.workDayButton}
                      />
                    );
                  })}
                </View>
              </View>
            </>
          ) : null}
          <View style={styles.formFieldWide}>
            <View style={styles.accessSectionHeader}>
              <Text style={styles.detailPanelTitle}>Data Pribadi</Text>
              <Text style={styles.detailSubtitle}>
                Biodata dan informasi identitas pengguna.
              </Text>
            </View>
          </View>
          <View style={styles.formField}>
            <UserFormField label="Jenis Kelamin">
              <KolamDropdownSelect
                label="Jenis Kelamin"
                onChange={value => setBiodataField('gender', value)}
                options={[
                  {label: 'Pilih jenis kelamin', value: ''},
                  {label: 'Laki-laki', value: 'male'},
                  {label: 'Perempuan', value: 'female'},
                ]}
                value={form.biodata.gender}
              />
            </UserFormField>
          </View>
          <View style={styles.formField}>
            <UserFormField label="Status Pernikahan">
              <KolamDropdownSelect
                label="Status Pernikahan"
                onChange={value => setBiodataField('maritalStatus', value)}
                options={[
                  {label: 'Pilih status', value: ''},
                  {label: 'Belum menikah', value: 'single'},
                  {label: 'Menikah', value: 'married'},
                ]}
                value={form.biodata.maritalStatus}
              />
            </UserFormField>
          </View>
          <UserFormField label="Tanggal Lahir">
            <KolamDateField
              label="Tanggal Lahir"
              onChange={value => setBiodataField('dateOfBirth', value)}
              showLabelInTrigger={false}
              value={form.biodata.dateOfBirth}
            />
          </UserFormField>
          <UserFormField label="Tempat Lahir">
            <KolamFormTextField
              editable={!formDisabled}
              onChangeText={value => setBiodataField('placeOfBirth', value)}
              style={styles.formInput}
              value={form.biodata.placeOfBirth}
            />
          </UserFormField>
          <UserFormField label="Agama">
            <KolamFormTextField
              editable={!formDisabled}
              onChangeText={value => setBiodataField('religion', value)}
              style={styles.formInput}
              value={form.biodata.religion}
            />
          </UserFormField>
          <UserFormField label="No. KTP">
            <KolamFormTextField
              editable={!formDisabled}
              onChangeText={value => setBiodataField('nationalId', value)}
              style={styles.formInput}
              value={form.biodata.nationalId}
            />
          </UserFormField>
          <View style={styles.formFieldWide}>
            <View style={styles.ktpUploadCard}>
              <View style={styles.ktpUploadCopy}>
                <Text style={styles.formSubsectionTitle}>
                  Foto KTP (boleh fotokopi)
                </Text>
                <Text style={styles.detailSubtitle}>
                  Unggahan foto KTP disimpan terpisah dari submit form biodata.
                </Text>
              </View>
              {ktpPreviewUri ? (
                <KolamRemoteImage
                  accessibilityLabel="Foto KTP"
                  previewItems={[
                    {
                      title: 'Foto KTP',
                      uri: ktpPreviewUri,
                    },
                  ]}
                  resizeMode="cover"
                  scope="user-ktp"
                  sourceUri={ktpPreviewUri}
                  style={styles.ktpPreviewImage}
                />
              ) : null}
              <KolamButton
                disabled={formDisabled || uploadingKtp}
                label={uploadingKtp ? 'Mengunggah...' : 'Unggah'}
                onPress={handleUploadKtp}
                style={styles.ktpUploadButton}
              />
            </View>
          </View>
          <UserFormField label="No. NPWP">
            <KolamFormTextField
              editable={!formDisabled}
              onChangeText={value => setBiodataField('taxNumber', value)}
              style={styles.formInput}
              value={form.biodata.taxNumber}
            />
          </UserFormField>
          <View style={styles.formFieldWide}>
            <Text style={styles.formSubsectionTitle}>Alamat</Text>
          </View>
          <UserFormField label="Jalan">
            <KolamFormTextField
              editable={!formDisabled}
              onChangeText={value => setBiodataAddressField('street', value)}
              style={styles.formInput}
              value={form.biodata.address.street}
            />
          </UserFormField>
          <UserFormField label="Kota">
            <KolamFormTextField
              editable={!formDisabled}
              onChangeText={value => setBiodataAddressField('city', value)}
              style={styles.formInput}
              value={form.biodata.address.city}
            />
          </UserFormField>
          <UserFormField label="Provinsi">
            <KolamFormTextField
              editable={!formDisabled}
              onChangeText={value => setBiodataAddressField('province', value)}
              style={styles.formInput}
              value={form.biodata.address.province}
            />
          </UserFormField>
          <UserFormField label="Kode Pos">
            <KolamFormTextField
              editable={!formDisabled}
              onChangeText={value => setBiodataAddressField('postalCode', value)}
              style={styles.formInput}
              value={form.biodata.address.postalCode}
            />
          </UserFormField>
          <View style={styles.formFieldWide}>
            <Text style={styles.formSubsectionTitle}>Kontak Darurat</Text>
          </View>
          <UserFormField label="Nama">
            <KolamFormTextField
              editable={!formDisabled}
              onChangeText={value =>
                setBiodataEmergencyContactField('name', value)
              }
              style={styles.formInput}
              value={form.biodata.emergencyContact.name}
            />
          </UserFormField>
          <UserFormField label="Hubungan">
            <KolamFormTextField
              editable={!formDisabled}
              onChangeText={value =>
                setBiodataEmergencyContactField('relation', value)
              }
              style={styles.formInput}
              value={form.biodata.emergencyContact.relation}
            />
          </UserFormField>
          <UserFormField label="Telepon">
            <KolamFormTextField
              editable={!formDisabled}
              onChangeText={value =>
                setBiodataEmergencyContactField('phone', value)
              }
              style={styles.formInput}
              value={form.biodata.emergencyContact.phone}
            />
          </UserFormField>
          {canShowResignInfo ? (
            <View style={styles.formFieldWide}>
              <View style={styles.resignGuardCard}>
                <View style={styles.resignGuardCopy}>
                  <Text style={styles.formSubsectionTitle}>
                    Resign karyawan
                  </Text>
                  <Text style={styles.detailSubtitle}>
                    Aksi ini mencabut akses dan dapat membatalkan komisi
                    accrued. Akun tidak dihapus dan histori tetap tersimpan.
                  </Text>
                </View>
                <KolamButton
                  disabled={!canResign || saving || resigning}
                  intent="danger"
                  label={resigning ? 'Memproses...' : 'Resign karyawan'}
                  onPress={() => setResignConfirmVisible(true)}
                  style={styles.resignGuardButton}
                />
              </View>
            </View>
          ) : null}
          {canResetPassword ? (
            <>
              <View style={styles.formFieldWide}>
                <View style={styles.accessSectionHeader}>
                  <Text style={styles.detailPanelTitle}>Reset Kata Sandi</Text>
                  <Text style={styles.detailSubtitle}>
                    Hanya Super Admin yang dapat mereset kata sandi pengguna.
                  </Text>
                </View>
              </View>
              <UserFormField label="Kata Sandi Baru">
                <KolamFormTextField
                  editable={!formDisabled}
                  mode="password"
                  onChangeText={value => setField('password', value)}
                  placeholder="Kosongkan untuk mempertahankan kata sandi saat ini"
                  style={styles.formInput}
                  value={form.password}
                />
              </UserFormField>
            </>
          ) : null}
        </View>
      </KolamContentFrame>

      <KolamConfirmDialog
        cancelLabel={resigning ? 'Tunggu' : 'Batal'}
        confirmLabel={resigning ? 'Memproses...' : 'Ya, resign'}
        destructive
        message={`Yakin resign ${form.first_name} ${form.last_name}? Semua akses Kolam, POS, AM, dan CS akan dicabut. Komisi accrued dibatalkan bila ada. Tindakan ini tidak menghapus akun dan histori tetap tersimpan.`}
        onCancel={() => {
          if (!resigning) {
            setResignConfirmVisible(false);
          }
        }}
        onConfirm={() => {
          void handleResignUser();
        }}
        title="Resign karyawan?"
        visible={resignConfirmVisible}
      />
    </View>
  );
}

function DetailRow({
  label,
  numberOfLines = 2,
  value,
}: {
  label: string;
  numberOfLines?: number;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text numberOfLines={numberOfLines} style={styles.detailValue}>
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

function createUserListColumns(
  kasbonPendingSummary: KolamKasbonPendingSummary,
): Array<KolamListTableColumn<KolamUserListItem>> {
  return USER_LIST_COLUMNS.map(column => ({
    ...column,
    render: user =>
      renderUserListCell(
        column.id,
        user,
        kasbonPendingSummary.byUser[user.id] ?? 0,
      ),
  }));
}

function renderUserListCell(
  columnId: UserListColumnId,
  user: KolamUserListItem,
  pendingKasbonCount: number,
) {
  const profilePhotoUrl = resolveProfilePhotoUrl(user.profilePicture);

  switch (columnId) {
    case 'name':
      return (
        <View style={styles.userNameCellContent}>
          {profilePhotoUrl ? (
            <KolamRemoteImage
              accessibilityLabel={`Foto profil ${user.displayName}`}
              resizeMode="cover"
              scope="user-profile-list"
              sourceUri={profilePhotoUrl}
              style={styles.userListAvatarImage}
            />
          ) : (
            <View style={styles.userListAvatarFallback}>
              <Text numberOfLines={1} style={styles.userListAvatarInitials}>
                {getUserInitials(user.displayName)}
              </Text>
            </View>
          )}
          <View style={styles.userNameCopy}>
            <Text numberOfLines={2} style={styles.userNameText}>
              {user.displayName}
            </Text>
            {user.username ? (
              <Text numberOfLines={1} style={styles.userSubText}>
                @{user.username}
              </Text>
            ) : null}
            {user.isEmployee && pendingKasbonCount > 0 ? (
              <KolamStatusBadge
                intent="danger"
                label={`${pendingKasbonCount} kasbon`}
                numberOfLines={1}
                style={styles.userKasbonBadge}
              />
            ) : null}
          </View>
        </View>
      );
    case 'email':
      return (
        <Text numberOfLines={1} style={styles.userMetaText}>
          {user.email || '-'}
        </Text>
      );
    case 'phone':
      return (
        <Text numberOfLines={1} style={styles.userMetaText}>
          {user.phoneNumber || '-'}
        </Text>
      );
    case 'role':
      return (
        <Text numberOfLines={1} style={styles.userMetaText}>
          {user.roleLabel || '-'}
        </Text>
      );
    case 'employee':
      return (
        <KolamStatusBadge
          intent={user.isEmployee ? 'success' : 'secondary'}
          label={user.isEmployee ? 'Karyawan' : 'Bukan karyawan'}
          numberOfLines={1}
        />
      );
    case 'access':
      return user.accessBadges.length ? (
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
      );
  }
}

function KolamUserListActions({
  canDeleteUser,
  currentUserId,
  onDeleteRequest,
  onRouteChange,
  user,
}: {
  canDeleteUser: boolean;
  currentUserId: string;
  onDeleteRequest: (user: KolamUserListItem) => void;
  onRouteChange?: (route: string) => void;
  user: KolamUserListItem;
}) {
  const userRouteId = encodeURIComponent(user.id);
  const deleteDisabled =
    !canDeleteUser ||
    currentUserId === String(user.id) ||
    isSettingsSuperAdminRoleKey(user.role?.key ?? '');

  return (
    <KolamTableRowActionMenu
      accessibilityLabel={`Menu ${user.displayName}`}
      actions={[
        {
          label: 'Lihat',
          onPress: () => onRouteChange?.(`/list-of-users/users/${userRouteId}`),
        },
        {
          label: 'Rubah',
          onPress: () =>
            onRouteChange?.(`/list-of-users/users/${userRouteId}/edit`),
        },
        {
          disabled: deleteDisabled,
          label: 'Hapus',
          onPress: () => onDeleteRequest(user),
          tone: 'danger',
        },
      ]}
    />
  );
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

function formatUserLongDate(value?: string | null) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('id-ID', {dateStyle: 'long'});
}

function formatUserCurrency(value?: number | null) {
  if (value == null || !Number.isFinite(value)) {
    return '-';
  }

  return formatRupiah(value);
}

function formatPayrollStatus(value?: string | null) {
  switch ((value ?? '').toLowerCase()) {
    case 'pending':
      return 'Menunggu';
    case 'verified':
      return 'Terverifikasi';
    case 'rejected':
      return 'Ditolak';
    case 'paid':
      return 'Dibayar';
    default:
      return value || '-';
  }
}

function getPayrollStatusIntent(
  value?: string | null,
): React.ComponentProps<typeof KolamStatusBadge>['intent'] {
  switch ((value ?? '').toLowerCase()) {
    case 'verified':
    case 'paid':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'danger';
    default:
      return 'secondary';
  }
}

function formatKasbonPaymentInfo(item: KolamUserKasbonItem) {
  if (item.paymentType === 'cicilan') {
    const paid =
      item.paidInstallments == null || item.installmentDuration == null
        ? ''
        : ` (${item.paidInstallments}/${item.installmentDuration})`;
    const amount =
      item.installmentAmount == null
        ? ''
        : `, ${formatUserCurrency(item.installmentAmount)} per cicilan`;
    const remaining =
      item.remainingBalance == null
        ? ''
        : `, sisa ${formatUserCurrency(item.remainingBalance)}`;

    return `Cicilan${paid}${amount}${remaining}`;
  }

  return 'Lunas penuh';
}

function getUserInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');

  return initials || '?';
}

function formatUserGender(value?: string | null) {
  switch ((value ?? '').toLowerCase()) {
    case 'male':
    case 'laki-laki':
    case 'pria':
      return 'Laki-laki';
    case 'female':
    case 'perempuan':
    case 'wanita':
      return 'Perempuan';
    default:
      return value || '-';
  }
}

function formatUserMaritalStatus(value?: string | null) {
  switch ((value ?? '').toLowerCase()) {
    case 'single':
      return 'Belum menikah';
    case 'married':
      return 'Menikah';
    case 'divorced':
      return 'Cerai';
    case 'widowed':
      return 'Duda/Janda';
    default:
      return value || '-';
  }
}

function formatUserEmployeeStatus(value?: string | null) {
  switch ((value ?? '').toLowerCase()) {
    case 'active':
      return 'Aktif';
    case 'terminated':
      return 'Berhenti';
    case 'probation':
      return 'Masa Percobaan';
    case 'inactive':
      return 'Tidak aktif';
    default:
      return value || '-';
  }
}

function getUserEmployeeStatusIntent(
  value?: string | null,
): React.ComponentProps<typeof KolamStatusBadge>['intent'] {
  switch ((value ?? '').toLowerCase()) {
    case 'active':
      return 'success';
    case 'terminated':
      return 'danger';
    default:
      return 'secondary';
  }
}

function formatUserScheduleType(value?: string | null) {
  switch ((value ?? '').toLowerCase()) {
    case 'full_time':
      return 'Penuh waktu';
    case 'part_time':
      return 'Paruh waktu';
    case 'shift':
      return 'Shift';
    case 'flexible':
      return 'Fleksibel';
    default:
      return value || '-';
  }
}

function formatUserShiftRange(schedule: KolamUserEmployeeSchedule) {
  return schedule.shiftStart && schedule.shiftEnd
    ? `${schedule.shiftStart} - ${schedule.shiftEnd}`
    : '-';
}

function formatUserWorkDays(days: string[]) {
  if (!days.length) {
    return '-';
  }

  const labels: Record<string, string> = {
    friday: 'Jumat',
    monday: 'Senin',
    saturday: 'Sabtu',
    sunday: 'Minggu',
    thursday: 'Kamis',
    tuesday: 'Selasa',
    wednesday: 'Rabu',
  };

  return days.map(day => labels[day.toLowerCase()] ?? day).join(', ');
}

function formatUserWorkDuration(value?: string | null) {
  if (!value) {
    return '-';
  }

  const start = new Date(value);

  if (Number.isNaN(start.getTime())) {
    return '-';
  }

  const now = new Date();
  let months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());

  if (now.getDate() < start.getDate()) {
    months -= 1;
  }

  if (months <= 0) {
    return 'Kurang dari 1 bulan';
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const parts = [
    years > 0 ? `${years} tahun` : '',
    remainingMonths > 0 ? `${remainingMonths} bulan` : '',
  ].filter(Boolean);

  return parts.join(' ') || '-';
}

function formatUserAddress(address: KolamUserBiodataAddress) {
  return [
    address.street,
    address.city,
    address.province,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(', ') || '-';
}

function formatUserEmergencyContact(contact: KolamUserBiodataEmergencyContact) {
  if (!contact.name) {
    return '-';
  }

  return [
    contact.name,
    contact.relation ? `(${contact.relation})` : '',
    contact.phone,
  ]
    .filter(Boolean)
    .join(' ');
}

function validateCreateUserForm(form: KolamUserCreatePayload) {
  if (!form.username.trim()) {
    return 'Nama pengguna wajib diisi';
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
    account_restricted: user.accountRestricted,
    access_am: user.accessAm,
    access_inventory: user.accessInventory,
    access_pos: user.accessPos,
    biodata: user.biodata,
    csActive: user.csActive,
    email: user.email,
    employee: getUserEmployeeFormFromUser(user.employee),
    first_name: user.firstName,
    isEmployee: user.isEmployee,
    isOwner: user.isOwner,
    last_name: user.lastName,
    password: '',
    phone_number: user.phoneNumber,
    role: user.role?.key ?? '',
    timezone: user.timezone || 'UTC+08:00',
    username: user.username,
  };
}

function getUserEmployeeFormFromUser(
  employee: KolamUserEmployeeProfile,
): KolamUserEmployeeForm {
  return {
    ...employee,
    salary: employee.salary == null ? '' : String(employee.salary),
    salaryDate: employee.salaryDate == null ? '' : String(employee.salaryDate),
    yearIn: employee.yearIn == null ? '' : String(employee.yearIn),
  };
}

function getUserEmployeePayload(
  employee: KolamUserEmployeeForm,
  options: {includeSalaryDate?: boolean} = {},
) {
  return {
    department: cleanOptionalUserString(employee.department),
    employeeNumber: cleanOptionalUserString(employee.employeeNumber),
    firstTimeWorking: employee.firstTimeWorking,
    hireDate: getUserBiodataDatePayload(employee.hireDate),
    isPkp: employee.isPkp,
    pkpNotes: cleanOptionalUserString(employee.pkpNotes),
    position: cleanOptionalUserString(employee.position),
    schedule: {
      shiftEnd: employee.schedule.shiftEnd || '18:00',
      shiftStart: employee.schedule.shiftStart || '09:00',
      type: employee.schedule.type || 'full_time',
      workDays: employee.schedule.workDays,
    },
    status: employee.status || 'active',
    yearIn: getOptionalEmployeeYear(employee.yearIn),
    ...(options.includeSalaryDate
      ? {salaryDate: getOptionalEmployeeSalaryDate(employee.salaryDate)}
      : {}),
  };
}

function getOptionalEmployeeYear(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) ? parsed : undefined;
}

function getOptionalEmployeeSalary(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function getOptionalEmployeeSalaryDate(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 31
    ? parsed
    : undefined;
}

function getUserBiodataPayload(biodata: KolamUserBiodata) {
  return {
    address: {
      city: cleanOptionalUserString(biodata.address.city),
      postalCode: cleanOptionalUserString(biodata.address.postalCode),
      province: cleanOptionalUserString(biodata.address.province),
      street: cleanOptionalUserString(biodata.address.street),
    },
    dateOfBirth: getUserBiodataDatePayload(biodata.dateOfBirth),
    emergencyContact: {
      name: cleanOptionalUserString(biodata.emergencyContact.name),
      phone: cleanOptionalUserString(biodata.emergencyContact.phone),
      relation: cleanOptionalUserString(biodata.emergencyContact.relation),
    },
    gender: cleanOptionalUserString(biodata.gender),
    maritalStatus: cleanOptionalUserString(biodata.maritalStatus),
    nationalId: cleanOptionalUserString(biodata.nationalId),
    placeOfBirth: cleanOptionalUserString(biodata.placeOfBirth),
    religion: cleanOptionalUserString(biodata.religion),
    taxNumber: cleanOptionalUserString(biodata.taxNumber),
  };
}

function getUserBiodataDatePayload(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function cleanOptionalUserString(value: string) {
  const trimmed = value.trim();

  return trimmed || undefined;
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

function getCurrentAttendancePeriodKey(cutoffDay = 28) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const safeCutoff = clampAttendanceCutoffDay(year, month, cutoffDay);

  if (today.getDate() > safeCutoff) {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    return `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
  }

  return `${year}-${String(month).padStart(2, '0')}`;
}

function formatAttendancePeriodLabel(periodKey: string, cutoffDay = 28) {
  const [year, month] = periodKey.split('-').map(Number);

  if (!year || !month) {
    return periodKey || '-';
  }

  const safeCutoff = clampAttendanceCutoffDay(year, month, cutoffDay);
  const monthName = new Date(year, month - 1, 1).toLocaleString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  return `${monthName} (cut-off tgl ${safeCutoff})`;
}

function clampAttendanceCutoffDay(year: number, month: number, cutoffDay = 28) {
  const lastDay = new Date(year, month, 0).getDate();
  const parsedCutoff = Number.isFinite(cutoffDay) ? cutoffDay : 28;

  return Math.min(Math.max(1, parsedCutoff || 28), lastDay);
}

function formatUserRatingStars(value: number) {
  const rounded = Math.max(0, Math.min(5, Math.round(value || 0)));

  return `${'★'.repeat(rounded)}${'☆'.repeat(5 - rounded)}`;
}

function formatFaceEnrollment(value: KolamUserFaceEnrollment | null) {
  if (!value) {
    return 'Belum terdaftar';
  }

  const dateText = formatUserDateTime(value.enrolledAt);
  const dimensionText =
    value.embeddingLength > 0 ? ` (${value.embeddingLength} dimensi)` : '';

  return `Terdaftar sejak ${dateText}${dimensionText}`;
}

function formatAttendanceDate(value: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatAttendanceStatus(value?: string | null) {
  switch ((value ?? '').toLowerCase()) {
    case 'present':
      return 'Hadir';
    case 'late_tier2':
      return `Telat (${formatRupiahCompactCurrency(50000)})`;
    case 'late_tier3':
      return `Telat >=2j (${formatRupiahCompactCurrency(100000)})`;
    case 'absent':
      return 'Absen';
    case 'holiday':
      return 'Libur';
    case 'leave':
      return 'Cuti/Ijin';
    case 'sick':
      return 'Sakit';
    default:
      return value || '-';
  }
}

function getAttendanceStatusIntent(
  value?: string | null,
): React.ComponentProps<typeof KolamStatusBadge>['intent'] {
  switch ((value ?? '').toLowerCase()) {
    case 'present':
      return 'success';
    case 'late_tier2':
    case 'late_tier3':
      return 'warning';
    case 'absent':
      return 'danger';
    default:
      return 'secondary';
  }
}

function formatAttendanceDeduction(item: KolamUserAttendanceRecord) {
  if (item.salaryDeduction) {
    const code = item.salaryDeduction.code || 'Potongan';
    const amount = formatUserCurrency(item.salaryDeduction.amount);
    const status = item.salaryDeduction.status || '-';

    return `${code} - ${amount} (${status})`;
  }

  return item.fineAmount > 0 ? formatUserCurrency(item.fineAmount) : '-';
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
  kasbonSummaryBadge: {
    flexShrink: 0,
    minHeight: 28,
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
  userListRow: {
    alignItems: 'center',
    gap: 8,
  },
  userNameCellContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minWidth: 0,
  },
  userListAvatarImage: {
    borderRadius: 8,
    height: 36,
    width: 36,
  },
  userListAvatarFallback: {
    alignItems: 'center',
    backgroundColor: V.colors.tableHeader,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  userListAvatarInitials: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  userNameCopy: {
    flex: 1,
    minWidth: 0,
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
  userKasbonBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  userSummaryCard: {
    alignSelf: 'stretch',
    width: '100%',
  },
  userTableBadgeCell: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  userTableBadge: {
    alignSelf: 'center',
  },
  userTableTextCenter: {
    textAlign: 'center',
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
  userProfileBlock: {
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  userProfileImage: {
    borderRadius: 8,
    height: 144,
    width: 144,
  },
  userProfileFallback: {
    alignItems: 'center',
    backgroundColor: V.colors.tableHeader,
    borderRadius: 8,
    height: 144,
    justifyContent: 'center',
    width: 144,
  },
  userProfileInitials: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
  },
  userKtpImage: {
    borderRadius: 8,
    height: 128,
    width: 200,
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
  payrollEntry: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 10,
  },
  payrollEntryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  payrollEntryTitle: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  payrollEntryAmount: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 22,
  },
  payrollEntryDate: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  ratingSummaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  ratingScore: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 38,
  },
  ratingSummaryCopy: {
    flex: 1,
    gap: 2,
  },
  ratingStars: {
    color: V.colors.warning,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
  },
  ratingCountRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ratingCountLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
    width: 64,
  },
  ratingBarTrack: {
    backgroundColor: V.colors.tableHeader,
    borderRadius: 999,
    flex: 1,
    height: 8,
    overflow: 'hidden',
  },
  ratingBarFill: {
    backgroundColor: V.colors.warning,
    borderRadius: 999,
    height: 8,
  },
  ratingCountValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textAlign: 'right',
    width: 28,
  },
  attendanceEntry: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 10,
  },
  attendanceMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  resignStatusCard: {
    backgroundColor: V.colors.dangerSoft,
    borderColor: V.colors.danger,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  resignStatusTitle: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  resignStatusText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  formSubsectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
  },
  workDayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  workDayButton: {
    minWidth: 52,
  },
  ktpUploadCard: {
    alignItems: 'flex-start',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  ktpUploadCopy: {
    gap: 2,
  },
  ktpPreviewImage: {
    aspectRatio: 1.6,
    borderRadius: 8,
    width: 220,
  },
  ktpUploadButton: {
    minWidth: 96,
  },
  resignGuardCard: {
    alignItems: 'center',
    borderColor: V.colors.danger,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    padding: 12,
  },
  resignGuardCopy: {
    flexBasis: 360,
    flexGrow: 1,
    gap: 4,
  },
  resignGuardButton: {
    minWidth: 132,
  },
  accessSectionHeader: {
    gap: 2,
    marginBottom: 8,
  },
  accessToggleGrid: {
    gap: 8,
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
