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
  KOLAM_INVENTORY_COPILOT_DESCRIPTION,
  KOLAM_INVENTORY_COPILOT_LIST_EMPTY,
  KOLAM_INVENTORY_COPILOT_OPS_EMPTY,
  formatKolamInventoryCopilotRoomLabel,
  formatKolamInventoryCopilotWib,
  type KolamInventoryListLine,
  type KolamInventoryOpsLogEvent,
} from '../domain/kolam-pusat-ai-inventory-copilot';
import {getKolamFileUrl} from '../lib/file-url';
import type {KolamPusatAiInventoryCopilotController} from '../hooks/use-kolam-pusat-ai-inventory-copilot-controller';
import {KolamButton} from './kolam-button';
import {KolamDropdownSelect} from './kolam-dropdown-select';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamSwitch} from './kolam-switch';
import {inventoryCopilotStyles as styles} from './kolam-pusat-ai-inventory-copilot-styles';

export function KolamPusatAiInventoryCopilotBody({
  controller,
  onRouteChange,
}: {
  controller: KolamPusatAiInventoryCopilotController;
  onRouteChange?: (route: string) => void;
}) {
  const {dashboard, opsLog, loading, error, notice} = controller;
  const counts = dashboard?.counts;

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}>
      <View style={styles.shell}>
        <View style={styles.shellHeader}>
          <View style={styles.heading}>
            <Text style={styles.eyebrow}>Copilot</Text>
            <Text style={styles.title}>Inventory Copilot</Text>
            <Text style={styles.desc}>
              {KOLAM_INVENTORY_COPILOT_DESCRIPTION}
            </Text>
          </View>
          <View style={styles.shellActions}>
            <KolamButton
              disabled={loading}
              intent="outline"
              label={loading ? 'Memuat…' : 'Refresh'}
              onPress={() => {
                void controller.onRefresh();
              }}
            />
          </View>
        </View>

        <View style={styles.body}>
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          {error && !dashboard ? (
            <KolamEmptyState message={error} title="Gagal memuat" />
          ) : null}

          <NotifyRoomSection
            controller={controller}
            onRouteChange={onRouteChange}
          />
          <BotHealthSection controller={controller} />
          <BotProfileSection controller={controller} />

          {loading && !dashboard ? (
            <Text style={styles.loadingText}>Memuat…</Text>
          ) : null}

          {dashboard && counts ? (
            <>
              <Text style={styles.meta}>
                {`Diperbarui ${formatKolamInventoryCopilotWib(dashboard.generatedAt)}${
                  dashboard.priorityHint
                    ? ` · ${dashboard.priorityHint}`
                    : ''
                }`}
              </Text>

              <Text style={styles.sectionTitle}>Kesehatan stok (SKU)</Text>
              <View style={styles.kpiGrid}>
                <KpiTile title="Low stock" value={counts.lowStock} />
                <KpiTile title="Habis" value={counts.outOfStock} />
                <KpiTile title="Slow movers (90h)" value={counts.slowMovers} />
                <KpiTile title="SKU kritis" value={counts.criticalSku} />
              </View>

              <Text style={styles.sectionTitle}>Operasi gudang</Text>
              <View style={styles.kpiGrid}>
                <KpiTile
                  hint={
                    counts.agedOpenOpname > 0
                      ? `${counts.agedOpenOpname} >48j · d${counts.opnameDraft}/r${counts.opnameInReview}/p${counts.opnameReadyToPost}`
                      : undefined
                  }
                  title="Opname terbuka"
                  value={counts.openOpnameSessions}
                />
                <KpiTile
                  hint={`qty Δ ${counts.opnameVarianceQty}`}
                  title="Variance (14h)"
                  value={counts.opnameVarianceDocs}
                />
                <KpiTile title="GRN backlog" value={counts.receivingBacklog} />
                <KpiTile
                  hint={`antrian pack ${counts.packQueueTotal}`}
                  title="Pack SLA risk"
                  value={counts.packSlaRisk}
                />
              </View>

              <View style={styles.listGrid}>
                <ListCard
                  lines={dashboard.lowStockLines}
                  title="Low stock"
                />
                <ListCard
                  lines={dashboard.varianceLines}
                  title="Variance opname (satu daftar)"
                />
                <ListCard
                  lines={dashboard.openOpnameLines}
                  title="Opname terbuka / aging"
                />
                <ListCard
                  empty={
                    !dashboard.physicalQueueLines.length &&
                    !dashboard.packHandoffLabel
                  }
                  lines={dashboard.physicalQueueLines}
                  preface={dashboard.packHandoffLabel}
                  title="Antrian fisik (GRN / pack)"
                />
                {dashboard.slowMoverLines.length ? (
                  <ListCard
                    lines={dashboard.slowMoverLines}
                    title="Slow movers (90h)"
                  />
                ) : null}
                {dashboard.opnameByLocationLines.length ? (
                  <ListCard
                    lines={dashboard.opnameByLocationLines}
                    title="Opname per lokasi"
                  />
                ) : null}
              </View>

              {dashboard.links.length ? (
                <View style={styles.linksRow}>
                  {dashboard.links.map(link => (
                    <Pressable
                      accessibilityRole="link"
                      key={link.id}
                      onPress={() => onRouteChange?.(link.href)}>
                      <Text style={styles.link}>{link.label}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              {dashboard.teamChat.suggestedPrompts.length ? (
                <View style={styles.promptsBox}>
                  <Text style={styles.promptsTitle}>Saran prompt room DARA</Text>
                  {dashboard.teamChat.suggestedPrompts.map(prompt => (
                    <Text key={prompt} style={styles.promptItem}>
                      {`• ${prompt}`}
                    </Text>
                  ))}
                </View>
              ) : null}
            </>
          ) : null}

          <View style={styles.opsGrid}>
            <OpsLogCard
              events={opsLog?.dara ?? []}
              loading={loading && !opsLog}
              title="Console operasi — Log DARA"
            />
            <OpsLogCard
              events={opsLog?.bot ?? []}
              loading={loading && !opsLog}
              title="Console operasi — Log Bot"
            />
          </View>

          {dashboard?.note || opsLog?.note ? (
            <Text style={styles.noteTiny}>
              {dashboard?.note || opsLog?.note}
            </Text>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}

function NotifyRoomSection({
  controller,
  onRouteChange,
}: {
  controller: KolamPusatAiInventoryCopilotController;
  onRouteChange?: (route: string) => void;
}) {
  const roomOptions = controller.rooms.map(room => ({
    label: formatKolamInventoryCopilotRoomLabel(room),
    value: room._id,
  }));
  const href =
    controller.dashboard?.teamChat.webHref ||
    controller.health?.notifyRoom?.webHref;

  return (
    <View style={[styles.sectionCard, styles.botStrip]}>
      <Text style={styles.sectionTitle}>Room log Inventory Copilot</Text>
      <Text style={styles.sectionDesc}>
        Room Team Chat untuk perintah DARA serta log/status deterministik
        Pangeran Isopod.
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
                : [{label: 'Tidak ada room', value: ''}]
            }
            showLabelInTrigger
            value={
              controller.selectedRoomId ||
              controller.dashboard?.teamChat.aiRoomId ||
              roomOptions[0]?.value ||
              ''
            }
          />
        </View>
      </View>
    </View>
  );
}

function BotHealthSection({
  controller,
}: {
  controller: KolamPusatAiInventoryCopilotController;
}) {
  const {health, healthLoading} = controller;
  return (
    <View style={[styles.sectionCard, styles.botStrip]}>
      <View style={styles.botStripHead}>
        <View style={styles.heading}>
          <Text style={styles.sectionTitle}>
            Kesehatan Bot — Pangeran Isopod
          </Text>
          <Text style={styles.sectionDesc}>
            {`Bot deterministik untuk log stock sync dan cek status stok.${
              health?.checkedAt
                ? ` Diperiksa ${formatKolamInventoryCopilotWib(health.checkedAt)}.`
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
      {health?.note ? (
        <Text style={styles.noteTiny}>{health.note}</Text>
      ) : null}
    </View>
  );
}

function BotProfileSection({
  controller,
}: {
  controller: KolamPusatAiInventoryCopilotController;
}) {
  const photoUri = controller.botPhotoUrl
    ? getKolamFileUrl(controller.botPhotoUrl) ?? controller.botPhotoUrl
    : null;

  return (
    <View style={[styles.sectionCard, styles.botStrip]}>
      <View style={styles.botStripHead}>
        <View style={styles.heading}>
          <Text style={styles.sectionTitle}>Profil Bot — Pangeran Isopod</Text>
          <Text style={styles.sectionDesc}>
            Foto & nama bot deterministik Inventory Copilot.
          </Text>
        </View>
      </View>
      <View style={[styles.botStripActions, {marginTop: 12}]}>
        {photoUri ? (
          <Image source={{uri: photoUri}} style={styles.botAvatar} />
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
          style={styles.botUpload}>
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
  );
}

function KpiTile({
  title,
  value,
  hint,
}: {
  title: string;
  value: number;
  hint?: string;
}) {
  return (
    <View style={styles.kpiCard}>
      <View style={styles.kpiTop}>
        <View>
          <Text style={styles.kpiLabel}>{title}</Text>
          <Text style={styles.kpiValue}>
            {value.toLocaleString('id-ID')}
          </Text>
          {hint ? <Text style={styles.kpiTrend}>{hint}</Text> : null}
        </View>
      </View>
    </View>
  );
}

function ListCard({
  title,
  lines,
  preface,
  empty,
}: {
  title: string;
  lines: KolamInventoryListLine[];
  preface?: string;
  empty?: boolean;
}) {
  const showEmpty = empty || (!lines.length && !preface);
  return (
    <View style={styles.listCard}>
      <Text style={styles.listCardTitle}>{title}</Text>
      {preface ? <Text style={styles.listLine}>{preface}</Text> : null}
      {lines.map(line => (
        <Text key={line.key} style={styles.listLine}>
          {line.text}
        </Text>
      ))}
      {showEmpty ? (
        <Text style={styles.listLine}>{KOLAM_INVENTORY_COPILOT_LIST_EMPTY}</Text>
      ) : null}
    </View>
  );
}

function OpsLogCard({
  title,
  events,
  loading,
}: {
  title: string;
  events: KolamInventoryOpsLogEvent[];
  loading: boolean;
}) {
  return (
    <View style={styles.opsCard}>
      <Text style={styles.opsCardTitle}>{title}</Text>
      <ScrollView nestedScrollEnabled style={styles.opsPanel}>
        {loading ? (
          <Text style={styles.loadingText}>Memuat…</Text>
        ) : events.length === 0 ? (
          <Text style={styles.opsEmpty}>{KOLAM_INVENTORY_COPILOT_OPS_EMPTY}</Text>
        ) : (
          events.map(event => (
            <View key={event.id} style={styles.opsItem}>
              <Text style={styles.opsTime}>
                {formatKolamInventoryCopilotWib(event.at)}
              </Text>
              <Text style={styles.opsDetail}>
                {`${event.detail || event.action}${
                  event.status ? ` · ${event.status}` : ''
                }`}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
