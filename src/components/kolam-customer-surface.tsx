import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  getKolamCustomerLocationText,
  type KolamCustomer,
  type KolamCustomerListResult,
} from '../domain/kolam-customer';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {getKolamCustomerList} from '../services/kolam-customer-api';
import type {
  KolamCustomerList,
  KolamCustomerSurfaceProps,
} from './kolam-workspace-module-surface-types';
import {KolamButton} from './kolam-button';
import {KolamCatalogListTableShell} from './kolam-catalog-list-table-shell';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamTableFooterControls} from './kolam-dropdown-select';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamFormTextField} from './kolam-form-text-field';
import {KolamCustomerModule} from './kolam-pos-workspace-widgets';

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
          <View style={styles.summaryPanel}>
            <Text style={styles.summaryTitle}>
              {visibleItems.length} pelanggan dimuat
            </Text>
            <Text style={styles.summaryDescription}>
              {clientSearchActive
                ? 'Hasil dari pencarian lokal.'
                : 'Data live dari server.'}
            </Text>
          </View>
        )}
      </KolamCatalogListTableShell>
    </View>
  );
}

function normalizeCustomerSearch(value: string) {
  return value.trim().toLowerCase();
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
  summaryPanel: {
    gap: 4,
    minHeight: 120,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  summaryTitle: {
    color: V.colors.fg,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 24,
  },
  summaryDescription: {
    color: V.colors.mutedFg,
    fontSize: 13,
    lineHeight: 20,
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
