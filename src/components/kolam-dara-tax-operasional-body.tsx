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
import type {KolamDaraTaxPeriod} from '../domain/kolam-finance-tax';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {copyTextToClipboard} from '../lib/native-clipboard';
import {
  fetchKolamDaraTaxPoMissingFaktur,
  fetchKolamDaraTaxSalesMissingFaktur,
} from '../services/kolam-dara-tax-api';
import {KolamButton} from './kolam-button';
import {KolamStatusBadge} from './kolam-status-badge';
import {KolamSurfacePanelTabs} from './kolam-surface-panel-tabs';

type FakturTab = 'sales' | 'po';

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
          {allocation ? (
            <View style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={styles.sectionTitle}>
                  Alokasi PPN per source penjualan
                </Text>
                <KolamStatusBadge intent="secondary" label={period} />
              </View>
              {allocation.disclaimer ? (
                <Text style={styles.meta}>{allocation.disclaimer}</Text>
              ) : null}
              {allocation.bySource.length === 0 ? (
                <Text style={styles.meta}>
                  Tidak ada penjualan eligible di periode ini.
                </Text>
              ) : (
                <View>
                  <View style={styles.tableHead}>
                    <Text style={[styles.th, styles.colSource]}>Source</Text>
                    <Text style={[styles.th, styles.colNum]}>Order</Text>
                    <Text style={[styles.th, styles.colNum]}>DPP</Text>
                    <Text style={[styles.th, styles.colNum]}>PPN keluaran</Text>
                  </View>
                  {allocation.bySource.map(row => (
                    <View
                      key={row.sourceId || row.sourceName}
                      style={styles.tableRow}>
                      <View style={styles.colSource}>
                        <Text style={styles.tdStrong}>{row.sourceName}</Text>
                        {row.sourceType ? (
                          <Text style={styles.metaUpper}>{row.sourceType}</Text>
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
                    <Text style={[styles.tdStrong, styles.colSource]}>Total</Text>
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

          {journal ? (
            <View style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={styles.sectionTitle}>
                  Preview jurnal pajak (estimasi)
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

          <View style={styles.sptCard}>
            <View style={styles.cardHead}>
              <Text style={styles.sectionTitle}>Pre-fill SPT Masa PPN</Text>
              <KolamStatusBadge intent="secondary" label={period} />
            </View>
            <Text style={styles.meta}>
              Referensi form 1111 — unduh JSON untuk review & input manual
              Coretax.
            </Text>
            {!sptPreview ? (
              <Text style={styles.meta}>Data SPT belum dimuat.</Text>
            ) : (
              <>
                <Text style={styles.td}>
                  {`Wajib pajak: ${sptPreview.taxpayer.legalName || '—'}`}
                  {sptPreview.taxpayer.npwp
                    ? ` · NPWP ${sptPreview.taxpayer.npwp}`
                    : ' · NPWP belum diisi (Settings → Finansial)'}
                </Text>
                <KolamButton
                  intent="secondary"
                  label={`Unduh JSON pre-fill SPT (${sptPreview.period})`}
                  onPress={() => {
                    void copySpt();
                  }}
                  size="sm"
                  style={styles.sptButton}
                />
              </>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.sectionTitle}>
                Faktur pajak belum tercatat
              </Text>
              <KolamButton
                disabled={fakturLoading}
                label="Refresh"
                onPress={() => {
                  void loadMissing();
                }}
                size="sm"
              />
            </View>
            <Text style={styles.meta}>
              Penjualan (faktur keluaran) dan PO masukan yang eligible tapi belum
              ada nomor seri.
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
              sales.length === 0 ? (
                <Text style={styles.meta}>
                  Tidak ada penjualan yang perlu faktur.
                </Text>
              ) : (
                sales.map(row => (
                  <View key={row.id} style={styles.fakturRow}>
                    <Pressable
                      accessibilityRole="link"
                      onPress={() => onRouteChange?.(`/sales/${row.id}`)}>
                      <Text style={styles.link}>{row.invoiceCode}</Text>
                    </Pressable>
                    <Text style={styles.meta}>
                      {formatKolamDaraTaxIdr(row.finalTotal)}
                    </Text>
                    <KolamStatusBadge
                      intent="warning"
                      label={row.fakturStatus}
                    />
                  </View>
                ))
              )
            ) : po.length === 0 ? (
              <Text style={styles.meta}>
                Tidak ada PO yang perlu faktur masukan.
              </Text>
            ) : (
              po.map(row => (
                <View key={row.id} style={styles.fakturRow}>
                  <View style={styles.fakturBody}>
                    <Pressable
                      accessibilityRole="link"
                      onPress={() =>
                        onRouteChange?.(`/purchase-order/${row.id}`)
                      }>
                      <Text style={styles.link}>{row.poCode}</Text>
                    </Pressable>
                    {row.vendorName ? (
                      <Text style={styles.meta}>{row.vendorName}</Text>
                    ) : null}
                    <Text style={styles.meta}>
                      {formatKolamDaraTaxIdr(row.finalTotal)}
                    </Text>
                  </View>
                  <KolamStatusBadge intent="warning" label={row.fakturStatus} />
                </View>
              ))
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
  fakturRow: {
    alignItems: 'center',
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
  fakturBody: {
    flex: 1,
    gap: 2,
    minWidth: 140,
  },
  link: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
