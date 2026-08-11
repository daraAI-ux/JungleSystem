import React, {useCallback, useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
  formatKolamDaraTaxIdr,
  type KolamDaraTaxAllocationBySource,
  type KolamDaraTaxJournalPreview,
  type KolamDaraTaxMissingFakturPo,
  type KolamDaraTaxMissingFakturSale,
  type KolamDaraTaxSptPpnMasaPreview,
} from '../domain/kolam-dara-tax';
import {
  KOLAM_DARA_TAX_PERIOD_OPTIONS,
  type KolamDaraTaxPeriod,
} from '../domain/kolam-finance-tax';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {copyTextToClipboard} from '../lib/native-clipboard';
import {
  fetchKolamDaraTaxPoMissingFaktur,
  fetchKolamDaraTaxSalesMissingFaktur,
} from '../services/kolam-dara-tax-api';
import {KolamButton} from './kolam-button';
import {KolamRefreshButton} from './kolam-refresh-button';
import {KolamListTableComposition} from './kolam-list-table-composition';
import {KolamStatusBadge} from './kolam-status-badge';
import {KolamSurfacePanelTabs} from './kolam-surface-panel-tabs';

type FakturTab = 'sales' | 'po';
const FAKTUR_PAGE_SIZE = 10;

function formatDaraTaxPeriodLabel(period: KolamDaraTaxPeriod) {
  return (
    KOLAM_DARA_TAX_PERIOD_OPTIONS.find(option => option.id === period)?.label ??
    period
  );
}

function formatFakturStatusLabel(status: string) {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized === 'missing') {
    return 'Belum tercatat';
  }
  if (normalized === 'needed') {
    return 'Perlu faktur';
  }
  if (normalized === 'pending') {
    return 'Menunggu';
  }
  if (normalized === 'issued') {
    return 'Terbit';
  }
  if (normalized === 'uploaded') {
    return 'Terunggah';
  }
  if (normalized === 'verified') {
    return 'Terverifikasi';
  }
  if (normalized === 'none') {
    return 'Tidak ada';
  }
  return status ? status.replace(/[_-]+/g, ' ') : '—';
}

