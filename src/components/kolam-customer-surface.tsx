import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  getKolamCustomerLocationText,
  type KolamCustomer,
  type KolamCustomerExternalAccount,
  type KolamCustomerListResult,
} from '../domain/kolam-customer';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {getKolamFileUrl} from '../lib/file-url';
import {getKolamCustomerList} from '../services/kolam-customer-api';
import type {
  KolamCustomerList,
  KolamCustomerSurfaceProps,
} from './kolam-workspace-module-surface-types';
import {KolamButton} from './kolam-button';
import {KolamCatalogListTableShell} from './kolam-catalog-list-table-shell';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamDataTableRowFrame} from './kolam-data-table-row-frame';
import {KolamTableFooterControls} from './kolam-dropdown-select';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamFormTextField} from './kolam-form-text-field';
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
  {id: 'actions', label: '', flex: 0.35, align: 'right'},
] as const;

type CustomerListColumnId = (typeof CUSTOMER_LIST_COLUMNS)[number]['id'];

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
  if (route?.split('?')[0] === '/customers') {
    return <KolamCustomerListSurface onRouteChange={onRouteChange} />;
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
  const [pageSize, setPageSize] = React.useState(10);
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
              : 'Gagal memuat pelanggan dari server.',
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
              onPress={() => onRouteChange?.('/customers/create')}
              style={styles.toolbarButton}
            />
          </View>
        </View>
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
      <KolamCatalogListTableShell
        footer={
          <KolamTableFooterControls
            onPageSizeChange={next => {
              setPageSize(next);
              setPage(1);
            }}
            page={safePage}
            pageSize={pageSize}
            total={tableTotal}>
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
                  onPress={() =>
                    setPage(current => Math.min(pageCount, current + 1))
                  }
                />
              </View>
            ) : null}
          </KolamTableFooterControls>
        }>
        {loading || searchEmpty || visibleItems.length === 0 ? (
          <View style={styles.placeholderBody}>
            <KolamEmptyState
              compact
              message={
                searchEmpty
                  ? shouldSearchApi
                    ? 'Coba kata kunci lain'
                    : 'Mencari di server untuk hasil lainnya...'
                  : 'Data pelanggan belum tersedia dari server.'
              }
              title={
                loading
                  ? 'Memuat pelanggan...'
                  : searchEmpty
                    ? `Tidak ada pelanggan untuk "${search.trim()}"`
                    : 'Belum ada pelanggan'
              }
            />
          </View>
        ) : (
          <>
            <View style={styles.customerHeaderRow}>
              {CUSTOMER_LIST_COLUMNS.map(column => (
                <View
                  key={column.id}
                  style={[
                    styles.customerListCell,
                    {flex: column.flex},
                    column.align === 'right' && styles.customerListCellRight,
                  ]}>
                  {column.label ? (
                    <Text
                      style={[
                        styles.customerHeaderCellText,
                        column.align === 'right' && styles.customerTextRight,
                      ]}>
                      {column.label}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
            {visibleItems.map(customer => (
              <KolamCustomerListRow customer={customer} key={customer.id} />
            ))}
          </>
        )}
      </KolamCatalogListTableShell>
    </View>
  );
}

function normalizeCustomerSearch(value: string) {
  return value.trim().toLowerCase();
}

function KolamCustomerListRow({customer}: {customer: KolamCustomer}) {
  const photoUri = getKolamFileUrl(customer.photos[0]);
  const gender = getCustomerGenderSymbol(customer.gender);
  const points = customer.points.availablePoints;

  return (
    <KolamDataTableRowFrame style={styles.customerListRow}>
      <View style={getCustomerListCellStyle('customer')}>
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
      </View>
      <View style={getCustomerListCellStyle('contact')}>
        <Text numberOfLines={1} style={styles.customerMetaText}>
          {customer.phone || '-'}
        </Text>
        {customer.email ? (
          <Text numberOfLines={1} style={styles.customerSubText}>
            {customer.email}
          </Text>
        ) : null}
      </View>
      <View style={getCustomerListCellStyle('location')}>
        <Text numberOfLines={2} style={styles.customerMetaText}>
          {getKolamCustomerLocationText(customer) || '-'}
        </Text>
      </View>
      <View style={getCustomerListCellStyle('points')}>
        {points > 0 ? (
          <KolamStatusBadge
            intent="warning"
            label={formatCustomerNumber(points)}
            style={styles.customerPointBadge}
          />
        ) : (
          <Text style={[styles.customerSubText, styles.customerTextRight]}>
            0
          </Text>
        )}
      </View>
      <View style={getCustomerListCellStyle('status')}>
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
      </View>
      <View style={getCustomerListCellStyle('created')}>
        <Text style={[styles.customerSubText, styles.customerTextRight]}>
          {formatCustomerDate(customer.createdAt)}
        </Text>
      </View>
      <View style={getCustomerListCellStyle('actions')} />
    </KolamDataTableRowFrame>
  );
}

function getCustomerListCellStyle(columnId: CustomerListColumnId) {
  const column = CUSTOMER_LIST_COLUMNS.find(item => item.id === columnId);

  return [
    styles.customerListCell,
    {flex: column?.flex ?? 1},
    column?.align === 'right' && styles.customerListCellRight,
  ];
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
  placeholderBody: {
    padding: 12,
  },
  customerHeaderRow: {
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
  customerHeaderCellText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  customerListRow: {
    alignItems: 'center',
    gap: 8,
  },
  customerListCell: {
    minWidth: 0,
  },
  customerListCellRight: {
    alignItems: 'flex-end',
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
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
  },
});
