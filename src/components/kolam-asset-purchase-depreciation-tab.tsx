import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  formatDepreciationMethodLabel,
  KOLAM_DEPRECIATION_METHOD_OPTIONS,
} from '../domain/kolam-asset-depreciation';
import type { KolamAssetPurchaseDetail } from '../domain/kolam-finance-expense';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamAssetPurchaseDepreciationController,
  type KolamAssetPurchaseDepreciationController,
} from '../hooks/use-kolam-asset-purchase-depreciation-controller';
import { formatRupiah } from '../lib/money';
import { KolamButton } from './kolam-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { KolamStatusBadge } from './kolam-status-badge';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';

function FieldShell({
  children,
  label,
  required = false,
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <View style={settingsWebFormStyles.settingsWebFormField}>
      <KolamSettingsWebFieldLabel label={label} required={required} />
      {children}
    </View>
  );
}

export function KolamAssetPurchaseDepreciationTab({
  onPurchaseRefresh,
  purchase,
}: {
  onPurchaseRefresh: () => Promise<void>;
  purchase: KolamAssetPurchaseDetail;
}) {
  const controller = useKolamAssetPurchaseDepreciationController(
    purchase,
    onPurchaseRefresh,
  );

  if (controller.mode === 'unverified') {
    return (
      <KolamContentFrame variant="nativeFormSection">
        <Text style={styles.gateTitle}>
          Pembelian aset belum terverifikasi
        </Text>
        <Text style={styles.gateBody}>
          Verifikasi pembelian aset terlebih dahulu sebelum mengisi data
          penyusutan.
        </Text>
      </KolamContentFrame>
    );
  }

  if (controller.mode === 'view') {
    return <DepreciationViewBody controller={controller} />;
  }

  return <DepreciationFormBody controller={controller} />;
}

