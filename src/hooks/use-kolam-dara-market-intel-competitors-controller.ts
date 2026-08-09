import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  KOLAM_DARA_MARKET_INTEL_COMPETITOR_CHANNELS,
  getKolamDaraMarketIntelTab,
  groupKolamDaraMarketIntelCompetitors,
  isKolamDaraMarketIntelMongoObjectId,
  isKolamDaraMarketIntelRoute,
  type KolamDaraMarketIntelBrand,
  type KolamDaraMarketIntelCompetitorBaseline,
  type KolamDaraMarketIntelCompetitorChannelId,
  type KolamDaraMarketIntelCompetitorGroup,
  type KolamDaraMarketIntelCompetitorLink,
} from '../domain/kolam-dara-market-intel';
import {sanitizeApiErrorMessage} from '../lib/api-error';
import {formatRupiah} from '../lib/money';
import {
  deleteKolamDaraMarketIntelCompetitorLink,
  fetchKolamDaraMarketIntelActiveBrands,
  fetchKolamDaraMarketIntelCompetitorBaseline,
  fetchKolamDaraMarketIntelCompetitorLinkPrice,
  fetchKolamDaraMarketIntelCompetitorLinks,
  saveKolamDaraMarketIntelCompetitorLink,
  sendKolamDaraMarketIntelCompetitorReport,
} from '../services/kolam-dara-market-intel-api';

export type KolamDaraMarketIntelCompetitorsView = 'list' | 'detail';

export interface KolamDaraMarketIntelCompetitorsController {
  brandId: string;
  brands: KolamDaraMarketIntelBrand[];
  bulkFetching: boolean;
  busy: boolean;
  channelUrls: Record<KolamDaraMarketIntelCompetitorChannelId, string>;
  channels: Record<KolamDaraMarketIntelCompetitorChannelId, boolean>;
  detailLinks: KolamDaraMarketIntelCompetitorLink[];
  error: string | null;
  fetchingId: string | null;
  filteredGroups: KolamDaraMarketIntelCompetitorGroup[];
  loading: boolean;
  newCompetitorName: string;
  notice: string | null;
  productBaseline: KolamDaraMarketIntelCompetitorBaseline | null;
  productId: string;
  productLabel: string;
  search: string;
  selectedCompetitor: string | null;
  showAddCompetitor: boolean;
  view: KolamDaraMarketIntelCompetitorsView;
  onBackToList: () => void;
  onBulkFetch: () => Promise<void>;
  onDeleteLink: (id: string) => Promise<void>;
  onFetchLink: (id: string) => Promise<void>;
  onOpenCompetitor: (name: string) => void;
  onRefresh: () => Promise<void>;
  onSaveProductChannels: () => Promise<void>;
  onSendReport: () => Promise<void>;
  onSetBrandId: (brandId: string) => void;
  onSetChannelUrl: (
    id: KolamDaraMarketIntelCompetitorChannelId,
    url: string,
  ) => void;
  onSetNewCompetitorName: (value: string) => void;
  onSetProduct: (id: string, label: string) => void;
  onClearProduct: () => void;
  onSetSearch: (value: string) => void;
  onToggleAddCompetitor: () => void;
  onToggleChannel: (
    id: KolamDaraMarketIntelCompetitorChannelId,
    value: boolean,
  ) => void;
  onConfirmAddCompetitor: () => void;
}

const EMPTY_CHANNELS: Record<KolamDaraMarketIntelCompetitorChannelId, boolean> =
  {
    website: false,
    tokopedia: false,
    shopee: false,
  };

const EMPTY_URLS: Record<KolamDaraMarketIntelCompetitorChannelId, string> = {
  website: '',
  tokopedia: '',
  shopee: '',
};

