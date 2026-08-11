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
  KOLAM_DARA_SEO_STATUS_FILTERS,
  KOLAM_DARA_SEO_TARGET_TABS,
  KOLAM_DARA_SEO_APPROVALS_PAGE_SIZE,
  buildKolamDaraSeoEntityHref,
  formatKolamDaraSeoApplySuccessLabel,
  formatKolamDaraSeoSuggestionStatus,
  formatKolamDaraSeoSuggestionValue,
  formatKolamDaraSeoTargetBadge,
  formatKolamDaraSeoWorkflowHint,
  isKolamDaraSeoApprovableStatus,
  isKolamDaraSeoReadyToApply,
  isKolamDaraSeoRejectableStatus,
  resolveKolamDaraSeoTargetType,
  type KolamDaraSeoStatusFilterId,
  type KolamDaraSeoSuggestion,
  type KolamDaraSeoTargetTab,
} from '../domain/kolam-dara-seo';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraSeoApprovalsController} from '../hooks/use-kolam-dara-seo-approvals-controller';
import {KolamButton} from './kolam-button';
import {KolamCancelButton} from './kolam-cancel-button';
import {KolamResetButton} from './kolam-reset-button';
import {KolamEmptyState} from './kolam-empty-state';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import {KolamModalBackdrop} from './kolam-modal-backdrop';
import {KolamSearchField} from './kolam-search-field';
import {KolamTableFilterTrigger} from './kolam-table-filter-trigger';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';

type ApprovalsFilterPanel = 'brand' | 'status' | 'target' | null;

