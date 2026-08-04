import React, {useMemo} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useKolamAuthContext} from '../context/kolam-app-contexts';
import {
  buildKolamPusatAiHubRoute,
  filterKolamPusatAiHubTabs,
  getKolamPusatAiHubTab,
  type KolamPusatAiHubTabId,
} from '../domain/kolam-pusat-ai';
import {
  formatKolamDaraJobModuleLabel,
  formatKolamDaraJobProgressLabel,
  getKolamDaraJobProgressPercent,
  getKolamDaraJobStatusIntent,
  isKolamDaraJobActive,
  KOLAM_DARA_JOBS_MODULE_OPTIONS,
  KOLAM_DARA_JOBS_STATUS_OPTIONS,
  KOLAM_PUSAT_AI_PROSES_EMPTY_COPY,
  KOLAM_PUSAT_AI_PROSES_HELPER_COPY,
  type KolamDaraAsyncJob,
} from '../domain/kolam-pusat-ai-jobs';
import {
  formatKolamDaraStaffNotifyChannels,
  formatKolamDaraStaffNotifyEventLabel,
  formatKolamDaraStaffNotifyWib,
  isKolamDaraStaffNotifyLlmCopy,
  KOLAM_DARA_STAFF_NOTIFY_EMPTY,
  KOLAM_DARA_STAFF_NOTIFY_UNAVAILABLE,
  type KolamDaraStaffNotifyEvent,
} from '../domain/kolam-pusat-ai-log-dara';
import {
  computeKolamOwnerCopilotNightOpsTotal,
  formatKolamOwnerCopilotEventLabel,
  formatKolamOwnerCopilotWib,
  getKolamOwnerCopilotStatusIntent,
  KOLAM_OWNER_COPILOT_AUDIT_OFF,
  KOLAM_OWNER_COPILOT_DESCRIPTION,
  KOLAM_OWNER_COPILOT_EMPTY_NIGHT_OPS,
  KOLAM_OWNER_COPILOT_EXECUTIVE_SUFFIX,
  type KolamOwnerCopilotDashboard,
} from '../domain/kolam-pusat-ai-owner-copilot';
import {isTopNavAdminRole} from '../domain/top-nav';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {
  useKolamPusatAiLogDaraController,
  type KolamPusatAiLogDaraController,
} from '../hooks/use-kolam-pusat-ai-log-dara-controller';
import {
  useKolamPusatAiOwnerCopilotController,
  type KolamPusatAiOwnerCopilotController,
} from '../hooks/use-kolam-pusat-ai-owner-copilot-controller';
import {
  useKolamPusatAiProsesController,
  type KolamPusatAiProsesController,
} from '../hooks/use-kolam-pusat-ai-proses-controller';
import {
  useKolamPusatAiRingkasanController,
  type KolamPusatAiRingkasanController,
} from '../hooks/use-kolam-pusat-ai-ringkasan-controller';
import {useKolamPusatAiPoCopilotController} from '../hooks/use-kolam-pusat-ai-po-copilot-controller';
import {useKolamPusatAiTransaksiCopilotController} from '../hooks/use-kolam-pusat-ai-transaksi-copilot-controller';
import {KolamButton} from './kolam-button';
import {KolamDropdownSelect} from './kolam-dropdown-select';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamPusatAiPoCopilotBody} from './kolam-pusat-ai-po-copilot-body';
import {KolamPusatAiTransaksiCopilotBody} from './kolam-pusat-ai-transaksi-copilot-body';
import {KolamStatsCardStrip} from './kolam-stats-card-strip';
import {KolamStatusBadge} from './kolam-status-badge';
import {KolamSurfacePanelTabs} from './kolam-surface-panel-tabs';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';

/** FE Log DARA violet tint (panel-local; not a global token). */
const LOG_DARA_VIOLET = '#7c3aed';
const LOG_DARA_VIOLET_SOFT = '#f5f3ff';
const LOG_DARA_VIOLET_BORDER = 'rgba(124, 58, 237, 0.2)';

export function KolamPusatAiRingkasanSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const {authUser} = useKolamAuthContext();
  const isAdmin = isTopNavAdminRole(authUser?.roleKey);
  const hubTabs = useMemo(() => filterKolamPusatAiHubTabs(isAdmin), [isAdmin]);
  const selectedTab = resolveSelectedHubTab(route, isAdmin);
  const ringkasanController = useKolamPusatAiRingkasanController(route);
  const prosesController = useKolamPusatAiProsesController(route, {
    canNormalize: isAdmin,
  });
  const ownerController = useKolamPusatAiOwnerCopilotController(route);
  const logDaraController = useKolamPusatAiLogDaraController(route);
  const transaksiController = useKolamPusatAiTransaksiCopilotController(route);
  const poController = useKolamPusatAiPoCopilotController(route);

  return (
    <View style={styles.surface}>
      <View style={styles.tabBar}>
        <KolamSurfacePanelTabs
          onSelectTab={(tabId: KolamPusatAiHubTabId) => {
            onRouteChange?.(buildKolamPusatAiHubRoute(tabId));
          }}
          selectedTabId={selectedTab}
          tabs={hubTabs.map(tab => ({id: tab.id, label: tab.label}))}
        />
      </View>

      {selectedTab === 'ringkasan' ? (
        <KolamPusatAiRingkasanBody
          controller={ringkasanController}
          onRouteChange={onRouteChange}
        />
      ) : selectedTab === 'proses' ? (
        <KolamPusatAiProsesBody controller={prosesController} />
      ) : selectedTab === 'owner-copilot' ? (
        <KolamPusatAiOwnerCopilotBody
          controller={ownerController}
          onRouteChange={onRouteChange}
        />
      ) : selectedTab === 'log-dara' ? (
        <KolamPusatAiLogDaraBody controller={logDaraController} />
      ) : selectedTab === 'transaksi-copilot' ? (
        <KolamPusatAiTransaksiCopilotBody
          controller={transaksiController}
          onRouteChange={onRouteChange}
        />
      ) : selectedTab === 'po-copilot' ? (
        <KolamPusatAiPoCopilotBody
          controller={poController}
          onRouteChange={onRouteChange}
        />
      ) : (
        <KolamEmptyState title="Belum tersedia" />
      )}
    </View>
  );
}

/** Alias for hub surface. */
export const KolamPusatAiSurface = KolamPusatAiRingkasanSurface;

function resolveSelectedHubTab(
  route: string,
  isAdmin: boolean,
): KolamPusatAiHubTabId {
  const tab = getKolamPusatAiHubTab(route);
  if (tab === 'other') {
    return 'ringkasan';
  }
  const allowed = filterKolamPusatAiHubTabs(isAdmin).some(
    item => item.id === tab,
  );
  return allowed ? tab : 'ringkasan';
}

