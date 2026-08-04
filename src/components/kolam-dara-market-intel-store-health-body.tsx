import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  buildKolamDaraMarketIntelProductEditRoute,
  resolveKolamDaraMarketIntelStoreHealthTone,
  type KolamDaraMarketIntelStoreHealthParameter,
  type KolamDaraMarketIntelStoreHealthProductRow,
} from '../domain/kolam-dara-market-intel';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraMarketIntelStoreHealthController} from '../hooks/use-kolam-dara-market-intel-store-health-controller';
import {KolamButton} from './kolam-button';
import {KolamDaraMarketIntelStoreHealthGauge} from './kolam-dara-market-intel-store-health-gauge';
import {KolamEmptyState} from './kolam-empty-state';

/** FE `StoreHealthProductsPanel` + Kesehatan page card. */
export function KolamDaraMarketIntelStoreHealthBody({
  controller,
  onRouteChange,
}: {
  controller: KolamDaraMarketIntelStoreHealthController;
  onRouteChange?: (route: string) => void;
}) {
  const data = controller.data;
  const summary = data?.summary;
  const storeScore = summary?.storeHealthScore ?? 0;
  const tone = resolveKolamDaraMarketIntelStoreHealthTone(storeScore);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Produk</Text>

        <View style={styles.toolbar}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{checked: controller.sellableOnly}}
            onPress={() =>
              controller.onSetSellableOnly(!controller.sellableOnly)
            }
            style={styles.checkRow}>
            <View
              style={[
                styles.check,
                controller.sellableOnly ? styles.checkOn : null,
              ]}>
              <Text style={styles.checkMark}>
                {controller.sellableOnly ? '✓' : ''}
              </Text>
            </View>
            <Text style={styles.checkLabel}>
              Hanya produk sellable (POS/webstore)
            </Text>
          </Pressable>
          <KolamButton
            disabled={controller.loading}
            intent="primary"
            label={controller.loading ? 'Memindai…' : 'Scan seluruh produk'}
            onPress={() => {
              void controller.onScan();
            }}
          />
        </View>

        {!data && !controller.loading ? (
          <Text style={styles.meta}>
            Tekan scan untuk memeriksa kelengkapan field Edit Produk. Produk skor
            100% tidak ditampilkan.
          </Text>
        ) : null}

        {controller.loading && !data ? (
          <Text style={styles.meta}>Memuat…</Text>
        ) : null}

        {controller.error ? (
          <KolamEmptyState
            message={controller.error}
            title="Gagal scan"
          />
        ) : null}

        {data && summary ? (
          <>
            <View style={styles.head}>
              <KolamDaraMarketIntelStoreHealthGauge
                score={storeScore}
                tone={tone}
              />
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLine}>
                  {`${summary.total} produk · ${summary.incomplete} incomplete · ${summary.blockerProducts} blocker`}
                </Text>
                <Text style={styles.formula}>
                  {`${data.formula.storeScore} · ${data.formula.productScore} · ${data.formula.complete}`}
                </Text>
                {summary.complete > 0 ? (
                  <Text style={styles.completeHint}>
                    {`${summary.complete} produk lengkap (hijau) disembunyikan dari tabel.`}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={styles.paramsBlock}>
              <Text style={styles.sectionTitle}>
                Parameter kesehatan produk
              </Text>
              <Text style={styles.formula}>
                Tiap bar = persentase produk yang lulus parameter (target 100% =
                semua hijau).
              </Text>
              <View style={styles.paramList}>
                {data.parameters.map(param => (
                  <ParameterBar key={param.id} param={param} />
                ))}
              </View>
            </View>

            {data.products.length === 0 ? (
              <View style={styles.allGood}>
                <Text style={styles.allGoodText}>
                  Semua produk lengkap — tidak ada baris incomplete.
                </Text>
              </View>
            ) : (
              <View style={styles.table}>
                <View style={styles.tableHead}>
                  <Text style={[styles.th, styles.colSku]}>SKU</Text>
                  <Text style={[styles.th, styles.colName]}>Nama</Text>
                  <Text style={[styles.th, styles.colScore]}>Skor</Text>
                  <Text style={[styles.th, styles.colNum]}>Blk</Text>
                  <Text style={[styles.th, styles.colNum]}>Wrn</Text>
                  <Text style={[styles.th, styles.colAction]}>Aksi</Text>
                </View>
                {data.products.map(row => (
                  <ProductRow
                    expanded={controller.expandedId === row.productId}
                    key={row.productId}
                    onOpenEdit={() =>
                      onRouteChange?.(
                        buildKolamDaraMarketIntelProductEditRoute(
                          row.productId,
                        ),
                      )
                    }
                    onToggle={() =>
                      controller.onToggleExpanded(row.productId)
                    }
                    row={row}
                  />
                ))}
              </View>
            )}
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

function ParameterBar({
  param,
}: {
  param: KolamDaraMarketIntelStoreHealthParameter;
}) {
  const tone = resolveKolamDaraMarketIntelStoreHealthTone(param.passRate);
  return (
    <View style={styles.paramItem}>
      <View style={styles.paramRow}>
        <Text numberOfLines={1} style={styles.paramLabel}>
          {`${param.level === 'blocker' ? '⛔ ' : '⚠ '}${param.label}`}
        </Text>
        <Text style={styles.paramMeta}>
          {`${param.passRate}% (${param.pass}/${param.pass + param.fail})`}
        </Text>
      </View>
      <View style={styles.paramTrack}>
        <View
          style={[
            styles.paramFill,
            tone === 'good'
              ? styles.fillGood
              : tone === 'warn'
                ? styles.fillWarn
                : styles.fillBad,
            {width: `${Math.min(100, Math.max(0, param.passRate))}%`},
          ]}
        />
      </View>
    </View>
  );
}

function ProductRow({
  expanded,
  onOpenEdit,
  onToggle,
  row,
}: {
  expanded: boolean;
  onOpenEdit: () => void;
  onToggle: () => void;
  row: KolamDaraMarketIntelStoreHealthProductRow;
}) {
  return (
    <View style={styles.productBlock}>
      <Pressable
        accessibilityRole="button"
        onPress={onToggle}
        style={styles.tableRow}>
        <Text numberOfLines={1} style={[styles.td, styles.colSku]}>
          {row.sku || '—'}
        </Text>
        <Text numberOfLines={1} style={[styles.td, styles.colName]}>
          {row.name}
        </Text>
        <Text
          style={[
            styles.td,
            styles.colScore,
            row.score >= 70 ? styles.scoreWarn : styles.scoreBad,
          ]}>
          {`${row.score}%`}
        </Text>
        <Text style={[styles.td, styles.colNum]}>{row.blockers}</Text>
        <Text style={[styles.td, styles.colNum]}>{row.warnings}</Text>
        <Pressable
          accessibilityRole="link"
          onPress={onOpenEdit}
          style={styles.colAction}>
          <Text style={styles.link}>Buka edit</Text>
        </Pressable>
      </Pressable>
      {expanded ? (
        <View style={styles.issues}>
          {row.issues.map(issue => (
            <Text
              key={issue.code}
              style={
                issue.level === 'blocker'
                  ? styles.issueBlocker
                  : styles.issueWarn
              }>
              {`${issue.level === 'blocker' ? '❌' : '⚠️'} ${issue.message}`}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  cardTitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  checkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexGrow: 1,
    gap: 8,
    minWidth: 200,
  },
  check: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 4,
    borderWidth: 1,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  checkOn: {
    backgroundColor: V.colors.primary,
    borderColor: V.colors.primary,
  },
  checkMark: {
    color: V.colors.primaryFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  checkLabel: {
    color: V.colors.mutedFg,
    flexShrink: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  meta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  head: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryCol: {
    flex: 1,
    gap: 4,
    minWidth: 180,
  },
  summaryLine: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  formula: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 15,
  },
  completeHint: {
    color: V.colors.success,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  paramsBlock: {
    gap: 8,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  paramList: {
    gap: 10,
  },
  paramItem: {
    gap: 4,
  },
  paramRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  paramLabel: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 12,
    minWidth: 0,
  },
  paramMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  paramTrack: {
    backgroundColor: V.colors.muted,
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  paramFill: {
    borderRadius: 999,
    height: 8,
  },
  fillGood: {
    backgroundColor: V.colors.success,
  },
  fillWarn: {
    backgroundColor: V.colors.warning,
  },
  fillBad: {
    backgroundColor: V.colors.danger,
  },
  allGood: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.success,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  allGoodText: {
    color: V.colors.success,
    fontFamily: V.fontFamily,
    fontSize: 13,
    textAlign: 'center',
  },
  table: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHead: {
    backgroundColor: V.colors.muted,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  th: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  productBlock: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  tableRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  td: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  colSku: {
    width: 72,
  },
  colName: {
    flex: 1,
    minWidth: 80,
  },
  colScore: {
    width: 48,
    fontWeight: '700',
  },
  colNum: {
    textAlign: 'right',
    width: 36,
  },
  colAction: {
    width: 72,
  },
  scoreWarn: {
    color: V.colors.warning,
  },
  scoreBad: {
    color: V.colors.danger,
  },
  link: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  issues: {
    backgroundColor: V.colors.muted,
    gap: 4,
    paddingBottom: 10,
    paddingHorizontal: 12,
  },
  issueBlocker: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  issueWarn: {
    color: V.colors.warning,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
});
