import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  getKolamCustomerLocationText,
  type KolamCustomer,
  type KolamCustomerAddress,
  type KolamCustomerExternalAccount,
  type KolamCustomerListResult,
  type KolamCustomerSavePayload,
} from '../domain/kolam-customer';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {getKolamFileUrl} from '../lib/file-url';
import {
  createKolamCustomer,
  deleteKolamCustomerPhoto,
  getKolamCustomerDetail,
  getKolamCustomerList,
  updateKolamCustomer,
  uploadKolamCustomerPhoto,
} from '../services/kolam-customer-api';
import {pickNativeImageFile} from '../services/native-file-picker';
import type {
  KolamCustomerList,
  KolamCustomerSurfaceProps,
} from './kolam-workspace-module-surface-types';
import {KolamButton} from './kolam-button';
import {KolamContentFrame} from './kolam-content-frame';
import {
  KolamDetailMediaPreview,
  type KolamDetailMediaItem,
} from './kolam-detail-media-preview';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
} from './kolam-dropdown-select';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamFormTextField} from './kolam-form-text-field';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import {KolamCustomerModule} from './kolam-pos-workspace-widgets';
import {KolamRemoteImage} from './kolam-remote-image';
import {KolamStatusBadge} from './kolam-status-badge';

const CUSTOMER_LIST_COLUMNS = [
  {id: 'customer', label: 'Pelanggan', flex: 1.55, align: 'left'},
  {id: 'contact', label: 'Kontak', flex: 1.25, align: 'left'},
  {id: 'location', label: 'Lokasi', flex: 1.25, align: 'left'},
  {id: 'points', label: 'Poin', flex: 0.65, align: 'right'},
  {id: 'status', label: 'Status', flex: 1.05, align: 'left'},
  {id: 'created', label: 'Dibuat', flex: 0.95, align: 'right'},
] as const;

type CustomerListColumnId = (typeof CUSTOMER_LIST_COLUMNS)[number]['id'];
type CustomerFormGender = 'male' | 'female';

const CUSTOMER_GENDER_OPTIONS = [
  {label: 'Laki-laki', value: 'male'},
  {label: 'Perempuan', value: 'female'},
] as const;

const INITIAL_CUSTOMER_LIST: KolamCustomerListResult = {
  items: [],
  pagination: {
    limit: 10,
    page: 1,
    total: 0,
    totalPages: 1,
  },
};

export function KolamCustomerSurface({
  customer,
  customers,
  onRouteChange,
  route,
}: {
  customer: KolamCustomerSurfaceProps;
  customers: KolamCustomerList;
  onRouteChange?: (route: string) => void;
  route?: string;
}) {
  const routePath = route?.split('?')[0] ?? '';
  const detailMatch = routePath.match(/^\/customers\/([^/]+)$/);
  const editMatch = routePath.match(/^\/customers\/([^/]+)\/edit$/);

  if (routePath === '/customers') {
    return (
      <View style={[styles.surface, styles.listSurface]}>
        <KolamCustomerListSurface onRouteChange={onRouteChange} />
      </View>
    );
  }

  if (routePath === '/customers/create') {
    return (
      <View style={styles.surface}>
        <KolamCustomerFormSurface onRouteChange={onRouteChange} />
      </View>
    );
  }

  if (editMatch?.[1]) {
    return (
      <View style={styles.surface}>
        <KolamCustomerFormSurface
          customerId={decodeURIComponent(editMatch[1])}
          onRouteChange={onRouteChange}
        />
      </View>
    );
  }

  if (detailMatch?.[1]) {
    return (
      <View style={styles.surface}>
        <KolamCustomerDetailSurface
          customerId={decodeURIComponent(detailMatch[1])}
          onRouteChange={onRouteChange}
        />
      </View>
    );
  }

  return <KolamCustomerModule customers={customers} {...customer} />;
}

