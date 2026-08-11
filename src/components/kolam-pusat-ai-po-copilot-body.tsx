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
  KOLAM_PO_COPILOT_DESCRIPTION,
  KOLAM_PO_COPILOT_OPS_EMPTY,
  KOLAM_PO_COPILOT_RANGES,
  compactKolamPoCopilotText,
  formatKolamPoCopilotRoomLabel,
  formatKolamPoCopilotWib,
  type KolamPoOpsLogEvent,
  type KolamPoStatsSummary,
} from '../domain/kolam-pusat-ai-po-copilot';
import { getKolamFileUrl } from '../lib/file-url';
import type { KolamPusatAiPoCopilotController } from '../hooks/use-kolam-pusat-ai-po-copilot-controller';
import { KolamButton } from './kolam-button';
import { KolamDashboardMetricSparkline } from './kolam-dashboard-metric-sparkline';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamSwitch } from './kolam-switch';
import { poCopilotStyles as styles } from './kolam-pusat-ai-po-copilot-styles';

export function KolamPusatAiPoCopilotBody({
  controller,
  onRouteChange,
}: {
  controller: KolamPusatAiPoCopilotController;
  onRouteChange?: (route: string) => void;
}) {
  const { stats, opsLog, loading, error, notice, range } = controller;

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}
    >
      <View style={styles.shell}>
        <View style={styles.shellHeader}>
          <View style={styles.heading}>
            <Text style={styles.eyebrow}>Copilot</Text>
            <Text style={styles.title}>PO Copilot</Text>
            <Text style={styles.desc}>{KOLAM_PO_COPILOT_DESCRIPTION}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          {error && !stats ? (
            <KolamEmptyState message={error} title="Gagal memuat" />
          ) : null}

          <View style={styles.sideBySideGrid}>
            <View style={styles.sideBySideItem}>
              <NotifyRoomSection
                controller={controller}
                onRouteChange={onRouteChange}
              />
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
                  {`Statistik diperbarui ${formatKolamPoCopilotWib(
                    stats.generatedAt,
                  )}${stats.note ? ` · ${stats.note}` : ''}`}
                </Text>
              ) : (
                <View />
              )}
              <View style={styles.rangeTabs}>
                {KOLAM_PO_COPILOT_RANGES.map(item => {
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
                <PoKpiCard
                  loading={loading}
                  summary={stats?.closed ?? null}
                  title="PO Closed (berhasil)"
                  unitLabel="PO"
                />
                <PoKpiCard
                  loading={loading}
                  summary={stats?.failed ?? null}
                  title="PO gagal (rejected / cancelled)"
                  unitLabel="PO"
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
  onRouteChange,
}: {
  controller: KolamPusatAiPoCopilotController;
  onRouteChange?: (route: string) => void;
}) {
  const roomOptions = controller.rooms.map(room => ({
    label: formatKolamPoCopilotRoomLabel(room),
    value: room._id,
  }));
  const href = controller.health?.notifyRoom?.webHref;

  return (
    <View style={[styles.sectionCard, styles.botStrip]}>
      <Text style={styles.sectionTitle}>Room log PO DARA</Text>
      <Text style={styles.sectionDesc}>
        Room Team Chat untuk log & perintah PO Copilot (DARA / Raja Anemon).
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
            onPress={() => onRouteChange?.(href)}
          >
            <Text style={styles.link}>Buka room</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.roomRow}>
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

function BotHealthSection({
  controller,
}: {
  controller: KolamPusatAiPoCopilotController;
}) {
  const { health, healthLoading } = controller;
  const procurementAgent = health?.procurementAgent;

  return (
    <View style={[styles.sectionCard, styles.botStrip]}>
      <View style={styles.botStripHead}>
        <View style={styles.heading}>
          <Text style={styles.sectionTitle}>Kesehatan Bot — Raja Anemon</Text>
          <Text style={styles.sectionDesc}>
            {`Status kosmetik (otomasi PO belakangan).${
              health?.checkedAt
                ? ` Diperiksa ${formatKolamPoCopilotWib(health.checkedAt)}.`
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
                  : platform.reason || platform.state || 'Standby'}
              </Text>
            </View>
          ))}
        </View>
      )}
      {procurementAgent ? (
        <View style={styles.procurementBox}>
          <View style={styles.procurementHead}>
            <Text style={styles.procurementTitle}>DARA Procurement Agent</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {procurementAgent.enabled ? 'aktif' : 'nonaktif'}
              </Text>
            </View>
            {procurementAgent.modelTier ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {`model: ${procurementAgent.modelTier}`}
                </Text>
              </View>
            ) : null}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {`approval: ${
                  procurementAgent.approvalGuard ? 'aktif' : 'nonaktif'
                }`}
              </Text>
            </View>
            {procurementAgent.paymentGuard ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {`payment: ${procurementAgent.paymentGuard}`}
                </Text>
              </View>
            ) : null}
          </View>
          {procurementAgent.guardrailBadges.length ? (
            <View style={styles.badgeRow}>
              {procurementAgent.guardrailBadges.map(badge => (
                <View
                  key={`${badge.label}:${badge.value}`}
                  style={styles.badge}
                >
                  <Text style={styles.badgeText}>
                    {`${badge.label}: ${compactKolamPoCopilotText(
                      badge.value,
                      34,
                    )}`}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          {procurementAgent.note ? (
            <Text style={styles.procurementNote}>
              {compactKolamPoCopilotText(procurementAgent.note, 160)}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function BotProfileSection({
  controller,
}: {
  controller: KolamPusatAiPoCopilotController;
}) {
  const photoUri = controller.botPhotoUrl
    ? getKolamFileUrl(controller.botPhotoUrl) ?? controller.botPhotoUrl
    : null;

  return (
    <View style={[styles.sectionCard, styles.botStrip]}>
      <View style={styles.botStripHead}>
        <View style={styles.heading}>
          <Text style={styles.sectionTitle}>Profil Bot — Raja Anemon</Text>
          <Text style={styles.sectionDesc}>Foto & nama PIC otomasi PO.</Text>
        </View>
        <View style={styles.botStripActions}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.botAvatar} />
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

function PoKpiCard({
  title,
  summary,
  loading,
  unitLabel,
}: {
  title: string;
  summary: KolamPoStatsSummary | null;
  loading: boolean;
  unitLabel: string;
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
              : `${(summary?.value ?? 0).toLocaleString('id-ID')} ${unitLabel}`}
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
    </View>
  );
}

function OpsLogCard({
  title,
  events,
  loading,
}: {
  title: string;
  events: KolamPoOpsLogEvent[];
  loading: boolean;
}) {
  return (
    <View style={styles.opsCard}>
      <Text style={styles.opsCardTitle}>{title}</Text>
      <ScrollView nestedScrollEnabled style={styles.opsPanel}>
        {loading ? (
          <Text style={styles.loadingText}>Memuat…</Text>
        ) : events.length === 0 ? (
          <Text style={styles.opsEmpty}>{KOLAM_PO_COPILOT_OPS_EMPTY}</Text>
        ) : (
          events.map(event => (
            <View key={event.id} style={styles.opsItem}>
              <Text style={styles.opsTime}>
                {formatKolamPoCopilotWib(event.at)}
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
              {event.badges.length ? (
                <View style={styles.badgeRow}>
                  {event.badges.map(badge => (
                    <View
                      key={`${badge.label}:${badge.value}`}
                      style={styles.badge}
                    >
                      <Text style={styles.badgeText}>
                        {`${badge.label}: ${compactKolamPoCopilotText(
                          badge.value,
                          28,
                        )}`}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
