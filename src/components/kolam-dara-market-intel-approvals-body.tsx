import React, {useMemo, useRef, useState} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  KOLAM_DARA_MARKET_INTEL_STATUS_FILTERS,
  buildKolamDaraMarketIntelMetricLines,
  formatKolamDaraMarketIntelCategory,
  formatKolamDaraMarketIntelEntityName,
  formatKolamDaraMarketIntelRecStatus,
  isKolamDaraMarketIntelApprovable,
  type KolamDaraMarketIntelRecommendation,
  type KolamDaraMarketIntelStatusFilterId,
} from '../domain/kolam-dara-market-intel';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraMarketIntelApprovalsController} from '../hooks/use-kolam-dara-market-intel-approvals-controller';
import {KolamButton} from './kolam-button';
import {KolamCancelButton} from './kolam-cancel-button';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamListTableComposition} from './kolam-list-table-composition';
import {KolamModalBackdrop} from './kolam-modal-backdrop';
import {KolamTableFilterTrigger} from './kolam-table-filter-trigger';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';

type ApprovalsFilterPanel = 'brand' | 'status' | null;

/** FE `DaraMarketIntelApprovalsPage` — list, filters, pagination 10, detail/reject. */
export function KolamDaraMarketIntelApprovalsBody({
  canApprove,
  canViewMargin,
  controller,
}: {
  canApprove: boolean;
  canViewMargin: boolean;
  controller: KolamDaraMarketIntelApprovalsController;
}) {
  const toolbarRef = useRef<View>(null);
  const brandTriggerRef = useRef<View>(null);
  const statusTriggerRef = useRef<View>(null);
  const [activePanel, setActivePanel] = useState<ApprovalsFilterPanel>(null);
  const [panelAnchor, setPanelAnchor] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const brandOptions = useMemo(
    () => [
      {label: 'Semua merek', value: 'all'},
      ...controller.brands.map(brand => ({
        label: brand.name,
        value: brand.id,
      })),
    ],
    [controller.brands],
  );

  const brandLabel =
    brandOptions.find(option => option.value === controller.brandId)?.label ??
    'Merek';
  const statusLabel =
    KOLAM_DARA_MARKET_INTEL_STATUS_FILTERS.find(
      item => item.id === controller.statusFilter,
    )?.label ?? 'Status';

  const openPanel = (
    panel: Exclude<ApprovalsFilterPanel, null>,
    triggerRef: React.RefObject<View | null>,
  ) => {
    if (activePanel === panel) {
      setActivePanel(null);
      return;
    }
    triggerRef.current?.measureInWindow((x, y, _w, h) => {
      toolbarRef.current?.measureInWindow((tx, ty) => {
        setPanelAnchor({top: y - ty + h + 4, left: Math.max(0, x - tx)});
        setActivePanel(panel);
      });
    });
  };

  const panelOptions =
    activePanel === 'brand'
      ? brandOptions
      : activePanel === 'status'
        ? KOLAM_DARA_MARKET_INTEL_STATUS_FILTERS.map(item => ({
            label: item.label,
            value: item.id,
          }))
        : [];

  return (
    <View style={styles.root}>
      <View ref={toolbarRef} collapsable={false} style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          {/* FE `dara-approvals-toolbar`: all controls flex-end. */}
          <View style={styles.toolbarEndRow}>
            {brandOptions.length > 1 ? (
              <View ref={brandTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={
                    activePanel === 'brand' || controller.brandId !== 'all'
                  }
                  label={brandLabel}
                  onPress={() => openPanel('brand', brandTriggerRef)}
                  open={activePanel === 'brand'}
                  variant="quiet"
                />
              </View>
            ) : null}
            <View ref={statusTriggerRef} collapsable={false}>
              <KolamTableFilterTrigger
                active={
                  activePanel === 'status' ||
                  controller.statusFilter !== 'all'
                }
                label={statusLabel}
                onPress={() => openPanel('status', statusTriggerRef)}
                open={activePanel === 'status'}
                variant="quiet"
              />
            </View>
            {canApprove ? (
              <KolamButton
                disabled={
                  controller.actionBusy ||
                  controller.selectedApprovableCount === 0
                }
                intent="primary"
                label={`Setujui (${controller.selectedApprovableCount})`}
                onPress={() => {
                  void controller.onBulkApprove();
                }}
              />
            ) : null}
          </View>
        </View>

        {activePanel && panelAnchor ? (
          <View
            style={[
              styles.filterOverlayPanel,
              {top: panelAnchor.top, left: panelAnchor.left},
            ]}>
            <ScrollView
              contentContainerStyle={styles.filterPanelContent}
              keyboardShouldPersistTaps="handled"
              style={styles.filterPanelScroll}>
              {panelOptions.map(option => {
                const selected =
                  activePanel === 'brand'
                    ? controller.brandId === option.value
                    : controller.statusFilter === option.value;
                return (
                  <KolamButton
                    intent={selected ? 'primary' : 'plain'}
                    key={option.value}
                    label={option.label}
                    onPress={() => {
                      if (activePanel === 'brand') {
                        controller.onSetBrandId(option.value);
                      } else {
                        controller.onSetStatusFilter(
                          option.value as KolamDaraMarketIntelStatusFilterId,
                        );
                      }
                      setActivePanel(null);
                    }}
                    style={styles.filterPanelOption}
                  />
                );
              })}
            </ScrollView>
            <View style={styles.filterPanelFooter}>
              <KolamButton
                label="Tutup"
                onPress={() => setActivePanel(null)}
              />
            </View>
          </View>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}>
        {controller.notice ? (
          <Text style={styles.notice}>{controller.notice}</Text>
        ) : null}
        {controller.error && !controller.pageItems.length ? (
          <KolamEmptyState message={controller.error} title="Gagal memuat" />
        ) : null}
        {controller.loading && !controller.list.length ? (
          <Text style={styles.meta}>Memuat…</Text>
        ) : null}

        <KolamListTableComposition
          columns={buildRecommendationColumns({
            canApprove,
            controller,
          })}
          emptyTitle="Tidak ada rekomendasi untuk filter ini."
          getRowKey={item => item.id}
          loading={controller.loading}
          pagination={
            controller.filteredTotal > 0
              ? {
                  onPageChange: controller.onPageChange,
                  page: controller.page,
                  pageSize: 10,
                  total: controller.filteredTotal,
                }
              : undefined
          }
          rows={controller.pageItems}
          style={styles.table}
        />
      </ScrollView>

      <DetailModal
        canApprove={canApprove}
        canViewMargin={canViewMargin}
        controller={controller}
      />
      <RejectModal controller={controller} />
    </View>
  );
}

function buildRecommendationColumns({
  canApprove,
  controller,
}: {
  canApprove: boolean;
  controller: KolamDaraMarketIntelApprovalsController;
}) {
  return [
    ...(canApprove
      ? [
          {
            align: 'center' as const,
            flex: 0.32,
            id: 'select',
            label: '',
            render: (item: KolamDaraMarketIntelRecommendation) => {
              const ready = isKolamDaraMarketIntelApprovable(item);
              const selected = controller.selectedIds.includes(item.id);
              return (
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{
                    checked: selected,
                    disabled: !ready,
                  }}
                  disabled={!ready}
                  onPress={() => controller.onToggleSelected(item.id)}
                  style={[
                    styles.check,
                    selected ? styles.checkOn : null,
                    !ready ? styles.checkDisabled : null,
                  ]}>
                  <Text style={styles.checkMark}>{selected ? '✓' : ''}</Text>
                </Pressable>
              );
            },
          },
        ]
      : []),
    {
      flex: 0.9,
      id: 'category',
      label: 'Kategori',
      render: (item: KolamDaraMarketIntelRecommendation) => (
        <Text style={styles.badge}>
          {formatKolamDaraMarketIntelCategory(item.category)}
        </Text>
      ),
    },
    {
      flex: 1.4,
      id: 'product',
      label: 'Produk',
      render: (item: KolamDaraMarketIntelRecommendation) => (
        <Text numberOfLines={2} style={[styles.td, styles.productName]}>
          {formatKolamDaraMarketIntelEntityName(item)}
        </Text>
      ),
    },
    {
      align: 'center' as const,
      flex: 0.9,
      id: 'status',
      label: 'Status',
      render: (item: KolamDaraMarketIntelRecommendation) => (
        <Text style={styles.td}>
          {formatKolamDaraMarketIntelRecStatus(item.status)}
        </Text>
      ),
    },
    {
      flex: 1.8,
      id: 'summary',
      label: 'Ringkasan',
      render: (item: KolamDaraMarketIntelRecommendation) => (
        <Text numberOfLines={2} style={styles.td}>
          {item.title}
        </Text>
      ),
    },
    {
      align: 'center' as const,
      flex: 0.8,
      id: 'action',
      label: 'Aksi',
      render: (item: KolamDaraMarketIntelRecommendation) => (
        <KolamButton
          label="Review"
          onPress={() => controller.onOpenDetail(item.id)}
        />
      ),
    },
  ];
}

function DetailModal({
  canApprove,
  canViewMargin,
  controller,
}: {
  canApprove: boolean;
  canViewMargin: boolean;
  controller: KolamDaraMarketIntelApprovalsController;
}) {
  const detail = controller.detail;
  if (!detail) {
    return (
      <Modal
        animationType="fade"
        onRequestClose={controller.onCloseDetail}
        transparent
        visible={controller.detailOpen}>
        <View style={styles.overlay}>
          <KolamModalBackdrop onPress={controller.onCloseDetail} />
        </View>
      </Modal>
    );
  }

  const metricLines =
    canViewMargin && detail.metrics
      ? buildKolamDaraMarketIntelMetricLines(detail.category, detail.metrics)
      : [];

  return (
    <Modal
      animationType="fade"
      onRequestClose={controller.onCloseDetail}
      transparent
      visible={controller.detailOpen}>
      <View style={styles.overlay}>
        <KolamModalBackdrop onPress={controller.onCloseDetail} />
        <View style={styles.dialog}>
          <Text style={styles.dialogTitle}>{detail.title}</Text>
          <ScrollView style={styles.dialogBody}>
            {detail.summary ? (
              <Text style={styles.summary}>{detail.summary}</Text>
            ) : null}
            {detail.daraMessage ? (
              <Text style={styles.message}>{detail.daraMessage}</Text>
            ) : null}
            {metricLines.length ? (
              <View style={styles.metricsBox}>
                {metricLines.map(line => (
                  <View key={line.label} style={styles.metricRow}>
                    <Text style={styles.metricLabel}>{line.label}</Text>
                    <Text style={styles.metricValue}>{line.value}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </ScrollView>
          <View style={styles.dialogActions}>
            {canApprove && isKolamDaraMarketIntelApprovable(detail) ? (
              <>
                <KolamButton
                  disabled={controller.actionBusy}
                  intent="primary"
                  label="Setujui"
                  onPress={() => {
                    void controller.onApproveDetail();
                  }}
                />
                <KolamButton
                  label="Tolak"
                  onPress={controller.onOpenReject}
                />
              </>
            ) : null}
            <KolamButton
              intent="secondary"
              label="Tutup"
              onPress={controller.onCloseDetail}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function RejectModal({
  controller,
}: {
  controller: KolamDaraMarketIntelApprovalsController;
}) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={controller.onCloseReject}
      transparent
      visible={controller.rejectOpen}>
      <View style={styles.overlay}>
        <KolamModalBackdrop onPress={controller.onCloseReject} />
        <View style={styles.rejectDialog}>
          <Text style={styles.dialogTitle}>Tolak rekomendasi</Text>
          <TextInput
            multiline
            onChangeText={controller.onSetRejectNote}
            placeholder="Alasan penolakan"
            placeholderTextColor={V.colors.mutedFg}
            style={styles.noteInput}
            value={controller.rejectNote}
          />
          <View style={styles.dialogActions}>
            <KolamButton
              disabled={controller.actionBusy}
              intent="danger"
              label="Tolak"
              onPress={() => {
                void controller.onConfirmReject();
              }}
            />
            <KolamCancelButton
              intent="secondary"
              onPress={controller.onCloseReject}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: 12,
  },
  toolbarWrap: {
    elevation: 1000,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
  },
  toolbarEndRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
    minHeight: 40,
    overflow: 'visible',
  },
  filterOverlayPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 1200,
    maxWidth: 280,
    padding: 6,
    position: 'absolute',
    shadowColor: V.colors.fg,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 16,
    width: 240,
    zIndex: 120000,
  },
  filterPanelScroll: {
    maxHeight: 280,
  },
  filterPanelContent: {
    gap: 4,
  },
  filterPanelOption: {
    justifyContent: 'flex-start',
  },
  filterPanelFooter: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    marginTop: 4,
    paddingTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 10,
    paddingBottom: 24,
  },
  notice: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  meta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  table: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHead: {
    alignItems: 'center',
    backgroundColor: V.colors.tableHeader,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  tableRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
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
    fontSize: 12,
  },
  colCheck: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
  },
  colCategory: {
    flex: 0.9,
    minWidth: 72,
  },
  colProduct: {
    flex: 1.4,
    minWidth: 100,
  },
  colStatus: {
    flex: 0.9,
    minWidth: 72,
  },
  colSummary: {
    flex: 1.8,
    minWidth: 120,
  },
  colAction: {
    alignItems: 'flex-end',
    flexShrink: 0,
    minWidth: 88,
  },
  productName: {
    fontWeight: '600',
  },
  badge: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  check: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 4,
    borderWidth: 1,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  checkOn: {
    backgroundColor: V.colors.primary,
    borderColor: V.colors.primary,
  },
  checkDisabled: {
    opacity: 0.4,
  },
  checkMark: {
    color: V.colors.primaryFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 12,
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-end',
    paddingTop: 4,
  },
  overlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    maxHeight: '85%',
    maxWidth: 640,
    padding: 16,
    width: '100%',
    zIndex: 2,
  },
  rejectDialog: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    maxWidth: 420,
    padding: 16,
    width: '100%',
    zIndex: 2,
  },
  dialogTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  dialogBody: {
    maxHeight: 360,
  },
  summary: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    marginBottom: 8,
  },
  message: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  metricsBox: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 12,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    minWidth: 120,
  },
  metricValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  dialogActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  noteInput: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    minHeight: 88,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlignVertical: 'top',
  },
});
