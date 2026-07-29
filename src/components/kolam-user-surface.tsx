import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  type KolamUserListItem,
  type KolamUserListPagination,
} from '../domain/kolam-user';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {getKolamUserList} from '../services/kolam-user-api';
import {KolamCatalogListTableShell} from './kolam-catalog-list-table-shell';
import {KolamTableFooterControls} from './kolam-dropdown-select';
import {KolamEmptyState} from './kolam-empty-state';

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
  onRouteChange: _onRouteChange,
  route: _route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const [items, setItems] = React.useState<KolamUserListItem[]>([]);
  const [pagination, setPagination] =
    React.useState<KolamUserListPagination>(INITIAL_PAGINATION);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const loadUsers = React.useCallback(
    async (page = pagination.page, limit = pagination.limit) => {
      setLoading(true);
      setError('');

      try {
        const result = await getKolamUserList({limit, page});
        setItems(result.items);
        setPagination(result.pagination);
      } catch {
        setItems([]);
        setPagination(current => ({...current, page, limit, total: 0}));
        setError('Gagal memuat daftar pengguna.');
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit, pagination.page],
  );

  React.useEffect(() => {
    void loadUsers(1, pagination.limit);
  }, [loadUsers, pagination.limit]);

  const emptyTitle = loading
    ? 'Memuat pengguna'
    : error
      ? 'Daftar pengguna belum termuat'
      : 'Belum ada pengguna';
  const emptyMessage = loading
    ? 'Mengambil data pengguna dari server.'
    : error || 'Tidak ada data pengguna pada halaman ini.';

  return (
    <View style={styles.surface}>
      <View style={styles.toolbar}>
        <Text style={styles.searchPlaceholder}>Cari</Text>
      </View>

      <KolamCatalogListTableShell
        footer={
          <KolamTableFooterControls
            onPageSizeChange={nextLimit => loadUsers(1, nextLimit)}
            page={pagination.page}
            pageSize={pagination.limit}
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
  toolbar: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 42,
    paddingHorizontal: 14,
  },
  searchPlaceholder: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
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