function KolamCustomerListSurface({
  onRouteChange,
}: {
  onRouteChange?: (route: string) => void;
}) {
  const [items, setItems] = React.useState<KolamCustomer[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [shouldSearchApi, setShouldSearchApi] = React.useState(false);
  const [pageSize] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [pagination, setPagination] = React.useState(
    INITIAL_CUSTOMER_LIST.pagination,
  );

  React.useEffect(() => {
    let active = true;
    const normalizedSearch = search.trim();
    const handle = setTimeout(() => {
      setLoading(true);
      setError('');
      void getKolamCustomerList({
        limit: pageSize,
        page,
        search: shouldSearchApi ? normalizedSearch : undefined,
      })
        .then(result => {
          if (!active) {
            return;
          }

          setItems(result.items);
          setPagination(result.pagination);
        })
        .catch(errorResult => {
          if (!active) {
            return;
          }

          setItems([]);
          setPagination({
            ...INITIAL_CUSTOMER_LIST.pagination,
            limit: pageSize,
            page,
          });
          setError(
            errorResult instanceof Error
              ? errorResult.message
              : 'Gagal memuat pelanggan.',
          );
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });
    }, 250);

    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [page, pageSize, search, shouldSearchApi]);

  const normalizedSearch = normalizeCustomerSearch(search);
  const clientFilteredItems = React.useMemo(
    () =>
      normalizedSearch
        ? items.filter(item => doesCustomerMatchSearch(item, normalizedSearch))
        : items,
    [items, normalizedSearch],
  );
  const shouldTriggerApiSearch =
    Boolean(normalizedSearch) &&
    !shouldSearchApi &&
    !loading &&
    clientFilteredItems.length === 0;

  React.useEffect(() => {
    if (shouldTriggerApiSearch) {
      setShouldSearchApi(true);
    }
  }, [shouldTriggerApiSearch]);

  const visibleItems =
    normalizedSearch && !shouldSearchApi ? clientFilteredItems : items;
  const clientSearchActive = Boolean(normalizedSearch) && !shouldSearchApi;
  const tableTotal = clientSearchActive ? visibleItems.length : pagination.total;
  const pageCount = clientSearchActive ? 1 : Math.max(1, pagination.totalPages);
  const safePage = Math.min(page, pageCount);
  const searchEmpty = Boolean(normalizedSearch) && !loading && !visibleItems.length;
  const filtersAppliedCount = Number(Boolean(search));
  const customerTableColumns = React.useMemo(
    () => createCustomerListColumns(),
    [],
  );
  const customerTableRows = loading || searchEmpty ? [] : visibleItems;
  const emptyTitle = loading
    ? 'Memuat pelanggan...'
    : searchEmpty
      ? `Tidak ada pelanggan untuk "${search.trim()}"`
      : 'Belum ada pelanggan';

  return (
    <View style={styles.stack}>
      <View style={styles.toolbarWrap}>
        <View style={styles.toolbarShell}>
          <View style={styles.filterRow}>
            <KolamFormTextField
              mode="search"
              onChangeText={next => {
                setSearch(next);
                setShouldSearchApi(false);
                setPage(1);
              }}
              placeholder="Cari nama, telepon, atau email"
              style={styles.searchInput}
              value={search}
            />
          </View>
          <View style={styles.actionRow}>
            {filtersAppliedCount > 0 ? (
              <KolamButton
                label="Hapus filter"
                muted
                onPress={() => {
                  setSearch('');
                  setShouldSearchApi(false);
                  setPage(1);
                }}
                style={styles.toolbarButton}
              />
            ) : null}
            <KolamButton
              intent="primary"
              label="Baru"
              tone="positive"
              onPress={() => onRouteChange?.('/customers/create')}
              style={styles.toolbarButton}
            />
          </View>
        </View>
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
      <KolamListTableComposition
        columns={customerTableColumns}
        emptyTitle={emptyTitle}
        getRowKey={customer => customer.id}
        loading={loading}
        pagination={{
          onPageChange: setPage,
          page: safePage,
          pageSize,
          total: tableTotal,
        }}
        renderActions={customer => (
          <KolamCustomerListActions
            customer={customer}
            onRouteChange={onRouteChange}
          />
        )}
        rowStyle={styles.customerListRow}
        rows={customerTableRows}
      />
    </View>
  );
}

function KolamCustomerDetailSurface({
  customerId,
  onRouteChange,
}: {
  customerId: string;
  onRouteChange?: (route: string) => void;
}) {
  const [customer, setCustomer] = React.useState<KolamCustomer | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [photoSaving, setPhotoSaving] = React.useState(false);

  React.useEffect(() => {
    let active = true;

    if (!customerId) {
      setCustomer(null);
      setError('ID pelanggan tidak valid.');
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError('');
    void getKolamCustomerDetail(customerId)
      .then(nextCustomer => {
        if (active) {
          setCustomer(nextCustomer);
        }
      })
      .catch(errorResult => {
        if (active) {
          setCustomer(null);
          setError(
            errorResult instanceof Error
              ? errorResult.message
              : 'Gagal memuat detail pelanggan.',
          );
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
  }, [customerId]);

  if (loading && !customer) {
    return (
      <View style={styles.detailSurface}>
        <KolamEmptyState
          message="Memuat detail pelanggan."
          title="Memuat pelanggan..."
        />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.detailSurface}>
        <KolamEmptyState
          message={error || 'Pelanggan tidak ditemukan.'}
          title="Detail pelanggan belum tersedia"
        />
        <KolamButton
          label="Daftar"
          onPress={() => onRouteChange?.('/customers')}
          style={styles.detailBackButton}
        />
      </View>
    );
  }

  const mediaItems = createCustomerMediaItems(customer);
  const primaryAddress = getKolamCustomerLocationText(customer);
  const handleUploadPhoto = async () => {
    try {
      setError('');
      const picked = await pickNativeImageFile();
      if (picked.cancelled) {
        return;
      }

      const localUri = picked.uri ?? picked.path ?? '';
      if (!localUri) {
        setError('File foto pelanggan tidak memiliki path yang bisa dibaca.');
        return;
      }

      setPhotoSaving(true);
      const photos = await uploadKolamCustomerPhoto(customer.id, localUri);
      setCustomer(current =>
        current?.id === customer.id ? {...current, photos} : current,
      );
    } catch (errorResult) {
      setError(
        errorResult instanceof Error
          ? errorResult.message
          : 'Gagal mengunggah foto pelanggan.',
      );
    } finally {
      setPhotoSaving(false);
    }
  };
  const handleDeletePhoto = async (index: number) => {
    try {
      setError('');
      setPhotoSaving(true);
      const photos = await deleteKolamCustomerPhoto(customer.id, index);
      setCustomer(current =>
        current?.id === customer.id ? {...current, photos} : current,
      );
    } catch (errorResult) {
      setError(
        errorResult instanceof Error
          ? errorResult.message
          : 'Gagal menghapus foto pelanggan.',
      );
    } finally {
      setPhotoSaving(false);
    }
  };

  return (
    <View style={styles.detailSurface}>
      <View style={styles.detailHeader}>
        <View style={styles.detailHeading}>
          <View style={styles.detailTitleRow}>
            <Text style={styles.detailTitle}>{customer.name}</Text>
            <KolamStatusBadge
              intent={getCustomerStatusIntent(customer.status)}
              label={getCustomerStatusLabel(customer.status)}
              numberOfLines={1}
            />
            {customer.verifiedStatus ? (
              <KolamStatusBadge
                intent="success"
                label="Terverifikasi"
                numberOfLines={1}
              />
            ) : null}
            {customer.accountRestricted ? (
              <KolamStatusBadge
                intent="danger"
                label="Dibatasi"
                numberOfLines={1}
              />
            ) : null}
          </View>
          {customer.notes ? (
            <Text numberOfLines={2} style={styles.detailSubtitle}>
              {customer.notes}
            </Text>
          ) : null}
        </View>
        <View style={styles.detailActions}>
          <KolamButton
            intent="primary"
            label="Rubah"
            onPress={() => onRouteChange?.(`/customers/${customer.id}/edit`)}
          />
          <KolamButton
            label="Daftar"
            onPress={() => onRouteChange?.('/customers')}
          />
        </View>
      </View>

      {error ? (
        <KolamStatusBadge
          intent="danger"
          label={error}
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}

      <View style={styles.detailGrid}>
        <View style={styles.detailMainColumn}>
          <KolamContentFrame
            style={styles.detailCard}
            variant="settingsWebConfig">
            <View style={styles.photoSectionHeader}>
              <SectionTitle
                description="Foto pelanggan"
                title="Foto"
              />
              <KolamButton
                disabled={photoSaving}
                label={photoSaving ? 'Memproses...' : 'Unggah Foto'}
                onPress={() => void handleUploadPhoto()}
              />
            </View>
            {mediaItems.length ? (
              <>
                <KolamDetailMediaPreview
                  items={mediaItems}
                  title={customer.name}
                />
                <View style={styles.photoActionList}>
                  {customer.photos.map((photo, index) => (
                    <View key={`${photo}-${index}`} style={styles.photoActionRow}>
                      <Text numberOfLines={1} style={styles.customerSubText}>
                        Foto {index + 1}
                      </Text>
                      <KolamButton
                        disabled={photoSaving}
                        intent="danger"
                        label="Hapus"
                        onPress={() => void handleDeletePhoto(index)}
                        style={styles.photoDeleteButton}
                      />
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.detailEmptyBox}>
                <Text style={styles.customerSubText}>
                  Foto pelanggan belum tersedia.
                </Text>
              </View>
            )}
          </KolamContentFrame>

          <KolamContentFrame
            style={styles.detailCard}
            variant="settingsWebConfig">
            <SectionTitle
              description="Ringkasan saldo poin member"
              title="Poin Member"
            />
            <View style={styles.pointsGrid}>
              <CustomerPointMetric
                label="Poin Tersedia"
                value={customer.points.availablePoints}
              />
              <CustomerPointMetric
                label="Total Poin"
                value={customer.points.totalPoints}
              />
              <CustomerPointMetric
                label="Poin Lifetime"
                value={customer.points.lifetimePoints}
              />
            </View>
          </KolamContentFrame>
        </View>

        <View style={styles.detailSideColumn}>
          <KolamContentFrame
            style={styles.detailCard}
            variant="settingsWebConfig">
            <SectionTitle
              description="Data profil utama pelanggan"
              title="Informasi Pelanggan"
            />
            <View style={styles.detailRows}>
              <CustomerDetailRow
                label="Jenis Kelamin"
                value={formatCustomerGenderLabel(customer.gender)}
              />
              <CustomerDetailRow
                label="Alamat"
                value={primaryAddress || customer.address || '-'}
              />
              <CustomerDetailRow label="Telepon" value={customer.phone || '-'} />
              <CustomerDetailRow label="Email" value={customer.email || '-'} />
              <CustomerDetailRow
                label="Username"
                value={customer.username ? `@${customer.username}` : '-'}
              />
              <CustomerDetailRow
                label="Status"
                value={
                  <KolamStatusBadge
                    intent={getCustomerStatusIntent(customer.status)}
                    label={getCustomerStatusLabel(customer.status)}
                  />
                }
              />
              <CustomerDetailRow
                label="Dibuat Pada"
                value={formatCustomerDateTime(customer.createdAt)}
              />
              <CustomerDetailRow
                label="Diperbarui Pada"
                value={formatCustomerDateTime(customer.updatedAt)}
              />
            </View>
          </KolamContentFrame>

          {customer.addresses.length ? (
            <KolamContentFrame
              style={styles.detailCard}
              variant="settingsWebConfig">
              <SectionTitle
                description="Alamat tersimpan dari payload pelanggan"
                title="Alamat"
              />
              <View style={styles.addressStack}>
                {customer.addresses.map(address => (
                  <View key={address.id} style={styles.addressCard}>
                    <View style={styles.addressHeader}>
                      <Text style={styles.addressTitle}>
                        {address.label || address.recipientName || 'Alamat'}
                      </Text>
                      {address.isDefault ? (
                        <KolamStatusBadge intent="success" label="Utama" />
                      ) : null}
                    </View>
                    <Text style={styles.customerMetaText}>
                      {formatCustomerAddress(address)}
                    </Text>
                    {address.phone ? (
                      <Text style={styles.customerSubText}>{address.phone}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            </KolamContentFrame>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function KolamCustomerFormSurface({
  customerId,
  onRouteChange,
}: {
  customerId?: string;
  onRouteChange?: (route: string) => void;
}) {
  const isEdit = Boolean(customerId);
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [gender, setGender] = React.useState<CustomerFormGender>('male');
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;

    if (!customerId) {
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setNotes('');
      setGender('male');
      setError('');
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError('');
    void getKolamCustomerDetail(customerId)
      .then(customer => {
        if (!active) {
          return;
        }

        setName(customer.name);
        setPhone(customer.phone);
        setEmail(customer.email);
        setAddress(customer.address);
        setNotes(customer.notes);
        setGender(customer.gender === 'female' ? 'female' : 'male');
      })
      .catch(errorResult => {
        if (active) {
          setError(
            errorResult instanceof Error
              ? errorResult.message
              : 'Gagal memuat pelanggan.',
          );
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
  }, [customerId]);

  const handleCancel = () => {
    onRouteChange?.(customerId ? `/customers/${customerId}` : '/customers');
  };

  const handleSave = () => {
    const payload: KolamCustomerSavePayload = {
      address: address.trim(),
      email: email.trim(),
      gender,
      name: name.trim(),
      notes: notes.trim(),
      phone: phone.trim(),
    };

    if (!payload.name || !payload.phone || !payload.address) {
      setError('Nama lengkap, nomor telepon, dan alamat wajib diisi.');
      return;
    }

    setSaving(true);
    setError('');
    const request =
      customerId != null
        ? updateKolamCustomer(customerId, payload)
        : createKolamCustomer(payload);

    void request
      .then(customer => {
        onRouteChange?.(`/customers/${customer.id}`);
      })
      .catch(errorResult => {
        setError(
          errorResult instanceof Error
            ? errorResult.message
            : isEdit
              ? 'Gagal memperbarui pelanggan.'
              : 'Gagal membuat pelanggan.',
        );
      })
      .finally(() => {
        setSaving(false);
      });
  };

  if (loading) {
    return (
      <View style={styles.detailSurface}>
        <KolamEmptyState
          message="Memuat data pelanggan."
          title="Memuat form pelanggan..."
        />
      </View>
    );
  }

  return (
    <View style={styles.detailSurface}>
      <View style={styles.detailHeader}>
        <View style={styles.detailHeading}>
          <Text style={styles.detailTitle}>
            {isEdit ? 'Rubah Pelanggan' : 'Pelanggan Baru'}
          </Text>
          <Text style={styles.detailSubtitle}>
            {isEdit
              ? 'Perbarui informasi kontak dan data pribadi pelanggan.'
              : 'Isi informasi pribadi dan kontak pelanggan.'}
          </Text>
        </View>
        <View style={styles.detailActions}>
          <KolamButton disabled={saving} label="Batal" onPress={handleCancel} />
          <KolamButton
            disabled={saving}
            intent="primary"
            label={saving ? 'Menyimpan...' : 'Simpan'}
            onPress={handleSave}
          />
        </View>
      </View>

      {error ? (
        <KolamStatusBadge
          intent="danger"
          label={error}
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}

      <KolamContentFrame style={styles.formCard} variant="settingsWebConfig">
        <SectionTitle
          description={
            isEdit
              ? 'Perbarui informasi kontak dan data pribadi pelanggan.'
              : 'Isi informasi pribadi dan kontak pelanggan.'
          }
          title="Detail"
        />
        <View style={styles.formGrid}>
          <CustomerTextField
            label="Nama lengkap"
            onChangeText={setName}
            placeholder="Nama lengkap"
            value={name}
          />
          <CustomerTextField
            label="Nomor telepon"
            onChangeText={setPhone}
            placeholder="Nomor telepon"
            value={phone}
          />
          <CustomerTextField
            label="Email"
            mode="email"
            onChangeText={setEmail}
            placeholder="Alamat email"
            value={email}
          />
          <CustomerTextField
            label="Alamat"
            multiline
            onChangeText={setAddress}
            placeholder="Alamat lengkap"
            value={address}
          />
          <CustomerTextField
            label="Catatan"
            multiline
            onChangeText={setNotes}
            placeholder="Catatan (opsional)"
            value={notes}
          />
          <View style={styles.formField}>
            <Text style={styles.formFieldLabel}>Jenis kelamin</Text>
            <KolamDropdownSelect<CustomerFormGender>
              label="Jenis kelamin"
              onChange={setGender}
              options={[...CUSTOMER_GENDER_OPTIONS]}
              showLabelInTrigger={false}
              style={styles.formDropdown}
              value={gender}
            />
          </View>
        </View>
      </KolamContentFrame>
    </View>
  );
}

function CustomerTextField({
  label,
  multiline = false,
  ...props
}: React.ComponentProps<typeof KolamFormTextField> & {
  label: string;
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formFieldLabel}>{label}</Text>
      <KolamFormTextField
        {...props}
        multiline={multiline}
        style={[styles.formInput, multiline ? styles.formTextarea : null]}
      />
    </View>
  );
}

function normalizeCustomerSearch(value: string) {
  return value.trim().toLowerCase();
}

function createCustomerListColumns(): Array<KolamListTableColumn<KolamCustomer>> {
  return CUSTOMER_LIST_COLUMNS.map(column => ({
    ...column,
    render: customer => renderCustomerListCell(column.id, customer),
  }));
}

function renderCustomerListCell(
  columnId: CustomerListColumnId,
  customer: KolamCustomer,
) {
  const photoUri = getKolamFileUrl(customer.photos[0]);
  const gender = getCustomerGenderSymbol(customer.gender);
  const points = customer.points.availablePoints;

  switch (columnId) {
    case 'customer':
      return (
        <View style={styles.customerIdentityRow}>
          <View style={styles.customerAvatar}>
            {photoUri ? (
              <KolamRemoteImage
                accessibilityLabel={`Foto ${customer.name}`}
                previewItems={customer.photos.map((photo, index) => ({
                  id: `${customer.id}-${index}`,
                  title: customer.name,
                  uri: getKolamFileUrl(photo) ?? '',
                }))}
                resizeMode="cover"
                scope="customer"
                sourceUri={photoUri}
                style={styles.customerAvatarImage}
              />
            ) : (
              <Text style={styles.customerAvatarText}>
                {getCustomerInitials(customer.name)}
              </Text>
            )}
          </View>
          <View style={styles.customerIdentityCopy}>
            <View style={styles.customerNameRow}>
              <Text numberOfLines={2} style={styles.customerNameText}>
                {customer.name}
              </Text>
              {gender ? (
                <Text style={styles.customerGenderText}>{gender}</Text>
              ) : null}
            </View>
            {customer.username ? (
              <Text numberOfLines={1} style={styles.customerSubText}>
                @{customer.username}
              </Text>
            ) : null}
          </View>
        </View>
      );
    case 'contact':
      return (
        <>
          <Text numberOfLines={1} style={styles.customerMetaText}>
            {customer.phone || '-'}
          </Text>
          {customer.email ? (
            <Text numberOfLines={1} style={styles.customerSubText}>
              {customer.email}
            </Text>
          ) : null}
        </>
      );
    case 'location':
      return (
        <Text numberOfLines={2} style={styles.customerMetaText}>
          {getKolamCustomerLocationText(customer) || '-'}
        </Text>
      );
    case 'points':
      return points > 0 ? (
        <KolamStatusBadge
          intent="warning"
          label={formatCustomerNumber(points)}
          style={styles.customerPointBadge}
        />
      ) : (
        <Text style={[styles.customerSubText, styles.customerTextRight]}>
          0
        </Text>
      );
    case 'status':
      return (
        <View style={styles.customerStatusStack}>
          <View style={styles.customerStatusRow}>
            <KolamStatusBadge
              intent={customer.verifiedStatus ? 'success' : 'warning'}
              label={customer.verifiedStatus ? 'Aktif' : 'Perlu Verifikasi'}
              numberOfLines={1}
            />
            {customer.accountRestricted ? (
              <KolamStatusBadge
                intent="danger"
                label="Dibatasi"
                numberOfLines={1}
              />
            ) : null}
          </View>
          {customer.externalAccounts.length ? (
            <View style={styles.customerExternalRow}>
              {customer.externalAccounts.map(account => (
                <View
                  key={`${account.platform}-${account.externalId}`}
                  style={[
                    styles.customerExternalDot,
                    getCustomerExternalDotStyle(account),
                  ]}>
                  <Text style={styles.customerExternalDotText}>
                    {getCustomerExternalLabel(account)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      );
    case 'created':
      return (
        <Text style={[styles.customerSubText, styles.customerTextRight]}>
          {formatCustomerDate(customer.createdAt)}
        </Text>
      );
  }
}

function KolamCustomerListActions({
  customer,
  onRouteChange,
}: {
  customer: KolamCustomer;
  onRouteChange?: (route: string) => void;
}) {
  const customerRouteId = encodeURIComponent(customer.id);

  return (
    <KolamOverflowMenuButton
      accessibilityLabel={`Menu ${customer.name}`}
      actions={[
        {
          label: 'Lihat',
          onPress: () => onRouteChange?.(`/customers/${customerRouteId}`),
        },
        {
          label: 'Rubah',
          onPress: () => onRouteChange?.(`/customers/${customerRouteId}/edit`),
        },
        {
          disabled: true,
          label: 'Hapus',
          onPress: () => undefined,
          tone: 'danger',
        },
      ]}
    />
  );
}

function SectionTitle({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <View style={styles.sectionTitleBlock}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {description ? (
        <Text style={styles.sectionDescription}>{description}</Text>
      ) : null}
    </View>
  );
}

function CustomerDetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailRowLabel}>{label}</Text>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Text style={styles.detailRowValue}>{value}</Text>
      ) : (
        <View style={styles.detailRowValueBox}>{value}</View>
      )}
    </View>
  );
}

function CustomerPointMetric({label, value}: {label: string; value: number}) {
  return (
    <View style={styles.pointMetric}>
      <Text style={styles.pointMetricValue}>{formatCustomerNumber(value)}</Text>
      <Text style={styles.pointMetricLabel}>{label}</Text>
    </View>
  );
}

function doesCustomerMatchSearch(
  customer: KolamCustomer,
  normalizedSearch: string,
) {
  return [
    customer.name,
    customer.phone,
    customer.email,
    customer.address,
    customer.gender,
    customer.username,
    getKolamCustomerLocationText(customer),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(normalizedSearch);
}

function createCustomerMediaItems(customer: KolamCustomer): KolamDetailMediaItem[] {
  return customer.photos.reduce<KolamDetailMediaItem[]>((items, photo, index) => {
    const uri = getKolamFileUrl(photo);

    if (!uri) {
      return items;
    }

    items.push({
      badgeLabel: `${index + 1} / ${customer.photos.length}`,
      id: `${customer.id}-${index}`,
      label: customer.name,
      revision: photo,
      scope: 'customer',
      type: 'image',
      uri,
    });

    return items;
  }, []);
}

function formatCustomerAddress(address: KolamCustomerAddress) {
  return [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.province,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(', ') || '-';
}

function formatCustomerDate(value: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const weekday = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
  }).format(date);

  return `${weekday}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function formatCustomerDateTime(value: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatCustomerNumber(value: number) {
  return new Intl.NumberFormat('id-ID').format(value);
}

function getCustomerInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getCustomerGenderSymbol(gender: string) {
  if (gender === 'male') {
    return 'L';
  }

  if (gender === 'female') {
    return 'P';
  }

  return '';
}

function formatCustomerGenderLabel(gender: string) {
  if (gender === 'male') {
    return 'Laki-laki';
  }

  if (gender === 'female') {
    return 'Perempuan';
  }

  if (gender === 'other') {
    return 'Lainnya';
  }

  return gender || '-';
}

function getCustomerStatusLabel(status: string) {
  if (status === 'active') {
    return 'Aktif';
  }

  if (status === 'inactive') {
    return 'Nonaktif';
  }

  if (status === 'blacklisted') {
    return 'Diblokir';
  }

  return status || '-';
}

function getCustomerStatusIntent(status: string) {
  if (status === 'active') {
    return 'success' as const;
  }

  if (status === 'blacklisted') {
    return 'danger' as const;
  }

  return 'muted' as const;
}

function getCustomerExternalLabel(account: KolamCustomerExternalAccount) {
  if (account.platform === 'tokopedia') {
    return 'T';
  }

  if (account.platform === 'shopee') {
    return 'S';
  }

  return account.platform[0]?.toUpperCase() ?? '?';
}

function getCustomerExternalDotStyle(account: KolamCustomerExternalAccount) {
  if (account.platform === 'tokopedia') {
    return styles.customerExternalTokopedia;
  }

  if (account.platform === 'shopee') {
    return styles.customerExternalShopee;
  }

  return styles.customerExternalOther;
}

const styles = StyleSheet.create({
  surface: {
    gap: 16,
  },
  listSurface: {
    flex: 1,
    minHeight: 0,
  },
  stack: {
    gap: 12,
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
    flexBasis: 260,
    flexGrow: 1,
    maxWidth: 420,
    minWidth: 220,
  },
  toolbarButton: {
    flexShrink: 0,
    minHeight: 34,
    paddingHorizontal: 10,
  },
  errorText: {
    color: V.colors.danger,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
  },
  customerListRow: {
    alignItems: 'center',
    gap: 8,
  },
  customerIdentityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minWidth: 0,
  },
  customerAvatar: {
    alignItems: 'center',
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 36,
  },
  customerAvatarImage: {
    height: 36,
    width: 36,
  },
  customerAvatarText: {
    color: V.colors.primary,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  customerIdentityCopy: {
    flex: 1,
    minWidth: 0,
  },
  customerNameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    minWidth: 0,
  },
  customerNameText: {
    color: V.colors.fg,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  customerGenderText: {
    color: V.colors.mutedFg,
    flexShrink: 0,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
  },
  customerMetaText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
  },
  customerSubText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 18,
  },
  customerTextRight: {
    textAlign: 'right',
  },
  customerPointBadge: {
    alignSelf: 'flex-end',
  },
  customerStatusStack: {
    gap: 4,
    minWidth: 0,
  },
  customerStatusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  customerExternalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  customerExternalDot: {
    alignItems: 'center',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  customerExternalTokopedia: {
    backgroundColor: V.colors.successSoft,
  },
  customerExternalShopee: {
    backgroundColor: V.colors.warningSoft,
  },
  customerExternalOther: {
    backgroundColor: V.colors.secondary,
  },
  customerExternalDotText: {
    color: V.colors.fg,
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 14,
  },
  detailSurface: {
    gap: 14,
    paddingBottom: 20,
  },
  detailHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  detailHeading: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  detailTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  detailTitle: {
    color: V.colors.fg,
    flexShrink: 1,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  detailSubtitle: {
    color: V.colors.mutedFg,
    fontSize: 13,
    lineHeight: 20,
  },
  detailActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  detailBackButton: {
    alignSelf: 'flex-start',
  },
  errorBadge: {
    alignSelf: 'flex-start',
  },
  detailGrid: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
  },
  detailMainColumn: {
    flex: 1.2,
    gap: 14,
    minWidth: 0,
  },
  detailSideColumn: {
    flex: 1,
    gap: 14,
    minWidth: 300,
  },
  detailCard: {
    gap: 12,
    padding: 14,
  },
  sectionTitleBlock: {
    gap: 3,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
  },
  sectionDescription: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 18,
  },
  detailEmptyBox: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 120,
    justifyContent: 'center',
    padding: 14,
  },
  photoSectionHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  photoActionList: {
    gap: 6,
  },
  photoActionRow: {
    alignItems: 'center',
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  photoDeleteButton: {
    minHeight: 30,
    paddingHorizontal: 10,
  },
  pointsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pointMetric: {
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 150,
    flexGrow: 1,
    gap: 4,
    padding: 12,
  },
  pointMetricValue: {
    color: V.colors.primary,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  pointMetricLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  detailRows: {
    gap: 0,
  },
  detailRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    gap: 6,
    paddingVertical: 10,
  },
  detailRowLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
  },
  detailRowValue: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
  },
  detailRowValueBox: {
    alignItems: 'flex-start',
  },
  addressStack: {
    gap: 8,
  },
  addressCard: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 10,
  },
  addressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  addressTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  formCard: {
    gap: 14,
    padding: 14,
  },
  formGrid: {
    gap: 12,
  },
  formField: {
    gap: 6,
  },
  formFieldLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
  },
  formInput: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.fg,
    fontSize: 13,
    minHeight: 38,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  formTextarea: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  formDropdown: {
    alignSelf: 'flex-start',
    minWidth: 220,
  },
});
