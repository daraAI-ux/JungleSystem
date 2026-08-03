import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  formatKolamSaleItemTypeLabel,
  type KolamSale,
} from '../domain/kolam-sales';
import {
  isKolamSaleEligibleForComplaint,
  KOLAM_COMPLAINT_CREATE_CATEGORY_OPTIONS,
  KOLAM_COMPLAINT_PRIORITY_OPTIONS,
  KOLAM_COMPLAINT_ROOT,
  parseKolamComplaintCreateQuery,
  type KolamComplaintCategory,
  type KolamComplaintPriority,
} from '../domain/kolam-complaint';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import type { KolamComplaintController } from '../hooks/use-kolam-complaint-controller';
import { getKolamCustomerList } from '../services/kolam-customer-api';
import { pickNativeImageFile } from '../services/native-file-picker';
import {
  getKolamSale,
  getKolamSalesList,
} from '../services/kolam-sales-api';
import { KolamButton } from './kolam-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamSearchField } from './kolam-search-field';
import { KolamStatusBadge } from './kolam-status-badge';

type SaleOption = {
  id: string;
  label: string;
  invoiceCode: string;
  customerName: string;
};

export function KolamComplaintCreateForm({
  controller,
  onRouteChange,
  route,
}: {
  controller: KolamComplaintController;
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const createQuery = React.useMemo(
    () => parseKolamComplaintCreateQuery(route),
    [route],
  );

  const [saleOptions, setSaleOptions] = React.useState<SaleOption[]>([]);
  const [saleSearch, setSaleSearch] = React.useState('');
  const [selectedSaleId, setSelectedSaleId] = React.useState(
    createQuery.saleId ?? '',
  );
  const [selectedSale, setSelectedSale] = React.useState<KolamSale | null>(null);
  const [loadingSales, setLoadingSales] = React.useState(false);
  const [loadingSaleDetail, setLoadingSaleDetail] = React.useState(false);
  const [customerOptions, setCustomerOptions] = React.useState<
    Array<{ id: string; label: string }>
  >([]);
  const [selectedCustomerId, setSelectedCustomerId] = React.useState('');
  const [selectedIndexes, setSelectedIndexes] = React.useState<Set<number>>(
    () => new Set(),
  );
  const [itemQuantities, setItemQuantities] = React.useState<
    Record<number, string>
  >({});
  const [itemReasons, setItemReasons] = React.useState<Record<number, string>>(
    {},
  );
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState<KolamComplaintCategory>(
    createQuery.category ?? 'other',
  );
  const [priority, setPriority] =
    React.useState<KolamComplaintPriority>('medium');
  const [photoUris, setPhotoUris] = React.useState<string[]>([]);
  const [localError, setLocalError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    void (async () => {
      setLoadingSales(true);
      try {
        const [activeList, completedList] = await Promise.all([
          getKolamSalesList({
            search: '',
            status: 'paid',
            deliveryStatus: '',
            lifecycle: 'active',
            needsAction: false,
            startDate: '',
            endDate: '',
            page: 1,
            limit: 100,
          }),
          getKolamSalesList({
            search: '',
            status: 'paid',
            deliveryStatus: '',
            lifecycle: 'completed',
            needsAction: false,
            startDate: '',
            endDate: '',
            page: 1,
            limit: 100,
          }),
        ]);
        if (!active) {
          return;
        }
        const merged = new Map<string, (typeof activeList.data)[number]>();
        for (const sale of [
          ...(activeList.data ?? []),
          ...(completedList.data ?? []),
        ]) {
          merged.set(sale.id, sale);
        }
        const eligible = Array.from(merged.values())
          .filter(isKolamSaleEligibleForComplaint)
          .map(sale => ({
            id: sale.id,
            invoiceCode: sale.invoiceCode,
            customerName: sale.customer?.name || sale.buyerLabel || '—',
            label: `${sale.invoiceCode} — ${sale.customer?.name || sale.buyerLabel || '—'}`,
          }));
        setSaleOptions(eligible);
      } catch (error) {
        if (active) {
          setLocalError(
            error instanceof Error
              ? error.message
              : 'Gagal memuat daftar penjualan',
          );
        }
      } finally {
        if (active) {
          setLoadingSales(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const result = await getKolamCustomerList({ page: 1, limit: 100 });
        if (!active) {
          return;
        }
        setCustomerOptions(
          result.items.map(customer => ({
            id: customer.id,
            label: `${customer.name}${customer.phone ? ` — ${customer.phone}` : ''}`,
          })),
        );
      } catch {
        // Optional field; keep empty on failure.
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    if (!selectedSaleId.trim()) {
      setSelectedSale(null);
      return;
    }

    let active = true;
    void (async () => {
      setLoadingSaleDetail(true);
      setLocalError(null);
      try {
        const sale = await getKolamSale(selectedSaleId.trim());
        if (!active) {
          return;
        }
        if (!isKolamSaleEligibleForComplaint(sale)) {
          setSelectedSale(null);
          setLocalError(
            'Invoice harus berstatus dibayar dan terkirim/selesai untuk dikeluhkan.',
          );
          return;
        }
        setSelectedSale(sale);
        setSelectedIndexes(new Set());
        setItemQuantities({});
        setItemReasons({});
        setSaleOptions(prev => {
          if (prev.some(option => option.id === sale.id)) {
            return prev;
          }
          return [
            {
              id: sale.id,
              invoiceCode: sale.invoiceCode,
              customerName: sale.customer?.name || sale.buyerLabel || '—',
              label: `${sale.invoiceCode} — ${sale.customer?.name || sale.buyerLabel || '—'}`,
            },
            ...prev,
          ];
        });
      } catch (error) {
        if (active) {
          setSelectedSale(null);
          setLocalError(
            error instanceof Error
              ? error.message
              : 'Gagal memuat detail penjualan',
          );
        }
      } finally {
        if (active) {
          setLoadingSaleDetail(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [selectedSaleId]);

  const filteredSaleOptions = React.useMemo(() => {
    const needle = saleSearch.trim().toLowerCase();
    if (!needle) {
      return saleOptions;
    }
    return saleOptions.filter(
      option =>
        option.invoiceCode.toLowerCase().includes(needle) ||
        option.customerName.toLowerCase().includes(needle),
    );
  }, [saleOptions, saleSearch]);

  const toggleItem = (index: number) => {
    setSelectedIndexes(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
        setItemQuantities(current => {
          const copy = { ...current };
          delete copy[index];
          return copy;
        });
        setItemReasons(current => {
          const copy = { ...current };
          delete copy[index];
          return copy;
        });
      } else {
        next.add(index);
        const maxQty = selectedSale?.items[index]?.quantity ?? 1;
        setItemQuantities(current => ({
          ...current,
          [index]: String(maxQty),
        }));
      }
      return next;
    });
  };

  const onSubmit = async () => {
    setLocalError(null);
    if (!selectedSale) {
      setLocalError('Silakan pilih penjualan/invoice');
      return;
    }

    const items = Array.from(selectedIndexes).map(index => {
      const maxQty = selectedSale.items[index]?.quantity ?? 1;
      const rawQty = Number(itemQuantities[index] ?? maxQty);
      const quantity = Math.min(Math.max(1, Number.isFinite(rawQty) ? rawQty : 1), maxQty);
      return {
        saleItemIndex: index,
        quantity,
        reason: itemReasons[index]?.trim() || undefined,
      };
    });

    const created = await controller.onCreateComplaint({
      saleId: selectedSale.id,
      items,
      description,
      category,
      priority,
      createdByCustomerId: selectedCustomerId || null,
      pendingServiceId: createQuery.pendingServiceId,
      subscriptionId: createQuery.subscriptionId,
      serviceContext: createQuery.serviceContext,
      photoUris,
    });

    if (created) {
      onRouteChange?.(`${KOLAM_COMPLAINT_ROOT}/${created.id}`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.title}>Buat Keluhan Baru</Text>
        <Text style={styles.subtitle}>
          Buat tiket keluhan untuk penjualan/invoice yang sudah dibayar dan
          terkirim.
        </Text>
        {createQuery.pendingServiceId ? (
          <KolamStatusBadge
            intent="muted"
            label={`Terhubung ke Kontrol Layanan (${createQuery.pendingServiceId.slice(-8)})`}
          />
        ) : null}
      </View>

      {(localError || controller.error) ? (
        <KolamStatusBadge
          intent="danger"
          label={localError || controller.error || ''}
          numberOfLines={4}
        />
      ) : null}

      <KolamCardFrame style={styles.card}>
        <Text style={styles.cardTitle}>Pelanggan (opsional)</Text>
        <Text style={styles.cardHint}>
          Kosongkan untuk membuat sebagai staf. Isi jika atas nama pelanggan.
        </Text>
        <KolamDropdownSelect
          label="Pelanggan"
          onChange={setSelectedCustomerId}
          options={[
            { label: 'Tidak ada (buat sebagai staf)', value: '' },
            ...customerOptions.map(option => ({
              label: option.label,
              value: option.id,
            })),
          ]}
          value={selectedCustomerId}
        />
      </KolamCardFrame>

      <KolamCardFrame style={styles.card}>
        <Text style={styles.cardTitle}>Pilih Penjualan/Invoice</Text>
        <KolamSearchField
          onChangeText={setSaleSearch}
          placeholder="Cari kode invoice atau nama pelanggan…"
          value={saleSearch}
        />
        <KolamDropdownSelect
          label={loadingSales ? 'Memuat penjualan…' : 'Penjualan/Invoice'}
          onChange={value => {
            setSelectedSaleId(value);
            setSaleSearch('');
          }}
          options={[
            { label: 'Pilih invoice…', value: '' },
            ...filteredSaleOptions.map(option => ({
              label: option.label,
              value: option.id,
            })),
          ]}
          value={selectedSaleId}
        />
        {loadingSaleDetail ? (
          <Text style={styles.cardHint}>Memuat item invoice…</Text>
        ) : null}
      </KolamCardFrame>

      {selectedSale ? (
        <KolamCardFrame style={styles.card}>
          <Text style={styles.cardTitle}>Pilih Item untuk Dikeluhkan</Text>
          <Text style={styles.cardHint}>
            Invoice {selectedSale.invoiceCode} ·{' '}
            {selectedSale.customer?.name || selectedSale.buyerLabel || '—'}
          </Text>
          {selectedSale.items.map((item, index) => {
            const selected = selectedIndexes.has(index);
            return (
              <View key={`${item.id || index}`} style={styles.itemCard}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  onPress={() => toggleItem(index)}
                  style={styles.itemToggle}
                >
                  <Text style={styles.itemCheck}>{selected ? '[x]' : '[ ]'}</Text>
                  <View style={styles.itemCopy}>
                    <Text style={styles.itemTitle}>
                      {item.title || `Item #${index + 1}`}
                    </Text>
                    <Text style={styles.itemMeta}>
                      {formatKolamSaleItemTypeLabel(item.itemType)} · Jumlah asli:{' '}
                      {item.quantity}
                    </Text>
                  </View>
                </Pressable>
                {selected ? (
                  <View style={styles.itemFields}>
                    <KolamFormTextField
                      keyboardType="number-pad"
                      label={`Jumlah dikeluhkan (maks ${item.quantity})`}
                      onChangeText={value =>
                        setItemQuantities(current => ({
                          ...current,
                          [index]: value,
                        }))
                      }
                      value={itemQuantities[index] ?? String(item.quantity)}
                    />
                    <KolamFormTextField
                      label="Alasan item (opsional)"
                      multiline
                      onChangeText={value =>
                        setItemReasons(current => ({
                          ...current,
                          [index]: value,
                        }))
                      }
                      placeholder="Mengapa item ini dikeluhkan?"
                      value={itemReasons[index] ?? ''}
                    />
                  </View>
                ) : null}
              </View>
            );
          })}
        </KolamCardFrame>
      ) : null}

      <KolamCardFrame style={styles.card}>
        <Text style={styles.cardTitle}>Detail Keluhan</Text>
        <KolamFormTextField
          label="Deskripsi"
          multiline
          onChangeText={setDescription}
          placeholder="Jelaskan keluhan secara detail…"
          value={description}
        />
        <KolamDropdownSelect
          label="Kategori"
          onChange={value => setCategory(value as KolamComplaintCategory)}
          options={KOLAM_COMPLAINT_CREATE_CATEGORY_OPTIONS.map(option => ({
            label: option.label,
            value: option.id,
          }))}
          value={category}
        />
        <KolamDropdownSelect
          label="Prioritas"
          onChange={value => setPriority(value as KolamComplaintPriority)}
          options={KOLAM_COMPLAINT_PRIORITY_OPTIONS.map(option => ({
            label: option.label,
            value: option.id,
          }))}
          value={priority}
        />
      </KolamCardFrame>

      <KolamCardFrame style={styles.card}>
        <Text style={styles.cardTitle}>Foto (opsional)</Text>
        <View style={styles.photoActions}>
          <KolamButton
            label={`Tambah foto (${photoUris.length})`}
            onPress={() => {
              void pickNativeImageFile().then(result => {
                if (!result?.uri) {
                  return;
                }
                setPhotoUris(current => [...current, result.uri!]);
              });
            }}
          />
        </View>
        {photoUris.length ? (
          <View style={styles.photoGrid}>
            {photoUris.map((uri, index) => (
              <View key={`${uri}-${index}`} style={styles.photoItem}>
                <Image source={{ uri }} style={styles.photoThumb} />
                <KolamButton
                  intent="plain"
                  label="Hapus"
                  onPress={() =>
                    setPhotoUris(current =>
                      current.filter((_, photoIndex) => photoIndex !== index),
                    )
                  }
                />
              </View>
            ))}
          </View>
        ) : null}
      </KolamCardFrame>

      <View style={styles.actions}>
        <KolamButton
          label="Batal"
          onPress={() => onRouteChange?.(KOLAM_COMPLAINT_ROOT)}
        />
        <KolamButton
          disabled={controller.mutating}
          intent="primary"
          label={controller.mutating ? 'Menyimpan…' : 'Buat keluhan'}
          onPress={() => {
            void onSubmit();
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: 12,
    paddingBottom: 24,
  },
  header: {
    gap: 6,
  },
  title: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  card: {
    gap: 10,
    padding: 12,
  },
  cardTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '800',
  },
  cardHint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  itemCard: {
    borderColor: V.colors.border,
    borderRadius: V.radius.md,
    borderWidth: 1,
    gap: 8,
    padding: 10,
  },
  itemToggle: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  itemCheck: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 1,
  },
  itemCopy: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  itemMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  itemFields: {
    gap: 8,
    marginLeft: 24,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoItem: {
    gap: 4,
    width: 96,
  },
  photoThumb: {
    backgroundColor: V.colors.secondary,
    borderRadius: V.radius.md,
    height: 72,
    width: 96,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
});
