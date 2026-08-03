import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  KOLAM_DELIVERY_CHANNELS,
  KOLAM_TRANSAKSI_COPILOT_DESCRIPTION,
  KOLAM_TRANSAKSI_COPILOT_OPS_EMPTY,
  KOLAM_TRANSAKSI_COPILOT_RANGES,
  formatKolamTransaksiCopilotRoomLabel,
  formatKolamTransaksiCopilotWib,
  type KolamDeliveryChannelKey,
  type KolamDeliveryChannelMeta,
  type KolamDeliveryStatsSummary,
  type KolamShippingOpsEvent,
} from '../domain/kolam-pusat-ai-transaksi-copilot';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {getKolamFileUrl} from '../lib/file-url';
import type {KolamPusatAiTransaksiCopilotController} from '../hooks/use-kolam-pusat-ai-transaksi-copilot-controller';
import {KolamButton} from './kolam-button';
import {KolamDashboardMetricSparkline} from './kolam-dashboard-metric-sparkline';
import {KolamDropdownSelect} from './kolam-dropdown-select';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamSwitch} from './kolam-switch';

export function KolamPusatAiTransaksiCopilotBody({
  controller,
  onRouteChange,
}: {
  controller: KolamPusatAiTransaksiCopilotController;
  onRouteChange?: (route: string) => void;
}) {
  const {
    stats,
    opsLog,
    loading,
    error,
    notice,
    health,
    healthLoading,
    range,
    channelSources,
  } = controller;

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}>
      <View style={styles.shellHeader}>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>Copilot</Text>
          <Text style={styles.title}>Transaksi Copilot</Text>
          <Text style={styles.desc}>{KOLAM_TRANSAKSI_COPILOT_DESCRIPTION}</Text>
        </View>
        <View style={styles.rangeTabs}>
          {KOLAM_TRANSAKSI_COPILOT_RANGES.map(item => {
            const active = range === item.id;
            return (
              <Pressable
                accessibilityRole="button"
                key={item.id}
                onPress={() => controller.onSetRange(item.id)}
                style={[styles.rangeBtn, active ? styles.rangeBtnActive : null]}>
                <Text
                  style={[
                    styles.rangeBtnText,
                    active ? styles.rangeBtnTextActive : null,
                  ]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {error && !stats ? (
        <KolamEmptyState message={error} title="Gagal memuat" />
      ) : null}

      <NotifyRoomSection
        controller={controller}
        onRouteChange={onRouteChange}
      />
      <BotHealthSection controller={controller} />
      <BotProfileSection controller={controller} />

      {loading && !stats ? (
        <Text style={styles.loadingText}>Memuat…</Text>
      ) : (
        <View style={styles.kpiGrid}>
          <DeliveryKpiCard
            channelSources={channelSources}
            loading={loading}
            summary={stats?.dara ?? null}
            title="Delivery DARA"
          />
          <DeliveryKpiCard
            channelSources={channelSources}
            loading={loading}
            summary={stats?.bot ?? null}
            title="Bot — Katak Terbang"
          />
        </View>
      )}

      {stats?.generatedAt ? (
        <Text style={styles.meta}>
          {`Statistik diperbarui ${formatKolamTransaksiCopilotWib(stats.generatedAt)} · ${stats.note}`}
        </Text>
      ) : null}

      <Text style={styles.sectionTitle}>Console operasi</Text>
      <View style={styles.opsGrid}>
        <OpsLogCard
          events={opsLog?.dara ?? []}
          loading={loading && !opsLog}
          title="Log DARA"
        />
        <OpsLogCard
          events={opsLog?.bot ?? []}
          loading={loading && !opsLog}
          title="Log Bot"
        />
      </View>
    </ScrollView>
  );
}

function NotifyRoomSection({
  controller,
  onRouteChange,
}: {
  controller: KolamPusatAiTransaksiCopilotController;
  onRouteChange?: (route: string) => void;
}) {
  const roomOptions = controller.rooms.map(room => ({
    label: formatKolamTransaksiCopilotRoomLabel(room),
    value: room._id,
  }));
  const href = controller.health?.notifyRoom?.webHref;

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Room log transaksi DARA</Text>
      <Text style={styles.sectionDesc}>
        Saat DARA memimpin transaksi (`handledByDara`), ringkasan + perintah bot
        dikirim ke room ini.
      </Text>
      <View style={styles.notifyRow}>
        <View style={styles.notifyToggle}>
          <KolamSwitch
            active={controller.notifyEnabled}
            disabled={controller.roomSaving}
            onPress={() => {
              void controller.onSetNotifyEnabled(!controller.notifyEnabled);
            }}
          />
          <Text style={styles.notifyLabel}>Notifikasi chat aktif</Text>
        </View>
        {href ? (
          <Pressable
            accessibilityRole="link"
            onPress={() => onRouteChange?.(href)}>
            <Text style={styles.link}>Buka room</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.roomSelect}>
        <KolamDropdownSelect
          accessibilityLabel="Team Chat room"
          label="Team Chat room"
          onChange={value => {
            void controller.onSetNotifyRoom(value);
          }}
          options={
            roomOptions.length
              ? roomOptions
              : [{label: 'Tidak ada room', value: ''}]
          }
          showLabelInTrigger
          value={controller.selectedRoomId || roomOptions[0]?.value || ''}
        />
      </View>
    </View>
  );
}

function BotHealthSection({
  controller,
}: {
  controller: KolamPusatAiTransaksiCopilotController;
}) {
  const {health, healthLoading} = controller;
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHead}>
        <View style={styles.headingGrow}>
          <Text style={styles.sectionTitle}>
            Kesehatan Bot — Katak Terbang
          </Text>
          <Text style={styles.sectionDesc}>
            {`Status runtime dari AM (bukan simulasi).${
              health?.checkedAt
                ? ` Diperiksa ${formatKolamTransaksiCopilotWib(health.checkedAt)}.`
                : ''
            }`}
          </Text>
        </View>
        <KolamButton
          disabled={healthLoading}
          intent="outline"
          label={healthLoading ? 'Memeriksa…' : 'Cek ulang'}
          onPress={() => {
            void controller.onRefreshHealth();
          }}
        />
      </View>
      {healthLoading && !health ? (
        <Text style={styles.loadingText}>Memuat…</Text>
      ) : (
        <View style={styles.healthGrid}>
          {(health?.platforms ?? []).map(platform => (
            <View
              key={platform.platform}
              style={[
                styles.healthRow,
                platform.enabled && platform.healthy === true
                  ? styles.healthOk
                  : null,
                platform.enabled && platform.healthy === false
                  ? styles.healthBad
                  : null,
              ]}>
              <Text style={styles.healthPlatform}>{platform.platform}</Text>
              <Text style={styles.healthState}>
                {platform.enabled
                  ? `${platform.state}${
                      platform.reason ? ` — ${platform.reason}` : ''
                    }`
                  : platform.reason || 'Nonaktif'}
              </Text>
            </View>
          ))}
        </View>
      )}
      {health && !health.amConfigured ? (
        <Text style={styles.warnText}>
          AM_URL / AM_API_KEY belum dikonfigurasi.
        </Text>
      ) : null}
      {health && health.amConfigured && !health.amReachable ? (
        <Text style={styles.dangerText}>AM tidak terjangkau — cek am-be.</Text>
      ) : null}
    </View>
  );
}

function BotProfileSection({
  controller,
}: {
  controller: KolamPusatAiTransaksiCopilotController;
}) {
  const photoUri = controller.botPhotoUrl
    ? getKolamFileUrl(controller.botPhotoUrl) ?? controller.botPhotoUrl
    : null;

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Profil Bot — Katak Terbang</Text>
      <Text style={styles.sectionDesc}>
        Foto & nama PIC otomasi — tampil di kartu Bot di bawah.
      </Text>
      <View style={styles.botProfileRow}>
        {photoUri ? (
          <Image source={{uri: photoUri}} style={styles.botAvatar} />
        ) : (
          <View style={styles.botAvatarPh}>
            <Text style={styles.botAvatarPhText}>BOT</Text>
          </View>
        )}
        <KolamButton
          disabled={controller.photoUploading}
          intent="outline"
          label={
            controller.photoUploading ? 'Mengunggah…' : 'Unggah foto bot'
          }
          onPress={() => {
            void controller.onPickBotPhoto();
          }}
        />
        <View style={styles.botNameField}>
          <Text style={styles.botNameLabel}>Nama PIC bot</Text>
          <TextInput
            editable={!controller.photoUploading}
            onBlur={() => {
              void controller.onSaveBotName();
            }}
            onChangeText={controller.onSetBotNameDraft}
            style={styles.botNameInput}
            value={controller.botNameDraft}
          />
        </View>
      </View>
    </View>
  );
}

