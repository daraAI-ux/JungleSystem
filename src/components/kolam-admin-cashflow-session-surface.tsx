import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  formatAdminCashflowOpenedBy,
  formatAdminCashflowStatusLabel,
  formatAdminCashflowWindowLabel,
  getAdminCashflowStatusIntent,
  KOLAM_ADMIN_CASHFLOW_SESSION_ROOT,
  KOLAM_ADMIN_CASHFLOW_SOURCE_OPTIONS,
  KOLAM_ADMIN_CASHFLOW_STATUS_OPTIONS,
  type KolamAdminCashflowSession,
  type KolamAdminCashflowSessionSource,
  type KolamAdminCashflowSessionStatus,
} from '../domain/kolam-admin-cashflow-session';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamAdminCashflowSessionController,
  type KolamAdminCashflowSessionController,
} from '../hooks/use-kolam-admin-cashflow-session-controller';
import { KolamAdminCashflowSessionDetail } from './kolam-admin-cashflow-session-detail';
import { KolamButton } from './kolam-button';
import {KolamCancelButton} from './kolam-cancel-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import {
  measureFilterPanelAnchor,
  type KolamFilterPanelAnchor,
} from './kolam-filter-panel-anchor';
import { KolamFormTextField } from './kolam-form-text-field';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamTableFilterTrigger } from './kolam-table-filter-trigger';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

type AdminCashflowFilterPanel = 'status' | 'source';

const FILTER_PANEL_WIDTH = 220;

/**
 * Admin cashflow sessions — list + create + detail ops (FE `/cashflow-session`).
 */
export function KolamAdminCashflowSessionSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamAdminCashflowSessionController(route);

  return (
    <View
      style={[
        styles.surface,
        controller.mode === 'list' ? styles.listSurface : null,
      ]}
    >
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

      {controller.mode === 'list' ? (
        <AdminCashflowList
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : null}
      {controller.mode === 'create' ? (
        <AdminCashflowCreateForm
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : null}
      {controller.mode === 'detail' ? (
        <KolamAdminCashflowSessionDetail
          documentId={controller.documentId}
          onRouteChange={onRouteChange}
        />
      ) : null}
    </View>
  );
}

function AdminCashflowList({
  controller,
  onRouteChange,
}: {
  controller: KolamAdminCashflowSessionController;
  onRouteChange?: (route: string) => void;
}) {
  const [activeFilterPanel, setActiveFilterPanel] =
    useState<AdminCashflowFilterPanel | null>(null);
  const [panelAnchor, setPanelAnchor] =
    useState<KolamFilterPanelAnchor | null>(null);
  const toolbarRef = React.useRef<View>(null);
  const statusTriggerRef = React.useRef<View>(null);
  const sourceTriggerRef = React.useRef<View>(null);
  const safePage = Math.max(1, controller.pagination.page);
  const hasFilters = Boolean(
    controller.filters.search ||
      controller.filters.status ||
      controller.filters.source,
  );
  const canCreate = !controller.todaySession;
  const statusLabel =
    KOLAM_ADMIN_CASHFLOW_STATUS_OPTIONS.find(
      option => option.value === controller.filters.status,
    )?.label ?? 'Semua status';
  const sourceLabel =
    KOLAM_ADMIN_CASHFLOW_SOURCE_OPTIONS.find(
      option => option.value === controller.filters.source,
    )?.label ?? 'Semua sumber';
  const columns = useMemo(
    () => createAdminCashflowColumns(onRouteChange),
    [onRouteChange],
  );
  const getFilterTriggerRef = (panel: AdminCashflowFilterPanel) =>
    panel === 'status' ? statusTriggerRef : sourceTriggerRef;
  const closeFilterPanel = () => {
    setActiveFilterPanel(null);
    setPanelAnchor(null);
  };
  const toggleFilterPanel = (panel: AdminCashflowFilterPanel) => {
    if (activeFilterPanel === panel) {
      closeFilterPanel();
      return;
    }

    closeFilterPanel();
    requestAnimationFrame(() => {
      measureFilterPanelAnchor(
        toolbarRef.current,
        getFilterTriggerRef(panel).current,
        FILTER_PANEL_WIDTH,
        anchor => {
          setPanelAnchor(anchor);
          setActiveFilterPanel(panel);
        },
      );
    });
  };

  return (
    <View style={styles.listRoot}>
      <View ref={toolbarRef} style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <KolamFormTextField
                onChangeText={value => controller.onChangeFilters({ search: value })}
                placeholder="Cari"
                style={kolamTableToolbarStyles.searchInput}
                value={controller.filters.search}
              />
              <View ref={statusTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={
                    activeFilterPanel === 'status' ||
                    Boolean(controller.filters.status)
                  }
                  label={statusLabel}
                  onPress={() => toggleFilterPanel('status')}
                  open={activeFilterPanel === 'status'}
                  variant="quiet"
                />
              </View>
              <View ref={sourceTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={
                    activeFilterPanel === 'source' ||
                    Boolean(controller.filters.source)
                  }
                  label={sourceLabel}
                  onPress={() => toggleFilterPanel('source')}
                  open={activeFilterPanel === 'source'}
                  variant="quiet"
                />
              </View>
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              {hasFilters ? (
                <KolamButton
                  label="Atur ulang"
                  muted
                  onPress={() => {
                    closeFilterPanel();
                    controller.onClearFilters();
                  }}
                  style={styles.toolbarButton}
                />
              ) : null}
              {canCreate ? (
                <KolamButton
                  intent="primary"
                  label="Baru"
                  tone="positive"
                  onPress={() =>
                    onRouteChange?.(`${KOLAM_ADMIN_CASHFLOW_SESSION_ROOT}/create`)
                  }
                  style={styles.toolbarButton}
                />
              ) : null}
            </View>
          </View>
        </View>

        {activeFilterPanel === 'status' && panelAnchor ? (
          <FilterPanel
            anchor={panelAnchor}
            onClose={closeFilterPanel}
            onSelect={value => {
              controller.onChangeFilters({
                status: value as '' | KolamAdminCashflowSessionStatus,
              });
              closeFilterPanel();
            }}
            options={KOLAM_ADMIN_CASHFLOW_STATUS_OPTIONS}
            selectedValue={controller.filters.status}
          />
        ) : null}
        {activeFilterPanel === 'source' && panelAnchor ? (
          <FilterPanel
            anchor={panelAnchor}
            onClose={closeFilterPanel}
            onSelect={value => {
              controller.onChangeFilters({
                source: value as '' | KolamAdminCashflowSessionSource,
              });
              closeFilterPanel();
            }}
            options={KOLAM_ADMIN_CASHFLOW_SOURCE_OPTIONS}
            selectedValue={controller.filters.source}
          />
        ) : null}
      </View>

      {controller.todaySession ? (
        <KolamCardFrame style={styles.todayCard} variant="compact">
          <KolamCopyStack
            items={[
              {
                id: 'today',
                text: `Sesi hari ini: ${controller.todaySession.name} (${formatAdminCashflowStatusLabel(controller.todaySession.status)})`,
                style: styles.todayText,
              },
            ]}
          />
          <KolamButton
            label="Buka"
            onPress={() =>
              onRouteChange?.(
                `${KOLAM_ADMIN_CASHFLOW_SESSION_ROOT}/${encodeURIComponent(
                  controller.todaySession!.id,
                )}`,
              )
            }
            style={styles.toolbarButton}
          />
        </KolamCardFrame>
      ) : null}

      <KolamListTableComposition
        columns={columns}
        emptyTitle={
          controller.loading ? 'Memuat sesi tunai...' : 'Belum ada sesi tunai'
        }
        getRowKey={item => item.id}
        loading={controller.loading}
        pagination={{
          onPageChange: controller.onPageChange,
          page: safePage,
          pageSize: controller.pagination.limit,
          total: controller.pagination.total,
        }}
        rows={controller.filteredItems}
      />
    </View>
  );
}

function createAdminCashflowColumns(
  onRouteChange?: (route: string) => void,
): Array<KolamListTableColumn<KolamAdminCashflowSession>> {
  return [
    {
      id: 'name',
      label: 'Nama',
      flex: 1.4,
      align: 'left',
      render: item => (
        <KolamButton
          intent="plain"
          label={item.name}
          onPress={() =>
            onRouteChange?.(
              `${KOLAM_ADMIN_CASHFLOW_SESSION_ROOT}/${encodeURIComponent(
                item.id,
              )}`,
            )
          }
          style={styles.nameButton}
          textStyle={styles.nameButtonText}
        />
      ),
    },
    {
      id: 'source',
      label: 'Sumber',
      flex: 0.7,
      render: item => (
        <Text style={styles.metaText}>
          {item.source === 'pos' ? 'POS' : 'Admin'}
        </Text>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      flex: 0.8,
      render: item => (
        <KolamStatusBadge
          intent={getAdminCashflowStatusIntent(item.status)}
          label={formatAdminCashflowStatusLabel(item.status)}
        />
      ),
    },
    {
      id: 'window',
      label: 'Jendela',
      flex: 1.4,
      render: item => (
        <Text numberOfLines={2} style={styles.metaText}>
          {formatAdminCashflowWindowLabel(item)}
        </Text>
      ),
    },
    {
      id: 'openedBy',
      label: 'Dibuka oleh',
      flex: 1,
      align: 'center',
      render: item => (
        <Text numberOfLines={1} style={[styles.metaText, styles.centerText]}>
          {formatAdminCashflowOpenedBy(item.openedBy, item.source)}
        </Text>
      ),
    },
  ];
}

function AdminCashflowCreateForm({
  controller,
  onRouteChange,
}: {
  controller: KolamAdminCashflowSessionController;
  onRouteChange?: (route: string) => void;
}) {
  const [name, setName] = useState('');
  const [windowStart, setWindowStart] = useState('');
  const [windowEnd, setWindowEnd] = useState('');

  const blockedByToday = Boolean(controller.todaySession);

  return (
    <View style={styles.formRoot}>
      <KolamCardFrame style={styles.formCard} variant="compact">
        <Text style={styles.formTitle}>Buka sesi tunai</Text>
        <Text style={styles.formHint}>
          Kosongkan field untuk memakai jendela hari ini (WIB) secara default.
        </Text>

        {blockedByToday ? (
          <KolamStatusBadge
            intent="warning"
            label={`Sesi hari ini sudah ada: ${controller.todaySession?.name} (${formatAdminCashflowStatusLabel(controller.todaySession?.status || 'open')}). Tidak bisa membuat sesi baru.`}
            numberOfLines={4}
            style={styles.banner}
          />
        ) : null}

        <Text style={styles.fieldLabel}>Nama sesi</Text>
        <KolamFormTextField
          onChangeText={setName}
          placeholder="mis. Shift pagi"
          value={name}
        />
        <Text style={styles.fieldLabel}>Awal jendela (ISO, opsional)</Text>
        <KolamFormTextField
          onChangeText={setWindowStart}
          placeholder="2026-07-28T00:00:00.000Z"
          value={windowStart}
        />
        <Text style={styles.fieldLabel}>Akhir jendela (ISO, opsional)</Text>
        <KolamFormTextField
          onChangeText={setWindowEnd}
          placeholder="2026-07-28T16:59:59.999Z"
          value={windowEnd}
        />

        <View style={styles.formActions}>
          <KolamCancelButton
            muted
            onPress={() => onRouteChange?.(KOLAM_ADMIN_CASHFLOW_SESSION_ROOT)}
          />
          <KolamButton
            disabled={controller.opening || blockedByToday}
            intent="primary"
            label={controller.opening ? 'Membuka…' : 'Buka sesi'}
            onPress={() => {
              void controller
                .onOpenSession({
                  name: name.trim() || undefined,
                  windowStart: windowStart.trim() || undefined,
                  windowEnd: windowEnd.trim() || undefined,
                })
                .then(session => {
                  if (session) {
                    onRouteChange?.(
                      `${KOLAM_ADMIN_CASHFLOW_SESSION_ROOT}/${encodeURIComponent(
                        session.id,
                      )}`,
                    );
                  }
                });
            }}
          />
        </View>
      </KolamCardFrame>
    </View>
  );
}

function FilterPanel({
  anchor,
  onClose,
  onSelect,
  options,
  selectedValue,
}: {
  anchor: KolamFilterPanelAnchor;
  onClose: () => void;
  onSelect: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  selectedValue: string;
}) {
  const rows = useMemo(() => options, [options]);
  return (
    <View
      style={[
        styles.filterOverlayPanel,
        {
          left: anchor.left,
          top: anchor.top,
          width: FILTER_PANEL_WIDTH,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.filterPanelContent}
        keyboardShouldPersistTaps="handled"
        style={styles.filterPanelScroll}
      >
        {rows.map(option => (
          <KolamButton
            intent={selectedValue === option.value ? 'primary' : 'plain'}
            key={option.value || 'all'}
            label={option.label}
            onPress={() => onSelect(option.value)}
            style={styles.filterPanelOption}
          />
        ))}
      </ScrollView>
      <View style={styles.filterPanelFooter}>
        <KolamButton label="Tutup" onPress={onClose} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    minHeight: 0,
    gap: 12,
  },
  listSurface: {
    overflow: 'visible',
  },
  listRoot: {
    flex: 1,
    minHeight: 0,
    gap: 12,
    overflow: 'visible',
  },
  banner: {
    alignSelf: 'flex-start',
  },
  toolbarWrap: {
    position: 'relative',
    zIndex: 100000,
    elevation: 1000,
    overflow: 'visible',
  },
  toolbarButton: {
    minHeight: 34,
    paddingHorizontal: 10,
  },
  filterOverlayPanel: {
    position: 'absolute',
    gap: 4,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: V.colors.border,
    backgroundColor: V.colors.bg,
    zIndex: 200000,
    elevation: 2000,
  },
  filterPanelContent: {
    gap: 4,
  },
  filterPanelScroll: {
    maxHeight: 220,
  },
  filterPanelFooter: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    paddingTop: 6,
  },
  filterPanelOption: {
    justifyContent: 'flex-start',
  },
  todayCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: 10,
  },
  todayText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
  },
  metaText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
  },
  centerText: {
    textAlign: 'center',
  },
  nameButton: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    minHeight: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  nameButtonText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'left',
  },
  formRoot: {
    gap: 12,
  },
  formCard: {
    gap: 12,
    padding: 14,
  },
  formTitle: {
    color: V.colors.fg,
    fontSize: 16,
    fontWeight: '900',
  },
  formHint: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  fieldLabel: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '800',
  },
  formActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 8,
  },
});
