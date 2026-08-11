import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  useKolamAuthContext,
  useKolamDataContext,
} from '../context/kolam-app-contexts';
import {
  getKolamCustomerLocationText,
  type KolamCustomer,
  type KolamCustomerAddress,
  type KolamCustomerExternalAccount,
  type KolamCustomerActivityResult,
  type KolamCustomerProjectActivity,
  type KolamCustomerListResult,
  type KolamCustomerPointTransaction,
  type KolamCustomerPointTransactionsResult,
  type KolamCustomerSaleActivity,
  type KolamCustomerSavePayload,
  type KolamCustomerSubscriptionActivity,
  type KolamCustomerStorageItem,
  type KolamCustomerStorageResult,
} from '../domain/kolam-customer';
import {
  type KolamEnclosure,
  type KolamEnclosureListResult,
} from '../domain/kolam-enclosure';
import {
  canEditKolamTaxPartyProfile,
  createEmptyKolamTaxPartyProfileFormState,
  hasKolamTaxPartyNpwp,
  type KolamTaxPartyProfileFormState,
} from '../domain/kolam-tax-party';
import type {KolamFreyerIotDevice} from '../domain/kolam-freyer-iot-device';
import type {SettingsTabVisibilityContext} from '../domain/settings-surface';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {getKolamFileUrl} from '../lib/file-url';
import {
  attachKolamFreyerToCustomer,
  createKolamCustomer,
  deleteKolamCustomer,
  deleteKolamCustomerPhoto,
  detachKolamFreyerFromCustomer,
  getKolamCustomerActivity,
  getKolamCustomerDetail,
  getKolamCustomerFreyerDevices,
  getKolamCustomerList,
  getKolamCustomerPointTransactions,
  getKolamCustomerStorage,
  getKolamUnattachedCustomerFreyerDevices,
  updateKolamCustomer,
  uploadKolamCustomerPhoto,
} from '../services/kolam-customer-api';
import {getKolamEnclosures} from '../services/kolam-enclosure-api';
import {downloadKolamLayananSubscriptionInvoice} from '../services/kolam-layanan-api';
import {downloadKolamProyekInvoice} from '../services/kolam-proyek-api';
import {downloadKolamSaleInvoice} from '../services/kolam-sales-api';
import {
  getKolamTaxPartyProfile,
  upsertKolamTaxPartyProfile,
} from '../services/kolam-financial-settings-api';
import {pickNativeImageFile} from '../services/native-file-picker';
import type {
  KolamCustomerList,
  KolamCustomerSurfaceProps,
} from './kolam-workspace-module-surface-types';
import {KolamButton} from './kolam-button';
import {KolamDeleteButton} from './kolam-delete-button';
import {KolamCancelButton} from './kolam-cancel-button';
import {KolamSaveButton} from './kolam-save-button';
import {KolamDaftarButton} from './kolam-daftar-button';
import {KolamEditButton} from './kolam-edit-button';
import {KolamContentFrame} from './kolam-content-frame';
import {KolamDeleteConfirmDialog} from './kolam-delete-confirm-dialog';
import {KolamDetailSummaryCard} from './kolam-detail-summary-card';
import type {KolamDetailMediaItem} from './kolam-detail-media-preview';
import {
  KolamDropdownSelect,
  KolamTableRowActionMenu,
} from './kolam-dropdown-select';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamFormTextField} from './kolam-form-text-field';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';
import {KolamCustomerModule} from './kolam-pos-workspace-widgets';
import {KolamNotesField} from './kolam-notes-field';
import {KolamPdfDownloadButton} from './kolam-pdf-download-button';
import {KolamRemoteImage} from './kolam-remote-image';
import {KolamStatusBadge} from './kolam-status-badge';

const CUSTOMER_LIST_COLUMNS = [
  {id: 'customer', label: 'Pelanggan', flex: 1.55, align: 'left'},
  {id: 'contact', label: 'Kontak', flex: 1.25, align: 'left'},
  {id: 'location', label: 'Lokasi', flex: 1.25, align: 'left'},
  {id: 'points', label: 'Poin', flex: 0.65, align: 'center'},
  {id: 'status', label: 'Status', flex: 1.05, align: 'center'},
  {id: 'created', label: 'Dibuat', flex: 0.95, align: 'center'},
] as const;

type CustomerListColumnId = (typeof CUSTOMER_LIST_COLUMNS)[number]['id'];
type CustomerFormGender = 'male' | 'female';

const CUSTOMER_GENDER_OPTIONS = [
  {label: 'Laki-laki', value: 'male'},
  {label: 'Perempuan', value: 'female'},
] as const;

const CUSTOMER_POINT_TRANSACTION_COLUMNS: Array<
  KolamListTableColumn<KolamCustomerPointTransaction>
> = [
  {
    align: 'left',
    flex: 1.25,
    id: 'type',
    label: 'Tipe',
    render: transaction => (
      <KolamStatusBadge
        intent={getCustomerPointTransactionIntent(transaction.type)}
        label={getCustomerPointTransactionLabel(transaction.type)}
      />
    ),
  },
  {
    align: 'left',
    flex: 1.45,
    id: 'description',
    label: 'Keterangan',
    render: transaction => (
      <View style={styles.customerPointTransactionCopy}>
        <Text numberOfLines={1} style={styles.customerMetaText}>
          {transaction.description || 'Transaksi poin'}
        </Text>
        {transaction.sale?.invoiceCode ? (
          <Text numberOfLines={1} style={styles.customerSubText}>
            {transaction.sale.invoiceCode}
          </Text>
        ) : null}
      </View>
    ),
  },
  {
    align: 'center',
    flex: 0.95,
    id: 'method',
    label: 'Metode',
    render: transaction => (
      <View style={styles.customerPointTransactionMethod}>
        <KolamStatusBadge
          intent={transaction.method === 'manual' ? 'secondary' : 'info'}
          label={
            transaction.method === 'manual'
              ? 'Manual'
              : transaction.method || 'Produk'
          }
          style={styles.customerPointTransactionMethodBadge}
        />
      </View>
    ),
  },
  {
    align: 'center',
    flex: 0.8,
    id: 'points',
    label: 'Poin',
    render: transaction => (
      <Text
        style={[
          styles.customerPointTransactionPoints,
          transaction.points > 0
            ? styles.customerPointTransactionPointsIn
            : transaction.points < 0
              ? styles.customerPointTransactionPointsOut
              : null,
        ]}>
        {transaction.points > 0 ? '+' : ''}
        {formatCustomerNumber(transaction.points)}
      </Text>
    ),
  },
  {
    align: 'center',
    flex: 0.95,
    id: 'created',
    label: 'Dibuat',
    render: transaction => (
      <Text style={[styles.customerSubText, styles.customerTextCenter]}>
        {formatCustomerDate(transaction.createdAt)}
      </Text>
    ),
  },
];

const INITIAL_CUSTOMER_LIST: KolamCustomerListResult = {
  items: [],
  pagination: {
    limit: 10,
    page: 1,
    total: 0,
    totalPages: 1,
  },
};