function KolamPusatAiLogDaraBody({
  controller,
}: {
  controller: KolamPusatAiLogDaraController;
}) {
  const {log, loading, error} = controller;

  if (loading && !log) {
    return <Text style={styles.loadingText}>Memuat…</Text>;
  }

  if (!log) {
    return (
      <View style={styles.logUnavailable}>
        <Text style={styles.logUnavailableText}>
          {error || KOLAM_DARA_STAFF_NOTIFY_UNAVAILABLE}
        </Text>
        <KolamButton
          intent="outline"
          label="Coba lagi"
          onPress={() => {
            void controller.onRefresh();
          }}
        />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.logScrollContent}
      style={styles.scroll}>
      <View style={styles.logSummaryCard}>
        <View style={styles.logSummaryMeta}>
          <Text style={styles.logSummaryItem}>
            {`Total ${log.summary.total}`}
          </Text>
          <Text style={styles.logSummaryItem}>
            {`LLM ${log.summary.llmCopy}`}
          </Text>
          <Text style={styles.logSummaryItem}>
            {`Template ${log.summary.templateCopy}`}
          </Text>
          <Text style={styles.logSummaryMuted}>
            {`${log.lookbackHours} jam terakhir`}
          </Text>
        </View>
        <KolamButton
          disabled={loading}
          intent="outline"
          label="Refresh"
          onPress={() => {
            void controller.onRefresh();
          }}
        />
      </View>

      <View style={styles.logEventsCard}>
        <Text style={styles.logEventsTitle}>Riwayat event</Text>
        {log.events.length === 0 ? (
          <Text style={styles.logEmpty}>{KOLAM_DARA_STAFF_NOTIFY_EMPTY}</Text>
        ) : (
          log.events.map(event => (
            <LogDaraEventRow event={event} key={event.id} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

function LogDaraEventRow({event}: {event: KolamDaraStaffNotifyEvent}) {
  const llm = isKolamDaraStaffNotifyLlmCopy(event.copySource);
  return (
    <View style={styles.logEventRow}>
      <View style={styles.logEventTop}>
        <Text style={styles.logEventTime}>
          {formatKolamDaraStaffNotifyWib(event.at)}
        </Text>
        <Text style={styles.logEventLabel}>
          {formatKolamDaraStaffNotifyEventLabel(
            event.action || event.eventType,
          )}
        </Text>
        {event.invoiceCode ? (
          <Text style={styles.logEventInvoice}>{event.invoiceCode}</Text>
        ) : null}
        <Text style={llm ? styles.logBadgeLlm : styles.logBadgeTpl}>
          {llm ? 'LLM' : 'tpl'}
        </Text>
      </View>
      <Text style={styles.logEventMeta}>
        {formatKolamDaraStaffNotifyChannels(event.notified)}
      </Text>
      {event.detail ? (
        <Text style={styles.logEventMeta}>{event.detail}</Text>
      ) : null}
    </View>
  );
}

function KolamPusatAiOwnerCopilotBody({
  controller,
  onRouteChange,
}: {
  controller: KolamPusatAiOwnerCopilotController;
  onRouteChange?: (route: string) => void;
}) {
  const {dash, loading, error} = controller;

  return (
    <ScrollView
      contentContainerStyle={styles.ownerScrollContent}
      style={styles.scroll}>
      <View style={styles.copilotShell}>
        <View style={styles.copilotHeader}>
          <View style={styles.copilotHeading}>
            <Text style={styles.copilotEyebrow}>Copilot</Text>
            <Text style={styles.copilotTitle}>Owner Copilot</Text>
            <Text style={styles.copilotDesc}>
              {KOLAM_OWNER_COPILOT_DESCRIPTION}
            </Text>
          </View>
          <View style={styles.copilotActions}>
            <KolamButton
              disabled={loading}
              intent="outline"
              label={loading ? 'Memuat…' : 'Refresh'}
              onPress={() => {
                void controller.onRefresh();
              }}
            />
            {dash?.teamChat.webHref ? (
              <KolamButton
                intent="primary"
                label="Buka room DARA"
                onPress={() => onRouteChange?.(dash.teamChat.webHref)}
              />
            ) : null}
          </View>
        </View>

        {loading && !dash ? (
          <Text style={styles.loadingText}>Memuat…</Text>
        ) : null}

        {error && !dash ? (
          <KolamEmptyState message={error} title="Gagal memuat" />
        ) : null}

        {dash ? <OwnerCopilotDashboardContent dash={dash} /> : null}
      </View>
    </ScrollView>
  );
}

function OwnerCopilotDashboardContent({
  dash,
}: {
  dash: KolamOwnerCopilotDashboard;
}) {
  const nightTotal = computeKolamOwnerCopilotNightOpsTotal(dash.nightOps.counts);
  const counts = dash.nightOps.counts;

  return (
    <View style={styles.ownerBody}>
      <Text style={styles.ownerMeta}>
        {`Periode Night Ops: ${dash.windowLabel}${
          dash.generatedAt
            ? ` · diperbarui ${formatKolamOwnerCopilotWib(dash.generatedAt)}`
            : ''
        }`}
      </Text>

      <View style={styles.ownerCards}>
        <View style={styles.ownerCard}>
          <Text style={styles.ownerCardTitle}>Bisnis hari ini</Text>
          <Text style={styles.ownerCardLine}>
            {`Penjualan: ${dash.health.salesFormatted} · ${dash.health.orderCount} order`}
          </Text>
          <Text style={styles.ownerCardLine}>
            {`Margin kotor: ${dash.health.marginFormatted}`}
          </Text>
          <Text style={styles.ownerCardMuted}>
            {`Stok rendah: ${dash.health.lowStockCount}`}
          </Text>
        </View>

        <View style={styles.ownerCard}>
          <Text style={styles.ownerCardTitle}>Night Ops (24 jam)</Text>
          {!dash.nightOps.opsAuditEnabled ? (
            <Text style={styles.ownerWarn}>{KOLAM_OWNER_COPILOT_AUDIT_OFF}</Text>
          ) : nightTotal === 0 ? (
            <Text style={styles.ownerCardMuted}>
              {KOLAM_OWNER_COPILOT_EMPTY_NIGHT_OPS}
            </Text>
          ) : (
            <>
              <Text style={styles.ownerCardLine}>
                {`Olshop: ${counts.olshop_dispatch} dispatch · ${counts.olshop_defer} defer · ${counts.olshop_fail} gagal · ${counts.olshop_stock_hold} stock hold`}
              </Text>
              <Text style={styles.ownerCardLine}>
                {`Webstore: ${counts.webstore_start} packing · DANA: ${counts.dana_ok} ok · ${counts.dana_fail} gagal`}
              </Text>
            </>
          )}
        </View>

        <View style={[styles.ownerCard, styles.ownerCardWide]}>
          <Text style={styles.ownerCardTitle}>Tanya di room DARA</Text>
          {dash.teamChat.suggestedPrompts.map(prompt => (
            <Text key={prompt} style={styles.promptChip}>
              {`«${prompt}»`}
            </Text>
          ))}
        </View>
      </View>

      {dash.nightOps.failures.length > 0 ? (
        <View style={[styles.ownerCard, styles.ownerCardDanger]}>
          <Text style={styles.ownerCardTitleDanger}>Perlu cek (Night Ops)</Text>
          {dash.nightOps.failures.map(failure => (
            <Text key={failure.id} style={styles.ownerCardLine}>
              {`${failure.invoiceCode || '—'} · ${formatKolamOwnerCopilotEventLabel(failure.eventType)} — ${failure.reason}`}
            </Text>
          ))}
        </View>
      ) : null}

      {dash.insights.length > 0 ? (
        <View style={styles.ownerCard}>
          <Text style={styles.ownerCardTitle}>Insight DARA terbaru</Text>
          {dash.insights.map((item, index) => (
            <View
              key={`${item.kind}-${index}`}
              style={styles.insightRow}>
              <Text style={styles.ownerStrong}>{item.title}</Text>
              {item.body ? (
                <Text numberOfLines={2} style={styles.ownerCardMuted}>
                  {item.body}
                </Text>
              ) : null}
              <Text style={styles.insightTime}>
                {formatKolamOwnerCopilotWib(item.broadcastAt)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {dash.nightOps.recentEvents.length > 0 ? (
        <View style={styles.ownerCard}>
          <Text style={styles.ownerCardTitle}>Event ops terbaru</Text>
          <View style={styles.eventsHeader}>
            <Text style={[styles.eventsHeaderCell, styles.colWaktu]}>
              Waktu
            </Text>
            <Text style={[styles.eventsHeaderCell, styles.colEvent]}>
              Event
            </Text>
            <Text style={[styles.eventsHeaderCell, styles.colInvoice]}>
              Invoice
            </Text>
            <Text style={[styles.eventsHeaderCell, styles.colEventStatus]}>
              Status
            </Text>
          </View>
          {dash.nightOps.recentEvents.map(event => (
            <View key={event.id} style={styles.eventsRow}>
              <Text style={[styles.eventsCell, styles.colWaktu]}>
                {formatKolamOwnerCopilotWib(event.at)}
              </Text>
              <Text style={[styles.eventsCell, styles.colEvent]}>
                {formatKolamOwnerCopilotEventLabel(event.eventType)}
              </Text>
              <Text style={[styles.eventsCell, styles.colInvoice]}>
                {event.invoiceCode || '—'}
              </Text>
              <View style={[styles.eventsCell, styles.colEventStatus]}>
                <KolamStatusBadge
                  intent={getKolamOwnerCopilotStatusIntent(event.status)}
                  label={event.status}
                />
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.executiveCard}>
        <Text style={styles.executiveText}>
          {`${dash.executiveNote}${KOLAM_OWNER_COPILOT_EXECUTIVE_SUFFIX}`}
        </Text>
      </View>
    </View>
  );
}

function KolamPusatAiProsesBody({
  controller,
}: {
  controller: KolamPusatAiProsesController;
}) {
  return (
    <View style={styles.proses}>
      <View style={styles.helperCard}>
        <Text style={styles.helperText}>{KOLAM_PUSAT_AI_PROSES_HELPER_COPY}</Text>
      </View>

      <View style={styles.prosesActions}>
        <KolamButton
          disabled={controller.loading}
          intent="outline"
          label="Refresh"
          onPress={() => {
            void controller.onRefresh();
          }}
        />
        {controller.canNormalize ? (
          <KolamButton
            disabled={controller.normalizeBusy}
            intent="outline"
            label={
              controller.normalizeBusy
                ? 'Memperbaiki…'
                : 'Perbaiki tipe SEO lama'
            }
            onPress={() => {
              void controller.onNormalizeSeo();
            }}
          />
        ) : null}
      </View>

      {controller.notice ? (
        <Text style={styles.noticeText}>{controller.notice}</Text>
      ) : null}
      {controller.error ? (
        <Text style={styles.noticeText}>{controller.error}</Text>
      ) : null}

      <View style={styles.filterCard}>
        <View style={styles.filterField}>
          <Text style={styles.filterLabel}>Modul</Text>
          <KolamDropdownSelect
            accessibilityLabel="Filter modul"
            label="Modul"
            onChange={value =>
              controller.onSetModuleFilter(
                value as typeof controller.moduleFilter,
              )
            }
            options={KOLAM_DARA_JOBS_MODULE_OPTIONS}
            showLabelInTrigger={false}
            value={controller.moduleFilter}
          />
        </View>
        <View style={styles.filterField}>
          <Text style={styles.filterLabel}>Status</Text>
          <KolamDropdownSelect
            accessibilityLabel="Filter status"
            label="Status"
            onChange={value =>
              controller.onSetStatusFilter(
                value as typeof controller.statusFilter,
              )
            }
            options={KOLAM_DARA_JOBS_STATUS_OPTIONS}
            showLabelInTrigger={false}
            value={controller.statusFilter}
          />
        </View>
      </View>

      {controller.loading ? (
        <Text style={styles.loadingText}>Memuat…</Text>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          style={styles.scroll}>
          <View style={styles.jobsTable}>
            <View style={styles.jobsHeader}>
              <Text style={[styles.jobsHeaderCell, styles.colProses]}>
                Proses
              </Text>
              <Text style={[styles.jobsHeaderCell, styles.colModul]}>Modul</Text>
              <Text style={[styles.jobsHeaderCell, styles.colStatus]}>
                Status
              </Text>
              <Text style={[styles.jobsHeaderCell, styles.colProgress]}>
                Progress
              </Text>
              <Text style={[styles.jobsHeaderCell, styles.colAksi]}>Aksi</Text>
            </View>

            {controller.jobs.length === 0 ? (
              <Text style={styles.emptyTableText}>
                {KOLAM_PUSAT_AI_PROSES_EMPTY_COPY}
              </Text>
            ) : (
              controller.jobs.map(job => (
                <ProsesJobRow
                  job={job}
                  key={job.id}
                  onDismiss={() => controller.onDismissJob(job.id)}
                  onPoll={() => {
                    void controller.onPollJob(job.id);
                  }}
                  polling={controller.pollingJobId === job.id}
                />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function ProsesJobRow({
  job,
  onDismiss,
  onPoll,
  polling,
}: {
  job: KolamDaraAsyncJob;
  onDismiss: () => void;
  onPoll: () => void;
  polling: boolean;
}) {
  const active = isKolamDaraJobActive(job);
  const percent = getKolamDaraJobProgressPercent(job);

  return (
    <View style={styles.jobsRow}>
      <View style={[styles.jobsCell, styles.colProses]}>
        <Text style={styles.jobLabel}>{job.label}</Text>
        {job.progressMessage ? (
          <Text numberOfLines={1} style={styles.jobMessage}>
            {job.progressMessage}
          </Text>
        ) : null}
      </View>
      <View style={[styles.jobsCell, styles.colModul]}>
        <KolamStatusBadge
          intent="secondary"
          label={formatKolamDaraJobModuleLabel(job.module)}
        />
      </View>
      <View style={[styles.jobsCell, styles.colStatus]}>
        <KolamStatusBadge
          intent={getKolamDaraJobStatusIntent(job.status)}
          label={job.status}
        />
      </View>
      <View style={[styles.jobsCell, styles.colProgress]}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {width: `${percent}%`}]} />
        </View>
        <Text style={styles.jobProgress}>
          {formatKolamDaraJobProgressLabel(job)}
        </Text>
      </View>
      <View style={[styles.jobsCell, styles.colAksi, styles.jobActions]}>
        {active ? (
          <KolamButton
            disabled={polling}
            intent="outline"
            label="Update"
            onPress={onPoll}
          />
        ) : null}
        <KolamButton intent="outline" label="Tutup" onPress={onDismiss} />
      </View>
    </View>
  );
}

function KolamPusatAiRingkasanBody({
  controller,
  onRouteChange,
}: {
  controller: KolamPusatAiRingkasanController;
  onRouteChange?: (route: string) => void;
}) {
  const {hub, loading, error, quickLinks, kpiCards} = controller;
  const showBrandFilter = (hub?.brands.length ?? 0) > 0;

  return (
    <View style={styles.ringkasan}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            {showBrandFilter ? (
              <KolamDropdownSelect
                accessibilityLabel="Filter merek Pusat AI"
                label="Merek"
                onChange={controller.onSetBrandId}
                options={controller.brandOptions}
                showLabelInTrigger={false}
                value={controller.brandId}
              />
            ) : null}
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              disabled={loading}
              label={loading ? 'Memuat…' : 'Refresh'}
              onPress={() => {
                void controller.onRefresh();
              }}
            />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}>
        {error && !hub ? (
          <KolamEmptyState message={error} title="Gagal memuat" />
        ) : null}

        {!error || hub ? <KolamStatsCardStrip cards={kpiCards} /> : null}

        {hub ? (
          <View style={styles.modules}>
            <ModuleCard
              actionLabel="Buka SEO"
              href="/campaign/dara-seo"
              metric={hub.seo != null ? String(hub.seo.seoScore) : '—'}
              onRouteChange={onRouteChange}
              stats={[
                `Persetujuan: ${hub.seo?.pendingApprovals ?? 0}`,
                `Negatif: ${hub.seo?.negativeMentions ?? 0}`,
              ]}
              subtitle="Skor rata-rata audit produk & konten."
              title="DARA SEO"
            />
            <ModuleCard
              actionLabel="Buka Market Intel"
              href="/campaign/dara-market-intel"
              metric={String(hub.market.pendingApprovals)}
              onRouteChange={onRouteChange}
              stats={[
                `Murah: ${hub.market.tooCheap}`,
                `Mahal: ${hub.market.tooExpensive}`,
                `Margin rendah: ${hub.market.lowMargin}`,
              ]}
              subtitle="Antrian persetujuan harga & positioning pasar."
              title="Market Intel"
            />
            <ModuleCard
              actionLabel="Lihat ranking SERP"
              href="/campaign/dara-seo/rankings"
              metric={String(hub.serpSnapshotsStored)}
              onRouteChange={onRouteChange}
              stats={[
                hub.integrations.searxngReachable
                  ? 'SearXNG online'
                  : 'SearXNG offline',
                hub.integrations.serpConfigured
                  ? 'SerpAPI aktif'
                  : 'SerpAPI belum',
              ]}
              statusOnline={[
                hub.integrations.searxngReachable,
                hub.integrations.serpConfigured,
              ]}
              subtitle="Snapshot SERP tersimpan untuk monitoring keyword."
              title="Ranking & integrasi"
            />
          </View>
        ) : null}

        {hub && !loading && quickLinks.length > 0 ? (
          <View style={styles.quickLinks}>
            <Text style={styles.quickLinksTitle}>Akses cepat</Text>
            <View style={styles.quickLinksGrid}>
              {quickLinks.map(item => (
                <Pressable
                  accessibilityLabel={item.label}
                  accessibilityRole="button"
                  key={item.href}
                  onPress={() => onRouteChange?.(item.href)}
                  style={styles.quickLink}>
                  <Text numberOfLines={1} style={styles.quickLinkText}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {!loading && !hub && !error ? (
          <KolamEmptyState title="Belum ada data" />
        ) : null}
      </ScrollView>
    </View>
  );
}

function ModuleCard({
  actionLabel,
  href,
  metric,
  onRouteChange,
  stats,
  statusOnline,
  subtitle,
  title,
}: {
  actionLabel: string;
  href: string;
  metric: string;
  onRouteChange?: (route: string) => void;
  stats: string[];
  statusOnline?: boolean[];
  subtitle: string;
  title: string;
}) {
  return (
    <View style={styles.moduleCard}>
      <Text style={styles.moduleTitle}>{title}</Text>
      <Text style={styles.moduleMetric}>{metric}</Text>
      <Text style={styles.moduleSubtitle}>{subtitle}</Text>
      <View style={styles.moduleStats}>
        {stats.map((stat, index) => {
          const online = statusOnline?.[index];
          return (
            <Text
              key={stat}
              style={[
                styles.moduleStat,
                online === true ? styles.statusOnline : null,
                online === false ? styles.statusOffline : null,
              ]}>
              {stat}
            </Text>
          );
        })}
      </View>
      <View style={styles.moduleAction}>
        <KolamButton
          intent="outline"
          label={actionLabel}
          onPress={() => onRouteChange?.(href)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 12,
  },
  tabBar: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  logScrollContent: {
    gap: 16,
    paddingBottom: 24,
  },
  logUnavailable: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    gap: 8,
    paddingVertical: 24,
  },
  logUnavailableText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    textAlign: 'center',
  },
  logSummaryCard: {
    alignItems: 'center',
    backgroundColor: LOG_DARA_VIOLET_SOFT,
    borderColor: LOG_DARA_VIOLET_BORDER,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  logSummaryMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  logSummaryItem: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  logSummaryMuted: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  logEventsCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  logEventsTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logEmpty: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 24,
    textAlign: 'center',
  },
  logEventRow: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  logEventTop: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  logEventTime: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  logEventLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  logEventInvoice: {
    color: LOG_DARA_VIOLET,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  logBadgeLlm: {
    backgroundColor: LOG_DARA_VIOLET_SOFT,
    borderRadius: V.radius.sm,
    color: LOG_DARA_VIOLET,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 2,
    textTransform: 'uppercase',
  },
  logBadgeTpl: {
    backgroundColor: V.colors.muted,
    borderRadius: V.radius.sm,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 2,
    textTransform: 'uppercase',
  },
  logEventMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    width: '100%',
  },
  ownerScrollContent: {
    gap: 16,
    paddingBottom: 24,
  },
  copilotShell: {
    gap: 16,
  },
  copilotHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  copilotHeading: {
    flex: 1,
    gap: 4,
    minWidth: 220,
  },
  copilotEyebrow: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  copilotTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '700',
  },
  copilotDesc: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
  copilotActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ownerBody: {
    gap: 16,
  },
  ownerMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  ownerCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  ownerCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    flexBasis: 260,
    flexGrow: 1,
    gap: 6,
    minWidth: 220,
    padding: 14,
  },
  ownerCardWide: {
    flexBasis: 280,
  },
  ownerCardDanger: {
    borderColor: V.colors.danger,
    flexBasis: '100%',
  },
  ownerCardTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  ownerCardTitleDanger: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  ownerCardLine: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
  ownerCardMuted: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
  ownerStrong: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontWeight: '700',
  },
  ownerWarn: {
    color: V.colors.warning,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  promptChip: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.md,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  insightRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    gap: 2,
    paddingBottom: 8,
  },
  insightTime: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  eventsHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  eventsHeaderCell: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
  },
  eventsRow: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 6,
  },
  eventsCell: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    justifyContent: 'center',
  },
  colWaktu: {
    flex: 1.1,
  },
  colEvent: {
    flex: 1.4,
  },
  colInvoice: {
    flex: 1,
  },
  colEventStatus: {
    flex: 0.8,
  },
  executiveCard: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderStyle: 'dashed',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  executiveText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 16,
  },
  ringkasan: {
    flex: 1,
    gap: 12,
  },
  proses: {
    flex: 1,
    gap: 16,
  },
  helperCard: {
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.primary,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  helperText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
  prosesActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noticeText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  filterCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    padding: 16,
  },
  filterField: {
    gap: 4,
    minWidth: 160,
  },
  filterLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  loadingText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    paddingHorizontal: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 24,
  },
  jobsTable: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  jobsHeader: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  jobsHeaderCell: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  jobsRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  jobsCell: {
    justifyContent: 'center',
    minWidth: 0,
  },
  colProses: {
    flex: 2.2,
  },
  colModul: {
    flex: 0.8,
  },
  colStatus: {
    flex: 0.9,
  },
  colProgress: {
    flex: 1.2,
    gap: 4,
    minWidth: 120,
  },
  colAksi: {
    flex: 1,
    minWidth: 128,
  },
  emptyTableText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    paddingVertical: 40,
    textAlign: 'center',
  },
  jobLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  jobMessage: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  progressTrack: {
    backgroundColor: V.colors.muted,
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: V.colors.primary,
    height: '100%',
  },
  jobProgress: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  jobActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  modules: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moduleCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    flexBasis: 260,
    flexGrow: 1,
    gap: 6,
    minWidth: 240,
    padding: 14,
  },
  moduleTitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  moduleMetric: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  moduleSubtitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 16,
  },
  moduleStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  moduleStat: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  statusOnline: {
    color: V.colors.success,
  },
  statusOffline: {
    color: V.colors.warning,
  },
  moduleAction: {
    alignItems: 'flex-start',
    marginTop: 8,
  },
  quickLinks: {
    gap: 8,
  },
  quickLinksTitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickLink: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: V.radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickLinkText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '500',
  },
});