function DeliveryKpiCard({
  title,
  summary,
  loading,
  channelSources,
}: {
  title: string;
  summary: KolamDeliveryStatsSummary | null;
  loading: boolean;
  channelSources: Record<KolamDeliveryChannelKey, KolamDeliveryChannelMeta>;
}) {
  const up = (summary?.change ?? 0) >= 0;
  const sparklineValues = (summary?.data ?? []).map(point => point.value);

  return (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>{title}</Text>
      <Text style={styles.kpiValue}>
        {loading
          ? '…'
          : `${(summary?.value ?? 0).toLocaleString('id-ID')} order`}
      </Text>
      {!loading && summary ? (
        <Text style={styles.kpiTrend}>
          {`${up ? '+' : ''}${summary.change}% vs periode sebelumnya`}
        </Text>
      ) : null}
      {!loading && sparklineValues.length > 0 ? (
        <View style={styles.kpiChart}>
          <KolamDashboardMetricSparkline
            tone={up ? 'success' : 'danger'}
            values={sparklineValues}
          />
        </View>
      ) : null}
      <Text style={styles.breakdownTitle}>Order per kanal</Text>
      <View style={styles.breakdownGrid}>
        {KOLAM_DELIVERY_CHANNELS.map(key => {
          const count = summary?.byChannel?.[key] ?? 0;
          const meta = channelSources[key];
          const logoUri = meta.logo
            ? getKolamFileUrl(meta.logo) ?? meta.logo
            : null;
          return (
            <View key={key} style={styles.breakdownItem}>
              {loading ? (
                <Text style={styles.breakdownName}>—</Text>
              ) : logoUri ? (
                <Image source={{uri: logoUri}} style={styles.channelLogo} />
              ) : (
                <Text style={styles.breakdownName}>
                  {(meta.name || key).replace('Tokopedia', 'Toko')}
                </Text>
              )}
              <Text style={styles.breakdownCount}>
                {loading ? '—' : count.toLocaleString('id-ID')}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function OpsLogCard({
  title,
  events,
  loading,
}: {
  title: string;
  events: KolamShippingOpsEvent[];
  loading: boolean;
}) {
  return (
    <View style={styles.opsCard}>
      <Text style={styles.opsCardTitle}>{title}</Text>
      {loading ? (
        <Text style={styles.loadingText}>Memuat…</Text>
      ) : events.length === 0 ? (
        <Text style={styles.opsEmpty}>{KOLAM_TRANSAKSI_COPILOT_OPS_EMPTY}</Text>
      ) : (
        events.map(event => (
          <View key={event.id} style={styles.opsItem}>
            <Text style={styles.opsTime}>
              {`${formatKolamTransaksiCopilotWib(event.at)}${
                event.invoiceCode ? ` ${event.invoiceCode}` : ''
              }`}
            </Text>
            <Text style={styles.opsDetail}>
              {`${event.detail || event.action || event.eventType}${
                event.phase ? ` · ${event.phase}` : ''
              }`}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1},
  scrollContent: {gap: 16, paddingBottom: 24},
  shellHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  heading: {flex: 1, gap: 4, minWidth: 220},
  headingGrow: {flex: 1, gap: 4, minWidth: 180},
  eyebrow: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '700',
  },
  desc: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
  rangeTabs: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  rangeBtn: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: V.radius.md,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  rangeBtnActive: {
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.primary,
  },
  rangeBtnText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  rangeBtnTextActive: {color: V.colors.primary},
  notice: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  loadingText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    padding: 8,
  },
  sectionCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  sectionHead: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionDesc: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 16,
  },
  notifyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  notifyToggle: {alignItems: 'center', flexDirection: 'row', gap: 8},
  notifyLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  link: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  roomSelect: {marginTop: 4, maxWidth: 360},
  healthGrid: {gap: 8, marginTop: 4},
  healthRow: {
    backgroundColor: V.colors.muted,
    borderRadius: V.radius.md,
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  healthOk: {backgroundColor: V.colors.successSoft},
  healthBad: {backgroundColor: V.colors.dangerSoft},
  healthPlatform: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  healthState: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  warnText: {
    color: V.colors.warning,
    fontFamily: V.fontFamily,
    fontSize: 12,
    marginTop: 4,
  },
  dangerText: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 12,
    marginTop: 4,
  },
  botProfileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  botAvatar: {
    borderRadius: 999,
    height: 48,
    width: 48,
  },
  botAvatarPh: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderRadius: 999,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  botAvatarPhText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  botNameField: {flexBasis: 220, flexGrow: 1, gap: 4, minWidth: 180},
  botNameLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  botNameInput: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.md,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  kpiGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  kpiCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    flexBasis: 280,
    flexGrow: 1,
    gap: 6,
    minWidth: 240,
    padding: 14,
  },
  kpiLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  kpiValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 22,
    fontWeight: '700',
  },
  kpiTrend: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  kpiChart: {height: 56, marginVertical: 4},
  breakdownTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  breakdownGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  breakdownItem: {alignItems: 'center', gap: 4, minWidth: 64},
  breakdownName: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  breakdownCount: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  channelLogo: {height: 20, resizeMode: 'contain', width: 48},
  meta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  opsGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  opsCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    flexBasis: 280,
    flexGrow: 1,
    gap: 6,
    minWidth: 240,
    paddingBottom: 8,
  },
  opsCardTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  opsEmpty: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  opsItem: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: V.radius.md,
    borderWidth: 1,
    gap: 2,
    marginHorizontal: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  opsTime: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  opsDetail: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
});