const INITIAL_CUSTOMER_POINT_TRANSACTIONS: KolamCustomerPointTransactionsResult =
  {
    items: [],
    pagination: {
      limit: 10,
      page: 1,
      total: 0,
      totalPages: 1,
    },
  };

const INITIAL_CUSTOMER_STORAGE: KolamCustomerStorageResult = {
  items: [],
  pagination: {
    limit: 50,
    page: 1,
    total: 0,
    totalPages: 1,
  },
};

const INITIAL_CUSTOMER_ENCLOSURES: KolamEnclosureListResult = {
  data: [],
  pagination: {
    limit: 50,
    page: 1,
    total: 0,
    totalPages: 1,
  },
};

const INITIAL_CUSTOMER_ACTIVITY: KolamCustomerActivityResult = {
  projects: [],
  sales: [],
  subscriptions: [],
};

const PROJECT_INVOICE_BLOCKED = new Set([
  'draft',
  'quotation_sent',
  'revision_in_progress',
  'cancelled',
]);

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
  const [deleteTarget, setDeleteTarget] = React.useState<KolamCustomer | null>(
    null,
  );
  const [deleting, setDeleting] = React.useState(false);

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
  const handleDeleteCustomer = React.useCallback(() => {
    if (!deleteTarget || deleting) {
      return;
    }

    setDeleting(true);
    setError('');
    void deleteKolamCustomer(deleteTarget.id)
      .then(() => {
        setItems(current =>
          current.filter(customer => customer.id !== deleteTarget.id),
        );
        setPagination(current => ({
          ...current,
          total: Math.max(0, current.total - 1),
        }));
        setDeleteTarget(null);
      })
      .catch(errorResult => {
        setError(
          errorResult instanceof Error
            ? errorResult.message
            : 'Gagal menghapus pelanggan.',
        );
      })
      .finally(() => {
        setDeleting(false);
      });
  }, [deleteTarget, deleting]);

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
            onDelete={() => setDeleteTarget(customer)}
            onRouteChange={onRouteChange}
          />
        )}
        rowStyle={styles.customerListRow}
        rows={customerTableRows}
      />
      <KolamDeleteConfirmDialog
        itemLabel={deleteTarget?.name}
        itemType="pelanggan"
        onCancel={() => {
          if (!deleting) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={handleDeleteCustomer}
        visible={Boolean(deleteTarget)}
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
  const {authUser} = useKolamAuthContext();
  const {setDataset} = useKolamDataContext();
  const [customer, setCustomer] = React.useState<KolamCustomer | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [photoSaving, setPhotoSaving] = React.useState(false);
  const [taxProfile, setTaxProfile] =
    React.useState<KolamTaxPartyProfileFormState>(() =>
      createEmptyKolamTaxPartyProfileFormState(),
    );
  const [taxProfileLoaded, setTaxProfileLoaded] = React.useState(false);
  const [taxProfileSaving, setTaxProfileSaving] = React.useState(false);
  const [pointTransactions, setPointTransactions] = React.useState(
    INITIAL_CUSTOMER_POINT_TRANSACTIONS,
  );
  const [pointTransactionsLoading, setPointTransactionsLoading] =
    React.useState(false);
  const [pointTransactionsPage, setPointTransactionsPage] = React.useState(1);
  const [customerStorage, setCustomerStorage] = React.useState(
    INITIAL_CUSTOMER_STORAGE,
  );
  const [customerStorageLoading, setCustomerStorageLoading] =
    React.useState(false);
  const [customerEnclosures, setCustomerEnclosures] = React.useState(
    INITIAL_CUSTOMER_ENCLOSURES,
  );
  const [customerEnclosuresLoading, setCustomerEnclosuresLoading] =
    React.useState(false);
  const [customerActivity, setCustomerActivity] = React.useState(
    INITIAL_CUSTOMER_ACTIVITY,
  );
  const [customerActivityLoading, setCustomerActivityLoading] =
    React.useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = React.useState('');
  const [freyerDevices, setFreyerDevices] = React.useState<
    KolamFreyerIotDevice[]
  >([]);
  const [unattachedFreyerDevices, setUnattachedFreyerDevices] = React.useState<
    KolamFreyerIotDevice[]
  >([]);
  const [freyerLoading, setFreyerLoading] = React.useState(false);
  const [freyerSaving, setFreyerSaving] = React.useState(false);
  const [selectedFreyerId, setSelectedFreyerId] = React.useState('');

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
          setDataset(currentDataset => {
            const nextListCustomer = {
              id: nextCustomer.id,
              name: nextCustomer.name,
              phone: nextCustomer.phone,
              email: nextCustomer.email,
              address: nextCustomer.address,
            };
            const existingIndex = currentDataset.customers.findIndex(
              item => item.id === nextCustomer.id,
            );

            if (existingIndex === -1) {
              return {
                ...currentDataset,
                customers: [...currentDataset.customers, nextListCustomer],
              };
            }

            const currentListCustomer =
              currentDataset.customers[existingIndex];

            if (
              currentListCustomer.name === nextListCustomer.name &&
              currentListCustomer.phone === nextListCustomer.phone &&
              currentListCustomer.email === nextListCustomer.email &&
              currentListCustomer.address === nextListCustomer.address
            ) {
              return currentDataset;
            }

            return {
              ...currentDataset,
              customers: currentDataset.customers.map(item =>
                item.id === nextCustomer.id
                  ? {...item, ...nextListCustomer}
                  : item,
              ),
            };
          });
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
  }, [customerId, setDataset]);

  React.useEffect(() => {
    let active = true;

    if (!customer?.id) {
      setTaxProfile(createEmptyKolamTaxPartyProfileFormState());
      setTaxProfileLoaded(false);
      return () => {
        active = false;
      };
    }

    setTaxProfileLoaded(false);
    void getKolamTaxPartyProfile('customer', customer.id)
      .then(profile => {
        if (!active) {
          return;
        }

        setTaxProfile({
          legalName: profile.legalName || customer.name,
          npwp: profile.npwp,
          npwp16: profile.npwp16,
        });
      })
      .catch(() => {
        if (active) {
          setTaxProfile(createEmptyKolamTaxPartyProfileFormState(customer.name));
        }
      })
      .finally(() => {
        if (active) {
          setTaxProfileLoaded(true);
        }
      });

    return () => {
      active = false;
    };
  }, [customer?.id, customer?.name]);

  React.useEffect(() => {
    let active = true;

    if (!customerId) {
      setPointTransactions(INITIAL_CUSTOMER_POINT_TRANSACTIONS);
      return () => {
        active = false;
      };
    }

    setPointTransactionsLoading(true);
    void getKolamCustomerPointTransactions({
      id: customerId,
      limit: 10,
      page: pointTransactionsPage,
    })
      .then(result => {
        if (active) {
          setPointTransactions(result);
        }
      })
      .catch(() => {
        if (active) {
          setPointTransactions(INITIAL_CUSTOMER_POINT_TRANSACTIONS);
        }
      })
      .finally(() => {
        if (active) {
          setPointTransactionsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [customerId, pointTransactionsPage]);

  React.useEffect(() => {
    let active = true;

    if (!customerId) {
      setCustomerStorage(INITIAL_CUSTOMER_STORAGE);
      return () => {
        active = false;
      };
    }

    setCustomerStorageLoading(true);
    void getKolamCustomerStorage({
      customerId,
      limit: 50,
      page: 1,
    })
      .then(result => {
        if (active) {
          setCustomerStorage(result);
        }
      })
      .catch(() => {
        if (active) {
          setCustomerStorage(INITIAL_CUSTOMER_STORAGE);
        }
      })
      .finally(() => {
        if (active) {
          setCustomerStorageLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [customerId]);

  React.useEffect(() => {
    let active = true;

    if (!customerId) {
      setCustomerEnclosures(INITIAL_CUSTOMER_ENCLOSURES);
      return () => {
        active = false;
      };
    }

    setCustomerEnclosuresLoading(true);
    void getKolamEnclosures({
      customer: customerId,
      enclosureType: 'all',
      limit: 50,
      livestockPurpose: 'all',
      page: 1,
      scope: 'client_linked',
      search: '',
    })
      .then(result => {
        if (active) {
          setCustomerEnclosures(result);
        }
      })
      .catch(() => {
        if (active) {
          setCustomerEnclosures(INITIAL_CUSTOMER_ENCLOSURES);
        }
      })
      .finally(() => {
        if (active) {
          setCustomerEnclosuresLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [customerId]);

  React.useEffect(() => {
    let active = true;

    if (!customerId) {
      setCustomerActivity(INITIAL_CUSTOMER_ACTIVITY);
      return () => {
        active = false;
      };
    }

    setCustomerActivityLoading(true);
    void getKolamCustomerActivity(customerId)
      .then(result => {
        if (active) {
          setCustomerActivity(result);
        }
      })
      .catch(() => {
        if (active) {
          setCustomerActivity(INITIAL_CUSTOMER_ACTIVITY);
        }
      })
      .finally(() => {
        if (active) {
          setCustomerActivityLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [customerId]);

  const reloadFreyerDevices = React.useCallback(async () => {
    if (!customerId) {
      setFreyerDevices([]);
      setUnattachedFreyerDevices([]);
      return;
    }

    setFreyerLoading(true);
    try {
      const [attached, unattached] = await Promise.all([
        getKolamCustomerFreyerDevices(customerId),
        getKolamUnattachedCustomerFreyerDevices(),
      ]);
      setFreyerDevices(attached);
      setUnattachedFreyerDevices(unattached);
    } catch (errorResult) {
      setError(
        errorResult instanceof Error
          ? errorResult.message
          : 'Gagal memuat perangkat Freyer.',
      );
    } finally {
      setFreyerLoading(false);
    }
  }, [customerId]);

  React.useEffect(() => {
    void reloadFreyerDevices();
  }, [reloadFreyerDevices]);

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
        <KolamDaftarButton
          onPress={() => onRouteChange?.('/customers')}
          style={styles.detailBackButton}
        />
      </View>
    );
  }

  const mediaItems = createCustomerMediaItems(customer);
  const hasAddresses = customer.addresses.length > 0;
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
  const handleChangeTaxProfile = (
    patch: Partial<KolamTaxPartyProfileFormState>,
  ) => {
    setTaxProfile(current => ({...current, ...patch}));
  };
  const handleSaveTaxProfile = async () => {
    if (!customer || taxProfileSaving) {
      return;
    }

    const npwpDigits = taxProfile.npwp.replace(/\D/g, '');
    const npwp16Digits = taxProfile.npwp16.replace(/\D/g, '');

    if (npwpDigits && npwpDigits.length !== 15) {
      setError('NPWP 15 digit harus berisi 15 angka.');
      return;
    }

    if (npwp16Digits && npwp16Digits.length !== 16) {
      setError('NPWP 16 digit harus berisi 16 angka.');
      return;
    }

    setTaxProfileSaving(true);
    setError('');
    try {
      const saved = await upsertKolamTaxPartyProfile('customer', customer.id, {
        legalName: taxProfile.legalName.trim() || customer.name,
        npwp: taxProfile.npwp.trim(),
        npwp16: taxProfile.npwp16.trim(),
      });
      setTaxProfile({
        legalName: saved.legalName || customer.name,
        npwp: saved.npwp,
        npwp16: saved.npwp16,
      });
      setTaxProfileLoaded(true);
    } catch (errorResult) {
      setError(
        errorResult instanceof Error
          ? errorResult.message
          : 'Gagal menyimpan profil pajak.',
      );
    } finally {
      setTaxProfileSaving(false);
    }
  };
  const handleAttachFreyer = async () => {
    if (!customer || !selectedFreyerId || freyerSaving) {
      return;
    }

    setFreyerSaving(true);
    setError('');
    try {
      await attachKolamFreyerToCustomer(customer.id, selectedFreyerId);
      setSelectedFreyerId('');
      await reloadFreyerDevices();
    } catch (errorResult) {
      setError(
        errorResult instanceof Error
          ? errorResult.message
          : 'Gagal menautkan Freyer.',
      );
    } finally {
      setFreyerSaving(false);
    }
  };
  const handleDetachFreyer = async (freyerId: string) => {
    if (!customer || freyerSaving) {
      return;
    }

    setFreyerSaving(true);
    setError('');
    try {
      await detachKolamFreyerFromCustomer(customer.id, freyerId);
      await reloadFreyerDevices();
    } catch (errorResult) {
      setError(
        errorResult instanceof Error
          ? errorResult.message
          : 'Gagal melepas Freyer.',
      );
    } finally {
      setFreyerSaving(false);
    }
  };
  const handleDownloadProjectInvoice = async (
    project: KolamCustomerProjectActivity,
  ) => {
    if (downloadingInvoice) {
      return;
    }

    setDownloadingInvoice(`project-${project.id}`);
    setError('');
    try {
      await downloadKolamProyekInvoice(
        project.id,
        project.quotationNumber || project.id,
      );
    } catch (errorResult) {
      setError(
        errorResult instanceof Error
          ? errorResult.message
          : 'Gagal mengunduh invoice proyek.',
      );
    } finally {
      setDownloadingInvoice('');
    }
  };
  const handleDownloadSubscriptionInvoice = async (
    subscription: KolamCustomerSubscriptionActivity,
  ) => {
    if (downloadingInvoice) {
      return;
    }

    setDownloadingInvoice(`subscription-${subscription.id}`);
    setError('');
    try {
      await downloadKolamLayananSubscriptionInvoice({
        id: subscription.id,
        saleId: subscription.saleId,
        saleInvoiceCode: subscription.invoiceCode,
        subscriptionNumber: subscription.subscriptionNumber,
      });
    } catch (errorResult) {
      setError(
        errorResult instanceof Error
          ? errorResult.message
          : 'Gagal mengunduh invoice layanan.',
      );
    } finally {
      setDownloadingInvoice('');
    }
  };
  const handleDownloadSaleInvoice = async (sale: KolamCustomerSaleActivity) => {
    if (downloadingInvoice) {
      return;
    }

    setDownloadingInvoice(`sale-${sale.id}`);
    setError('');
    try {
      await downloadKolamSaleInvoice(sale.id, sale.invoiceCode || sale.id);
    } catch (errorResult) {
      setError(
        errorResult instanceof Error
          ? errorResult.message
          : 'Gagal mengunduh invoice.',
      );
    } finally {
      setDownloadingInvoice('');
    }
  };

  return (
    <View style={styles.detailSurface}>
      <View style={styles.toolbarWrap}>
        <View style={styles.toolbarShell}>
          <View style={styles.detailToolbarSpacer} />
          <View style={styles.actionRow}>
            <KolamDaftarButton
              onPress={() => onRouteChange?.('/customers')}
              style={styles.toolbarButton}
            />
            <KolamEditButton
              intent="primary"
              onPress={() => onRouteChange?.(`/customers/${customer.id}/edit`)}
              style={styles.toolbarButton}
            />
          </View>
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
        <View
          style={[
            styles.detailMainColumn,
            !hasAddresses && styles.detailMainColumnFull,
          ]}>
          <KolamDetailSummaryCard
            aside={
              <CustomerTaxProfilePanel
                authUser={authUser}
                form={taxProfile}
                loaded={taxProfileLoaded}
                onChange={handleChangeTaxProfile}
                onSave={handleSaveTaxProfile}
                saving={taxProfileSaving}
              />
            }
            asideStyle={styles.customerSummaryTaxAside}
            body={
              customer.notes ? (
                <Text style={styles.customerSummaryNotes}>
                  {customer.notes}
                </Text>
              ) : undefined
            }
            bodyTitle={customer.notes ? 'Catatan' : undefined}
            description="Data profil utama pelanggan"
            fieldColumns={3}
            fields={[
              {
                id: 'status',
                label: 'Status',
                value: (
                  <KolamStatusBadge
                    intent={getCustomerStatusIntent(customer.status)}
                    label={getCustomerStatusLabel(customer.status)}
                  />
                ),
              },
              {
                id: 'gender',
                label: 'Jenis Kelamin',
                value: formatCustomerGenderLabel(customer.gender),
              },
              {
                id: 'phone',
                label: 'Telepon',
                value: customer.phone || '-',
              },
              {
                id: 'email',
                label: 'Email',
                value: customer.email || '-',
              },
              {
                id: 'username',
                label: 'Nama Pengguna',
                value: customer.username ? `@${customer.username}` : '-',
              },
              {
                id: 'address',
                label: 'Alamat',
                value: primaryAddress || customer.address || '-',
              },
              {
                id: 'available-points',
                label: 'Poin Member',
                value: formatCustomerNumber(customer.points.availablePoints),
              },
              {
                id: 'total-points',
                label: 'Total Poin',
                value: formatCustomerNumber(customer.points.totalPoints),
              },
              {
                id: 'lifetime-points',
                label: 'Poin Lifetime',
                value: formatCustomerNumber(customer.points.lifetimePoints),
              },
              {
                id: 'created',
                label: 'Dibuat Pada',
                value: formatCustomerDateTime(customer.createdAt),
              },
              {
                id: 'updated',
                label: 'Diperbarui Pada',
                value: formatCustomerDateTime(customer.updatedAt),
              },
            ]}
            leading={
              <CustomerPictureSummaryBox
                customer={customer}
                mediaItems={mediaItems}
                onDeletePhoto={handleDeletePhoto}
                onUploadPhoto={handleUploadPhoto}
                photoSaving={photoSaving}
              />
            }
            leadingStyle={styles.customerSummaryPictureLeading}
            title="Ringkasan pelanggan"
          />
        </View>

        {hasAddresses ? (
          <View style={styles.detailSideColumn}>
            <KolamContentFrame
              style={[styles.detailCard, styles.customerDetailSectionCard]}
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
          </View>
        ) : null}
      </View>

      <CustomerPointTransactionsCard
        loading={pointTransactionsLoading}
        onPageChange={setPointTransactionsPage}
        result={pointTransactions}
      />

      <CustomerFreyerDevicesCard
        devices={freyerDevices}
        loading={freyerLoading}
        onAttach={handleAttachFreyer}
        onDetach={handleDetachFreyer}
        onSelect={setSelectedFreyerId}
        saving={freyerSaving}
        selectedId={selectedFreyerId}
        unattached={unattachedFreyerDevices}
      />

      <CustomerEnclosuresCard
        loading={customerEnclosuresLoading}
        onRouteChange={onRouteChange}
        result={customerEnclosures}
      />

      <CustomerStorageCard
        loading={customerStorageLoading}
        result={customerStorage}
      />

      <CustomerActivityInvoiceCard
        downloadingInvoice={downloadingInvoice}
        loading={customerActivityLoading}
        onDownloadProjectInvoice={handleDownloadProjectInvoice}
        onDownloadSaleInvoice={handleDownloadSaleInvoice}
        onDownloadSubscriptionInvoice={handleDownloadSubscriptionInvoice}
        result={customerActivity}
      />
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
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters} />
          <View style={kolamTableToolbarStyles.actions}>
            <KolamSaveButton
              disabled={saving}
              label={saving ? 'Menyimpan...' : 'Simpan'}
              onPress={handleSave}
            />
            <KolamCancelButton disabled={saving} onPress={handleCancel} />
          </View>
        </View>
      </View>

      <View style={styles.detailHeader}>
        <View style={styles.detailHeading}>
          <Text style={styles.detailTitle}>
            {isEdit ? 'Rubah pelanggan' : 'Pelanggan baru'}
          </Text>
          <Text style={styles.detailSubtitle}>
            {isEdit
              ? 'Perbarui informasi kontak dan data pribadi pelanggan.'
              : 'Isi informasi pribadi dan kontak pelanggan.'}
          </Text>
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
          <View style={styles.formField}>
            <Text style={styles.formFieldLabel}>Jenis kelamin</Text>
            <KolamDropdownSelect<CustomerFormGender>
              label="Jenis kelamin"
              onChange={setGender}
              options={[...CUSTOMER_GENDER_OPTIONS]}
              showLabelInTrigger={false}
              style={styles.formDropdown}
              triggerStyle={styles.formDropdownTrigger}
              value={gender}
            />
          </View>
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
          <KolamNotesField
            label="Catatan"
            onChangeText={setNotes}
            placeholder="Catatan (opsional)"
            value={notes}
          />
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
        <Text style={[styles.customerSubText, styles.customerTextCenter]}>
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
        <Text style={[styles.customerSubText, styles.customerTextCenter]}>
          {formatCustomerDate(customer.createdAt)}
        </Text>
      );
  }
}

function KolamCustomerListActions({
  customer,
  onDelete,
  onRouteChange,
}: {
  customer: KolamCustomer;
  onDelete: () => void;
  onRouteChange?: (route: string) => void;
}) {
  const customerRouteId = encodeURIComponent(customer.id);

  return (
    <KolamTableRowActionMenu
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
          label: 'Hapus',
          onPress: onDelete,
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

function CustomerPictureSummaryBox({
  customer,
  mediaItems,
  onDeletePhoto,
  onUploadPhoto,
  photoSaving,
}: {
  customer: KolamCustomer;
  mediaItems: KolamDetailMediaItem[];
  onDeletePhoto: (index: number) => Promise<void>;
  onUploadPhoto: () => Promise<void>;
  photoSaving: boolean;
}) {
  const primaryPhoto = mediaItems[0];
  const previewItems = mediaItems.map(item => ({
    id: item.id,
    title: item.label,
    uri: item.uri,
  }));

  return (
    <View style={styles.customerSummaryPictureBox}>
      <View style={styles.photoSectionHeader}>
        <SectionTitle description="" title="Foto" />
        <KolamButton
          disabled={photoSaving}
          label={photoSaving ? 'Memproses...' : 'Unggah Foto'}
          onPress={() => void onUploadPhoto()}
        />
      </View>
      {primaryPhoto ? (
        <>
          <View style={styles.customerSummaryPhotoFrame}>
            <KolamRemoteImage
              accessibilityLabel={`Foto ${customer.name}`}
              previewItems={previewItems}
              resizeMode="cover"
              scope="customer"
              sourceUri={primaryPhoto.uri}
              style={styles.customerSummaryPhotoImage}
            />
          </View>
          <View style={styles.photoActionList}>
            {customer.photos.map((photo, index) => (
              <View key={`${photo}-${index}`} style={styles.photoActionRow}>
                <Text numberOfLines={1} style={styles.customerSubText}>
                  Foto {index + 1}
                </Text>
                <KolamDeleteButton
                  disabled={photoSaving}
                  intent="danger"
                  label="Hapus"
                  onPress={() => void onDeletePhoto(index)}
                  style={styles.photoDeleteButton}
                />
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.customerSummaryPhotoEmpty}>
          <Text style={styles.customerSubText}>
            Foto pelanggan belum tersedia.
          </Text>
        </View>
      )}
    </View>
  );
}

function CustomerTaxProfilePanel({
  authUser,
  form,
  loaded,
  onChange,
  onSave,
  saving,
}: {
  authUser: SettingsTabVisibilityContext | null | undefined;
  form: KolamTaxPartyProfileFormState;
  loaded: boolean;
  onChange: (patch: Partial<KolamTaxPartyProfileFormState>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}) {
  const canEdit = canEditKolamTaxPartyProfile(authUser);
  const hasNpwp = loaded && hasKolamTaxPartyNpwp(form);

  return (
    <View style={styles.customerTaxProfilePanel}>
      <View style={styles.taxHeader}>
        <Text style={styles.sectionTitle}>Profil pajak</Text>
        {loaded ? (
          <KolamStatusBadge
            intent={hasNpwp ? 'success' : 'warning'}
            label={hasNpwp ? 'NPWP tercatat' : 'Belum NPWP'}
          />
        ) : null}
      </View>
      {!loaded ? (
        <KolamEmptyState compact message="Memuat profil pajak." title="Memuat" />
      ) : (
        <View style={styles.customerTaxProfileBody}>
          <View style={styles.formSplitRow}>
            <View style={styles.formSplitCell}>
              <CustomerFieldShell label="NPWP 15 digit">
                <KolamFormTextField
                  editable={canEdit && !saving}
                  mode="numeric"
                  onChangeText={npwp => onChange({npwp})}
                  placeholder="15 digit"
                  style={styles.customerFormFieldValue}
                  value={form.npwp}
                />
              </CustomerFieldShell>
            </View>
            <View style={styles.formSplitCell}>
              <CustomerFieldShell label="NPWP 16 digit">
                <KolamFormTextField
                  editable={canEdit && !saving}
                  mode="numeric"
                  onChangeText={npwp16 => onChange({npwp16})}
                  placeholder="16 digit"
                  style={styles.customerFormFieldValue}
                  value={form.npwp16}
                />
              </CustomerFieldShell>
            </View>
          </View>
          <CustomerFieldShell label="Nama legal (faktur)">
            <KolamFormTextField
              editable={canEdit && !saving}
              onChangeText={legalName => onChange({legalName})}
              placeholder="Nama legal untuk faktur"
              style={styles.customerFormFieldValue}
              value={form.legalName}
            />
          </CustomerFieldShell>
          {canEdit ? (
            <View style={styles.formActions}>
              <KolamSaveButton
                disabled={saving}
                label={saving ? 'Menyimpan...' : 'Simpan NPWP'}
                onPress={() => void onSave()}
              />
            </View>
          ) : (
            <Text style={styles.switchHint}>Mode baca saja.</Text>
          )}
        </View>
      )}
    </View>
  );
}

function CustomerPointTransactionsCard({
  loading,
  onPageChange,
  result,
}: {
  loading: boolean;
  onPageChange: (page: number) => void;
  result: KolamCustomerPointTransactionsResult;
}) {
  return (
    <KolamContentFrame
      style={[styles.detailCard, styles.customerDetailSectionCard]}
      variant="settingsWebConfig">
      <SectionTitle
        description="Riwayat perubahan poin pelanggan"
        title="Riwayat transaksi poin"
      />
      <KolamListTableComposition
        columns={CUSTOMER_POINT_TRANSACTION_COLUMNS}
        emptyTitle={
          loading ? 'Memuat transaksi poin...' : 'Belum ada transaksi poin'
        }
        getRowKey={row => row.id}
        loading={loading}
        pagination={{
          onPageChange,
          page: result.pagination.page,
          pageSize: result.pagination.limit,
          total: result.pagination.total,
        }}
        rows={loading ? [] : result.items}
      />
    </KolamContentFrame>
  );
}

function CustomerFreyerDevicesCard({
  devices,
  loading,
  onAttach,
  onDetach,
  onSelect,
  saving,
  selectedId,
  unattached,
}: {
  devices: KolamFreyerIotDevice[];
  loading: boolean;
  onAttach: () => Promise<void>;
  onDetach: (freyerId: string) => Promise<void>;
  onSelect: (freyerId: string) => void;
  saving: boolean;
  selectedId: string;
  unattached: KolamFreyerIotDevice[];
}) {
  const options = [
    {label: 'Pilih Freyer', value: ''},
    ...unattached.map(device => ({
      label: `${device.name || 'Freyer'} - ${device.serialNumber || '-'}`,
      value: device.id,
    })),
  ];

  return (
    <KolamContentFrame
      style={[styles.detailCard, styles.customerDetailSectionCard]}
      variant="settingsWebConfig">
      <View style={styles.customerCardHeaderRow}>
        <SectionTitle
          description="Alat IoT yang tertaut ke pelanggan"
          title="Perangkat Freyer"
        />
        <KolamStatusBadge
          intent={devices.length ? 'success' : 'secondary'}
          label={`${devices.length} perangkat`}
        />
      </View>
      {loading ? (
        <KolamEmptyState compact message="Memuat perangkat." title="Memuat" />
      ) : devices.length ? (
        <View style={styles.customerFreyerList}>
          {devices.map(device => (
            <View key={device.id} style={styles.customerFreyerRow}>
              <View style={styles.customerFreyerCopy}>
                <Text numberOfLines={1} style={styles.customerMetaText}>
                  {device.name || 'Freyer'}
                </Text>
                <Text numberOfLines={1} style={styles.customerSubText}>
                  {device.serialNumber || '-'}
                </Text>
              </View>
              <KolamStatusBadge
                intent={device.status === 1 ? 'success' : 'secondary'}
                label={device.status === 1 ? 'On' : 'Off'}
              />
              <KolamCancelButton
                disabled={saving}
                label="Lepas"
                onPress={() => void onDetach(device.id)}
              />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.customerEmptyPanel}>
          <Text style={styles.customerSubText}>Belum ada Freyer tertaut.</Text>
        </View>
      )}
      <View style={styles.customerFreyerAttachRow}>
        <View style={styles.customerFreyerSelect}>
          <KolamDropdownSelect
            label="Tautkan perangkat"
            onChange={onSelect}
            options={options}
            value={selectedId}
          />
        </View>
        <KolamSaveButton
          disabled={!selectedId || saving}
          label={saving ? 'Memproses...' : 'Tautkan'}
          onPress={() => void onAttach()}
        />
      </View>
    </KolamContentFrame>
  );
}

function CustomerEnclosuresCard({
  loading,
  onRouteChange,
  result,
}: {
  loading: boolean;
  onRouteChange?: (route: string) => void;
  result: KolamEnclosureListResult;
}) {
  const rows = result.data;
  const total = result.pagination.total || rows.length;

  return (
    <KolamContentFrame
      style={[styles.detailCard, styles.customerDetailSectionCard]}
      variant="settingsWebConfig">
      <View style={styles.customerCardHeaderRow}>
        <SectionTitle
          description="Kandang tertaut ke pelanggan"
          title="Kandang pelanggan"
        />
        <View style={styles.customerHeaderActions}>
          <KolamStatusBadge
            intent={rows.length ? 'success' : 'secondary'}
            label={`${total} kandang`}
          />
          <KolamButton
            label="Semua kandang"
            onPress={() => onRouteChange?.('/enclosures?scope=client_linked')}
          />
        </View>
      </View>
      {loading ? (
        <KolamEmptyState compact message="Memuat kandang." title="Memuat" />
      ) : rows.length ? (
        <View style={styles.customerEnclosureList}>
          {total > rows.length ? (
            <Text style={styles.customerSubText}>
              Menampilkan {rows.length} dari {total} kandang.
            </Text>
          ) : null}
          {rows.map(enclosure => (
            <CustomerEnclosureRow
              enclosure={enclosure}
              key={enclosure.id}
              onRouteChange={onRouteChange}
            />
          ))}
        </View>
      ) : (
        <View style={styles.customerEmptyPanel}>
          <Text style={styles.customerSubText}>
            Belum ada kandang pelanggan.
          </Text>
        </View>
      )}
    </KolamContentFrame>
  );
}

function CustomerEnclosureRow({
  enclosure,
  onRouteChange,
}: {
  enclosure: KolamEnclosure;
  onRouteChange?: (route: string) => void;
}) {
  return (
    <View style={styles.customerEnclosureRow}>
      <View style={styles.customerEnclosureCopy}>
        <Text numberOfLines={1} style={styles.customerMetaText}>
          {enclosure.name || enclosure.code || 'Kandang'}
        </Text>
        <Text numberOfLines={1} style={styles.customerSubText}>
          {enclosure.code || '-'} | {getCustomerEnclosureLocationLabel(enclosure)}
        </Text>
      </View>
      <KolamStatusBadge
        intent={getCustomerEnclosureStatusIntent(enclosure.status)}
        label={enclosure.status || '-'}
      />
      <KolamButton
        label="Lihat"
        onPress={() => onRouteChange?.(`/enclosures/${enclosure.id}`)}
      />
    </View>
  );
}

function CustomerStorageCard({
  loading,
  result,
}: {
  loading: boolean;
  result: KolamCustomerStorageResult;
}) {
  return (
    <KolamContentFrame
      style={[styles.detailCard, styles.customerDetailSectionCard]}
      variant="settingsWebConfig">
      <View style={styles.customerCardHeaderRow}>
        <SectionTitle
          description="Stok milik pelanggan yang tersimpan di gudang"
          title="Penyimpanan Pelanggan"
        />
        <KolamStatusBadge
          intent={result.items.length ? 'success' : 'secondary'}
          label={`${result.pagination.total || result.items.length} item`}
        />
      </View>
      {loading ? (
        <KolamEmptyState compact message="Memuat penyimpanan." title="Memuat" />
      ) : result.items.length ? (
        <View style={styles.customerStorageList}>
          {result.items.map(item => (
            <CustomerStorageRow item={item} key={item.id} />
          ))}
        </View>
      ) : (
        <View style={styles.customerEmptyPanel}>
          <Text style={styles.customerSubText}>Belum ada penyimpanan pelanggan.</Text>
        </View>
      )}
    </KolamContentFrame>
  );
}

function CustomerStorageRow({item}: {item: KolamCustomerStorageItem}) {
  const stockIntent =
    item.stock <= 0 ? 'danger' : item.stock <= 2 ? 'warning' : 'success';

  return (
    <View style={styles.customerStorageRow}>
      <View style={styles.customerStorageCopy}>
        <Text numberOfLines={1} style={styles.customerMetaText}>
          {item.product?.name || 'Item'}
        </Text>
        <Text numberOfLines={1} style={styles.customerSubText}>
          {item.product?.units || '-'} | {formatCustomerDateTime(item.updatedAt)}
        </Text>
      </View>
      <KolamStatusBadge intent={stockIntent} label={`Stok ${item.stock}`} />
    </View>
  );
}

function CustomerActivityInvoiceCard({
  downloadingInvoice,
  loading,
  onDownloadProjectInvoice,
  onDownloadSaleInvoice,
  onDownloadSubscriptionInvoice,
  result,
}: {
  downloadingInvoice: string;
  loading: boolean;
  onDownloadProjectInvoice: (
    project: KolamCustomerProjectActivity,
  ) => Promise<void>;
  onDownloadSaleInvoice: (sale: KolamCustomerSaleActivity) => Promise<void>;
  onDownloadSubscriptionInvoice: (
    subscription: KolamCustomerSubscriptionActivity,
  ) => Promise<void>;
  result: KolamCustomerActivityResult;
}) {
  const projectColumns = React.useMemo<
    Array<KolamListTableColumn<KolamCustomerProjectActivity>>
  >(
    () => [
      {
        align: 'left',
        flex: 1.1,
        id: 'quotation',
        label: 'No. Penawaran',
        render: project => (
          <Text numberOfLines={1} style={styles.customerMetaText}>
            {project.quotationNumber || '-'}
          </Text>
        ),
      },
      {
        align: 'left',
        flex: 1.15,
        id: 'task',
        label: 'Tugas',
        render: project => (
          <Text numberOfLines={1} style={styles.customerSubText}>
            {project.taskTitle || '-'}
          </Text>
        ),
      },
      {
        align: 'center',
        flex: 0.9,
        id: 'status',
        label: 'Status',
        render: project => (
          <KolamStatusBadge
            intent={getCustomerProjectStatusIntent(project.lifecycleStatus)}
            label={formatCustomerProjectStatus(project.lifecycleStatus)}
          />
        ),
      },
      {
        align: 'left',
        flex: 1,
        id: 'invoice',
        label: 'Faktur',
        render: project => (
          <Text numberOfLines={1} style={styles.customerSubText}>
            {project.invoiceCode || '-'}
          </Text>
        ),
      },
      {
        align: 'center',
        flex: 0.8,
        id: 'date',
        label: 'Tgl',
        render: project => (
          <Text style={[styles.customerSubText, styles.customerTextCenter]}>
            {formatCustomerShortDate(project.createdAt)}
          </Text>
        ),
      },
    ],
    [],
  );
  const subscriptionColumns = React.useMemo<
    Array<KolamListTableColumn<KolamCustomerSubscriptionActivity>>
  >(
    () => [
      {
        align: 'left',
        flex: 1.1,
        id: 'number',
        label: 'No. Langganan',
        render: subscription => (
          <Text numberOfLines={1} style={styles.customerMetaText}>
            {subscription.subscriptionNumber || '-'}
          </Text>
        ),
      },
      {
        align: 'left',
        flex: 1.15,
        id: 'package',
        label: 'Paket',
        render: subscription => (
          <Text numberOfLines={1} style={styles.customerSubText}>
            {subscription.packageName || '-'}
          </Text>
        ),
      },
      {
        align: 'center',
        flex: 0.85,
        id: 'status',
        label: 'Status',
        render: subscription => (
          <KolamStatusBadge
            intent={getCustomerSubscriptionStatusIntent(subscription.status)}
            label={formatCustomerSubscriptionStatus(subscription.status)}
          />
        ),
      },
      {
        align: 'left',
        flex: 1,
        id: 'invoice',
        label: 'Faktur',
        render: subscription => (
          <Text numberOfLines={1} style={styles.customerSubText}>
            {subscription.invoiceCode || '-'}
          </Text>
        ),
      },
      {
        align: 'center',
        flex: 1.05,
        id: 'period',
        label: 'Berlaku',
        render: subscription => (
          <Text style={[styles.customerSubText, styles.customerTextCenter]}>
            {formatCustomerPeriod(subscription.startDate, subscription.endDate)}
          </Text>
        ),
      },
    ],
    [],
  );
  const saleColumns = React.useMemo<
    Array<KolamListTableColumn<KolamCustomerSaleActivity>>
  >(
    () => [
      {
        align: 'left',
        flex: 1.25,
        id: 'invoice',
        label: 'Kode Faktur',
        render: sale => (
          <Text numberOfLines={1} style={styles.customerMetaText}>
            {sale.invoiceCode || '-'}
          </Text>
        ),
      },
      {
        align: 'center',
        flex: 0.9,
        id: 'total',
        label: 'Total',
        render: sale => (
          <Text
            style={[styles.customerMoneyText, styles.customerMoneyTextCenter]}>
            {formatCustomerCurrency(sale.finalTotal)}
          </Text>
        ),
      },
      {
        align: 'center',
        flex: 0.85,
        id: 'status',
        label: 'Status',
        render: sale => (
          <View style={styles.customerInvoiceStatusCell}>
            <KolamStatusBadge
              intent={getCustomerSaleStatusIntent(sale.status)}
              label={formatCustomerSaleStatus(sale.status)}
              style={styles.customerInvoiceStatusBadge}
            />
          </View>
        ),
      },
      {
        align: 'center',
        flex: 0.85,
        id: 'date',
        label: 'Tgl',
        render: sale => (
          <Text style={[styles.customerSubText, styles.customerTextCenter]}>
            {formatCustomerShortDate(sale.createdAt)}
          </Text>
        ),
      },
    ],
    [],
  );

  return (
    <KolamContentFrame
      style={[styles.detailCard, styles.customerDetailSectionCard]}
      variant="settingsWebConfig">
      <SectionTitle
        description="Proyek kustom, langganan layanan, dan faktur pembelian"
        title="Aktivitas & Faktur"
      />
      <View style={styles.customerActivityStack}>
        <CustomerActivityTableSection
          count={result.projects.length}
          title="Proyek Kustom"
        >
          <KolamListTableComposition
            actionsColumn
            columns={projectColumns}
            emptyTitle={loading ? 'Memuat proyek...' : 'Belum ada proyek'}
            getRowKey={row => row.id}
            loading={loading}
            renderActions={project =>
              PROJECT_INVOICE_BLOCKED.has(project.lifecycleStatus) ? null : (
                <KolamPdfDownloadButton
                  disabled={Boolean(downloadingInvoice)}
                  iconOnly
                  label="Unduh faktur proyek"
                  loading={downloadingInvoice === `project-${project.id}`}
                  onPress={() => void onDownloadProjectInvoice(project)}
                />
              )
            }
            rows={loading ? [] : result.projects}
            showFooter={false}
          />
        </CustomerActivityTableSection>

        <CustomerActivityTableSection
          count={result.subscriptions.length}
          title="Langganan Layanan"
        >
          <KolamListTableComposition
            actionsColumn
            columns={subscriptionColumns}
            emptyTitle={
              loading ? 'Memuat langganan...' : 'Belum ada langganan'
            }
            getRowKey={row => row.id}
            loading={loading}
            renderActions={subscription =>
              subscription.saleId ? (
                <KolamPdfDownloadButton
                  disabled={Boolean(downloadingInvoice)}
                  iconOnly
                  label="Unduh faktur layanan"
                  loading={downloadingInvoice === `subscription-${subscription.id}`}
                  onPress={() => void onDownloadSubscriptionInvoice(subscription)}
                />
              ) : null
            }
            rows={loading ? [] : result.subscriptions}
            showFooter={false}
          />
        </CustomerActivityTableSection>

        <CustomerActivityTableSection
          count={result.sales.length}
          title="Faktur Pembelian"
        >
          <KolamListTableComposition
            actionsColumn
            columns={saleColumns}
            emptyTitle={
              loading ? 'Memuat faktur...' : 'Belum ada faktur pembelian'
            }
            getRowKey={row => row.id}
            loading={loading}
            renderActions={sale => (
              <KolamPdfDownloadButton
                disabled={Boolean(downloadingInvoice)}
                iconOnly
                label="Unduh faktur"
                loading={downloadingInvoice === `sale-${sale.id}`}
                onPress={() => void onDownloadSaleInvoice(sale)}
              />
            )}
            rows={loading ? [] : result.sales}
            showFooter={false}
          />
        </CustomerActivityTableSection>
      </View>
    </KolamContentFrame>
  );
}

function CustomerActivityTableSection({
  children,
  count,
  title,
}: {
  children: React.ReactNode;
  count: number;
  title: string;
}) {
  return (
    <View style={styles.customerActivitySection}>
      <View style={styles.customerActivitySectionHeader}>
        <Text style={styles.customerActivitySectionTitle}>{title}</Text>
        <Text style={styles.customerSubText}>{count} item</Text>
      </View>
      {children}
    </View>
  );
}

function CustomerFieldShell({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <View style={styles.customerFieldShell}>
      <Text style={styles.customerFieldLabel}>{label}</Text>
      {children}
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

function formatCustomerShortDate(value: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  }).format(date);
}

function formatCustomerPeriod(startDate: string, endDate: string) {
  const start = formatCustomerShortDate(startDate);
  const end = formatCustomerShortDate(endDate);

  if (start === '-' && end === '-') {
    return '-';
  }

  return end === '-' ? start : `${start} - ${end}`;
}

function formatCustomerCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    currency: 'IDR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value || 0);
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

function getCustomerPointTransactionLabel(type: string) {
  switch (type) {
    case 'earned':
      return 'Masuk';
    case 'used':
      return 'Dipakai';
    case 'adjusted':
      return 'Penyesuaian';
    case 'expired':
      return 'Kedaluwarsa';
    default:
      return type || '-';
  }
}

function getCustomerEnclosureLocationLabel(enclosure: KolamEnclosure) {
  return enclosure.location?.name || '-';
}

function getCustomerEnclosureStatusIntent(status: string) {
  switch (status.toLowerCase()) {
    case 'active':
      return 'success';
    case 'inactive':
    case 'disabled':
      return 'secondary';
    default:
      return 'secondary';
  }
}

function formatCustomerProjectStatus(status: string) {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'quotation_sent':
      return 'Penawaran';
    case 'revision_in_progress':
      return 'Revisi';
    case 'approved':
      return 'Disetujui';
    case 'in_progress':
      return 'Diproses';
    case 'completed':
      return 'Selesai';
    case 'cancelled':
      return 'Dibatalkan';
    default:
      return status || '-';
  }
}

function getCustomerProjectStatusIntent(status: string) {
  switch (status) {
    case 'approved':
    case 'completed':
      return 'success' as const;
    case 'quotation_sent':
    case 'revision_in_progress':
    case 'in_progress':
      return 'warning' as const;
    case 'cancelled':
      return 'danger' as const;
    default:
      return 'secondary' as const;
  }
}

function formatCustomerSubscriptionStatus(status: string) {
  switch (status) {
    case 'active':
      return 'Aktif';
    case 'suspended':
      return 'Ditahan';
    case 'expired':
      return 'Berakhir';
    case 'cancelled':
      return 'Dibatalkan';
    case 'draft':
      return 'Draft';
    default:
      return status || '-';
  }
}

function getCustomerSubscriptionStatusIntent(status: string) {
  switch (status) {
    case 'active':
      return 'success' as const;
    case 'suspended':
      return 'warning' as const;
    case 'cancelled':
      return 'danger' as const;
    default:
      return 'secondary' as const;
  }
}

function formatCustomerSaleStatus(status: string) {
  switch (status) {
    case 'paid':
      return 'Lunas';
    case 'pending':
      return 'Menunggu';
    case 'cancelled':
      return 'Dibatalkan';
    case 'refunded':
      return 'Refund';
    default:
      return status || '-';
  }
}

function getCustomerSaleStatusIntent(status: string) {
  switch (status) {
    case 'paid':
      return 'success' as const;
    case 'pending':
      return 'warning' as const;
    case 'cancelled':
      return 'danger' as const;
    default:
      return 'secondary' as const;
  }
}

function getCustomerPointTransactionIntent(type: string) {
  switch (type) {
    case 'earned':
      return 'success' as const;
    case 'used':
      return 'danger' as const;
    case 'adjusted':
      return 'warning' as const;
    case 'expired':
      return 'secondary' as const;
    default:
      return 'muted' as const;
  }
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
  detailToolbarSpacer: {
    flex: 1,
    minWidth: 0,
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
  customerTextCenter: {
    textAlign: 'center',
  },
  customerPointBadge: {
    alignSelf: 'center',
  },
  customerStatusStack: {
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  customerStatusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
  },
  customerExternalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
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
  detailMainColumnFull: {
    flex: 1,
    width: '100%',
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
  customerSummaryPictureLeading: {
    flexGrow: 0,
    maxWidth: 300,
    minWidth: 240,
    width: 260,
  },
  customerSummaryTaxAside: {
    flexBasis: 300,
    flexGrow: 1,
    minWidth: 280,
  },
  customerSummaryPictureBox: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 10,
    width: '100%',
  },
  customerSummaryPhotoFrame: {
    aspectRatio: 1,
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
  },
  customerSummaryPhotoImage: {
    height: '100%',
    width: '100%',
  },
  customerSummaryPhotoEmpty: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    padding: 14,
    width: '100%',
  },
  customerSummaryNotes: {
    color: V.colors.fg,
    fontSize: 13,
    lineHeight: 20,
  },
  customerDetailSectionCard: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
  },
  customerTaxProfilePanel: {
    backgroundColor: '#f5f0ff',
    borderColor: '#d8c7ff',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  customerTaxProfileBody: {
    gap: 10,
  },
  taxHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  formSplitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formSplitCell: {
    flexBasis: 180,
    flexGrow: 1,
    minWidth: 0,
  },
  customerFieldShell: {
    gap: 6,
  },
  customerFieldLabel: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
  },
  customerFormFieldValue: {
    width: '100%',
  },
  formActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  switchHint: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 18,
  },
  customerPointTransactionCopy: {
    gap: 2,
    minWidth: 0,
  },
  customerPointTransactionMethod: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  customerPointTransactionMethodBadge: {
    alignSelf: 'center',
  },
  customerPointTransactionPoints: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 20,
    textAlign: 'center',
  },
  customerPointTransactionPointsIn: {
    color: V.colors.success,
  },
  customerPointTransactionPointsOut: {
    color: V.colors.danger,
  },
  customerCardHeaderRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  customerHeaderActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  customerFreyerList: {
    gap: 8,
  },
  customerFreyerRow: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  customerFreyerCopy: {
    flex: 1,
    gap: 2,
    minWidth: 180,
  },
  customerFreyerAttachRow: {
    alignItems: 'center',
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 12,
  },
  customerFreyerSelect: {
    flex: 1,
    minWidth: 260,
  },
  customerEnclosureList: {
    gap: 8,
  },
  customerEnclosureRow: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  customerEnclosureCopy: {
    flex: 1,
    gap: 2,
    minWidth: 180,
  },
  customerStorageList: {
    gap: 8,
  },
  customerStorageRow: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  customerStorageCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  customerActivityStack: {
    gap: 16,
  },
  customerActivitySection: {
    gap: 8,
  },
  customerActivitySectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  customerActivitySectionTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  customerMoneyText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 20,
    textAlign: 'right',
  },
  customerMoneyTextCenter: {
    textAlign: 'center',
  },
  customerInvoiceStatusCell: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  customerInvoiceStatusBadge: {
    alignSelf: 'center',
  },
  customerEmptyPanel: {
    alignItems: 'center',
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 72,
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
    alignSelf: 'stretch',
    gap: 14,
    paddingHorizontal: 0,
    paddingVertical: 14,
    width: '100%',
  },
  formGrid: {
    gap: 12,
    width: '100%',
  },
  formField: {
    alignSelf: 'stretch',
    gap: 6,
    width: '100%',
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
    width: '100%',
  },
  formTextarea: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  formDropdown: {
    alignSelf: 'stretch',
    width: '100%',
  },
  formDropdownTrigger: {
    alignSelf: 'stretch',
    width: '100%',
  },
});
