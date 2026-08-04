import React, {useMemo} from 'react';
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
} from '../domain/kolam-dara-seo';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraSeoApprovalsController} from '../hooks/use-kolam-dara-seo-approvals-controller';
import {KolamButton} from './kolam-button';
import {KolamDropdownSelect} from './kolam-dropdown-select';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamModalBackdrop} from './kolam-modal-backdrop';

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

  const statusOptions = useMemo(
    () =>
      KOLAM_DARA_SEO_STATUS_FILTERS.map(item => ({
        label: item.label,
        value: item.id,
      })),
    [],
  );

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}>
        <View style={styles.targetRow}>
          {KOLAM_DARA_SEO_TARGET_TABS.map(tab => (
            <KolamButton
              intent={controller.targetTab === tab.id ? 'primary' : 'outline'}
              key={tab.id}
              label={tab.label}
              onPress={() => controller.onSetTargetTab(tab.id)}
              size="sm"
            />
          ))}
        </View>

        <View style={styles.filterCard}>
          {brandOptions.length > 1 ? (
            <View style={styles.field}>
              <KolamDropdownSelect
                accessibilityLabel="Filter merek"
                label="Merek"
                onChange={controller.onSetBrandId}
                options={brandOptions}
                showLabelInTrigger
                value={controller.brandId}
              />
            </View>
          ) : null}
          <View style={styles.searchRow}>
            <TextInput
              accessibilityLabel="Cari nama"
              onChangeText={controller.onSetSearchInput}
              placeholder="Cari nama"
              placeholderTextColor={V.colors.mutedFg}
              style={styles.searchInput}
              value={controller.searchInput}
            />
            <KolamButton
              intent="primary"
              label="Cari"
              onPress={controller.onSearch}
              size="sm"
            />
          </View>
          <View style={styles.field}>
            <KolamDropdownSelect
              accessibilityLabel="Filter status"
              label="Status"
              onChange={value =>
                controller.onSetStatusFilter(value as KolamDaraSeoStatusFilterId)
              }
              options={statusOptions}
              showLabelInTrigger
              value={controller.statusFilter}
            />
          </View>
          <View style={styles.actionRow}>
            <KolamButton
              intent="outline"
              label="Reset filter"
              onPress={controller.onResetFilters}
              size="sm"
            />
            <KolamButton
              disabled={controller.loading}
              intent="outline"
              label={controller.loading ? 'Memuat…' : 'Refresh antrian'}
              onPress={() => {
                void controller.onRefresh();
              }}
              size="sm"
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
                size="sm"
              />
            ) : null}
          </View>
        </View>

        {controller.notice ? (
          <Text style={styles.notice}>{controller.notice}</Text>
        ) : null}
        {controller.error && !controller.pageItems.length ? (
          <KolamEmptyState message={controller.error} title="Gagal memuat" />
        ) : null}
        {controller.loading && !controller.list.length ? (
          <Text style={styles.meta}>Memuat…</Text>
        ) : null}

        {!controller.loading && controller.pageItems.length === 0 ? (
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

        {controller.filteredTotal > 0 ? (
          <View style={styles.pagination}>
            <KolamButton
              disabled={controller.page <= 1}
              intent="outline"
              label="Sebelumnya"
              onPress={() =>
                controller.onPageChange(Math.max(1, controller.page - 1))
              }
              size="sm"
            />
            <Text style={styles.meta}>
              {`${controller.page} / ${controller.totalPages} · ${controller.filteredTotal}`}
            </Text>
            <KolamButton
              disabled={controller.page >= controller.totalPages}
              intent="outline"
              label="Berikutnya"
              onPress={() =>
                controller.onPageChange(
                  Math.min(controller.totalPages, controller.page + 1),
                )
              }
              size="sm"
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
      <KolamButton intent="outline" label="Review" onPress={onOpen} size="sm" />
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
                size="sm"
              />
            ) : null}
            {canDraft && status === 'draft_ready' && detailPending ? (
              <KolamButton
                disabled={controller.actionBusy}
                intent="outline"
                label="Kirim approval"
                onPress={() => {
                  void controller.onSubmitDetail();
                }}
                size="sm"
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
                size="sm"
              />
            ) : null}
            {canApprove && isKolamDaraSeoRejectableStatus(status) ? (
              <KolamButton
                intent="outline"
                label="Tolak"
                onPress={controller.onOpenReject}
                size="sm"
              />
            ) : null}
            {canApprove &&
            (status === 'pending_approval' || status === 'draft_ready') ? (
              <KolamButton
                disabled={controller.actionBusy}
                intent="outline"
                label="Tunda"
                onPress={() => {
                  void controller.onDeferDetail();
                }}
                size="sm"
              />
            ) : null}
            {canApprove && (status === 'applied' || status === 'approved') ? (
              <KolamButton
                disabled={controller.actionBusy}
                intent="outline"
                label="Rollback"
                onPress={() => {
                  void controller.onRollbackDetail();
                }}
                size="sm"
              />
            ) : null}
            <KolamButton
              intent="secondary"
              label="Tutup"
              onPress={controller.onCloseDetail}
              size="sm"
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
            <KolamButton
              intent="secondary"
              label="Batal"
              onPress={controller.onCloseReject}
              size="sm"
            />
            <KolamButton
              disabled={controller.actionBusy || !controller.detail}
              intent="primary"
              label="Tolak"
              onPress={() => {
                void controller.onConfirmReject();
              }}
              size="sm"
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
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 24,
  },
  targetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  field: {
    maxWidth: 320,
  },
  searchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
