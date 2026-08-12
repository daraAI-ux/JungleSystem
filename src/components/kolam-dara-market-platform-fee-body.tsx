import React, {useEffect, useState} from 'react';
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  formatKolamDaraMarketPlatformFeeCheckedAt,
  formatKolamDaraMarketPlatformFeeIdr,
  type KolamDaraMarketPlatformFeeCalcLine,
  type KolamDaraMarketPlatformFeeMeta,
  type KolamDaraMarketPlatformFeeProfile,
  type KolamDaraMarketPlatformFeePrograms,
  type KolamDaraMarketPlatformFeeSource,
} from '../domain/kolam-dara-market-platform-fee';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraMarketPlatformFeeController} from '../hooks/use-kolam-dara-market-platform-fee-controller';
import {KolamButton} from './kolam-button';
import {KolamDropdownSelect} from './kolam-dropdown-select';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamListTableComposition} from './kolam-list-table-composition';
import {KolamNotesField} from './kolam-notes-field';
import {KolamSaveButton} from './kolam-save-button';
import {KolamSurfacePanelTabs} from './kolam-surface-panel-tabs';

const SHOPEE_LOGO = require('../assets/marketplace/shopee.jpg');
const TOKOPEDIA_LOGO = require('../assets/marketplace/tokopedia.png');

/** FE `PlatformFeeMonitorPanel` — Monitor | Kalkulasi. */
export function KolamDaraMarketPlatformFeeBody({
  controller,
}: {
  controller: KolamDaraMarketPlatformFeeController;
}) {
  if (controller.loading && !controller.meta) {
    return <Text style={styles.meta}>Memuat monitor biaya platform…</Text>;
  }
  if (!controller.meta) {
    return controller.error ? (
      <KolamEmptyState message={controller.error} title="Gagal memuat" />
    ) : null;
  }

  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>Monitor Biaya Platform</Text>
          <Text style={styles.meta}>
            Pantau URL kebijakan fee Shopee/Tokopedia. Isi profil toko, approve
            draft mapping, lalu lihat Kalkulasi untuk rincian per komponen
            (bukan estimasi % gabungan).
          </Text>
          {controller.summary &&
          controller.summary.pendingSnapshotCount > 0 ? (
            <Text style={styles.pendingHint}>
              {`${controller.summary.pendingSnapshotCount} draft menunggu review`}
            </Text>
          ) : null}
        </View>
        <View style={styles.heroTabs}>
          <KolamSurfacePanelTabs
            onSelectTab={tabId =>
              controller.onSetPanelTab(tabId as 'monitor' | 'kalkulasi')
            }
            selectedTabId={controller.panelTab}
            tabs={[
              {id: 'monitor', label: 'Monitor'},
              {id: 'kalkulasi', label: 'Kalkulasi'},
            ]}
          />
        </View>
      </View>

      {controller.notice ? (
        <Text style={styles.notice}>{controller.notice}</Text>
      ) : null}
      {controller.error ? (
        <Text style={styles.warn}>{controller.error}</Text>
      ) : null}

      {controller.panelTab === 'kalkulasi' ? (
        <KalkulasiTab controller={controller} />
      ) : (
        <MonitorTab controller={controller} meta={controller.meta} />
      )}
    </View>
  );
}

