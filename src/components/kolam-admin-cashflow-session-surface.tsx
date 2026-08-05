import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamCopyStack } from './kolam-copy-stack';
import {
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamStatusBadge } from './kolam-status-badge';

const LIST_COLUMNS = [
  { id: 'name', label: 'Nama', flex: 1.4 },
  { id: 'source', label: 'Sumber', flex: 0.7 },
  { id: 'status', label: 'Status', flex: 0.8 },
  { id: 'window', label: 'Jendela', flex: 1.4 },
  { id: 'openedBy', label: 'Dibuka oleh', flex: 1 },
] as const;

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
  const [statusPanelOpen, setStatusPanelOpen] = useState(false);
  const [sourcePanelOpen, setSourcePanelOpen] = useState(false);
  const safePage = Math.max(1, controller.pagination.page);
  const pageCount = Math.max(1, controller.pagination.totalPages);
  const hasFilters = Boolean(
    controller.filters.search ||
      controller.filters.status ||
      controller.filters.source,
  );
  const canCreate = !controller.todaySession;
  const statusLabel =
    KOLAM_ADMIN_CASHFLOW_STATUS_OPTIONS.find(
      option => option.value === controller.filters.status,
    )?.label ?? 'Status';
  const sourceLabel =
    KOLAM_ADMIN_CASHFLOW_SOURCE_OPTIONS.find(
      option => option.value === controller.filters.source,
    )?.label ?? 'Sumber';

  const renderRow = React.useCallback(
    ({ item }: { item: KolamAdminCashflowSession }) => (
      <Pressable
        onPress={() =>
          onRouteChange?.(
            `${KOLAM_ADMIN_CASHFLOW_SESSION_ROOT}/${encodeURIComponent(item.id)}`,
          )
        }
        style={styles.row}
      >
        <View style={[styles.cell, { flex: 1.4 }]}>
          <Text numberOfLines={2} style={styles.primaryText}>
            {item.name}
          </Text>
        </View>
        <View style={[styles.cell, { flex: 0.7 }]}>
          <Text style={styles.metaText}>
            {item.source === 'pos' ? 'POS' : 'Admin'}
          </Text>
        </View>
        <View style={[styles.cell, { flex: 0.8 }]}>
          <KolamStatusBadge
            intent={getAdminCashflowStatusIntent(item.status)}
            label={formatAdminCashflowStatusLabel(item.status)}
          />
        </View>
        <View style={[styles.cell, { flex: 1.4 }]}>
          <Text numberOfLines={2} style={styles.metaText}>
            {formatAdminCashflowWindowLabel(item)}
          </Text>
        </View>
        <View style={[styles.cell, { flex: 1 }]}>
          <Text numberOfLines={1} style={styles.metaText}>
            {formatAdminCashflowOpenedBy(item.openedBy, item.source)}
          </Text>
        </View>
      </Pressable>
    ),
    [onRouteChange],
  );

  return (
    <View style={styles.listRoot}>
      <View style={styles.toolbarWrap}>
        <View style={styles.toolbarShell}>
          <View style={styles.filterRow}>
            <KolamFormTextField
              onChangeText={value => controller.onChangeFilters({ search: value })}
              placeholder="Cari"
              style={styles.searchInput}
              value={controller.filters.search}
            />
            <KolamButton
              intent={
                statusPanelOpen || controller.filters.status
                  ? 'primary'
                  : 'secondary'
              }
              label={statusLabel}
              onPress={() => {
                setSourcePanelOpen(false);
                setStatusPanelOpen(current => !current);
              }}
              style={styles.filterTrigger}
            />
            <KolamButton
              intent={
                sourcePanelOpen || controller.filters.source
                  ? 'primary'
                  : 'secondary'
              }
              label={sourceLabel}
              onPress={() => {
                setStatusPanelOpen(false);
                setSourcePanelOpen(current => !current);
              }}
              style={styles.filterTrigger}
            />
          </View>
          <View style={styles.actionRow}>
            {hasFilters ? (
              <KolamButton
                label="Atur ulang"
                muted
                onPress={() => {
                  setStatusPanelOpen(false);
                  setSourcePanelOpen(false);
                  controller.onClearFilters();
                }}
                style={styles.toolbarButton}
              />
            ) : null}
            <KolamRefreshButton
              accessibilityLabel="Muat ulang"
              disabled={controller.loading}

              onPress={() => {
                void controller.onRefresh();
              }}
              style={styles.toolbarButton}
            />
            {canCreate ? (
              <KolamButton
                intent="primary"
                label="Baru"
                onPress={() =>
                  onRouteChange?.(`${KOLAM_ADMIN_CASHFLOW_SESSION_ROOT}/create`)
                }
                style={styles.toolbarButton}
              />
            ) : null}
          </View>
        </View>

        {statusPanelOpen ? (
          <FilterPanel
            onClose={() => setStatusPanelOpen(false)}
            onSelect={value => {
              controller.onChangeFilters({
                status: value as '' | KolamAdminCashflowSessionStatus,
              });
              setStatusPanelOpen(false);
            }}
            options={KOLAM_ADMIN_CASHFLOW_STATUS_OPTIONS}
            selectedValue={controller.filters.status}
          />
        ) : null}
        {sourcePanelOpen ? (
          <FilterPanel
            onClose={() => setSourcePanelOpen(false)}
            onSelect={value => {
              controller.onChangeFilters({
                source: value as '' | KolamAdminCashflowSessionSource,
              });
              setSourcePanelOpen(false);
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

      <KolamCatalogListTableShell
        footer={
          <KolamTableFooterControls
            onPageSizeChange={controller.onLimitChange}
            page={safePage}
            pageSize={controller.pagination.limit}
            total={controller.pagination.total}
          >
            {pageCount > 1 ? (
              <View style={styles.paginationBar}>
                <KolamButton
                  disabled={safePage <= 1 || controller.loading}
                  label="Sebelumnya"
                  onPress={() =>
                    controller.onPageChange(Math.max(1, safePage - 1))
                  }
                />
                <Text style={styles.pageLabel}>
                  {safePage} / {pageCount}
                </Text>
                <KolamButton
                  disabled={safePage >= pageCount || controller.loading}
                  label="Berikutnya"
                  onPress={() =>
                    controller.onPageChange(Math.min(pageCount, safePage + 1))
                  }
                />
              </View>
            ) : null}
          </KolamTableFooterControls>
        }
        style={styles.tableFrame}
      >
        <FlatList
          data={controller.filteredItems}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <KolamEmptyState
                compact
                message="Buka sesi admin harian atau sesuaikan filter."
                title={
                  controller.loading
                    ? 'Memuat sesi tunai…'
                    : 'Belum ada sesi tunai'
                }
              />
            </View>
          }
          ListHeaderComponent={
            <View style={styles.headerRow}>
              {LIST_COLUMNS.map(column => (
                <View
                  key={column.id}
                  style={[styles.cell, { flex: column.flex }]}
                >
                  <Text style={styles.headerCellText}>{column.label}</Text>
                </View>
              ))}
            </View>
          }
          renderItem={renderRow}
          style={styles.listFlatList}
          contentContainerStyle={styles.listContent}
        />
      </KolamCatalogListTableShell>
    </View>
  );
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
          <KolamButton
            label="Batal"
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
  onClose,
  onSelect,
  options,
  selectedValue,
}: {
  onClose: () => void;
  onSelect: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  selectedValue: string;
}) {
  const rows = useMemo(() => options, [options]);
  return (
    <View style={styles.filterOverlayPanel}>
      {rows.map(option => (
        <KolamButton
          intent={selectedValue === option.value ? 'primary' : 'plain'}
          key={option.value || 'all'}
          label={option.label}
          onPress={() => onSelect(option.value)}
          style={styles.filterPanelOption}
        />
      ))}
      <KolamButton label="Tutup" onPress={onClose} />
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
  toolbarShell: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 6,
    justifyContent: 'space-between',
    overflow: 'visible',
    padding: 4,
  },
  filterRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 4,
    minWidth: 0,
  },
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 4,
  },
  searchInput: {
    flex: 1,
    minWidth: 140,
    maxWidth: 220,
  },
  filterTrigger: {
    minHeight: 34,
    paddingHorizontal: 10,
  },
  toolbarButton: {
    minHeight: 34,
    paddingHorizontal: 10,
  },
  filterOverlayPanel: {
    position: 'absolute',
    top: '100%',
    left: 4,
    marginTop: 4,
    minWidth: 220,
    maxWidth: 320,
    gap: 4,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: V.colors.border,
    backgroundColor: V.colors.bg,
    zIndex: 200000,
    elevation: 2000,
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
  tableFrame: {
    minHeight: 0,
  },
  listFlatList: {
    flexGrow: 0,
  },
  listContent: {
    flexGrow: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: V.colors.border,
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 4,
  },
  headerCellText: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: V.colors.border,
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 4,
  },
  cell: {
    minWidth: 0,
  },
  primaryText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '800',
  },
  metaText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyWrap: {
    minHeight: 200,
    justifyContent: 'center',
  },
  paginationBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '800',
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
