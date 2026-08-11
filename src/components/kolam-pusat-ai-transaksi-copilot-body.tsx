import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
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
import { getKolamFileUrl } from '../lib/file-url';
import type { KolamPusatAiTransaksiCopilotController } from '../hooks/use-kolam-pusat-ai-transaksi-copilot-controller';
import { KolamButton } from './kolam-button';
import { KolamDashboardMetricSparkline } from './kolam-dashboard-metric-sparkline';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamSwitch } from './kolam-switch';
import { transaksiCopilotStyles as styles } from './kolam-pusat-ai-transaksi-copilot-styles';

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
  const notifyRoomRoute = getNotifyRoomRoute(
    controller.selectedRoomId || health?.notifyRoom?.id,
  );

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}
    >
      <View style={styles.shell}>
        <View style={styles.shellHeader}>
          <View style={styles.heading}>
            <Text style={styles.eyebrow}>Copilot</Text>
            <Text style={styles.title}>Transaksi Copilot</Text>
            <Text style={styles.desc}>
              {KOLAM_TRANSAKSI_COPILOT_DESCRIPTION}
            </Text>
          </View>
          <View style={styles.shellActions}>
            {notifyRoomRoute ? (
              <KolamButton
                intent="primary"
                label="Buka room"
                onPress={() => onRouteChange?.(notifyRoomRoute)}
              />
            ) : null}
          </View>
        </View>

        <View style={styles.body}>
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          {error && !stats ? (
            <KolamEmptyState message={error} title="Gagal memuat" />
          ) : null}

          <View style={styles.sideBySideGrid}>
            <View style={styles.sideBySideItem}>
              <NotifyRoomSection controller={controller} />
            </View>
            <View style={styles.sideBySideItem}>
              <BotProfileSection controller={controller} />
            </View>
          </View>
          <BotHealthSection controller={controller} />

          <View style={styles.deliveryPanel}>
            <View style={styles.deliveryPanelHeader}>
              {stats?.generatedAt ? (
                <Text style={styles.meta}>
                  {`Statistik diperbarui ${formatKolamTransaksiCopilotWib(
                    stats.generatedAt,
                  )} · ${stats.note}`}
                </Text>
              ) : (
                <View />
              )}
              <View style={styles.rangeTabs}>
                {KOLAM_TRANSAKSI_COPILOT_RANGES.map(item => {
                  const active = range === item.id;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      key={item.id}
                      onPress={() => controller.onSetRange(item.id)}
                      style={[
                        styles.rangeBtn,
                        active ? styles.rangeBtnActive : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.rangeBtnText,
                          active ? styles.rangeBtnTextActive : null,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
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
          </View>

          <View style={styles.opsBlock}>
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
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function NotifyRoomSection({
  controller,
}: {
  controller: KolamPusatAiTransaksiCopilotController;
}) {
  const roomOptions = controller.rooms.map(room => ({
    label: formatKolamTransaksiCopilotRoomLabel(room),
    value: room._id,
  }));

  return (
    <View style={[styles.sectionCard, styles.botStrip]}>
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
                : [{ label: 'Tidak ada room', value: '' }]
            }
            showLabelInTrigger
            value={controller.selectedRoomId || roomOptions[0]?.value || ''}
          />
        </View>
      </View>
    </View>
  );
}

function getNotifyRoomRoute(roomId?: string | null): string {
  const normalized = String(roomId || '').trim();
  return normalized ? `/team-chat?room=${encodeURIComponent(normalized)}` : '';
}

function BotHealthSection({
  controller,
}: {
  controller: KolamPusatAiTransaksiCopilotController;
}) {
  const { health, healthLoading } = controller;
  return (
    <View style={[styles.sectionCard, styles.botStrip]}>
      <View style={styles.botStripHead}>
        <View style={styles.heading}>
          <Text style={styles.sectionTitle}>Kesehatan Bot — Katak Terbang</Text>
          <Text style={styles.sectionDesc}>
            {`Status runtime dari AM.${
              health?.checkedAt
                ? ` Diperiksa ${formatKolamTransaksiCopilotWib(
                    health.checkedAt,
                  )}.`
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
            <View key={platform.platform} style={styles.healthRow}>
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
    <View style={[styles.sectionCard, styles.botStrip]}>
      <View style={styles.botStripHead}>
        <View style={styles.heading}>
          <Text style={styles.sectionTitle}>Profil Bot — Katak Terbang</Text>
          <Text style={styles.sectionDesc}>
            Foto & nama PIC otomasi — tampil di kartu Bot di bawah.
          </Text>
        </View>
        <View style={styles.botStripActions}>
          {photoUri ? (
            <KolamRemoteImage
              accessibilityLabel="Avatar Katak Terbang"
              resizeMode="cover"
              revision={photoUri}
              scope="transaksi-copilot-katak-avatar"
              sourceUri={photoUri}
              style={styles.botAvatar}
            />
          ) : (
            <View style={styles.botAvatarPh}>
              <Text style={styles.botAvatarPhText}>BOT</Text>
            </View>
          )}
          <Pressable
            accessibilityRole="button"
            disabled={controller.photoUploading}
            onPress={() => {
              void controller.onPickBotPhoto();
            }}
            style={styles.botUpload}
          >
            <Text style={styles.botUploadText}>
              {controller.photoUploading ? 'Mengunggah…' : 'Unggah foto bot'}
            </Text>
          </Pressable>
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
      <View style={styles.kpiTop}>
        <View>
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
        </View>
      </View>

      <View style={styles.kpiChart}>
        {!loading && sparklineValues.length > 0 ? (
          <KolamDashboardMetricSparkline
            tone={up ? 'success' : 'danger'}
            values={sparklineValues}
          />
        ) : null}
      </View>

      <View style={styles.breakdown}>
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
                  <Image source={{ uri: logoUri }} style={styles.channelLogo} />
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
      <ScrollView nestedScrollEnabled style={styles.opsPanel}>
        {loading ? (
          <Text style={styles.loadingText}>Memuat…</Text>
        ) : events.length === 0 ? (
          <Text style={styles.opsEmpty}>
            {KOLAM_TRANSAKSI_COPILOT_OPS_EMPTY}
          </Text>
        ) : (
          events.map(event => (
            <View key={event.id} style={styles.opsItem}>
              <Text style={styles.opsTime}>
                {formatKolamTransaksiCopilotWib(event.at)}
                {event.invoiceCode ? (
                  <Text
                    style={styles.opsInvoice}
                  >{` ${event.invoiceCode}`}</Text>
                ) : null}
              </Text>
              <Text style={styles.opsDetail}>
                {`${event.detail || event.action || event.eventType}${
                  event.phase ? ` · ${event.phase}` : ''
                }`}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