/** FE Operasional: TaxPhase3 + TaxPhase4Compliance + TaxMissingFaktur. */
export function KolamDaraTaxOperasionalBody({
  allocation,
  journal,
  loading,
  onRouteChange,
  period,
  sptPreview,
  taxEnabled,
}: {
  allocation: KolamDaraTaxAllocationBySource | null;
  journal: KolamDaraTaxJournalPreview | null;
  loading: boolean;
  onRouteChange?: (route: string) => void;
  period: KolamDaraTaxPeriod;
  sptPreview: KolamDaraTaxSptPpnMasaPreview | null;
  taxEnabled: boolean;
}) {
  const [notice, setNotice] = useState('');
  const [fakturTab, setFakturTab] = useState<FakturTab>('sales');
  const [sales, setSales] = useState<KolamDaraTaxMissingFakturSale[]>([]);
  const [po, setPo] = useState<KolamDaraTaxMissingFakturPo[]>([]);
  const [fakturLoading, setFakturLoading] = useState(false);
  const [salesPage, setSalesPage] = useState(1);
  const [poPage, setPoPage] = useState(1);

  const loadMissing = useCallback(async () => {
    setFakturLoading(true);
    try {
      const [salesRes, poRes] = await Promise.allSettled([
        fetchKolamDaraTaxSalesMissingFaktur(15),
        fetchKolamDaraTaxPoMissingFaktur(15),
      ]);
      setSales(salesRes.status === 'fulfilled' ? salesRes.value : []);
      setPo(poRes.status === 'fulfilled' ? poRes.value : []);
    } finally {
      setFakturLoading(false);
    }
  }, []);

  useEffect(() => {
    if (taxEnabled) {
      void loadMissing();
    }
  }, [loadMissing, taxEnabled]);

  useEffect(() => {
    setSalesPage(1);
  }, [sales.length]);

  useEffect(() => {
    setPoPage(1);
  }, [po.length]);

  if (!taxEnabled) {
    return null;
  }

  const copySpt = async () => {
    if (!sptPreview) {
      setNotice('Data SPT belum tersedia');
      return;
    }
    try {
      await copyTextToClipboard(JSON.stringify(sptPreview.raw, null, 2));
      setNotice('JSON SPT disalin');
    } catch {
      setNotice('Gagal menyalin JSON SPT');
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.meta}>
        Drill-down alokasi, jurnal, SPT, dan faktur belum tercatat.
      </Text>
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {loading ? (
        <Text style={styles.meta}>Memuat data operasional…</Text>
      ) : (
        <>
          <View style={styles.topGrid}>
            <View style={styles.mainColumn}>
              {allocation ? (
                <View style={styles.card}>
                  <View style={styles.cardHead}>
                    <Text style={styles.sectionTitle}>
                      Alokasi PPN per sumber penjualan
                    </Text>
                    <KolamStatusBadge
                      intent="secondary"
                      label={formatDaraTaxPeriodLabel(period)}
                    />
                  </View>
                  {allocation.disclaimer ? (
                    <Text style={styles.meta}>{allocation.disclaimer}</Text>
                  ) : null}
                  {allocation.bySource.length === 0 ? (
                    <Text style={styles.meta}>
                      Tidak ada penjualan yang memenuhi syarat di periode ini.
                    </Text>
                  ) : (
                    <View>
                      <View style={styles.tableHead}>
                        <Text style={[styles.th, styles.colSource]}>Sumber</Text>
                        <Text style={[styles.th, styles.colNum]}>Pesanan</Text>
                        <Text style={[styles.th, styles.colNum]}>DPP</Text>
                        <Text style={[styles.th, styles.colNum]}>
                          PPN keluaran
                        </Text>
                      </View>
                      {allocation.bySource.map(row => (
                        <View
                          key={row.sourceId || row.sourceName}
                          style={styles.tableRow}>
                          <View style={styles.colSource}>
                            <Text style={styles.tdStrong}>{row.sourceName}</Text>
                            {row.sourceType ? (
                              <Text style={styles.metaUpper}>
                                {row.sourceType}
                              </Text>
                            ) : null}
                          </View>
                          <Text style={[styles.td, styles.colNum]}>
                            {row.orderCount}
                          </Text>
                          <Text style={[styles.tdMono, styles.colNum]}>
                            {formatKolamDaraTaxIdr(row.dppIdr)}
                          </Text>
                          <Text style={[styles.tdMono, styles.colNum]}>
                            {formatKolamDaraTaxIdr(row.ppnOutputIdr)}
                          </Text>
                        </View>
                      ))}
                      <View style={[styles.tableRow, styles.totalRow]}>
                        <Text style={[styles.tdStrong, styles.colSource]}>
                          Total
                        </Text>
                        <Text style={[styles.tdStrong, styles.colNum]}>
                          {allocation.totals.orderCount}
                        </Text>
                        <Text style={[styles.tdMono, styles.colNum]}>
                          {formatKolamDaraTaxIdr(allocation.totals.dppIdr)}
                        </Text>
                        <Text style={[styles.tdMono, styles.colNum]}>
                          {formatKolamDaraTaxIdr(allocation.totals.ppnOutputIdr)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ) : null}
            </View>
            <View style={styles.sideColumn}>
              <View style={styles.sptCard}>
                <View style={styles.cardHead}>
                  <Text style={styles.sectionTitle}>Pra-isi SPT Masa PPN</Text>
                  <KolamStatusBadge
                    intent="secondary"
                    label={formatDaraTaxPeriodLabel(period)}
                  />
                </View>
                <Text style={styles.meta}>
                  Referensi form 1111 — unduh JSON untuk tinjauan dan input
                  manual Coretax.
                </Text>
                {!sptPreview ? (
                  <Text style={styles.meta}>Data SPT belum dimuat.</Text>
                ) : (
                  <>
                    <Text style={styles.td}>
                      {`Wajib pajak: ${
                        sptPreview.taxpayer.legalName || '—'
                      }`}
                      {sptPreview.taxpayer.npwp
                        ? ` · NPWP ${sptPreview.taxpayer.npwp}`
                        : ' · NPWP belum diisi (Pengaturan → Finansial)'}
                    </Text>
                    <KolamButton
                      intent="secondary"
                      label={`Unduh JSON pra-isi SPT (${sptPreview.period})`}
                      onPress={() => {
                        void copySpt();
                      }}
                      size="sm"
                      style={styles.sptButton}
                    />
                  </>
                )}
              </View>
            </View>
          </View>

          {journal ? (
            <View style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={styles.sectionTitle}>
                  Pratinjau jurnal pajak (estimasi)
                </Text>
                <KolamStatusBadge
                  intent={journal.balanced ? 'success' : 'warning'}
                  label={
                    journal.balanced ? 'PPN seimbang' : 'PPN cek selisih'
                  }
                />
              </View>
              {journal.disclaimer ? (
                <Text style={styles.meta}>{journal.disclaimer}</Text>
              ) : null}
              {journal.lines.length === 0 ? (
                <Text style={styles.meta}>
                  Belum ada baris jurnal untuk periode ini.
                </Text>
              ) : (
                <View>
                  <View style={styles.tableHead}>
                    <Text style={[styles.th, styles.colAccount]}>Akun</Text>
                    <Text style={[styles.th, styles.colMemo]}>Keterangan</Text>
                    <Text style={[styles.th, styles.colNum]}>Debit</Text>
                    <Text style={[styles.th, styles.colNum]}>Kredit</Text>
                  </View>
                  {journal.lines.map((line, index) => (
                    <View
                      key={`${line.accountCode}-${index}`}
                      style={[
                        styles.tableRow,
                        line.informational ? styles.infoRow : null,
                      ]}>
                      <View style={styles.colAccount}>
                        <Text style={styles.tdMono}>{line.accountCode}</Text>
                        <Text style={styles.meta}>{line.accountLabel}</Text>
                      </View>
                      <Text style={[styles.td, styles.colMemo]}>
                        {`${line.memo}${line.informational ? ' (info)' : ''}`}
                      </Text>
                      <Text style={[styles.tdMono, styles.colNum]}>
                        {line.debitIdr > 0
                          ? formatKolamDaraTaxIdr(line.debitIdr)
                          : '—'}
                      </Text>
                      <Text style={[styles.tdMono, styles.colNum]}>
                        {line.creditIdr > 0
                          ? formatKolamDaraTaxIdr(line.creditIdr)
                          : '—'}
                      </Text>
                    </View>
                  ))}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={[styles.tdStrong, styles.colAccount]}>
                      Total
                    </Text>
                    <View style={styles.colMemo} />
                    <Text style={[styles.tdMono, styles.colNum]}>
                      {formatKolamDaraTaxIdr(journal.totals.debitIdr)}
                    </Text>
                    <Text style={[styles.tdMono, styles.colNum]}>
                      {formatKolamDaraTaxIdr(journal.totals.creditIdr)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ) : null}

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.sectionTitle}>
                Faktur pajak belum tercatat
              </Text>
              <KolamRefreshButton
                accessibilityLabel="Muat ulang"
                disabled={fakturLoading}

                onPress={() => {
                  void loadMissing();
                }}
                size="sm"
              />
            </View>
            <Text style={styles.meta}>
              Penjualan (faktur keluaran) dan PO masukan yang memenuhi syarat
              tapi belum ada nomor seri.
            </Text>
            <KolamSurfacePanelTabs
              onSelectTab={(tabId: FakturTab) => setFakturTab(tabId)}
              selectedTabId={fakturTab}
              tabs={[
                {
                  id: 'sales',
                  label:
                    sales.length > 0
                      ? `Penjualan (${sales.length})`
                      : 'Penjualan',
                },
                {
                  id: 'po',
                  label: po.length > 0 ? `PO masukan (${po.length})` : 'PO masukan',
                },
              ]}
            />
            {fakturTab === 'sales' ? (
              <KolamListTableComposition
                columns={[
                  {
                    flex: 1.4,
                    id: 'invoice',
                    label: 'Invoice',
                    render: row => (
                      <Pressable
                        accessibilityRole="link"
                        onPress={() => onRouteChange?.(`/sales/${row.id}`)}>
                        <Text style={styles.link}>{row.invoiceCode}</Text>
                      </Pressable>
                    ),
                  },
                  {
                    align: 'right',
                    flex: 1,
                    id: 'total',
                    label: 'Total',
                    render: row => (
                      <Text style={styles.tdMono}>
                        {formatKolamDaraTaxIdr(row.finalTotal)}
                      </Text>
                    ),
                  },
                  {
                    align: 'center',
                    flex: 0.8,
                    id: 'status',
                    label: 'Status',
                    render: row => (
                      <KolamStatusBadge
                        intent="warning"
                        label={formatFakturStatusLabel(row.fakturStatus)}
                      />
                    ),
                  },
                ]}
                emptyTitle="Tidak ada penjualan yang perlu faktur."
                getRowKey={row => row.id}
                loading={fakturLoading}
                pagination={{
                  onPageChange: setSalesPage,
                  page: salesPage,
                  pageSize: FAKTUR_PAGE_SIZE,
                  total: sales.length,
                }}
                rows={sales.slice(
                  (salesPage - 1) * FAKTUR_PAGE_SIZE,
                  salesPage * FAKTUR_PAGE_SIZE,
                )}
              />
            ) : (
              <KolamListTableComposition
                columns={[
                  {
                    flex: 1.2,
                    id: 'po',
                    label: 'PO',
                    render: row => (
                      <Pressable
                        accessibilityRole="link"
                        onPress={() =>
                          onRouteChange?.(`/purchase-order/${row.id}`)
                        }>
                        <Text style={styles.link}>{row.poCode}</Text>
                      </Pressable>
                    ),
                  },
                  {
                    flex: 1.2,
                    id: 'vendor',
                    label: 'Vendor',
                    render: row => (
                      <Text style={styles.td}>{row.vendorName || '-'}</Text>
                    ),
                  },
                  {
                    align: 'right',
                    flex: 1,
                    id: 'total',
                    label: 'Total',
                    render: row => (
                      <Text style={styles.tdMono}>
                        {formatKolamDaraTaxIdr(row.finalTotal)}
                      </Text>
                    ),
                  },
                  {
                    align: 'center',
                    flex: 0.8,
                    id: 'status',
                    label: 'Status',
                    render: row => (
                      <KolamStatusBadge
                        intent="warning"
                        label={formatFakturStatusLabel(row.fakturStatus)}
                      />
                    ),
                  },
                ]}
                emptyTitle="Tidak ada PO yang perlu faktur masukan."
                getRowKey={row => row.id}
                loading={fakturLoading}
                pagination={{
                  onPageChange: setPoPage,
                  page: poPage,
                  pageSize: FAKTUR_PAGE_SIZE,
                  total: po.length,
                }}
                rows={po.slice(
                  (poPage - 1) * FAKTUR_PAGE_SIZE,
                  poPage * FAKTUR_PAGE_SIZE,
                )}
              />
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
  },
  topGrid: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mainColumn: {
    flex: 3,
    minWidth: 520,
  },
  sideColumn: {
    flex: 1,
    minWidth: 260,
  },
  meta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  metaUpper: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  notice: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  sptCard: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  cardHead: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: V.colors.fg,
    flexShrink: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  tableHead: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 6,
  },
  tableRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 6,
  },
  totalRow: {
    borderBottomWidth: 0,
  },
  infoRow: {
    opacity: 0.75,
  },
  th: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  td: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  tdStrong: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  tdMono: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  colSource: {flex: 1.4, minWidth: 100},
  colAccount: {flex: 1.2, minWidth: 90},
  colMemo: {flex: 1.4, minWidth: 100},
  colNum: {flex: 1, minWidth: 72, textAlign: 'right'},
  sptButton: {
    alignSelf: 'flex-start',
  },
  link: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