function MonitorTab({
  controller,
  meta,
}: {
  controller: KolamDaraMarketPlatformFeeController;
  meta: KolamDaraMarketPlatformFeeMeta;
}) {
  /** FE `lg:grid-cols-2` — Shopee | Tokopedia side by side. */
  const orderedProfiles = (['shopee', 'tokopedia'] as const)
    .map(platform =>
      controller.profiles.find(profile => profile.platform === platform),
    )
    .filter(
      (profile): profile is NonNullable<typeof profile> => profile != null,
    );

  return (
    <View style={styles.tabBody}>
      <View style={styles.profileGrid}>
        {orderedProfiles.map(profile => (
          <ProfileFormCard
            key={profile.platform}
            meta={meta}
            onSave={draft =>
              controller.onSaveProfile(profile.platform, draft)
            }
            profile={profile}
          />
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>URL sumber regulasi</Text>

        {controller.scanAllProgress ? (
          <View style={styles.scanBanner} accessibilityRole="summary">
            <Text style={styles.scanBannerText}>
              {`Memindai: ${controller.scanAllProgress.name} (${controller.scanAllProgress.current}/${controller.scanAllProgress.total})`}
            </Text>
          </View>
        ) : null}
        {controller.scanningId && !controller.scanAllProgress ? (
          <View style={styles.scanBanner}>
            <Text style={styles.scanBannerText}>Memindai URL…</Text>
          </View>
        ) : null}

        <View style={styles.addRow}>
          <TextInput
            onChangeText={controller.onSetNewName}
            placeholder="Nama (opsional)"
            placeholderTextColor={V.colors.mutedFg}
            style={[styles.input, styles.addField]}
            value={controller.newName}
          />
          <TextInput
            onChangeText={controller.onSetNewUrl}
            placeholder="https://seller…"
            placeholderTextColor={V.colors.mutedFg}
            style={[styles.input, styles.addField]}
            value={controller.newUrl}
          />
          <View style={styles.addActions}>
            <KolamButton
              label="Tambah URL"
              onPress={() => {
                void controller.onAddSource();
              }}
              size="sm"
            />
            <KolamButton
              disabled={controller.isScanning}
              label={
                controller.scanAllProgress ? 'Memindai…' : 'Cek semua URL'
              }
              onPress={() => {
                void controller.onCheckAll();
              }}
              size="sm"
            />
          </View>
        </View>

        <KolamListTableComposition
          columns={[
            {
              flex: 0.8,
              id: 'platform',
              label: 'Platform',
              render: source => (
                <Text style={[styles.td, styles.sourcePlatform]}>
                  {source.platform}
                </Text>
              ),
            },
            {
              flex: 1.8,
              id: 'name',
              label: 'Nama',
              render: source => (
                <SourceNameCell
                  rowScanning={controller.scanningId === source.id}
                  source={source}
                />
              ),
            },
            {
              align: 'center',
              flex: 1,
              id: 'checked',
              label: 'Terakhir cek',
              render: source => (
                <Text style={[styles.td, styles.meta]}>
                  {formatKolamDaraMarketPlatformFeeCheckedAt(
                    source.lastCheckedAt,
                  )}
                </Text>
              ),
            },
            {
              align: 'center',
              flex: 0.7,
              id: 'action',
              label: 'Aksi',
              render: source => {
                const rowScanning = controller.scanningId === source.id;
                return (
                  <KolamButton
                    disabled={controller.isScanning}
                    intent="outline"
                    label={rowScanning ? 'Scan' : 'Cek'}
                    onPress={() => {
                      void controller.onCheckOne(source.id, source.name);
                    }}
                    size="sm"
                  />
                );
              },
            },
          ]}
          emptyTitle="Belum ada URL sumber regulasi."
          getRowKey={source => source.id}
          rows={controller.sources}
          style={styles.sourceTable}
        />
      </View>

      {controller.snapshots.length ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Draft mapping AI (pending)</Text>
          {controller.snapshots.map(snap => (
            <View key={snap.id} style={styles.snapshotCard}>
              <Text style={styles.rowTitle}>
                {`${snap.sourceName || snap.platform} — ${formatKolamDaraMarketPlatformFeeCheckedAt(
                  snap.createdAt,
                )}`}
              </Text>
              {snap.aiSummary ? (
                <Text style={styles.meta}>{snap.aiSummary}</Text>
              ) : null}
              <View style={styles.rowActions}>
                <KolamButton
                  intent="primary"
                  label="Approve"
                  onPress={() => {
                    void controller.onApproveSnapshot(snap.id);
                  }}
                />
                <KolamButton
                  label="Tolak"
                  onPress={() => {
                    void controller.onRejectSnapshot(snap.id);
                  }}
                />
              </View>
              {snap.mappedFees.map((fee, index) => (
                <Text key={`${fee.name}-${index}`} style={styles.feeLine}>
                  {`${fee.name}: ${
                    fee.type === 'percentage'
                      ? `${fee.value}%`
                      : formatKolamDaraMarketPlatformFeeIdr(fee.value)
                  }${
                    fee.confidence != null
                      ? ` · conf ${(fee.confidence * 100).toFixed(0)}%`
                      : ''
                  }`}
                </Text>
              ))}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function SourceNameCell({
  rowScanning,
  source,
}: {
  rowScanning: boolean;
  source: KolamDaraMarketPlatformFeeSource;
}) {
  return (
    <View style={styles.nameCell}>
      <Pressable
        accessibilityRole="link"
        disabled={!source.url}
        onPress={() => {
          if (source.url) {
            void Linking.openURL(source.url);
          }
        }}>
        <Text style={styles.sourceLink}>{source.name}</Text>
      </Pressable>
      {rowScanning ? <Text style={styles.scanTiny}>Memindai…</Text> : null}
      {source.lastError && !rowScanning ? (
        <Text style={styles.errorTiny}>{source.lastError}</Text>
      ) : null}
    </View>
  );
}

function ProfileFormCard({
  meta,
  onSave,
  profile,
}: {
  meta: KolamDaraMarketPlatformFeeMeta;
  onSave: (draft: {
    sellerTier: string;
    primaryCategoryId: string;
    primaryCategoryLabel: string;
    programs: KolamDaraMarketPlatformFeePrograms;
    notes: string;
  }) => Promise<void>;
  profile: KolamDaraMarketPlatformFeeProfile;
}) {
  const [sellerTier, setSellerTier] = useState(profile.sellerTier);
  const [primaryCategoryId, setPrimaryCategoryId] = useState(
    profile.primaryCategoryId,
  );
  const [programs, setPrograms] = useState(profile.programs);
  const [notes, setNotes] = useState(profile.notes);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSellerTier(profile.sellerTier);
    setPrimaryCategoryId(profile.primaryCategoryId);
    setPrograms(profile.programs);
    setNotes(profile.notes);
  }, [profile]);

  const programOptions = meta.programs[profile.platform] || [];
  const categoryOptions = meta.categories[profile.platform] || [];

  return (
    <View style={[styles.card, styles.profileCard]}>
      <View pointerEvents="none" style={styles.platformLogoCorner}>
        <Image
          resizeMode="contain"
          source={
            profile.platform === 'shopee' ? SHOPEE_LOGO : TOKOPEDIA_LOGO
          }
          style={styles.platformLogo}
        />
      </View>
      <Text style={[styles.sectionTitle, styles.profileTitle]}>
        {profile.platform}
      </Text>

      <Text style={styles.fieldLabel}>Tier penjual</Text>
      <KolamDropdownSelect
        label="Tier"
        onChange={setSellerTier}
        options={meta.sellerTiers.map(tier => ({
          label: tier.label,
          value: tier.id,
        }))}
        showLabelInTrigger={false}
        style={styles.fullSelect}
        value={sellerTier || meta.sellerTiers[0]?.id || ''}
      />

      <Text style={styles.fieldLabel}>Kategori produk utama</Text>
      <KolamDropdownSelect
        label="Kategori"
        onChange={setPrimaryCategoryId}
        options={[
          {label: '— Pilih kategori —', value: ''},
          ...categoryOptions.map(cat => ({
            label: cat.label,
            value: cat.id,
          })),
        ]}
        showLabelInTrigger={false}
        style={styles.fullSelect}
        value={primaryCategoryId}
      />

      <Text style={styles.fieldLabel}>Program aktif</Text>
      <View style={styles.programList}>
        {programOptions.map(program => {
          const on = !!programs[program.id];
          return (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{checked: on}}
              key={program.id}
              onPress={() =>
                setPrograms(prev => ({...prev, [program.id]: !on}))
              }
              style={styles.programRow}>
              <View style={[styles.check, on ? styles.checkOn : null]}>
                <Text style={styles.checkMark}>{on ? '✓' : ''}</Text>
              </View>
              <Text style={styles.programLabel}>{program.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <KolamNotesField
        label="Catatan internal"
        onChangeText={setNotes}
        value={notes}
      />
      <KolamSaveButton
        disabled={saving}
        label={saving ? 'Menyimpan…' : 'Simpan profil'}
        onPress={() => {
          const cat = categoryOptions.find(
            item => item.id === primaryCategoryId,
          );
          setSaving(true);
          void onSave({
            sellerTier,
            primaryCategoryId,
            primaryCategoryLabel: cat?.label || primaryCategoryId,
            programs,
            notes,
          }).finally(() => setSaving(false));
        }}
      />
    </View>
  );
}

function KalkulasiTab({
  controller,
}: {
  controller: KolamDaraMarketPlatformFeeController;
}) {
  if (controller.calcLoading && !controller.calculation) {
    return <Text style={styles.meta}>Memuat kalkulasi…</Text>;
  }
  if (!controller.calculation) {
    return null;
  }

  return (
    <View style={styles.tabBody}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Contoh harga jual</Text>
        <Text style={styles.meta}>
          Setiap komponen biaya dihitung terpisah — bukan estimasi % gabungan.
        </Text>
        <View style={styles.calcInputs}>
          <LabeledInput
            label="Harga produk (IDR)"
            onChangeText={controller.onSetPriceInput}
            value={controller.priceInput}
          />
          <LabeledInput
            label="Diskon seller (IDR)"
            onChangeText={controller.onSetDiscountInput}
            value={controller.discountInput}
          />
          <LabeledInput
            label="Kuantitas"
            onChangeText={controller.onSetQtyInput}
            value={controller.qtyInput}
          />
          <KolamButton
            disabled={controller.calcLoading}
            label={controller.calcLoading ? 'Menghitung…' : 'Hitung ulang'}
            onPress={() => {
              void controller.onLoadCalculation();
            }}
          />
        </View>
      </View>

      {controller.calculation.platforms.map(plat => (
        <View key={plat.platform} style={styles.card}>
          <Text style={styles.sectionTitle}>{plat.platform}</Text>
          <Text style={styles.meta}>
            {`${plat.tier} · ${plat.category || 'Kategori belum dipilih'}`}
          </Text>
          {!plat.hasApprovedBaseline ? (
            <Text style={styles.pendingHint}>
              Draft belum di-approve — tarif bisa berubah setelah review
            </Text>
          ) : null}
          {plat.emptyHint ? (
            <Text style={styles.warn}>{plat.emptyHint}</Text>
          ) : null}

          <Text style={styles.subHead}>
            Komponen biaya aktif (per item, untuk profil toko)
          </Text>
          <FeeLines lines={plat.activeLines} />

          {plat.sampleRows.length ? (
            <View style={styles.sampleBox}>
              <Text style={styles.subHead}>
                {`Hasil kalkulasi contoh — subtotal ${formatKolamDaraMarketPlatformFeeIdr(
                  plat.sampleInput.subtotalAfterDiscount,
                )}`}
              </Text>
              {plat.sampleRows.map((row, index) => (
                <View key={`${row.name}-${index}`} style={styles.sampleRow}>
                  <Text style={styles.sampleName}>{row.name}</Text>
                  <Text style={styles.meta}>{row.calcFormula}</Text>
                  <Text style={styles.sampleAmount}>
                    {row.skipped
                      ? row.skipReason
                      : formatKolamDaraMarketPlatformFeeIdr(row.amountIdr)}
                  </Text>
                </View>
              ))}
              <Text style={styles.rowTitle}>
                {`Total biaya platform: ${formatKolamDaraMarketPlatformFeeIdr(
                  plat.totalFeeIdr,
                )}`}
              </Text>
              <Text style={styles.meta}>
                {`Dana setelah biaya: ${formatKolamDaraMarketPlatformFeeIdr(
                  plat.netAfterFeesIdr,
                )}`}
              </Text>
              {plat.disclaimer ? (
                <Text style={styles.meta}>{plat.disclaimer}</Text>
              ) : null}
            </View>
          ) : null}

          {plat.settlement ? (
            <View style={styles.settlement}>
              <Text style={styles.subHead}>
                {`Referensi riil Kolam (${plat.settlement.windowDays} hari)`}
              </Text>
              <Text style={styles.meta}>
                {`${plat.settlement.orderCount} order · total fee ${formatKolamDaraMarketPlatformFeeIdr(
                  plat.settlement.totalFeesIdr,
                )} dari omzet ${formatKolamDaraMarketPlatformFeeIdr(
                  plat.settlement.totalGrossIdr,
                )} · efektif ${plat.settlement.effectivePercent}% agregat`}
              </Text>
              {plat.settlement.note ? (
                <Text style={styles.meta}>{plat.settlement.note}</Text>
              ) : null}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function FeeLines({lines}: {lines: KolamDaraMarketPlatformFeeCalcLine[]}) {
  if (!lines.length) {
    return <Text style={styles.meta}>Tidak ada baris tarif.</Text>;
  }
  return (
    <View style={styles.feeList}>
      {lines.map((line, index) => (
        <View key={`${line.code}-${index}`} style={styles.feeItem}>
          <Text style={styles.rowTitle}>{line.name}</Text>
          <Text style={styles.meta}>
            {`${line.rateDisplay} · ${line.basisFormula || '—'} · ${
              line.snapshotStatus || '—'
            }`}
          </Text>
          {line.conditions ? (
            <Text style={styles.meta}>{line.conditions}</Text>
          ) : null}
          {line.sourceName ? (
            <Text style={styles.meta}>{line.sourceName}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function LabeledInput({
  label,
  onChangeText,
  value,
}: {
  label: string;
  onChangeText: (value: string) => void;
  value: string;
}) {
  return (
    <View style={styles.labeledInput}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        keyboardType="numeric"
        onChangeText={onChangeText}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 0,
    gap: 12,
  },
  hero: {
    alignItems: 'flex-start',
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    padding: 12,
  },
  heroText: {
    flex: 1,
    gap: 4,
    minWidth: 200,
  },
  heroTabs: {
    flexShrink: 0,
  },
  heroTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '700',
  },
  tabBody: {
    gap: 12,
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  profileCard: {
    flexBasis: '48%',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 280,
    overflow: 'hidden',
    position: 'relative',
  },
  platformLogoCorner: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 1,
  },
  platformLogo: {
    borderRadius: 6,
    height: 28,
    width: 28,
  },
  profileTitle: {
    paddingRight: 36,
  },
  fullSelect: {
    width: '100%',
  },
  programList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  programRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  programLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
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
  card: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
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
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  subHead: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  meta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  notice: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  warn: {
    color: V.colors.warning,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  pendingHint: {
    color: V.colors.warning,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  scanBanner: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  scanBannerText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  addRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  addField: {
    flex: 1,
    minWidth: 140,
  },
  addActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  input: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  fieldLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  chipOn: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.primary,
  },
  chipText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  sourceTable: {
    alignSelf: 'stretch',
    width: '100%',
  },
  tableHead: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 6,
  },
  tableRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
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
  colPlatform: {
    flex: 0.9,
    minWidth: 72,
    textTransform: 'capitalize',
  },
  colName: {
    flex: 1.6,
    minWidth: 120,
  },
  colChecked: {
    flex: 1.2,
    minWidth: 100,
  },
  colAction: {
    alignItems: 'flex-start',
    flex: 0.7,
    minWidth: 72,
  },
  nameCell: {
    gap: 2,
    minWidth: 0,
  },
  sourceBusy: {
    backgroundColor: V.colors.muted,
  },
  sourcePlatform: {
    color: V.colors.mutedFg,
    textTransform: 'capitalize',
  },
  sourceLink: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  scanTiny: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 10,
  },
  errorTiny: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 10,
  },
  snapshotCard: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.warning,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 10,
  },
  rowTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  rowActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  feeLine: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  calcInputs: {
    gap: 8,
  },
  labeledInput: {
    gap: 4,
  },
  feeList: {
    gap: 8,
  },
  feeItem: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    gap: 2,
    paddingBottom: 8,
  },
  sampleBox: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 10,
  },
  sampleRow: {
    gap: 2,
    marginBottom: 4,
  },
  sampleName: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  sampleAmount: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  settlement: {
    backgroundColor: V.colors.muted,
    borderRadius: 8,
    gap: 4,
    padding: 10,
  },
});
