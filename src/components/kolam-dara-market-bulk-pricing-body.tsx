import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  KOLAM_DARA_PRICING_MARKETPLACE_MODE_OPTIONS,
  formatKolamDaraPricingEquipmentIdr,
  isKolamDaraPricingEquipmentJobActive,
  type KolamDaraPricingMarketplaceMode,
  type KolamDaraPricingMarkupType,
} from '../domain/kolam-dara-pricing-equipment';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraPricingEquipmentController} from '../hooks/use-kolam-dara-pricing-equipment-controller';
import {KolamButton} from './kolam-button';
import {KolamDropdownSelect} from './kolam-dropdown-select';

/** FE `DaraMarketBulkPricingToolsPanel`. */
export function KolamDaraMarketBulkPricingBody({
  controller,
}: {
  controller: KolamDaraPricingEquipmentController;
}) {
  const busy = controller.loadingPreview || !!controller.runningOp;
  const marketplaceMeta = KOLAM_DARA_PRICING_MARKETPLACE_MODE_OPTIONS.find(
    opt => opt.value === controller.marketplaceMode,
  );
  const markupLabel =
    controller.marketplaceMode === 'webstore_below_market'
      ? 'Jarak di bawah olshop'
      : 'Nilai markup';
  const jobActive =
    controller.activeJob != null &&
    isKolamDaraPricingEquipmentJobActive(controller.activeJob.status);

  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>DARA Peralatan — Bulk Harga</Text>
        <Text style={styles.meta}>
          Empat operasi bulk: hitung dari vendor pembelian terakhir (PO), markup
          per item, lalu push harga DB ke Tokopedia atau Shopee. Hanya
          admin/owner.
        </Text>
      </View>

      {controller.notice ? (
        <Text style={styles.notice}>{controller.notice}</Text>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Markup default (per item)</Text>
        <View style={styles.markupRow}>
          <View style={styles.markupField}>
            <Text style={styles.fieldLabel}>Tipe</Text>
            <KolamDropdownSelect
              label="Tipe"
              onChange={value =>
                controller.onSetMarkupType(value as KolamDaraPricingMarkupType)
              }
              options={[
                {label: 'Persen (%)', value: 'percent'},
                {label: 'Nominal (Rp)', value: 'fixed'},
              ]}
              showLabelInTrigger={false}
              style={styles.markupSelect}
              value={controller.markupType}
            />
          </View>
          <View style={styles.markupField}>
            <Text style={styles.fieldLabel}>{markupLabel}</Text>
            <TextInput
              keyboardType="numeric"
              onChangeText={controller.onSetMarkupValue}
              placeholderTextColor={V.colors.mutedFg}
              style={styles.input}
              value={controller.markupValue}
            />
          </View>
          <View style={styles.checkRowWrap}>
            <CheckRow
              checked={controller.includeProducts}
              label="Produk"
              onPress={() =>
                controller.onSetIncludeProducts(!controller.includeProducts)
              }
            />
            <CheckRow
              checked={controller.includeSpecies}
              label="Species"
              onPress={() =>
                controller.onSetIncludeSpecies(!controller.includeSpecies)
              }
            />
          </View>
        </View>
      </View>

      <OperationCard
        badge="A"
        busy={busy}
        description="Basis = harga vendor pembelian terakhir + ongkir PO. Tambah markup per item → simpan ke onlinePrice di DB Kolam."
        onPreview={() => {
          void controller.onPreview('kolam');
        }}
        onRun={() => {
          void controller.onRun('kolam');
        }}
        running={controller.runningOp === 'kolam'}
        title="Harga Kolam (onlinePrice)"
      />

      <View style={styles.card}>
        <View style={styles.opHead}>
          <View style={styles.opText}>
            <View style={styles.badgeRow}>
              <Text style={styles.badge}>B</Text>
              <Text style={styles.opTitle}>
                Harga olshop & webstore (DB saja)
              </Text>
            </View>
            <Text style={styles.fieldLabel}>Mode operasi B</Text>
            <KolamDropdownSelect
              label="Mode"
              onChange={value =>
                controller.onSetMarketplaceMode(
                  value as KolamDaraPricingMarketplaceMode,
                )
              }
              options={KOLAM_DARA_PRICING_MARKETPLACE_MODE_OPTIONS.map(opt => ({
                label: opt.label,
                value: opt.value,
              }))}
              showLabelInTrigger={false}
              style={styles.modeSelect}
              value={controller.marketplaceMode}
            />
            {marketplaceMeta ? (
              <Text style={styles.meta}>{marketplaceMeta.hint}</Text>
            ) : null}
          </View>
          <View style={styles.opActions}>
            <KolamButton
              disabled={busy}
              intent="secondary"
              label="Preview"
              onPress={() => {
                void controller.onPreview('marketplace_db');
              }}
            />
            <KolamButton
              disabled={busy}
              intent="primary"
              label={
                controller.runningOp === 'marketplace_db'
                  ? 'Berjalan…'
                  : 'Jalankan'
              }
              onPress={() => {
                void controller.onRun('marketplace_db');
              }}
            />
          </View>
        </View>
      </View>

      <OperationCard
        badge="C"
        busy={!!controller.runningOp}
        description="Kirim onlinePrice yang ada di DB ke Tokopedia via AM — sama seperti tombol Sync Harga di daftar produk."
        onPreview={controller.onPushPreviewNotice}
        onRun={() => {
          void controller.onRun('push_olshop', {pushPlatform: 'tokopedia'});
        }}
        running={controller.runningOp === 'push_olshop_tokopedia'}
        title="Push ke olshop (Tokopedia)"
      />

      <OperationCard
        badge="D"
        busy={!!controller.runningOp}
        description="Kirim onlinePrice yang ada di DB ke Shopee via AM — sama seperti Sync Harga Shopee di daftar produk/species."
        onPreview={controller.onPushPreviewNotice}
        onRun={() => {
          void controller.onRun('push_olshop', {pushPlatform: 'shopee'});
        }}
        running={controller.runningOp === 'push_olshop_shopee'}
        title="Push ke olshop (Shopee)"
      />

      {jobActive && controller.activeJob ? (
        <View style={styles.card}>
          <View style={styles.progressHead}>
            <Text style={styles.sectionTitle}>
              {`${controller.activeJob.progressCurrent}/${
                controller.activeJob.progressTotal || '?'
              }`}
            </Text>
            <Text style={styles.meta}>{controller.activeJob.status}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {width: `${controller.progressPct}%`},
              ]}
            />
          </View>
          <Text style={styles.mono} numberOfLines={2}>
            {controller.activeJob.progressMessage || 'Menunggu…'}
          </Text>
        </View>
      ) : null}

      <View style={styles.console}>
        <View style={styles.consoleHead}>
          <View
            style={[
              styles.consoleDot,
              controller.runningOp ? styles.consoleDotOn : null,
            ]}
          />
          <Text style={styles.consoleTitle}>Console log</Text>
        </View>
        <Text style={styles.consoleBody}>
          {controller.consoleLines.length
            ? controller.consoleLines.join('\n')
            : '// Log muncul saat proses berjalan'}
        </Text>
      </View>

      {controller.preview && controller.previewOp ? (
        <View style={styles.card}>
          <View style={styles.previewHead}>
            <Text style={styles.sectionTitle}>
              {`Preview operasi ${
                controller.previewOp === 'kolam' ? 'A' : 'B'
              }${
                controller.previewOp === 'marketplace_db' &&
                controller.preview.marketplaceMode
                  ? ` · ${
                      KOLAM_DARA_PRICING_MARKETPLACE_MODE_OPTIONS.find(
                        o =>
                          o.value === controller.preview?.marketplaceMode,
                      )?.label ?? ''
                    }`
                  : ''
              }`}
            </Text>
            <Text style={styles.meta}>
              {`${controller.preview.applicable} siap · ${controller.preview.skipped} dilewati · total ${controller.preview.total}`}
            </Text>
          </View>

          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.colSku]}>SKU</Text>
            <Text style={[styles.th, styles.colName]}>Nama</Text>
            <Text style={[styles.th, styles.colVendor]}>Vendor / PO</Text>
            <Text style={[styles.th, styles.colNum]}>Basis</Text>
            <Text style={[styles.th, styles.colNum]}>Lama</Text>
            <Text style={[styles.th, styles.colNum]}>Baru</Text>
          </View>
          {controller.previewRows.map(row => (
            <View
              key={`${row.entityId}-${row.variantId || 'r'}`}
              style={styles.tableRow}>
              <Text style={[styles.td, styles.colSku, styles.mono]}>
                {row.sku || '—'}
              </Text>
              <Text style={[styles.td, styles.colName]} numberOfLines={1}>
                {row.name}
              </Text>
              <Text
                style={[styles.td, styles.colVendor, styles.meta]}
                numberOfLines={1}>
                {`${row.vendorName || row.source || '—'}${
                  row.poCode ? ` · ${row.poCode}` : ''
                }`}
              </Text>
              <Text style={[styles.td, styles.colNum]}>
                {formatKolamDaraPricingEquipmentIdr(row.baseCost)}
              </Text>
              <Text style={[styles.td, styles.colNum]}>
                {formatKolamDaraPricingEquipmentIdr(row.oldPrice)}
              </Text>
              <Text style={[styles.td, styles.colNum, styles.newPrice]}>
                {formatKolamDaraPricingEquipmentIdr(row.newPrice)}
              </Text>
            </View>
          ))}
          {controller.preview.skipped > 0 ? (
            <Text style={styles.warn}>
              {`${controller.preview.skipped} item dilewati (tanpa harga olshop/webstore atau jarak markup tidak valid).`}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function OperationCard({
  badge,
  busy,
  description,
  onPreview,
  onRun,
  running,
  title,
}: {
  badge: string;
  busy: boolean;
  description: string;
  onPreview: () => void;
  onRun: () => void;
  running: boolean;
  title: string;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.opHead}>
        <View style={styles.opText}>
          <View style={styles.badgeRow}>
            <Text style={styles.badge}>{badge}</Text>
            <Text style={styles.opTitle}>{title}</Text>
          </View>
          <Text style={styles.meta}>{description}</Text>
        </View>
        <View style={styles.opActions}>
          <KolamButton
            disabled={busy}
            intent="secondary"
            label="Preview"
            onPress={onPreview}
          />
          <KolamButton
            disabled={busy || running}
            intent="primary"
            label={running ? 'Berjalan…' : 'Jalankan'}
            onPress={onRun}
          />
        </View>
      </View>
    </View>
  );
}

function CheckRow({
  checked,
  label,
  onPress,
}: {
  checked: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{checked}}
      onPress={onPress}
      style={styles.checkRow}>
      <View style={[styles.check, checked ? styles.checkOn : null]}>
        <Text style={styles.checkMark}>{checked ? '✓' : ''}</Text>
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 16,
  },
  hero: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  heroTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '700',
  },
  card: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  fieldLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
  },
  meta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  notice: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  warn: {
    color: V.colors.warning,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  markupRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  markupField: {
    gap: 4,
    minWidth: 128,
  },
  markupSelect: {
    minWidth: 140,
  },
  modeSelect: {
    maxWidth: 420,
    width: '100%',
  },
  input: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    maxWidth: 140,
    minWidth: 112,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  checkRowWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 6,
  },
  checkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  check: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 4,
    borderWidth: 1,
    height: 16,
    justifyContent: 'center',
    width: 16,
  },
  checkOn: {
    backgroundColor: V.colors.fg,
    borderColor: V.colors.fg,
  },
  checkMark: {
    color: V.colors.bg,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
  checkLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  opHead: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  opText: {
    flex: 1,
    gap: 6,
    minWidth: 200,
  },
  badgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: V.colors.fg,
    borderRadius: 4,
    color: V.colors.bg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  opTitle: {
    color: V.colors.fg,
    flexShrink: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  opActions: {
    flexDirection: 'row',
    flexShrink: 0,
    gap: 8,
  },
  progressHead: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTrack: {
    backgroundColor: V.colors.muted,
    borderRadius: 4,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: V.colors.fg,
    height: '100%',
  },
  mono: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  console: {
    backgroundColor: '#0b1220',
    borderColor: '#1f2937',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  consoleHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  consoleDot: {
    backgroundColor: '#4b5563',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  consoleDotOn: {
    backgroundColor: '#4ade80',
  },
  consoleTitle: {
    color: '#d1d5db',
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  consoleBody: {
    color: '#4ade80',
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 16,
    maxHeight: 180,
  },
  previewHead: {
    gap: 4,
  },
  tableHead: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingBottom: 6,
  },
  tableRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 6,
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
    fontSize: 11,
  },
  colSku: {flex: 1.1},
  colName: {flex: 1.4},
  colVendor: {flex: 1.4},
  colNum: {flex: 1, textAlign: 'right'},
  newPrice: {
    fontWeight: '700',
  },
});