export function useKolamDaraMarketIntelCompetitorsController(
  route: string,
): KolamDaraMarketIntelCompetitorsController {
  const enabled =
    isKolamDaraMarketIntelRoute(route) &&
    getKolamDaraMarketIntelTab(route) === 'competitors';

  const [brandId, setBrandId] = useState('all');
  const [brands, setBrands] = useState<KolamDaraMarketIntelBrand[]>([]);
  const [links, setLinks] = useState<KolamDaraMarketIntelCompetitorLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fetchingId, setFetchingId] = useState<string | null>(null);
  const [bulkFetching, setBulkFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [view, setView] =
    useState<KolamDaraMarketIntelCompetitorsView>('list');
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(
    null,
  );
  const [search, setSearch] = useState('');
  const [showAddCompetitor, setShowAddCompetitor] = useState(false);
  const [newCompetitorName, setNewCompetitorName] = useState('');
  const [productId, setProductId] = useState('');
  const [productLabel, setProductLabel] = useState('');
  const [channels, setChannels] = useState(EMPTY_CHANNELS);
  const [channelUrls, setChannelUrls] = useState(EMPTY_URLS);
  const [productBaseline, setProductBaseline] =
    useState<KolamDaraMarketIntelCompetitorBaseline | null>(null);

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [brandRes, linkRes] = await Promise.all([
        fetchKolamDaraMarketIntelActiveBrands().catch(() => ({
          brands: [] as KolamDaraMarketIntelBrand[],
          defaultBrandId: 'all',
        })),
        fetchKolamDaraMarketIntelCompetitorLinks({
          brandId,
          enriched: true,
        }),
      ]);
      setBrands(brandRes.brands);
      setLinks(linkRes);
    } catch (err) {
      setLinks([]);
      setError(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal memuat kompetitor',
      );
    } finally {
      setLoading(false);
    }
  }, [brandId, enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void onRefresh();
  }, [enabled, onRefresh]);

  useEffect(() => {
    setView('list');
    setSelectedCompetitor(null);
    setProductId('');
    setProductLabel('');
    setProductBaseline(null);
    setChannels(EMPTY_CHANNELS);
    setChannelUrls(EMPTY_URLS);
  }, [brandId]);

  useEffect(() => {
    if (!enabled || !isKolamDaraMarketIntelMongoObjectId(productId)) {
      setProductBaseline(null);
      return;
    }
    let cancelled = false;
    void fetchKolamDaraMarketIntelCompetitorBaseline(productId)
      .then(next => {
        if (!cancelled) {
          setProductBaseline(next);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProductBaseline(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, productId]);

  const groups = useMemo(
    () => groupKolamDaraMarketIntelCompetitors(links),
    [links],
  );

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return groups;
    }
    return groups.filter(group => group.name.toLowerCase().includes(q));
  }, [groups, search]);

  const detailLinks = useMemo(() => {
    if (!selectedCompetitor) {
      return [];
    }
    return links
      .filter(link => link.competitorName === selectedCompetitor)
      .sort((a, b) =>
        (a.product?.name || '').localeCompare(b.product?.name || '', 'id'),
      );
  }, [links, selectedCompetitor]);

  const onOpenCompetitor = useCallback((name: string) => {
    setSelectedCompetitor(name);
    setView('detail');
    setProductId('');
    setProductLabel('');
    setChannels(EMPTY_CHANNELS);
    setChannelUrls(EMPTY_URLS);
    setNotice(null);
  }, []);

  const onBackToList = useCallback(() => {
    setView('list');
    setSelectedCompetitor(null);
    setProductId('');
    setProductLabel('');
    setNotice(null);
  }, []);

  const onFetchLink = useCallback(
    async (id: string) => {
      setFetchingId(id);
      setNotice(null);
      try {
        const result = await fetchKolamDaraMarketIntelCompetitorLinkPrice(id);
        if (result.ok) {
          setNotice(
            result.price != null
              ? formatRupiah(result.price)
              : 'Fetch OK',
          );
        } else {
          setNotice(result.error || 'Fetch gagal');
        }
        await onRefresh();
      } catch (err) {
        setNotice(
          err instanceof Error && err.message.trim()
            ? sanitizeApiErrorMessage(err.message)
            : 'Fetch gagal',
        );
      } finally {
        setFetchingId(null);
      }
    },
    [onRefresh],
  );

  const onBulkFetch = useCallback(async () => {
    if (!detailLinks.length) {
      setNotice('Tidak ada barang untuk di-fetch');
      return;
    }
    setBulkFetching(true);
    setNotice(null);
    let ok = 0;
    let fail = 0;
    try {
      for (const row of detailLinks) {
        setFetchingId(row.id);
        try {
          const result = await fetchKolamDaraMarketIntelCompetitorLinkPrice(
            row.id,
          );
          if (result.ok) {
            ok += 1;
          } else {
            fail += 1;
          }
        } catch {
          fail += 1;
        }
      }
      setNotice(`Bulk fetch selesai: ${ok} OK, ${fail} gagal`);
      await onRefresh();
    } finally {
      setFetchingId(null);
      setBulkFetching(false);
    }
  }, [detailLinks, onRefresh]);

  const onDeleteLink = useCallback(
    async (id: string) => {
      setNotice(null);
      try {
        await deleteKolamDaraMarketIntelCompetitorLink(id);
        setNotice('Dihapus');
        await onRefresh();
      } catch (err) {
        setNotice(
          err instanceof Error && err.message.trim()
            ? sanitizeApiErrorMessage(err.message)
            : 'Gagal hapus',
        );
      }
    },
    [onRefresh],
  );

  const onSaveProductChannels = useCallback(async () => {
    if (!selectedCompetitor) {
      return;
    }
    if (!isKolamDaraMarketIntelMongoObjectId(productId.trim())) {
      setNotice('Pilih produk terlebih dahulu');
      return;
    }
    const selected = KOLAM_DARA_MARKET_INTEL_COMPETITOR_CHANNELS.filter(
      channel => channels[channel.id],
    );
    if (!selected.length) {
      setNotice('Pilih minimal satu channel');
      return;
    }
    for (const channel of selected) {
      if (!channelUrls[channel.id].trim()) {
        setNotice(`URL barang kompetitor (${channel.label}) wajib`);
        return;
      }
    }
    setBusy(true);
    setNotice(null);
    try {
      for (const channel of selected) {
        const url = channelUrls[channel.id].trim();
        await saveKolamDaraMarketIntelCompetitorLink({
          productId: productId.trim(),
          competitorName: selectedCompetitor,
          platform: channel.platform,
          listingUrl: channel.id === 'website' ? '' : url,
          websiteUrl: channel.id === 'website' ? url : '',
          compareWith: channel.compareWith,
        });
      }
      setNotice(`Barang tersimpan (${selected.length} channel)`);
      setProductId('');
      setProductLabel('');
      setChannels(EMPTY_CHANNELS);
      setChannelUrls(EMPTY_URLS);
      await onRefresh();
    } catch (err) {
      setNotice(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal simpan',
      );
    } finally {
      setBusy(false);
    }
  }, [
    channelUrls,
    channels,
    onRefresh,
    productId,
    selectedCompetitor,
  ]);

  const onSendReport = useCallback(async () => {
    setBusy(true);
    setNotice(null);
    try {
      await sendKolamDaraMarketIntelCompetitorReport(brandId);
      setNotice('Laporan dikirim ke room Chat dengan DARA');
    } catch (err) {
      setNotice(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal kirim laporan',
      );
    } finally {
      setBusy(false);
    }
  }, [brandId]);

  return {
    brandId,
    brands,
    bulkFetching,
    busy,
    channelUrls,
    channels,
    detailLinks,
    error,
    fetchingId,
    filteredGroups,
    loading,
    newCompetitorName,
    notice,
    productBaseline,
    productId,
    productLabel,
    search,
    selectedCompetitor,
    showAddCompetitor,
    view,
    onBackToList,
    onBulkFetch,
    onDeleteLink,
    onFetchLink,
    onOpenCompetitor,
    onRefresh,
    onSaveProductChannels,
    onSendReport,
    onSetBrandId: setBrandId,
    onSetChannelUrl: (id, url) => {
      setChannelUrls(prev => ({...prev, [id]: url}));
    },
    onSetNewCompetitorName: setNewCompetitorName,
    onSetProduct: (id, label) => {
      setProductId(id);
      setProductLabel(label);
    },
    onClearProduct: () => {
      setProductId('');
      setProductLabel('');
      setProductBaseline(null);
    },
    onSetSearch: setSearch,
    onToggleAddCompetitor: () => {
      setShowAddCompetitor(prev => !prev);
      setNewCompetitorName('');
    },
    onToggleChannel: (id, value) => {
      setChannels(prev => ({...prev, [id]: value}));
    },
    onConfirmAddCompetitor: () => {
      const name = newCompetitorName.trim();
      if (!name) {
        return;
      }
      onOpenCompetitor(name);
      setShowAddCompetitor(false);
      setNewCompetitorName('');
    },
  };
}