function DepreciationFormBody({
  controller,
}: {
  controller: KolamAssetPurchaseDepreciationController;
}) {
  const { form } = controller;

  return (
    <View style={styles.tabBody}>
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
          style={styles.banner}
        />
      ) : null}
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
          style={styles.banner}
        />
      ) : null}

      <KolamContentFrame variant="nativeFormSection">
        <Text style={styles.mutedLabel}>Harga Aset (dari Pembelian Aset)</Text>
        <Text style={styles.priceHero}>
          {formatRupiah(controller.purchasePrice)}
        </Text>
      </KolamContentFrame>

      <KolamContentFrame variant="nativeFormSection">
        <View style={settingsWebFormStyles.settingsWebFormFields}>
          <FieldShell label="Nilai Residu">
            <KolamFormTextField
              editable={!controller.submitting}
              keyboardType="numeric"
              onChangeText={salvageValueText =>
                controller.onChangeForm({
                  salvageValueText: sanitizeDigits(salvageValueText),
                })
              }
              placeholder="0"
              value={form.salvageValueText}
            />
          </FieldShell>
          <FieldShell label="Masa Manfaat (Bulan)" required>
            <KolamFormTextField
              editable={!controller.submitting}
              keyboardType="numeric"
              onChangeText={usefulLifeText =>
                controller.onChangeForm({
                  usefulLifeText: sanitizeDigits(usefulLifeText),
                })
              }
              placeholder="12"
              value={form.usefulLifeText}
            />
          </FieldShell>
          <FieldShell label="Metode Penyusutan" required>
            <View style={styles.methodGrid}>
              {KOLAM_DEPRECIATION_METHOD_OPTIONS.map(option => {
                const selected = form.depreciationMethod === option.id;
                return (
                  <KolamInteractionFrame
                    key={option.id}
                    onPress={() => controller.onSelectMethod(option.id)}
                    style={[
                      styles.methodCard,
                      selected ? styles.methodCardSelected : null,
                    ]}
                  >
                    <Text style={styles.methodName}>{option.name}</Text>
                    <Text style={styles.methodDesc}>{option.desc}</Text>
                  </KolamInteractionFrame>
                );
              })}
            </View>
          </FieldShell>
          {form.depreciationMethod === 'declining-balance' ? (
            <FieldShell
              label="Tingkat Penyusutan (% per tahun)"
              required={controller.salvageValue === 0}
            >
              <KolamFormTextField
                editable={!controller.submitting}
                keyboardType="numeric"
                onChangeText={depreciationRateText =>
                  controller.onChangeForm({
                    depreciationRateText: sanitizeDigits(depreciationRateText),
                  })
                }
                placeholder="0"
                value={form.depreciationRateText}
              />
            </FieldShell>
          ) : null}
        </View>

        {controller.previewStraightLine != null ? (
          <View style={styles.previewBox}>
            <Text style={styles.mutedLabel}>
              Pratinjau Penyusutan (Garis Lurus)
            </Text>
            <Text style={styles.previewValue}>
              {formatRupiah(controller.previewStraightLine)}
              <Text style={styles.previewUnit}> / bulan</Text>
            </Text>
            <Text style={styles.previewMeta}>
              {formatRupiah(
                controller.purchasePrice - controller.salvageValue,
              )}{' '}
              ÷ {controller.usefulLife} bulan
            </Text>
          </View>
        ) : null}

        {controller.previewDeclining != null ? (
          <View style={styles.previewBox}>
            <Text style={styles.mutedLabel}>
              Pratinjau Penyusutan (Saldo Menurun — Bulan 1)
            </Text>
            <Text style={styles.previewValue}>
              {formatRupiah(controller.previewDeclining)}
              <Text style={styles.previewUnit}> / bulan (perkiraan)</Text>
            </Text>
            {controller.depreciationRate != null ? (
              <Text style={styles.previewMeta}>
                {controller.depreciationRate}% / tahun →{' '}
                {(controller.depreciationRate / 12).toFixed(2)}% / bulan
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.submitRow}>
          <KolamButton
            disabled={controller.submitting}
            label={
              controller.submitting ? 'Menyimpan…' : 'Simpan Data Penyusutan'
            }
            onPress={() => {
              void controller.onSubmit();
            }}
          />
        </View>
      </KolamContentFrame>
    </View>
  );
}

function DepreciationViewBody({
  controller,
}: {
  controller: KolamAssetPurchaseDepreciationController;
}) {
  if (controller.loadingAsset && !controller.asset) {
    return (
      <KolamContentFrame variant="nativeFormSection">
        <KolamEmptyState message="Memuat…" title="Penyusutan" />
      </KolamContentFrame>
    );
  }

  if (!controller.asset) {
    return (
      <KolamContentFrame variant="nativeFormSection">
        <Text style={styles.gateBody}>
          {controller.error || 'Gagal memuat data aset.'}
        </Text>
      </KolamContentFrame>
    );
  }

  const asset = controller.asset;
  const dep = asset.depreciation;

  return (
    <View style={styles.tabBody}>
      <View style={styles.summaryGrid}>
        <SummaryCard
          label="Harga Beli"
          value={formatRupiah(asset.purchasePrice)}
        />
        <SummaryCard
          label="Nilai Buku Saat Ini"
          tone="primary"
          value={dep ? formatRupiah(dep.currentBookValue) : '—'}
        />
        <SummaryCard
          label="Akumulasi Penyusutan"
          tone="danger"
          value={dep ? formatRupiah(dep.accumulated) : '—'}
        />
        <SummaryCard
          label="Nilai Residu"
          value={formatRupiah(asset.salvageValue)}
        />
        <SummaryCard
          label="Masa Manfaat"
          value={`${asset.usefulLife} Bulan`}
        />
        <SummaryCard
          label="Metode Penyusutan"
          meta={
            dep?.depreciationPerPeriod != null
              ? `${formatRupiah(dep.depreciationPerPeriod)} / bulan`
              : dep?.annualRatePercent != null
                ? `Tingkat: ${dep.annualRatePercent.toFixed(2)}% / tahun`
                : undefined
          }
          value={formatDepreciationMethodLabel(asset.depreciationMethod)}
        />
      </View>

      {dep ? (
        <KolamContentFrame variant="nativeFormSection">
          <View style={styles.progressHeader}>
            <Text style={styles.mutedLabel}>Progres Penyusutan</Text>
            <Text style={styles.progressPercent}>
              {dep.progressPercent.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(Math.max(dep.progressPercent, 0), 100)}%`,
                },
              ]}
            />
          </View>
          {dep.isFullyDepreciated ? (
            <Text style={styles.previewMeta}>
              Aset sudah disusutkan sepenuhnya
            </Text>
          ) : null}
        </KolamContentFrame>
      ) : null}

      {asset.schedule.length > 0 ? (
        <KolamContentFrame variant="nativeFormSection">
          <KolamCopyStack
            containerStyle={styles.sectionCopy}
            items={[
              {
                id: 'schedule',
                text: `Jadwal Penyusutan — ${asset.usefulLife} Bulan${
                  dep && dep.completedPeriods > 0
                    ? ` (${dep.completedPeriods} selesai)`
                    : ''
                }`,
                style: styles.sectionTitle,
              },
            ]}
          />
          <View style={styles.scheduleHeader}>
            <Text style={[styles.scheduleColMonth, styles.scheduleHeadText]}>
              Bulan
            </Text>
            <Text style={[styles.scheduleColMoney, styles.scheduleHeadText]}>
              Penyusutan
            </Text>
            <Text style={[styles.scheduleColMoney, styles.scheduleHeadText]}>
              Akumulasi
            </Text>
            <Text style={[styles.scheduleColMoney, styles.scheduleHeadText]}>
              Nilai Buku
            </Text>
          </View>
          <ScrollView
            nestedScrollEnabled
            style={styles.scheduleScroll}
          >
            {asset.schedule.map(row => (
              <View
                key={row.period}
                style={[
                  styles.scheduleRow,
                  row.isDone ? null : styles.scheduleRowFuture,
                ]}
              >
                <Text style={styles.scheduleColMonth}>
                  Bulan {row.period}
                  {row.isDone ? ' ·' : ''}
                </Text>
                <Text style={[styles.scheduleColMoney, styles.scheduleDep]}>
                  -{formatRupiah(row.depreciation)}
                </Text>
                <Text style={[styles.scheduleColMoney, styles.scheduleMuted]}>
                  {formatRupiah(row.accumulated)}
                </Text>
                <Text style={[styles.scheduleColMoney, styles.scheduleBook]}>
                  {formatRupiah(row.bookValue)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </KolamContentFrame>
      ) : null}
    </View>
  );
}

function SummaryCard({
  label,
  meta,
  tone = 'default',
  value,
}: {
  label: string;
  meta?: string;
  tone?: 'default' | 'primary' | 'danger';
  value: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.mutedLabel}>{label}</Text>
      <Text
        style={[
          styles.summaryValue,
          tone === 'primary' ? styles.summaryPrimary : null,
          tone === 'danger' ? styles.summaryDanger : null,
        ]}
      >
        {value}
      </Text>
      {meta ? <Text style={styles.previewMeta}>{meta}</Text> : null}
    </View>
  );
}

function sanitizeDigits(value: string): string {
  return value.replace(/[^\d]/g, '');
}

const styles = StyleSheet.create({
  tabBody: {
    gap: 12,
  },
  banner: {
    alignSelf: 'stretch',
  },
  gateTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  gateBody: {
    color: V.colors.mutedFg,
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  mutedLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  priceHero: {
    color: V.colors.fg,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodCard: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 140,
    padding: 12,
  },
  methodCardSelected: {
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.primary,
  },
  methodName: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  methodDesc: {
    color: V.colors.mutedFg,
    fontSize: 11,
    marginTop: 4,
  },
  previewBox: {
    backgroundColor: V.colors.muted,
    borderRadius: 8,
    marginTop: 12,
    padding: 12,
  },
  previewValue: {
    color: V.colors.fg,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  previewUnit: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '400',
  },
  previewMeta: {
    color: V.colors.mutedFg,
    fontSize: 11,
    marginTop: 4,
  },
  submitRow: {
    alignItems: 'flex-end',
    marginTop: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 140,
    padding: 12,
  },
  summaryValue: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  summaryPrimary: {
    color: V.colors.primary,
  },
  summaryDanger: {
    color: V.colors.danger,
  },
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressPercent: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  progressTrack: {
    backgroundColor: V.colors.muted,
    borderRadius: 999,
    height: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: V.colors.primary,
    height: '100%',
  },
  sectionCopy: {
    marginBottom: 8,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '700',
  },
  scheduleScroll: {
    maxHeight: 360,
  },
  scheduleHeader: {
    backgroundColor: V.colors.tableHeader,
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  scheduleHeadText: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '700',
  },
  scheduleRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  scheduleRowFuture: {
    opacity: 0.5,
  },
  scheduleColMonth: {
    color: V.colors.fg,
    flex: 0.9,
    fontSize: 12,
  },
  scheduleColMoney: {
    flex: 1,
    fontSize: 12,
    textAlign: 'right',
  },
  scheduleDep: {
    color: V.colors.danger,
  },
  scheduleMuted: {
    color: V.colors.mutedFg,
  },
  scheduleBook: {
    color: V.colors.fg,
    fontWeight: '600',
  },
});