export function KolamDaraSeoApprovalsBody({
  canApprove,
  canDraft,
  controller,
  onRouteChange,
}: {
  canApprove: boolean;
  canDraft: boolean;
  controller: KolamDaraSeoApprovalsController;
  onRouteChange?: (route: string) => void;
}) {
  const toolbarRef = useRef<View>(null);
  const brandTriggerRef = useRef<View>(null);
  const statusTriggerRef = useRef<View>(null);
  const targetTriggerRef = useRef<View>(null);
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
    KOLAM_DARA_SEO_STATUS_FILTERS.find(
      item => item.id === controller.statusFilter,
    )?.label ?? 'Status';
  const targetLabel =
    KOLAM_DARA_SEO_TARGET_TABS.find(item => item.id === controller.targetTab)
      ?.label ?? 'Tipe';
  const tableColumns = useMemo<
    Array<KolamListTableColumn<KolamDaraSeoSuggestion>>
  >(
    () => [
      ...(canApprove
        ? [
            {
              align: 'center' as const,
              flex: 0.36,
              id: 'select',
              label: '',
              render: (item: KolamDaraSeoSuggestion) => {
                const ready = isKolamDaraSeoReadyToApply(item);
                const selected = controller.selectedIds.includes(item.id);
                return (
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{checked: selected, disabled: !ready}}
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
        flex: 0.72,
        id: 'target',
        label: 'Tipe',
        render: (item: KolamDaraSeoSuggestion) => (
          <Text style={styles.badge}>
            {formatKolamDaraSeoTargetBadge(resolveKolamDaraSeoTargetType(item))}
          </Text>
        ),
      },
      {
        flex: 1.8,
        id: 'title',
        label: 'Rekomendasi',
        render: (item: KolamDaraSeoSuggestion) => (
          <Text numberOfLines={2} style={styles.rowTitle}>
            {item.title}
          </Text>
        ),
      },
      {
        align: 'center' as const,
        flex: 0.62,
        id: 'status',
        label: 'Status',
        render: (item: KolamDaraSeoSuggestion) => (
          <Text numberOfLines={1} style={styles.tableCenterText}>
            {formatKolamDaraSeoSuggestionStatus(item.status)}
          </Text>
        ),
      },
      {
        align: 'center' as const,
        flex: 0.42,
        id: 'score',
        label: 'Skor',
        render: (item: KolamDaraSeoSuggestion) => (
          <Text style={styles.tableCenterStrong}>{item.seoScore}/100</Text>
        ),
      },
    ],
    [canApprove, controller],
  );

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
        ? KOLAM_DARA_SEO_STATUS_FILTERS.map(item => ({
            label: item.label,
            value: item.id,
          }))
        : activePanel === 'target'
          ? KOLAM_DARA_SEO_TARGET_TABS.map(item => ({
              label: item.label,
              value: item.id,
            }))
          : [];

  return (
    <View style={styles.root}>
      <View ref={toolbarRef} collapsable={false} style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <KolamSearchField
                containerStyle={kolamTableToolbarStyles.searchInput}
                onChangeText={controller.onSetSearchInput}
                placeholder="Cari"
                value={controller.searchInput}
              />
              <View ref={targetTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={
                    activePanel === 'target' || controller.targetTab !== 'all'
                  }
                  label={targetLabel}
                  onPress={() => openPanel('target', targetTriggerRef)}
                  open={activePanel === 'target'}
                  variant="quiet"
                />
              </View>
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
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              <KolamResetButton
                muted
                onPress={() => {
                  setActivePanel(null);
                  controller.onResetFilters();
                }}
              />
              {canApprove ? (
                <KolamButton
                  disabled={
                    controller.actionBusy ||
                    controller.selectedApprovableCount === 0
                  }
                  intent="primary"
                  label={`Terapkan terpilih (${controller.selectedApprovableCount})`}
                  onPress={() => {
                    void controller.onBulkApprove();
                  }}
                />
              ) : null}
            </View>
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
                    : activePanel === 'status'
                      ? controller.statusFilter === option.value
                      : controller.targetTab === option.value;
                return (
                  <KolamButton
                    intent={selected ? 'primary' : 'plain'}
                    key={option.value}
                    label={option.label}
                    onPress={() => {
                      if (activePanel === 'brand') {
                        controller.onSetBrandId(option.value);
                      } else if (activePanel === 'status') {
                        controller.onSetStatusFilter(
                          option.value as KolamDaraSeoStatusFilterId,
                        );
                      } else {
                        controller.onSetTargetTab(
                          option.value as KolamDaraSeoTargetTab,
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
          columns={tableColumns}
          emptyTitle="Tidak ada data untuk filter ini"
          getRowKey={item => item.id}
          loading={controller.loading}
          pagination={{
            onPageChange: controller.onPageChange,
            page: controller.page,
            pageSize: KOLAM_DARA_SEO_APPROVALS_PAGE_SIZE,
            total: controller.filteredTotal,
          }}
          renderActions={item => (
            <KolamButton
              label="Review"
              onPress={() => {
                void controller.onOpenDetail(item.id);
              }}
              size="sm"
              style={styles.reviewButton}
              textStyle={styles.reviewButtonText}
            />
          )}
          rows={controller.pageItems}
          showFooter={controller.filteredTotal > 0}
        />

        {false && !controller.loading && controller.pageItems.length === 0 ? (
          <KolamEmptyState title="Tidak ada data untuk filter ini" />
        ) : (
          <View style={styles.list}>
            {controller.pageItems.map(item => (
              <SuggestionRow
                canApprove={canApprove}
                item={item}
                key={item.id}
                onOpen={() => {
                  void controller.onOpenDetail(item.id);
                }}
                onToggle={() => controller.onToggleSelected(item.id)}
                selected={controller.selectedIds.includes(item.id)}
              />
            ))}
          </View>
        )}

        {false && controller.filteredTotal > 0 ? (
          <View style={styles.pagination}>
            <KolamButton
              disabled={controller.page <= 1}
              label="Sebelumnya"
              onPress={() =>
                controller.onPageChange(Math.max(1, controller.page - 1))
              }
            />
            <Text style={styles.meta}>
              {`${controller.page} / ${controller.totalPages} · ${controller.filteredTotal}`}
            </Text>
            <KolamButton
              disabled={controller.page >= controller.totalPages}
              label="Berikutnya"
              onPress={() =>
                controller.onPageChange(
                  Math.min(controller.totalPages, controller.page + 1),
                )
              }
            />
          </View>
        ) : null}
      </ScrollView>

      <DetailModal
        canApprove={canApprove}
        canDraft={canDraft}
        controller={controller}
        onRouteChange={onRouteChange}
      />
      <RejectModal controller={controller} />
    </View>
  );
}

function SuggestionRow({
  canApprove,
  item,
  onOpen,
  onToggle,
  selected,
}: {
  canApprove: boolean;
  item: KolamDaraSeoSuggestion;
  onOpen: () => void;
  onToggle: () => void;
  selected: boolean;
}) {
  const ready = isKolamDaraSeoReadyToApply(item);
  return (
    <View style={styles.row}>
      {canApprove ? (
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{checked: selected, disabled: !ready}}
          disabled={!ready}
          onPress={onToggle}
          style={[
            styles.check,
            selected ? styles.checkOn : null,
            !ready ? styles.checkDisabled : null,
          ]}>
          <Text style={styles.checkMark}>{selected ? '✓' : ''}</Text>
        </Pressable>
      ) : null}
      <View style={styles.rowBody}>
        <Text style={styles.badge}>
          {formatKolamDaraSeoTargetBadge(resolveKolamDaraSeoTargetType(item))}
        </Text>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.meta}>
          {`${formatKolamDaraSeoSuggestionStatus(item.status)} · skor ${item.seoScore}/100 · ${
            item.pendingItemCount > 0
              ? `${item.pendingItemCount} draft`
              : '—'
          }`}
        </Text>
      </View>
      <KolamButton label="Review" onPress={onOpen} />
    </View>
  );
}

function DetailModal({
  canApprove,
  canDraft,
  controller,
  onRouteChange,
}: {
  canApprove: boolean;
  canDraft: boolean;
  controller: KolamDaraSeoApprovalsController;
  onRouteChange?: (route: string) => void;
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

  const suggestion = detail.suggestion;
  const detailPending = detail.items.some(item => item.itemStatus === 'pending');
  const status = suggestion.status;
  const workflowHint = formatKolamDaraSeoWorkflowHint(status, {
    hasPendingItems: detailPending,
    canDraft,
    canApprove,
  });
  const entityHref = buildKolamDaraSeoEntityHref(suggestion);

  return (
    <Modal
      animationType="fade"
      onRequestClose={controller.onCloseDetail}
      transparent
      visible={controller.detailOpen}>
      <View style={styles.overlay}>
        <KolamModalBackdrop onPress={controller.onCloseDetail} />
        <View style={styles.dialog}>
          <Text style={styles.dialogTitle}>
            {`${formatKolamDaraSeoTargetBadge(resolveKolamDaraSeoTargetType(suggestion))} — ${suggestion.title}`}
          </Text>
          <Text style={styles.meta}>
            {`Skor ${suggestion.seoScore}/100 · ${formatKolamDaraSeoSuggestionStatus(status)}`}
          </Text>
          <ScrollView style={styles.dialogBody}>
            {workflowHint ? (
              <Text style={styles.hint}>{workflowHint}</Text>
            ) : null}
            {entityHref ? (
              <Pressable
                accessibilityRole="link"
                onPress={() => onRouteChange?.(entityHref)}>
                <Text style={styles.link}>
                  {`Buka halaman ${formatKolamDaraSeoApplySuccessLabel(
                    resolveKolamDaraSeoTargetType(suggestion),
                  )}`}
                </Text>
              </Pressable>
            ) : null}
            {detail.items.length === 0 ? (
              <Text style={styles.meta}>Belum ada draft perubahan dari AI.</Text>
            ) : (
              detail.items.map(item => (
                <View key={item.id} style={styles.itemCard}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <View style={styles.diffRow}>
                    <View style={styles.diffCol}>
                      <Text style={styles.diffHead}>Sebelum</Text>
                      <Text style={styles.diffValue}>
                        {formatKolamDaraSeoSuggestionValue(item.beforeValue)}
                      </Text>
                    </View>
                    <View style={styles.diffCol}>
                      <Text style={styles.diffHead}>Sesudah (AI)</Text>
                      <Text style={styles.diffValue}>
                        {formatKolamDaraSeoSuggestionValue(item.proposedValue)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
          <View style={styles.dialogActions}>
            {canDraft && !detailPending ? (
              <KolamButton
                disabled={controller.jobBusy || controller.actionBusy}
                intent="primary"
                label={controller.jobBusy ? 'Membuat draft…' : 'Buat draft SEO'}
                onPress={() => {
                  void controller.onRegenerateDraft();
                }}
              />
            ) : null}
            {canDraft && status === 'draft_ready' && detailPending ? (
              <KolamButton
                disabled={controller.actionBusy}
                label="Kirim approval"
                onPress={() => {
                  void controller.onSubmitDetail();
                }}
              />
            ) : null}
            {canApprove &&
            isKolamDaraSeoApprovableStatus(status) &&
            detailPending ? (
              <KolamButton
                disabled={controller.actionBusy}
                intent="primary"
                label="Approve & terapkan"
                onPress={() => {
                  void controller.onApproveDetail();
                }}
              />
            ) : null}
            {canApprove && isKolamDaraSeoRejectableStatus(status) ? (
              <KolamButton label="Tolak" onPress={controller.onOpenReject} />
            ) : null}
            {canApprove &&
            (status === 'pending_approval' || status === 'draft_ready') ? (
              <KolamButton
                disabled={controller.actionBusy}
                label="Tunda"
                onPress={() => {
                  void controller.onDeferDetail();
                }}
              />
            ) : null}
            {canApprove && (status === 'applied' || status === 'approved') ? (
              <KolamButton
                disabled={controller.actionBusy}
                label="Rollback"
                onPress={() => {
                  void controller.onRollbackDetail();
                }}
              />
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
  controller: KolamDaraSeoApprovalsController;
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
          <Text style={styles.dialogTitle}>Tolak saran SEO</Text>
          <Text style={styles.meta}>Alasan (opsional)</Text>
          <TextInput
            accessibilityLabel="Alasan tolak"
            multiline
            onChangeText={controller.onSetRejectNote}
            placeholderTextColor={V.colors.mutedFg}
            style={styles.rejectInput}
            value={controller.rejectNote}
          />
          <View style={styles.dialogActions}>
            <KolamCancelButton
              intent="secondary"
              onPress={controller.onCloseReject}
            />
            <KolamButton
              disabled={controller.actionBusy || !controller.detail}
              intent="primary"
              label="Tolak"
              onPress={() => {
                void controller.onConfirmReject();
              }}
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
    gap: 12,
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
  tableCenterText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    textAlign: 'center',
    width: '100%',
  },
  tableCenterStrong: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },
  reviewButton: {
    minHeight: 28,
    minWidth: 0,
    paddingHorizontal: 8,
  },
  reviewButtonText: {
    fontSize: 11,
  },
  list: {
    gap: 8,
  },
  row: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  check: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 4,
    borderWidth: 1,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  checkOn: {
    backgroundColor: V.colors.primary,
    borderColor: V.colors.primary,
  },
  checkDisabled: {
    opacity: 0.35,
  },
  checkMark: {
    color: V.colors.bg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  badge: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
  },
  rowTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-start',
  },
  overlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  dialog: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    maxHeight: '86%',
    maxWidth: 720,
    padding: 16,
    width: '92%',
  },
  rejectDialog: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    maxWidth: 420,
    padding: 16,
    width: '86%',
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
  hint: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
    padding: 10,
  },
  link: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 12,
    marginBottom: 8,
    textDecorationLine: 'underline',
  },
  itemCard: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    marginBottom: 8,
    padding: 10,
  },
  itemLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  diffRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  diffCol: {
    flex: 1,
    gap: 4,
    minWidth: 140,
  },
  diffHead: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  diffValue: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    maxHeight: 96,
    padding: 8,
  },
  dialogActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  rejectInput: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    minHeight: 88,
    padding: 10,
    textAlignVertical: 'top',
  },
});
