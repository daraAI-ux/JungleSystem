import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  formatKolamTaskListDatetime,
  getKolamTaskChecklistProgress,
  getKolamTaskCategoryBucketLabel,
  getKolamTaskDueCountdownLabel,
  getKolamTaskPriorityBadgeIntent,
  getKolamTaskPriorityLabel,
  getKolamTaskResolutionDuration,
  getKolamTaskRefId,
  getKolamTaskStatusBadgeIntent,
  getKolamTaskStatusLabel,
  getKolamTaskStatusOptionsForUser,
  getKolamTaskTimelineLabel,
  getKolamTaskUserDisplayName,
  canPostKolamTaskDiscussion,
  hasOpenKolamTaskChecklistItems,
  isKolamTaskOverdue,
  resolveKolamTaskCompletedAt,
  KOLAM_TASK_CATEGORY_BUCKET_OPTIONS,
  KOLAM_TASK_PRIORITY_OPTIONS,
  KOLAM_TASK_STATUS_OPTIONS,
  type KolamTaskCategoryBucket,
  type KolamTaskManagerTask,
} from '../domain/kolam-task-manager';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamTaskManagerController,
  type KolamTaskManagerController,
} from '../hooks/use-kolam-task-manager-controller';
import { getKolamFileUrl } from '../lib/file-url';
import { formatRupiah } from '../lib/money';
import { KolamButton } from './kolam-button';
import { KolamDetailSummaryCard } from './kolam-detail-summary-card';
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamResetButton } from './kolam-reset-button';
import { KolamDateField } from './kolam-date-field';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamHtmlContent } from './kolam-html-content';
import { KolamHoverTooltip } from './kolam-hover-tooltip';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import { openKolamMediaPreview } from './kolam-media-preview-dialog';
import { KolamModalBackdrop } from './kolam-modal-backdrop';
import { KolamOverdueTaskIcon } from './kolam-overdue-task-icon';
import { KolamProfileAvatarContent } from './kolam-profile-avatar-content';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamSearchField } from './kolam-search-field';
import { KolamSelesaiTaskIcon } from './kolam-selesai-task-icon';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { KolamProsesTaskIcon } from './kolam-proses-task-icon';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamSwitch } from './kolam-switch';
import {
  measureFilterPanelAnchor,
  type KolamFilterPanelAnchor,
} from './kolam-filter-panel-anchor';
import { KolamTableFilterTrigger } from './kolam-table-filter-trigger';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';
import { KolamTipTapRichTextEditor } from './kolam-tiptap-rich-text-editor';
import { KolamTodoTaskIcon } from './kolam-todo-task-icon';
import { KolamTotalTaskIcon } from './kolam-total-task-icon';

const LIST_COLUMNS = [
  { id: 'primary', label: 'Tugas', align: 'left', flex: 2.3 },
  { id: 'meta', label: 'PIC', align: 'center', flex: 0.62 },
  { id: 'children', label: 'Asisten', align: 'center', flex: 0.68 },
  { id: 'status', label: 'Status', align: 'center', flex: 1.38 },
  { id: 'notes', label: 'Prioritas', align: 'center', flex: 1.28 },
  { id: 'marketplace', label: 'Countdown', align: 'center', flex: 1.05 },
  { id: 'amount', label: 'Due', align: 'center', flex: 1 },
] as const;

type TaskListColumnId = (typeof LIST_COLUMNS)[number]['id'];
const RECURRING_SCHEDULE_COLUMNS = [
  { id: 'schedule', label: 'Jadwal', align: 'left', flex: 2 },
  { id: 'kind', label: 'Tipe', align: 'center', flex: 0.9 },
  { id: 'category', label: 'Kategori', align: 'center', flex: 1.1 },
  { id: 'status', label: 'Status', align: 'center', flex: 0.9 },
  { id: 'pic', label: 'PIC', align: 'center', flex: 1 },
  { id: 'time', label: 'Waktu', align: 'center', flex: 1.35 },
  { id: 'customer', label: 'Pelanggan', align: 'center', flex: 1.1 },
] as const;

type RecurringScheduleColumnId =
  (typeof RECURRING_SCHEDULE_COLUMNS)[number]['id'];
const TASK_FILTER_PANEL_WIDTH = 180;
type TaskToolbarFilterPanel =
  | 'bucket'
  | 'category'
  | 'pic'
  | 'project'
  | 'status'
  | 'priority'
  | null;

const TASK_TYPE_BUCKET_OPTIONS: Array<{
  id: KolamTaskCategoryBucket;
  label: string;
}> = KOLAM_TASK_CATEGORY_BUCKET_OPTIONS.filter(
  (option): option is { id: KolamTaskCategoryBucket; label: string } =>
    option.id !== 'all',
);

export function KolamTaskManagerSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamTaskManagerController({ onRouteChange, route });
  const settingsBlocked =
    Boolean(controller.currentUserId) &&
    !controller.isTaskAdmin &&
    (controller.mode === 'categories' || controller.mode === 'task-types');
  const accessBlocked =
    Boolean(controller.currentUserId) &&
    !controller.canAccess &&
    controller.mode !== 'categories' &&
    controller.mode !== 'task-types';

  if (settingsBlocked) {
    return null;
  }

  if (accessBlocked) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState message="Tidak ada akses" title="Akses ditolak" />
      </View>
    );
  }

  return (
    <View style={styles.surface}>
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
          style={styles.messageBadge}
        />
      ) : null}
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
          style={styles.messageBadge}
        />
      ) : null}
      {controller.mode === 'recurring' ? (
        <KolamTaskRecurringPanel
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : controller.mode === 'list' ? (
        <KolamTaskManagerList
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : controller.mode === 'detail' ? (
        <KolamTaskManagerDetail
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : controller.mode === 'categories' ? (
        <KolamTaskCategorySettingsPanel controller={controller} />
      ) : controller.mode === 'task-types' ? (
        <KolamTaskTypeSettingsPanel controller={controller} />
      ) : (
        <KolamTaskManagerPlaceholder mode={controller.mode} />
      )}
      <KolamTaskFormModal controller={controller} />
      <KolamTaskCategoryFormModal controller={controller} />
      <KolamTaskRecurringBulkEnrollmentModal controller={controller} />
      <KolamTaskRecurringTemplateFormModal controller={controller} />
      <KolamTaskTypeFormModal controller={controller} />
      <KolamTaskOvertimeRequestModal controller={controller} />
      <KolamTaskDeleteConfirmModal controller={controller} />
      <KolamTaskTypeDeleteConfirmModal controller={controller} />
    </View>
  );
}

function KolamTaskManagerDetail({
  controller,
  onRouteChange,
}: {
  controller: KolamTaskManagerController;
  onRouteChange?: (route: string) => void;
}) {
  const task = controller.selectedTask;
  if (controller.loading && !task) {
    return <KolamEmptyState message="Memuat tugas..." title="Detail tugas" />;
  }
  if (!task) {
    return <KolamEmptyState message="Tugas tidak ditemukan" title="Detail tugas" />;
  }

  const checklistProgress = getKolamTaskChecklistProgress(task);
  const completedAt = resolveKolamTaskCompletedAt(task);
  const isCreator =
    Boolean(controller.currentUserId) &&
    getKolamTaskRefId(task.createdBy) === controller.currentUserId;
  const showChecklistDoneWarning =
    checklistProgress &&
    checklistProgress.done < checklistProgress.total &&
    (controller.isTaskAdmin || isCreator);
  const statusOptions = getKolamTaskStatusOptionsForUser({
    currentUserId: controller.currentUserId,
    isTaskAdmin: controller.isTaskAdmin,
    task,
  });
  const statusDisabled =
    task.status === 'done' ||
    task.status === 'cancelled' ||
    controller.mutatingTaskId === task.id ||
    statusOptions.length === 0;
  const discussionMessages = [...task.discussion].sort(
    (left, right) =>
      new Date(left.createdAt || 0).getTime() -
      new Date(right.createdAt || 0).getTime(),
  );
  const timeline = [...task.timeline]
    .filter(item => item.meta?.source !== 'description')
    .sort(
      (left, right) =>
        new Date(right.at || 0).getTime() - new Date(left.at || 0).getTime(),
    );
  const relatedLinks = getTaskRelatedLinks(task);
  const canRequestOvertime = isTaskOvertimeRequestVisible(controller, task);
  const canPostDiscussion = canPostKolamTaskDiscussion(
    task,
    controller.currentUserId,
    controller.isTaskAdmin,
  );
  const canEditChecklist = canPostDiscussion;
  const checklistAssigneeOptions = [
    { label: 'Tanpa PIC', value: '' },
    ...controller.staffOptions.map(option => ({
      label: option.label,
      value: option.id,
    })),
  ];
  const mentionOptions = getTaskMentionOptions(controller);

  return (
    <View style={styles.detailStack}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.detailContext}>
              {task.title || 'Detail tugas'}
            </Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton label="Daftar" onPress={controller.onBackToList} />
            {controller.isTaskAdmin ? (
              <KolamButton
                disabled={controller.mutatingTaskId === task.id}
                label="Ubah"
                onPress={() => controller.onEditTask(task)}
              />
            ) : null}
            {canRequestOvertime ? (
              <KolamButton
                disabled={controller.mutatingTaskId === `overtime:${task.id}`}
                intent="outline"
                label="Ajukan lembur"
                onPress={() => controller.onOpenOvertimeRequest(task)}
              />
            ) : null}
            {controller.isTaskAdmin ? (
              <KolamButton
                disabled={controller.mutatingTaskId === `delete:${task.id}`}
                intent="outline"
                label="Hapus"
                onPress={() => controller.onRequestDeleteTask(task)}
              />
            ) : null}
            <KolamRefreshButton
              accessibilityLabel="Refresh"
              disabled={controller.loading}

              onPress={() => {
                void controller.onRefresh();
              }}
            />
          </View>
        </View>
      </View>

      <View style={styles.detailHeader}>
        <View style={styles.detailTitleBlock}>
          <View style={styles.titleRow}>
            {showKolamTaskUrgentMarker(task) ? (
              <Text style={styles.urgent}>!</Text>
            ) : null}
            <Text style={styles.detailTitle}>{task.title || '-'}</Text>
          </View>
          <View style={styles.badgeRow}>
            <KolamStatusBadge
              intent={getKolamTaskStatusBadgeIntent(task.status)}
              label={getKolamTaskStatusLabel(task.status)}
            />
            <KolamStatusBadge
              intent={getKolamTaskPriorityBadgeIntent(task.priority)}
              label={getKolamTaskPriorityLabel(task.priority)}
            />
            {task.categoryBucket ? (
              <KolamStatusBadge
                intent="muted"
                label={getKolamTaskCategoryBucketLabel(task.categoryBucket)}
              />
            ) : null}
            <KolamTaskSourceBadge source={task.source} />
            {getTaskTypeLabel(task) !== '-' ? (
              <KolamStatusBadge intent="info" label={getTaskTypeLabel(task)} />
            ) : null}
          </View>
        </View>
        {statusDisabled ? null : (
          <KolamDropdownSelect
            label="Status"
            onChange={value => {
              void controller.onSetTaskStatus(task, value as typeof task.status);
            }}
            options={statusOptions.map(option => ({
              label: option.label,
              value: option.id,
            }))}
            showLabelInTrigger={false}
            value={task.status}
          />
        )}
      </View>

      <KolamDetailSummaryCard
        fields={[
          {
            id: 'pic',
            label: 'PIC',
            value: getKolamTaskUserDisplayName(task.assignedTo),
          },
          {
            id: 'assistedBy',
            label: 'Dibantu',
            value: getKolamTaskUserDisplayName(task.assistedBy),
          },
          {
            id: 'taskType',
            label: 'Tipe task',
            value: getTaskTypeLabel(task),
          },
          {
            id: 'createdAt',
            label: 'Dibuat',
            value: formatKolamTaskListDatetime(task.createdAt),
          },
          {
            id: 'dueDate',
            label: 'Due',
            value: formatKolamTaskListDatetime(task.dueDate),
          },
          {
            id: 'countdown',
            label: 'Countdown',
            value: getKolamTaskDueCountdownLabel(task),
          },
          {
            id: 'completedAt',
            label: 'Diselesaikan',
            value: completedAt ? formatKolamTaskListDatetime(completedAt) : '-',
          },
          {
            id: 'duration',
            label: 'Durasi',
            value: getKolamTaskResolutionDuration(task),
          },
          {
            id: 'checklist',
            label: 'Checklist',
            value: checklistProgress
              ? `${checklistProgress.done}/${checklistProgress.total}`
              : '-',
          },
        ]}
        title="Ringkasan tugas"
      />

      {controller.crmContext?.customer ? (
        <View style={styles.detailCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>CRM</Text>
            <KolamStatusBadge
              intent="info"
              label={`${controller.crmContext.metrics.totalOrders} paid`}
            />
          </View>
          <Text style={styles.cellText}>{controller.crmContext.customer.name}</Text>
          <Text style={styles.metaText}>
            {formatRupiah(controller.crmContext.metrics.totalSpend)}
          </Text>
          {controller.crmContext.recentOrders.length ? (
            <View style={styles.crmOrderStack}>
              {controller.crmContext.recentOrders.slice(0, 3).map(order => (
                <View key={order.id || order.invoiceCode} style={styles.crmOrderRow}>
                  <Text style={styles.cellText}>
                    {order.invoiceCode || order.id || '-'}
                  </Text>
                  <Text style={styles.metaText}>
                    {formatRupiah(order.finalTotal)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {task.categoryBucket === 'crm' && controller.ratingSummary ? (
        <View style={styles.detailCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Rating</Text>
            <KolamStatusBadge
              intent={
                controller.ratingSummary.totalRatings > 0 ? 'success' : 'muted'
              }
              label={`${controller.ratingSummary.totalRatings} rating`}
            />
          </View>
          {controller.ratingSummary.totalRatings > 0 ? (
            <View style={styles.ratingSummaryRow}>
              <Text style={styles.ratingScore}>
                {controller.ratingSummary.averageRating.toFixed(1)}
              </Text>
              <Text style={styles.metaText}>
                {formatTaskRatingStars(controller.ratingSummary.averageRating)}
              </Text>
            </View>
          ) : (
            <Text style={styles.metaText}>Belum ada rating</Text>
          )}
        </View>
      ) : null}

      {relatedLinks.length ? (
        <View style={styles.relatedChipRow}>
          {relatedLinks.map(link => (
            <KolamButton
              intent="outline"
              key={link.route}
              label={link.label}
              onPress={() => onRouteChange?.(link.route)}
            />
          ))}
        </View>
      ) : null}

      {task.description ? (
        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Deskripsi</Text>
          <KolamHtmlContent html={task.description} />
        </View>
      ) : null}

      <View style={styles.detailCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Checklist</Text>
          {checklistProgress ? (
            <Text style={styles.metaText}>
              {checklistProgress.done}/{checklistProgress.total}
            </Text>
          ) : null}
        </View>
        {showChecklistDoneWarning ? (
          <KolamStatusBadge
            intent={
              hasOpenKolamTaskChecklistItems(task) && !task.projectId
                ? 'warning'
                : 'muted'
            }
            label="Checklist belum 100%"
          />
        ) : null}
        {task.checklist.length ? (
          task.checklist.map((item, index) => (
            <View key={item.id || item.title} style={styles.checklistRow}>
              <KolamButton
                disabled={
                  !canEditChecklist ||
                  controller.mutatingTaskId === `checklist:${task.id}`
                }
                intent={item.done ? 'primary' : 'outline'}
                label={item.done ? 'Selesai' : 'Open'}
                onPress={() => {
                  void controller.onToggleChecklistItem(index);
                }}
              />
              <Text style={styles.cellText}>{item.title}</Text>
              {getKolamTaskUserDisplayName(item.assignedTo) !== '-' ? (
                <Text style={styles.metaText}>
                  {getKolamTaskUserDisplayName(item.assignedTo)}
                </Text>
              ) : null}
              {canEditChecklist ? (
                <KolamDropdownSelect
                  label="PIC"
                  onChange={assignedToId => {
                    void controller.onAssignChecklistItem(index, assignedToId);
                  }}
                  options={checklistAssigneeOptions}
                  searchable
                  showLabelInTrigger={false}
                  triggerStyle={styles.checklistAssigneeSelect}
                  value={getKolamTaskRefId(item.assignedTo)}
                />
              ) : null}
              {canEditChecklist ? (
                <KolamButton
                  disabled={controller.mutatingTaskId === `checklist:${task.id}`}
                  intent="outline"
                  label="Hapus"
                  onPress={() => {
                    void controller.onRemoveChecklistItem(index);
                  }}
                />
              ) : null}
            </View>
          ))
        ) : (
          <Text style={styles.metaText}>Kosong</Text>
        )}
        {canEditChecklist ? (
          <View style={styles.checklistAddRow}>
            <KolamFormTextField
              onChangeText={controller.onSetChecklistDraft}
              placeholder="Detail tugas"
              style={[
                settingsWebFormStyles.settingsWebFormFieldValue,
                styles.checklistDraftInput,
              ]}
              value={controller.checklistDraft}
            />
            <KolamButton
              disabled={
                controller.mutatingTaskId === `checklist:${task.id}` ||
                !controller.checklistDraft.trim()
              }
              label="Tambah"
              onPress={() => {
                void controller.onAddChecklistItem();
              }}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Diskusi</Text>
        {discussionMessages.length ? (
          discussionMessages.map(message => (
            <View
              key={message.id || `${message.sender}-${message.createdAt}`}
              style={styles.discussionRow}
            >
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.timelineTitle}>
                  {getKolamTaskUserDisplayName(message.sender)}
                </Text>
                <Text style={styles.metaText}>
                  {formatKolamTaskListDatetime(message.createdAt)}
                </Text>
              </View>
              <KolamHtmlContent html={message.message} />
              {message.attachments.length ? (
                <View style={styles.attachmentRow}>
                  {message.attachments.map(attachment => (
                    <KolamTaskDiscussionAttachmentPreview
                      attachment={attachment}
                      key={
                        attachment.path || attachment.fileName || attachment.mimeType
                      }
                    />
                  ))}
                </View>
              ) : null}
            </View>
          ))
        ) : (
          <Text style={styles.metaText}>Belum ada diskusi.</Text>
        )}
        {canPostDiscussion ? (
          <>
            {controller.discussionAttachments.length ? (
              <View style={styles.attachmentRow}>
                {controller.discussionAttachments.map((file, index) => (
                  <Pressable
                    key={`${file.uri || file.path || file.name}-${index}`}
                    onPress={() => controller.onRemoveDiscussionAttachment(index)}
                  >
                    <KolamStatusBadge
                      intent="muted"
                      label={getDiscussionAttachmentLabel(file)}
                    />
                  </Pressable>
                ))}
              </View>
            ) : null}
            <View style={styles.noteAddRow}>
              <KolamTipTapRichTextEditor
                mentionOptions={mentionOptions}
                onChangeText={controller.onSetDiscussionDraft}
                placeholder="Tulis diskusi... Ketik @ untuk tag user."
                value={controller.discussionDraft}
              />
              <View style={styles.discussionActionStack}>
                <View style={styles.attachmentRow}>
                  <KolamButton
                    disabled={
                      controller.mutatingTaskId === `discussion:${task.id}` ||
                      controller.discussionAttachments.length >= 8
                    }
                    intent="outline"
                    label="Gambar"
                    onPress={() => {
                      void controller.onPickDiscussionImage();
                    }}
                  />
                  <KolamButton
                    disabled={
                      controller.mutatingTaskId === `discussion:${task.id}` ||
                      controller.discussionAttachments.length >= 8
                    }
                    intent="outline"
                    label="Video"
                    onPress={() => {
                      void controller.onPickDiscussionVideo();
                    }}
                  />
                </View>
                <KolamButton
                  disabled={
                    controller.mutatingTaskId === `discussion:${task.id}` ||
                    (!stripTaskHtmlText(controller.discussionDraft) &&
                      controller.discussionAttachments.length === 0)
                  }
                  label="Kirim"
                  onPress={() => {
                    void controller.onAddDiscussion();
                  }}
                />
              </View>
            </View>
          </>
        ) : null}
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        {canPostDiscussion ? (
          <View style={styles.noteAddRow}>
            <KolamFormTextField
              multiline
              onChangeText={controller.onSetNoteDraft}
              placeholder="Catatan"
              style={[
                settingsWebFormStyles.settingsWebFormFieldValue,
                settingsWebFormStyles.settingsWebFormFieldValueTextarea,
                styles.noteDraftInput,
              ]}
              value={controller.noteDraft}
            />
            <KolamButton
              disabled={
                controller.mutatingTaskId === `note:${task.id}` ||
                !controller.noteDraft.trim()
              }
              label="Kirim"
              onPress={() => {
                void controller.onAddNote();
              }}
            />
          </View>
        ) : null}
        {timeline.length ? (
          timeline.map(item => (
            <View key={item.id || `${item.type}-${item.at}`} style={styles.timelineRow}>
              <Text style={styles.timelineTitle}>
                {getKolamTaskTimelineLabel(item.type)}
              </Text>
              {item.message ? (
                <Text style={styles.timelineMessage}>{item.message}</Text>
              ) : null}
              <Text style={styles.metaText}>
                {formatKolamTaskListDatetime(item.at)} -{' '}
                {getKolamTaskUserDisplayName(item.by)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.metaText}>Kosong</Text>
        )}
      </View>
    </View>
  );
}

function KolamTaskDetailMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailMetric}>
      <Text style={styles.metaText}>{label}</Text>
      <Text numberOfLines={2} style={styles.cellText}>
        {value}
      </Text>
    </View>
  );
}

function getTaskTypeLabel(task: KolamTaskManagerTask) {
  if (!task.taskType) return '-';
  if (typeof task.taskType === 'string') return task.taskType || '-';
  return task.taskType.name || task.taskType.key || task.taskType.id || '-';
}

function showKolamTaskUrgentMarker(task: KolamTaskManagerTask) {
  return task.urgent && task.status !== 'done' && task.status !== 'cancelled';
}

function KolamTaskSourceBadge({
  source,
}: {
  source: KolamTaskManagerTask['source'];
}) {
  if (source === 'inbox_follow_up') {
    return <KolamStatusBadge intent="info" label="Inbox" />;
  }
  if (source === 'recurring') {
    return <KolamStatusBadge intent="muted" label="Berulang" />;
  }
  return null;
}

function isTaskOvertimeRequestVisible(
  controller: KolamTaskManagerController,
  task: KolamTaskManagerTask,
) {
  const eligibility = controller.overtimeEligibilityByTaskId[task.id];
  return Boolean(eligibility?.eligible && !eligibility.hasActiveRequest);
}

function stripTaskHtmlText(value: string) {
  return value.replace(/<[^>]+>/g, '').trim();
}

function getDiscussionAttachmentLabel(
  file: KolamTaskManagerController['discussionAttachments'][number],
) {
  return (
    file.name ||
    file.path?.split(/[\\/]/).pop() ||
    file.uri?.split('/').pop() ||
    'File'
  );
}

function KolamTaskDiscussionAttachmentPreview({
  attachment,
}: {
  attachment: KolamTaskManagerTask['discussion'][number]['attachments'][number];
}) {
  const label = attachment.fileName || attachment.path || attachment.type;
  const uri = getKolamFileUrl(attachment.path);

  if (attachment.type === 'image' && uri) {
    return (
      <KolamRemoteImage
        accessibilityLabel={label || 'Lampiran'}
        previewItems={[
          {
            revision: uri,
            scope: 'task-discussion-attachment',
            title: label || 'Lampiran',
            uri,
          },
        ]}
        resizeMode="cover"
        revision={uri}
        scope="task-discussion-attachment"
        sourceUri={uri}
        style={styles.discussionAttachmentImage}
      />
    );
  }

  if (attachment.type === 'video' && uri) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() =>
          openKolamMediaPreview({
            kind: 'video',
            title: label || 'Video',
            uri,
          })
        }
        style={styles.discussionAttachmentVideo}
      >
        <Text style={styles.discussionAttachmentVideoText}>Video</Text>
      </Pressable>
    );
  }

  return <KolamStatusBadge intent="muted" label={label || 'Lampiran'} />;
}

function getTaskMentionOptions(controller: KolamTaskManagerController) {
  return controller.staffOptions.map(option => ({
    id: option.id,
    label: option.label,
  }));
}

function getTaskRelatedLinks(task: KolamTaskManagerTask) {
  const links: Array<{ label: string; route: string }> = [];
  if (task.enclosureId) {
    links.push({
      label: `Kandang ${task.enclosure?.code || task.enclosure?.name || task.enclosureId}`,
      route: `/enclosures/${task.enclosureId}`,
    });
  }
  if (task.serviceId) {
    links.push({
      label: `Layanan ${task.service?.name || task.service?.sku || task.serviceId}`,
      route: `/service/${task.serviceId}`,
    });
  }
  if (task.productionId) {
    links.push({
      label: `Produksi ${task.production?.code || task.productionId}`,
      route: `/production/${task.productionId}`,
    });
  }
  if (task.conversationId) {
    links.push({
      label: 'Chat Inbox',
      route: `/inbox/${task.conversationId}`,
    });
  }
  if (task.projectId) {
    links.push({
      label: `Project ${task.project?.quotationNumber || task.projectId}`,
      route: `/proyek/${encodeURIComponent(
        task.project?.quotationNumber || task.projectId,
      )}`,
    });
  }
  if (task.saleId) {
    links.push({
      label: `Sale ${task.sale?.invoiceCode || task.saleId}`,
      route: `/sales/${task.saleId}`,
    });
  }
  if (task.complaintId) {
    links.push({
      label: task.complaint?.ticketCode || 'Complaint',
      route: `/complaints/${task.complaintId}`,
    });
  }
  if (task.customerId) {
    links.push({
      label: task.customer?.name || 'Customer',
      route: `/customers/${task.customerId}`,
    });
  }
  return links;
}

function formatTaskRatingStars(value: number) {
  const rounded = Math.round(Math.max(0, Math.min(5, value)));
  return `${rounded}/5`;
}

function KolamTaskManagerTabs({
  controller,
}: {
  controller: KolamTaskManagerController;
}) {
  return (
    <View style={styles.tabRow}>
      <KolamButton
        intent={controller.mode === 'recurring' ? 'outline' : 'primary'}
        label="Tugas"
        onPress={() => controller.onSwitchTab('tasks')}
      />
      <KolamButton
        intent={controller.mode === 'recurring' ? 'primary' : 'outline'}
        label="Tugas Terjadwal"
        onPress={() => controller.onSwitchTab('recurring')}
      />
    </View>
  );
}

function KolamTaskManagerList({
  controller,
  onRouteChange,
}: {
  controller: KolamTaskManagerController;
  onRouteChange?: (route: string) => void;
}) {
  const columns = React.useMemo(
    () => createTaskListColumns(controller, onRouteChange),
    [controller, onRouteChange],
  );

  return (
    <View style={styles.stack}>
      <KolamTaskKpiRow controller={controller} />
      <KolamTaskToolbar controller={controller} />
      <KolamListTableComposition
        actionsColumn
        columns={columns}
        emptyTitle={
          controller.loading && controller.tasks.length === 0
            ? 'Memuat tugas...'
            : 'Tugas kosong'
        }
        getRowKey={task => task.id}
        loading={controller.loading}
        pagination={{
          onPageChange: controller.onSelectPage,
          page: controller.page,
          pageSize: controller.pageSize,
          total: controller.total,
        }}
        renderActions={task =>
          renderTaskListActions(task, controller, onRouteChange)
        }
        rows={controller.tasks}
        style={styles.taskListTable}
      />
    </View>
  );
}

function KolamTaskKpiRow({
  controller,
}: {
  controller: KolamTaskManagerController;
}) {
  const cards = [
    {
      id: 'todo',
      iconElement: <KolamTodoTaskIcon style={styles.kpiCardIcon} />,
      label: 'To Do',
      value: controller.kpi.todo,
      tone: 'warning',
    },
    {
      id: 'progress',
      iconElement: <KolamProsesTaskIcon style={styles.kpiCardIcon} />,
      label: 'Sedang berjalan',
      value: controller.kpi.inProgress,
      tone: 'info',
    },
    {
      id: 'done',
      iconElement: <KolamSelesaiTaskIcon style={styles.kpiCardIcon} />,
      label: 'Selesai',
      value: controller.kpi.done,
      tone: 'success',
    },
    {
      id: 'overdue',
      iconElement: <KolamOverdueTaskIcon style={styles.kpiCardIcon} />,
      label: 'Overdue',
      value: controller.kpi.overdue,
      tone: 'danger',
    },
    {
      id: 'total',
      iconElement: <KolamTotalTaskIcon style={styles.kpiCardIcon} />,
      label: 'Total',
      value: controller.kpi.total,
      tone: 'muted',
    },
  ] as const;

  return (
    <View style={styles.kpiRow}>
      {cards.map(card => (
        <View key={card.id} style={styles.kpiCard}>
          <View style={[styles.kpiAccent, getTaskKpiAccentStyle(card.tone)]} />
          <View style={[styles.kpiBody, 'iconElement' in card && styles.kpiBodyWithIcon]}>
            <Text numberOfLines={1} style={styles.kpiLabel}>
              {card.label}
            </Text>
            <Text numberOfLines={1} style={styles.kpiValue}>
              {card.value}
            </Text>
          </View>
          {'iconElement' in card ? (
            <View style={styles.kpiIconShell}>{card.iconElement}</View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function getTaskKpiAccentStyle(
  tone: 'danger' | 'info' | 'muted' | 'success' | 'warning',
) {
  switch (tone) {
    case 'danger':
      return styles.kpiAccentDanger;
    case 'info':
      return styles.kpiAccentInfo;
    case 'muted':
      return styles.kpiAccentMuted;
    case 'success':
      return styles.kpiAccentSuccess;
    case 'warning':
      return styles.kpiAccentWarning;
  }
}

function KolamTaskToolbar({
  controller,
}: {
  controller: KolamTaskManagerController;
}) {
  const toolbarRef = React.useRef<View>(null);
  const bucketTriggerRef = React.useRef<View>(null);
  const categoryTriggerRef = React.useRef<View>(null);
  const picTriggerRef = React.useRef<View>(null);
  const projectTriggerRef = React.useRef<View>(null);
  const statusTriggerRef = React.useRef<View>(null);
  const priorityTriggerRef = React.useRef<View>(null);
  const [activeFilterPanel, setActiveFilterPanel] =
    React.useState<TaskToolbarFilterPanel>(null);
  const [panelAnchor, setPanelAnchor] =
    React.useState<KolamFilterPanelAnchor | null>(null);
  const bucketOptions = KOLAM_TASK_CATEGORY_BUCKET_OPTIONS.map(option => ({
    label: option.label,
    value: option.id,
  }));
  const categoryOptions = [
    { label: 'Kategori', value: 'all' },
    ...controller.categories.map(category => ({
      label: category.name,
      value: category.id,
    })),
  ];
  const picOptions = [
    { label: 'PIC', value: 'all' },
    ...controller.staffOptions.map(option => ({
      label: option.label,
      value: option.id,
    })),
  ];
  const projectOptions = [
    { label: 'Project', value: 'all' },
    ...controller.projectOptions.map(project => ({
      label: project.label,
      value: project.id,
    })),
  ];
  const statusOptions = KOLAM_TASK_STATUS_OPTIONS.map(option => ({
    label: option.label,
    value: option.id,
  }));
  const priorityOptions = KOLAM_TASK_PRIORITY_OPTIONS.map(option => ({
    label: option.label,
    value: option.id,
  }));
  const bucketLabel =
    bucketOptions.find(option => option.value === controller.categoryBucketFilter)
      ?.label ?? 'Bucket';
  const categoryLabel =
    categoryOptions.find(option => option.value === controller.categoryFilter)
      ?.label ?? 'Kategori';
  const picLabel =
    picOptions.find(option => option.value === controller.assignedToFilter)
      ?.label ?? 'PIC';
  const projectLabel =
    projectOptions.find(option => option.value === controller.projectFilter)
      ?.label ?? 'Project';
  const statusLabel =
    statusOptions.find(option => option.value === controller.statusFilter)
      ?.label ?? 'Status';
  const priorityLabel =
    priorityOptions.find(option => option.value === controller.priorityFilter)
      ?.label ?? 'Prioritas';
  const getFilterTriggerRef = (
    panel: Exclude<TaskToolbarFilterPanel, null>,
  ) =>
    panel === 'bucket'
      ? bucketTriggerRef
      : panel === 'category'
        ? categoryTriggerRef
        : panel === 'pic'
          ? picTriggerRef
          : panel === 'project'
            ? projectTriggerRef
            : panel === 'status'
              ? statusTriggerRef
              : priorityTriggerRef;
  const closePanels = () => {
    setActiveFilterPanel(null);
    setPanelAnchor(null);
  };
  const anchorFilterPanel = React.useCallback(
    (panel: Exclude<TaskToolbarFilterPanel, null>) => {
      measureFilterPanelAnchor(
        toolbarRef.current,
        getFilterTriggerRef(panel).current,
        TASK_FILTER_PANEL_WIDTH,
        setPanelAnchor,
      );
    },
    [],
  );
  const togglePanel = (panel: Exclude<TaskToolbarFilterPanel, null>) => {
    if (activeFilterPanel === panel) {
      closePanels();
      return;
    }
    setActiveFilterPanel(null);
    setPanelAnchor(null);
    requestAnimationFrame(() => {
      measureFilterPanelAnchor(
        toolbarRef.current,
        getFilterTriggerRef(panel).current,
        TASK_FILTER_PANEL_WIDTH,
        anchor => {
          setPanelAnchor(anchor);
          setActiveFilterPanel(panel);
        },
      );
    });
  };

  React.useEffect(() => {
    if (!activeFilterPanel) {
      return;
    }
    requestAnimationFrame(() => anchorFilterPanel(activeFilterPanel));
  }, [activeFilterPanel, anchorFilterPanel]);

  return (
    <View ref={toolbarRef} style={styles.taskToolbarWrap}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={styles.taskToolbarStack}>
          <View style={styles.taskToolbarSearchRow}>
            <KolamSearchField
              containerStyle={kolamTableToolbarStyles.searchInput}
              onChangeText={controller.onSetSearch}
              placeholder="Cari tugas..."
              value={controller.search}
            />
            <KolamTaskManagerTabs controller={controller} />
          </View>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <View
                ref={bucketTriggerRef}
                collapsable={false}
                style={styles.taskFilterFillItem}
              >
                <KolamTableFilterTrigger
                  active={
                    activeFilterPanel === 'bucket' ||
                    controller.categoryBucketFilter !== 'all'
                  }
                  label={bucketLabel}
                  onPress={() => togglePanel('bucket')}
                  open={activeFilterPanel === 'bucket'}
                  style={styles.taskFilterFillTrigger}
                  textStyle={styles.taskFilterFillText}
                  variant="quiet"
                />
              </View>
              <View
                ref={categoryTriggerRef}
                collapsable={false}
                style={styles.taskFilterFillItem}
              >
                <KolamTableFilterTrigger
                  active={
                    activeFilterPanel === 'category' ||
                    controller.categoryFilter !== 'all'
                  }
                  label={categoryLabel}
                  onPress={() => togglePanel('category')}
                  open={activeFilterPanel === 'category'}
                  style={styles.taskFilterFillTrigger}
                  textStyle={styles.taskFilterFillText}
                  variant="quiet"
                />
              </View>
              <View
                ref={picTriggerRef}
                collapsable={false}
                style={styles.taskFilterFillItem}
              >
                <KolamTableFilterTrigger
                  active={
                    activeFilterPanel === 'pic' ||
                    controller.assignedToFilter !== 'all'
                  }
                  label={picLabel}
                  onPress={() => togglePanel('pic')}
                  open={activeFilterPanel === 'pic'}
                  style={styles.taskFilterFillTrigger}
                  textStyle={styles.taskFilterFillText}
                  variant="quiet"
                />
              </View>
              <View
                ref={projectTriggerRef}
                collapsable={false}
                style={styles.taskFilterFillItem}
              >
                <KolamTableFilterTrigger
                  active={
                    activeFilterPanel === 'project' ||
                    controller.projectFilter !== 'all'
                  }
                  label={projectLabel}
                  onPress={() => togglePanel('project')}
                  open={activeFilterPanel === 'project'}
                  style={styles.taskFilterFillTrigger}
                  textStyle={styles.taskFilterFillText}
                  variant="quiet"
                />
              </View>
              <View
                ref={statusTriggerRef}
                collapsable={false}
                style={styles.taskFilterFillItem}
              >
                <KolamTableFilterTrigger
                  active={
                    activeFilterPanel === 'status' ||
                    controller.statusFilter !== 'all'
                  }
                  label={statusLabel}
                  onPress={() => togglePanel('status')}
                  open={activeFilterPanel === 'status'}
                  style={styles.taskFilterFillTrigger}
                  textStyle={styles.taskFilterFillText}
                  variant="quiet"
                />
              </View>
              <View
                ref={priorityTriggerRef}
                collapsable={false}
                style={styles.taskFilterFillItem}
              >
                <KolamTableFilterTrigger
                  active={
                    activeFilterPanel === 'priority' ||
                    controller.priorityFilter !== 'all'
                  }
                  label={priorityLabel}
                  onPress={() => togglePanel('priority')}
                  open={activeFilterPanel === 'priority'}
                  style={styles.taskFilterFillTrigger}
                  textStyle={styles.taskFilterFillText}
                  variant="quiet"
                />
              </View>
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              <KolamButton
                disabled={controller.loading}
                intent={controller.priorityFilter === 'high' ? 'primary' : 'outline'}
                onPress={() => {
                  closePanels();
                  controller.onSetPriorityFilter(
                    controller.priorityFilter === 'high' ? 'all' : 'high',
                  );
                }}
                label="Prioritas tinggi"
                style={styles.taskToolbarButton}
              />
              <View style={styles.switchInline}>
                <Text style={styles.metaText}>Tugas saya</Text>
                <KolamSwitch
                  active={controller.mineOnly}
                  onPress={() => {
                    closePanels();
                    controller.onSetMineOnly(!controller.mineOnly);
                  }}
                />
              </View>
              <KolamResetButton
                disabled={controller.loading}
                onPress={() => {
                  closePanels();
                  controller.onResetFilters();
                }}
                style={styles.taskToolbarButton}
              />
              <KolamRefreshButton
                accessibilityLabel="Refresh"
                disabled={controller.loading}

                onPress={() => {
                  closePanels();
                  void controller.onRefresh();
                }}
                style={styles.taskToolbarButton}
              />
              {controller.isTaskAdmin ? (
                <KolamButton
                  intent="primary"
                  label="Baru"
                  tone="positive"
                  onPress={() => {
                    closePanels();
                    controller.onCreateNew();
                  }}
                  style={styles.taskToolbarButton}
                />
              ) : null}
            </View>
          </View>
        </View>
      </View>
      {activeFilterPanel === 'bucket' && panelAnchor ? (
        <View
          style={[
            styles.taskFilterOverlayPanel,
            {
              left: panelAnchor.left,
              top: panelAnchor.top,
              width: TASK_FILTER_PANEL_WIDTH,
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.taskFilterPanelContent}
            keyboardShouldPersistTaps="handled"
            style={styles.taskFilterPanelScroll}
          >
            {bucketOptions.map(option => (
              <KolamButton
                intent={
                  option.value === controller.categoryBucketFilter
                    ? 'primary'
                    : 'plain'
                }
                key={option.value || 'all'}
                label={option.label}
                onPress={() => {
                  controller.onSetCategoryBucketFilter(
                    option.value as typeof controller.categoryBucketFilter,
                  );
                  closePanels();
                }}
                style={styles.taskFilterPanelOption}
              />
            ))}
          </ScrollView>
          <View style={styles.taskFilterPanelFooter}>
            <KolamButton label="Tutup" onPress={closePanels} />
          </View>
        </View>
      ) : null}
      {activeFilterPanel === 'category' && panelAnchor ? (
        <View
          style={[
            styles.taskFilterOverlayPanel,
            {
              left: panelAnchor.left,
              top: panelAnchor.top,
              width: TASK_FILTER_PANEL_WIDTH,
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.taskFilterPanelContent}
            keyboardShouldPersistTaps="handled"
            style={styles.taskFilterPanelScroll}
          >
            {categoryOptions.map(option => (
              <KolamButton
                intent={
                  option.value === controller.categoryFilter ? 'primary' : 'plain'
                }
                key={option.value || 'all'}
                label={option.label}
                onPress={() => {
                  controller.onSetCategoryFilter(option.value);
                  closePanels();
                }}
                style={styles.taskFilterPanelOption}
              />
            ))}
          </ScrollView>
          <View style={styles.taskFilterPanelFooter}>
            <KolamButton label="Tutup" onPress={closePanels} />
          </View>
        </View>
      ) : null}
      {activeFilterPanel === 'pic' && panelAnchor ? (
        <View
          style={[
            styles.taskFilterOverlayPanel,
            {
              left: panelAnchor.left,
              top: panelAnchor.top,
              width: TASK_FILTER_PANEL_WIDTH,
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.taskFilterPanelContent}
            keyboardShouldPersistTaps="handled"
            style={styles.taskFilterPanelScroll}
          >
            {picOptions.map(option => (
              <KolamButton
                intent={
                  option.value === controller.assignedToFilter
                    ? 'primary'
                    : 'plain'
                }
                key={option.value || 'all'}
                label={option.label}
                onPress={() => {
                  controller.onSetAssignedToFilter(option.value);
                  closePanels();
                }}
                style={styles.taskFilterPanelOption}
              />
            ))}
          </ScrollView>
          <View style={styles.taskFilterPanelFooter}>
            <KolamButton label="Tutup" onPress={closePanels} />
          </View>
        </View>
      ) : null}
      {activeFilterPanel === 'project' && panelAnchor ? (
        <View
          style={[
            styles.taskFilterOverlayPanel,
            {
              left: panelAnchor.left,
              top: panelAnchor.top,
              width: TASK_FILTER_PANEL_WIDTH,
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.taskFilterPanelContent}
            keyboardShouldPersistTaps="handled"
            style={styles.taskFilterPanelScroll}
          >
            {projectOptions.map(option => (
              <KolamButton
                intent={
                  option.value === controller.projectFilter
                    ? 'primary'
                    : 'plain'
                }
                key={option.value || 'all'}
                label={option.label}
                onPress={() => {
                  controller.onSetProjectFilter(option.value);
                  closePanels();
                }}
                style={styles.taskFilterPanelOption}
              />
            ))}
          </ScrollView>
          <View style={styles.taskFilterPanelFooter}>
            <KolamButton label="Tutup" onPress={closePanels} />
          </View>
        </View>
      ) : null}
      {activeFilterPanel === 'status' && panelAnchor ? (
        <View
          style={[
            styles.taskFilterOverlayPanel,
            {
              left: panelAnchor.left,
              top: panelAnchor.top,
              width: TASK_FILTER_PANEL_WIDTH,
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.taskFilterPanelContent}
            keyboardShouldPersistTaps="handled"
            style={styles.taskFilterPanelScroll}
          >
            {statusOptions.map(option => (
              <KolamButton
                intent={
                  option.value === controller.statusFilter ? 'primary' : 'plain'
                }
                key={option.value || 'all'}
                label={option.label}
                onPress={() => {
                  controller.onSetStatusFilter(
                    option.value as typeof controller.statusFilter,
                  );
                  closePanels();
                }}
                style={styles.taskFilterPanelOption}
              />
            ))}
          </ScrollView>
          <View style={styles.taskFilterPanelFooter}>
            <KolamButton label="Tutup" onPress={closePanels} />
          </View>
        </View>
      ) : null}
      {activeFilterPanel === 'priority' && panelAnchor ? (
        <View
          style={[
            styles.taskFilterOverlayPanel,
            {
              left: panelAnchor.left,
              top: panelAnchor.top,
              width: TASK_FILTER_PANEL_WIDTH,
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.taskFilterPanelContent}
            keyboardShouldPersistTaps="handled"
            style={styles.taskFilterPanelScroll}
          >
            {priorityOptions.map(option => (
              <KolamButton
                intent={
                  option.value === controller.priorityFilter
                    ? 'primary'
                    : 'plain'
                }
                key={option.value || 'all'}
                label={option.label}
                onPress={() => {
                  controller.onSetPriorityFilter(
                    option.value as typeof controller.priorityFilter,
                  );
                  closePanels();
                }}
                style={styles.taskFilterPanelOption}
              />
            ))}
          </ScrollView>
          <View style={styles.taskFilterPanelFooter}>
            <KolamButton label="Tutup" onPress={closePanels} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function createTaskListColumns(
  controller: KolamTaskManagerController,
  onRouteChange?: (route: string) => void,
): Array<KolamListTableColumn<KolamTaskManagerTask>> {
  return LIST_COLUMNS.map(column => ({
    ...column,
    render: task =>
      renderTaskListCell(column.id, task, controller, onRouteChange),
  }));
}

function renderTaskListCell(
  columnId: TaskListColumnId,
  task: KolamTaskManagerTask,
  controller: KolamTaskManagerController,
  onRouteChange?: (route: string) => void,
) {
  const overdue = isKolamTaskOverdue(task);
  const statusOptions = getKolamTaskStatusOptionsForUser({
    currentUserId: controller.currentUserId,
    isTaskAdmin: controller.isTaskAdmin,
    task,
  });
  const statusDisabled =
    task.status === 'done' ||
    task.status === 'cancelled' ||
    controller.mutatingTaskId === task.id ||
    statusOptions.length === 0;
  const priorityDisabled =
    !controller.isTaskAdmin || controller.mutatingTaskId === task.id;

  switch (columnId) {
    case 'primary':
      return (
        <Pressable
          accessibilityRole="button"
          onPress={() => onRouteChange?.(`/task-manager/${task.id}`)}
          style={styles.taskTitleCell}
        >
          <View style={styles.titleRow}>
            {showKolamTaskUrgentMarker(task) ? (
              <Text style={styles.urgent}>!</Text>
            ) : null}
            <Text numberOfLines={1} style={styles.primaryText}>
              {task.title || '-'}
            </Text>
          </View>
          <View style={styles.badgeRow}>
            {task.categoryBucket ? (
              <KolamStatusBadge
                intent="muted"
                label={getKolamTaskCategoryBucketLabel(task.categoryBucket)}
              />
            ) : null}
            <KolamTaskSourceBadge source={task.source} />
            {task.category && typeof task.category === 'object' ? (
              <KolamStatusBadge intent="info" label={task.category.name} />
            ) : null}
            {getTaskTypeLabel(task) !== '-' ? (
              <KolamStatusBadge intent="muted" label={getTaskTypeLabel(task)} />
            ) : null}
          </View>
        </Pressable>
      );
    case 'meta':
      return (
        <View style={styles.centerCell}>
          <KolamTaskUserAvatar user={task.assignedTo} />
        </View>
      );
    case 'children':
      return (
        <View style={styles.centerCell}>
          <KolamTaskUserAvatar user={task.assistedBy} />
        </View>
      );
    case 'status':
      return (
        <View style={styles.centerCell}>
          {statusDisabled ? (
            <KolamStatusBadge
              intent={getKolamTaskStatusBadgeIntent(task.status)}
              label={getKolamTaskStatusLabel(task.status)}
            />
          ) : (
            <KolamDropdownSelect
              label="Status"
              onChange={value => {
                void controller.onSetTaskStatus(
                  task,
                  value as typeof task.status,
                );
              }}
              options={statusOptions.map(option => ({
                label: getTaskTableStatusOptionLabel(option.id, option.label),
                value: option.id,
              }))}
              showLabelInTrigger={false}
              style={styles.tableSelect}
              triggerStyle={styles.tableSelectTrigger}
              value={task.status}
            />
          )}
        </View>
      );
    case 'notes':
      return (
        <View style={styles.centerCell}>
          {priorityDisabled ? (
            <KolamStatusBadge
              intent={getKolamTaskPriorityBadgeIntent(task.priority)}
              label={getKolamTaskPriorityLabel(task.priority)}
            />
          ) : (
            <KolamDropdownSelect
              label="Prioritas"
              onChange={value => {
                void controller.onSetTaskPriority(
                  task,
                  value as typeof task.priority,
                );
              }}
              options={KOLAM_TASK_PRIORITY_OPTIONS.filter(
                option => option.id !== 'all',
              ).map(option => ({
                label: option.label,
                value: option.id,
              }))}
              showLabelInTrigger={false}
              style={styles.tableSelect}
              triggerStyle={styles.tableSelectTrigger}
              value={task.priority}
            />
          )}
        </View>
      );
    case 'marketplace':
      return (
        <View style={styles.centerCell}>
          <KolamTaskDueCountdownText task={task} />
        </View>
      );
    case 'amount':
      return (
        <View style={styles.centerCell}>
          <Text
            numberOfLines={1}
            style={[
              styles.cellText,
              styles.centerText,
              overdue && styles.dangerText,
            ]}
          >
            {formatKolamTaskListDatetime(task.dueDate)}
          </Text>
        </View>
      );
  }
}

function KolamTaskUserAvatar({
  user,
}: {
  user: KolamTaskManagerTask['assignedTo'];
}) {
  const name = getKolamTaskUserDisplayName(user);
  const label = name || '-';
  const photoUri =
    user && typeof user === 'object'
      ? getKolamFileUrl(user.profilePicture)
      : '';
  const initials = getTaskUserInitials(label);

  return (
    <KolamHoverTooltip
      align="center"
      containerStyle={styles.taskUserTooltip}
      label={label}
    >
      <View accessibilityLabel={label} style={styles.taskUserAvatar}>
        <KolamProfileAvatarContent
          imageStyle={styles.taskUserAvatarImage}
          imageUrl={photoUri}
          initials={initials}
          textStyle={styles.taskUserAvatarText}
        />
      </View>
    </KolamHoverTooltip>
  );
}

function getTaskUserInitials(name: string) {
  const normalized = name.trim();
  if (!normalized || normalized === '-') {
    return '?';
  }
  return (
    normalized
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || '?'
  );
}

function renderTaskListActions(
  task: KolamTaskManagerTask,
  controller: KolamTaskManagerController,
  onRouteChange?: (route: string) => void,
) {
  return (
    <KolamOverflowMenuButton
      actions={[
        {
          label: 'Detail',
          onPress: () => onRouteChange?.(`/task-manager/${task.id}`),
        },
        ...(isTaskOvertimeRequestVisible(controller, task)
          ? [
              {
                disabled: controller.mutatingTaskId === `overtime:${task.id}`,
                label: 'Lembur',
                onPress: () => controller.onOpenOvertimeRequest(task),
              },
            ]
          : []),
        ...(controller.isTaskAdmin
          ? [
              {
                disabled: controller.mutatingTaskId === task.id,
                label: 'Ubah',
                onPress: () => controller.onEditTask(task),
              },
            ]
          : []),
        ...(controller.isTaskAdmin
          ? [
              {
                disabled: controller.mutatingTaskId === `delete:${task.id}`,
                label: 'Hapus',
                onPress: () => controller.onRequestDeleteTask(task),
              },
            ]
          : []),
      ]}
    />
  );
}

function KolamTaskDueCountdownText({
  task,
}: {
  task: KolamTaskManagerTask;
}) {
  const [label, setLabel] = React.useState(() =>
    getKolamTaskDueCountdownTextLabel(task),
  );

  React.useEffect(() => {
    const updateLabel = () => setLabel(getKolamTaskDueCountdownTextLabel(task));
    const isTestRuntime =
      typeof (globalThis as { expect?: unknown }).expect !== 'undefined' ||
      typeof (globalThis as { it?: unknown }).it !== 'undefined';
    updateLabel();
    if (
      isTestRuntime ||
      !task.dueDate ||
      task.status === 'done' ||
      task.status === 'cancelled'
    ) {
      return undefined;
    }
    const intervalId = setInterval(updateLabel, 1000);
    return () => clearInterval(intervalId);
  }, [task]);

  const danger =
    isKolamTaskOverdue(task) || label.toLowerCase().includes('terlambat');
  const overdueMatch = /^terlambat\s+(.+)$/i.exec(label.trim());
  const completedLateMatch = /^selesai\s+\(terlambat\s+(.+)\)$/i.exec(
    label.trim(),
  );
  const completedOnTime = /^selesai\s+\(tepat waktu\)$/i.test(label.trim());

  if (overdueMatch) {
    return (
      <View style={styles.taskCountdownStack}>
        <Text style={[styles.cellText, styles.dangerText]}>Terlambat</Text>
        <Text
          numberOfLines={1}
          style={[
            styles.cellText,
            styles.dangerText,
            styles.taskCountdownDuration,
          ]}
        >
          {overdueMatch[1]}
        </Text>
      </View>
    );
  }

  if (completedLateMatch) {
    return (
      <View style={styles.taskCountdownStack}>
        <Text style={[styles.cellText, styles.dangerText]}>Selesai</Text>
        <Text
          style={[
            styles.cellText,
            styles.dangerText,
            styles.taskCountdownDuration,
          ]}
        >
          Terlambat
        </Text>
      </View>
    );
  }

  if (completedOnTime) {
    return (
      <View style={styles.taskCountdownStack}>
        <Text style={styles.cellText}>Selesai</Text>
        <Text style={[styles.cellText, styles.taskCountdownDuration]}>
          Tepat waktu
        </Text>
      </View>
    );
  }

  return (
    <Text
      numberOfLines={1}
      style={[styles.cellText, danger && styles.dangerText]}
    >
      {label}
    </Text>
  );
}

function getKolamTaskDueCountdownTextLabel(task: KolamTaskManagerTask) {
  return getKolamTaskDueCountdownLabel({
    ...task,
    timeline: Array.isArray(task.timeline) ? task.timeline : [],
  });
}

function getTaskTableStatusOptionLabel(status: string, label: string) {
  return status === 'needs_review' ? 'Periksa' : label;
}

function KolamTaskRecurringPanel({
  controller,
  onRouteChange,
}: {
  controller: KolamTaskManagerController;
  onRouteChange?: (route: string) => void;
}) {
  const scheduleRows = getRecurringScheduleRows(controller);

  return (
    <View style={styles.detailStack}>
      <KolamTaskRecurringKpiRow
        controller={controller}
        scheduleRows={scheduleRows}
      />

      {controller.isTaskAdmin ? (
        <KolamTaskRecurringEnrollmentDashboard controller={controller} />
      ) : null}

      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text style={styles.detailContext}>Tugas berulang</Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamTaskManagerTabs controller={controller} />
            {controller.isTaskAdmin ? (
              <View style={styles.switchInline}>
                <Text style={styles.metaText}>Hanya kandang</Text>
                <KolamSwitch
                  active={controller.recurringEnclosureOnly}
                  onPress={() =>
                    controller.onSetRecurringEnclosureOnly(
                      !controller.recurringEnclosureOnly,
                    )
                  }
                />
              </View>
            ) : null}
            <KolamRefreshButton
              accessibilityLabel="Refresh"
              disabled={controller.loading}

              onPress={() => {
                void controller.onRefresh();
              }}
            />
            {controller.isTaskAdmin ? (
              <KolamButton
                disabled={controller.loading}
                intent="outline"
                label="Bulk enrollment"
                onPress={controller.onCreateRecurringBulkEnrollment}
              />
            ) : null}
            {controller.isTaskAdmin ? (
              <KolamButton
                disabled={controller.mutatingTaskId === 'recurring'}
                label="Generate hari ini"
                onPress={() => {
                  void controller.onRunRecurringTick();
                }}
              />
            ) : null}
            {controller.isTaskAdmin ? (
              <KolamButton
                disabled={controller.loading}
                intent="primary"
                label="Template baru"
                onPress={controller.onCreateRecurringTemplate}
              />
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Template aktif</Text>
        {controller.recurringTemplates.length ? (
          controller.recurringTemplates.map(template => {
            const taskTypeId = getRecurringTemplateTaskTypeId(template);
            return (
              <View key={template.id} style={styles.timelineRow}>
                <Text style={styles.timelineTitle}>{template.title}</Text>
                <View style={styles.badgeRow}>
                  <KolamStatusBadge
                    intent={getKolamTaskPriorityBadgeIntent(template.priority)}
                    label={getKolamTaskPriorityLabel(template.priority)}
                  />
                  <KolamStatusBadge
                    intent={template.active ? 'success' : 'danger'}
                    label={template.active ? 'Aktif' : 'Nonaktif'}
                  />
                </View>
                <Text style={styles.metaText}>
                  {getRecurrenceLabel(template.recurrence)} -{' '}
                  {getKolamTaskUserDisplayName(template.assignedTo)}
                </Text>
                {controller.isTaskAdmin ? (
                  <View style={styles.categoryActionsCell}>
                    {taskTypeId ? (
                      <KolamButton
                        disabled={controller.loading}
                        intent="outline"
                        label="Enrollment"
                        onPress={() =>
                          controller.onCreateRecurringBulkEnrollment(taskTypeId)
                        }
                      />
                    ) : null}
                    <KolamButton
                      disabled={
                        controller.mutatingTaskId ===
                        `recurring-template:${template.id}`
                      }
                      intent="outline"
                      label="Hapus"
                      onPress={() => {
                        void controller.onDeleteRecurringTemplate(template);
                      }}
                    />
                  </View>
                ) : null}
              </View>
            );
          })
        ) : (
          <Text style={styles.metaText}>
            {controller.loading ? 'Memuat...' : 'Belum ada template'}
          </Text>
        )}
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Jadwal / occurrence</Text>
        <KolamListTableComposition
          columns={createRecurringScheduleColumns(onRouteChange)}
          emptyTitle={
            controller.loading ? 'Memuat...' : 'Belum ada occurrence'
          }
          getRowKey={row => row.id}
          loading={controller.loading}
          rows={scheduleRows}
          showFooter={false}
          style={styles.recurringScheduleTable}
        />
      </View>
    </View>
  );
}

function KolamTaskRecurringKpiRow({
  controller,
  scheduleRows,
}: {
  controller: KolamTaskManagerController;
  scheduleRows: RecurringScheduleRow[];
}) {
  const dashboard = controller.recurringEnrollmentDashboard;
  const compliance = controller.recurringEnrollmentCompliance;
  const sampleReviewCount = scheduleRows.filter(
    row => row.sampleReviewRequired,
  ).length;
  const pendingCount = scheduleRows.filter(
    row => row.status === 'pending',
  ).length;
  const missedCount = scheduleRows.filter(
    row => row.status === 'missed',
  ).length;
  const cards = [
    {
      id: 'occurrence',
      iconElement: <KolamTotalTaskIcon style={styles.kpiCardIcon} />,
      label: 'Occurrence',
      value: compliance ? compliance.total : scheduleRows.length,
      tone: 'muted',
    },
    {
      id: 'pending',
      iconElement: <KolamTodoTaskIcon style={styles.kpiCardIcon} />,
      label: 'Pending',
      value: compliance ? `${compliance.pendingPercent}%` : pendingCount,
      tone: 'warning',
    },
    {
      id: 'missed',
      iconElement: <KolamOverdueTaskIcon style={styles.kpiCardIcon} />,
      label: 'Terlewat',
      value: compliance ? `${compliance.missedPercent}%` : missedCount,
      tone: 'danger',
    },
    {
      id: 'sample-review',
      iconElement: <KolamProsesTaskIcon style={styles.kpiCardIcon} />,
      label: 'Review sampel',
      value: compliance ? compliance.sampleReviewPending : sampleReviewCount,
      tone: 'info',
    },
    {
      id: 'enrollment',
      iconElement: <KolamSelesaiTaskIcon style={styles.kpiCardIcon} />,
      label: 'Enrollment aktif',
      value: dashboard ? dashboard.totalActive : 0,
      tone: 'success',
    },
  ] as const;

  return (
    <View style={styles.kpiRow}>
      {cards.map(card => (
        <View key={card.id} style={styles.kpiCard}>
          <View style={[styles.kpiAccent, getTaskKpiAccentStyle(card.tone)]} />
          <View style={[styles.kpiBody, styles.kpiBodyWithIcon]}>
            <Text numberOfLines={1} style={styles.kpiLabel}>
              {card.label}
            </Text>
            <Text numberOfLines={1} style={styles.kpiValue}>
              {card.value}
            </Text>
          </View>
          <View style={styles.kpiIconShell}>{card.iconElement}</View>
        </View>
      ))}
    </View>
  );
}

function KolamTaskRecurringEnrollmentDashboard({
  controller,
}: {
  controller: KolamTaskManagerController;
}) {
  const dashboard = controller.recurringEnrollmentDashboard;
  if (!dashboard) return null;

  return (
    <KolamDetailSummaryCard
      description="30 hari terakhir"
      fields={[
        {
          id: 'active',
          label: 'Enrollment aktif',
          value: dashboard.totalActive,
        },
        {
          id: 'locations',
          label: 'Kandang',
          value: dashboard.byLocation.length,
        },
        {
          id: 'pic',
          label: 'PIC',
          value: dashboard.byPic.length,
        },
        {
          id: 'location',
          label: 'Per kandang',
          value: dashboard.byLocation.length ? (
            <View style={styles.enrollmentSummaryList}>
              {dashboard.byLocation.slice(0, 12).map(row => (
                <View
                  key={row.locationId ?? row.locationName}
                  style={styles.enrollmentRow}
                >
                  <Text numberOfLines={1} style={styles.cellText}>
                    {row.locationName || '-'}
                  </Text>
                  <Text style={styles.metaText}>{row.count}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.metaText}>-</Text>
          ),
        },
        {
          id: 'pic',
          label: 'Per PIC',
          value: dashboard.byPic.length ? (
            <View style={styles.enrollmentSummaryList}>
              {dashboard.byPic.slice(0, 12).map(row => (
                <View
                  key={row.userId ?? row.userName}
                  style={styles.enrollmentRow}
                >
                  <Text numberOfLines={1} style={styles.cellText}>
                    {row.userName || '-'}
                  </Text>
                  <Text style={styles.metaText}>{row.count}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.metaText}>-</Text>
          ),
        },
      ]}
      title="Kandang - enrollment & compliance"
    />
  );
}

function getRecurrenceLabel(
  recurrence: KolamTaskManagerController['recurringTemplates'][number]['recurrence'],
) {
  if (recurrence.type === 'weekly') return `Mingguan ${recurrence.time}`;
  if (recurrence.type === 'monthly') {
    return `Bulanan ${recurrence.dayOfMonth ?? 1} ${recurrence.time}`;
  }
  return `Harian ${recurrence.time}`;
}

function getRecurringTemplateTaskTypeId(
  template: KolamTaskManagerController['recurringTemplates'][number],
) {
  if (!template.taskType) return '';
  if (typeof template.taskType === 'string') return template.taskType;
  return template.taskType.id;
}

type RecurringScheduleRow = ReturnType<typeof getRecurringScheduleRows>[number];

function getRecurringScheduleRows(controller: KolamTaskManagerController) {
  return [
    ...controller.recurringOccurrences.map(row => ({
      id: `occ-${row.id}`,
      kind: 'internal' as const,
      title: row.title,
      category:
        row.categoryLabel ||
        getKolamTaskCategoryBucketLabel(row.categoryBucket),
      status: row.status,
      assignedTo: row.assignedTo,
      scheduledAt: row.scheduledAt,
      dueAt: row.dueAt,
      customerId: '',
      customerName: '',
      href: '',
      sampleReviewRequired: row.sampleReviewRequired,
      taskId: row.taskId,
    })),
    ...controller.recurringServiceVisits.map(row => ({
      id: `svc-${row.id}`,
      kind: 'subscription' as const,
      title: row.title,
      category: row.categoryLabel || row.serviceName,
      status: row.status,
      assignedTo: row.assignedTo,
      scheduledAt: row.scheduledAt,
      dueAt: row.dueAt,
      customerId: row.customerId,
      customerName: row.customerName,
      href: row.href,
      sampleReviewRequired: false,
      taskId: '',
    })),
  ].sort(
    (a, b) =>
      new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
  );
}

function createRecurringScheduleColumns(
  onRouteChange?: (route: string) => void,
): Array<KolamListTableColumn<RecurringScheduleRow>> {
  return RECURRING_SCHEDULE_COLUMNS.map(column => ({
    ...column,
    render: row => renderRecurringScheduleCell(column.id, row, onRouteChange),
  }));
}

function renderRecurringScheduleCell(
  columnId: RecurringScheduleColumnId,
  row: RecurringScheduleRow,
  onRouteChange?: (route: string) => void,
) {
  switch (columnId) {
    case 'schedule':
      return (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            if (row.taskId) {
              onRouteChange?.(`/task-manager/${row.taskId}`);
            } else if (row.href) {
              onRouteChange?.(row.href);
            }
          }}
          style={styles.recurringScheduleTitleCell}
        >
          <Text numberOfLines={1} style={styles.timelineTitle}>
            {row.title || '-'}
          </Text>
          {row.sampleReviewRequired ? (
            <KolamStatusBadge intent="warning" label="Sampel" />
          ) : null}
        </Pressable>
      );
    case 'kind':
      return (
        <View style={styles.centerCell}>
          <Text numberOfLines={1} style={[styles.cellText, styles.centerText]}>
            {row.kind === 'internal' ? 'Internal' : 'Subscription'}
          </Text>
        </View>
      );
    case 'category':
      return (
        <View style={styles.centerCell}>
          <Text numberOfLines={1} style={[styles.cellText, styles.centerText]}>
            {row.category || '-'}
          </Text>
        </View>
      );
    case 'status':
      return (
        <View style={styles.centerCell}>
          <KolamStatusBadge
            intent={getRecurringStatusIntent(row.status)}
            label={row.status}
          />
        </View>
      );
    case 'pic':
      return (
        <View style={styles.centerCell}>
          <KolamTaskUserAvatar user={row.assignedTo} />
        </View>
      );
    case 'time':
      return (
        <View style={styles.centerCell}>
          <Text numberOfLines={2} style={[styles.cellText, styles.centerText]}>
            {formatKolamTaskListDatetime(row.scheduledAt)}
          </Text>
          <Text numberOfLines={2} style={[styles.metaText, styles.centerText]}>
            {formatKolamTaskListDatetime(row.dueAt)}
          </Text>
        </View>
      );
    case 'customer':
      return (
        <View style={styles.centerCell}>
          <Text numberOfLines={1} style={[styles.cellText, styles.centerText]}>
            {row.customerName || '-'}
          </Text>
        </View>
      );
  }
}

function getRecurringStatusIntent(
  status: string,
): React.ComponentProps<typeof KolamStatusBadge>['intent'] {
  switch (status) {
    case 'done':
      return 'success';
    case 'missed':
      return 'danger';
    case 'skipped':
      return 'muted';
    case 'pending':
    default:
      return 'info';
  }
}

function taskFormShowsCustomerField(
  form: Pick<
    KolamTaskManagerController['form'],
    'conversationId' | 'projectId' | 'saleId'
  >,
) {
  return Boolean(
    form.projectId.trim() || form.conversationId.trim() || form.saleId.trim(),
  );
}

function getTaskFormCategoryBucket(
  form: Pick<
    KolamTaskManagerController['form'],
    'conversationId' | 'projectId' | 'saleId'
  >,
): KolamTaskCategoryBucket | null {
  if (form.conversationId.trim() || form.saleId.trim()) return 'crm';
  if (form.projectId.trim()) return 'project';
  return null;
}

function KolamTaskFormModal({
  controller,
}: {
  controller: KolamTaskManagerController;
}) {
  const staffOptions = [
    { label: 'Pilih PIC', value: '' },
    ...controller.staffOptions.map(option => ({
      label: option.label,
      value: option.id,
    })),
  ];
  const assistedOptions = [
    { label: 'Tanpa asisten', value: '' },
    ...controller.staffOptions.map(option => ({
      label: option.label,
      value: option.id,
    })),
  ];
  const mentionOptions = getTaskMentionOptions(controller);
  const categoryOptions = [
    { label: 'Pilih kategori', value: '' },
    ...controller.categories.map(category => ({
      label: category.name,
      value: category.id,
    })),
  ];
  const selectedCategoryBucket =
    getTaskFormCategoryBucket(controller.form) ??
    controller.categories.find(
      category => category.id === controller.form.categoryId,
    )?.bucket ??
    null;
  const taskTypeOptions = [
    { label: 'Tidak ada', value: '' },
    ...controller.taskTypes
      .filter(taskType => {
        if (!taskType.active) return false;
        if (!selectedCategoryBucket) return true;
        return (
          taskType.categoryBuckets.length === 0 ||
          taskType.categoryBuckets.includes(selectedCategoryBucket)
        );
      })
      .map(taskType => ({
        label: taskType.name,
        value: taskType.id,
      })),
  ];
  const projectOptions = [
    { label: 'Tidak ada', value: '' },
    ...controller.projectOptions.map(project => ({
      label: project.label,
      value: project.id,
    })),
  ];
  const customerOptions = [
    { label: 'Tidak ada', value: '' },
    ...controller.customerOptions.map(customer => ({
      label: customer.label,
      value: customer.id,
    })),
  ];
  const showCustomerField = taskFormShowsCustomerField(controller.form);
  const saving =
    controller.mutatingTaskId === 'new' ||
    (controller.formMode === 'edit' &&
      controller.mutatingTaskId != null &&
      controller.mutatingTaskId !== 'recurring');

  return (
    <Modal
      animationType="fade"
      onRequestClose={controller.onCloseForm}
      transparent
      visible={controller.formOpen}
    >
      <View style={styles.modalRoot}>
        <KolamModalBackdrop onPress={controller.onCloseForm} />
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text numberOfLines={1} style={styles.modalTitle}>
              {controller.formMode === 'edit' ? 'Ubah tugas' : 'Tugas baru'}
            </Text>
            <View style={styles.modalActions}>
              <KolamButton
                disabled={saving}
                intent="outline"
                label="Batal"
                onPress={controller.onCloseForm}
              />
              <KolamButton
                disabled={saving}
                label={saving ? 'Menyimpan...' : 'Simpan'}
                onPress={() => {
                  void controller.onSaveForm();
                }}
              />
            </View>
          </View>

          {controller.formError ? (
            <KolamStatusBadge
              intent="danger"
              label={controller.formError}
              numberOfLines={3}
            />
          ) : null}

          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <KolamTaskField label="Judul" required>
              <KolamFormTextField
                onChangeText={title => controller.onChangeForm({ title })}
                placeholder="Judul"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={controller.form.title}
              />
            </KolamTaskField>

            <KolamTaskField label="Deskripsi">
              <KolamTipTapRichTextEditor
                mentionOptions={mentionOptions}
                onChangeText={description =>
                  controller.onChangeForm({ description })
                }
                placeholder="Spesifikasi tugas (bukan catatan aktivitas)... Ketik @ untuk tag user."
                value={controller.form.description}
              />
            </KolamTaskField>

            <View style={styles.formGrid}>
              <KolamDropdownSelect
                label="PIC"
                onChange={assignedToId =>
                  controller.onChangeForm({ assignedToId })
                }
                options={staffOptions}
                searchable
                value={controller.form.assignedToId}
              />
              <KolamDropdownSelect
                label="Dibantu"
                onChange={assistedById =>
                  controller.onChangeForm({ assistedById })
                }
                options={assistedOptions}
                searchable
                value={controller.form.assistedById}
              />
              <KolamDropdownSelect
                label="Kategori"
                onChange={categoryId =>
                  controller.onChangeForm({ categoryId, taskTypeId: '' })
                }
                options={categoryOptions}
                searchable
                value={controller.form.categoryId}
              />
              <KolamDropdownSelect
                label="Tipe task"
                onChange={taskTypeId => controller.onChangeForm({ taskTypeId })}
                options={taskTypeOptions}
                searchable
                value={controller.form.taskTypeId}
              />
              <KolamDropdownSelect
                label="Proyek"
                onChange={projectId =>
                  controller.onChangeForm({
                    customerId: taskFormShowsCustomerField({
                      ...controller.form,
                      projectId,
                    })
                      ? controller.form.customerId
                      : '',
                    projectId,
                    taskTypeId: '',
                  })
                }
                options={projectOptions}
                searchable
                value={controller.form.projectId}
              />
              {showCustomerField ? (
                <KolamDropdownSelect
                  label="Customer"
                  onChange={customerId =>
                    controller.onChangeForm({ customerId })
                  }
                  options={customerOptions}
                  searchable
                  value={controller.form.customerId}
                />
              ) : null}
              <KolamTaskField label="Sale ID">
                <KolamFormTextField
                  onChangeText={saleId =>
                    controller.onChangeForm({
                      customerId: taskFormShowsCustomerField({
                        ...controller.form,
                        saleId,
                      })
                        ? controller.form.customerId
                        : '',
                      saleId,
                      taskTypeId: '',
                    })
                  }
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={controller.form.saleId}
                />
              </KolamTaskField>
              <KolamTaskField label="Complaint ID">
                <KolamFormTextField
                  onChangeText={complaintId =>
                    controller.onChangeForm({ complaintId })
                  }
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={controller.form.complaintId}
                />
              </KolamTaskField>
              <KolamTaskField label="Conversation ID">
                <KolamFormTextField
                  onChangeText={conversationId =>
                    controller.onChangeForm({
                      customerId: taskFormShowsCustomerField({
                        ...controller.form,
                        conversationId,
                      })
                        ? controller.form.customerId
                        : '',
                      conversationId,
                      taskTypeId: '',
                    })
                  }
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={controller.form.conversationId}
                />
              </KolamTaskField>
              <KolamDropdownSelect
                label="Status"
                onChange={status =>
                  controller.onChangeForm({
                    status: status as typeof controller.form.status,
                  })
                }
                options={KOLAM_TASK_STATUS_OPTIONS.filter(
                  option => option.id !== 'all',
                ).map(option => ({
                  label: option.label,
                  value: option.id,
                }))}
                value={controller.form.status}
              />
              <KolamDropdownSelect
                label="Prioritas"
                onChange={priority =>
                  controller.onChangeForm({
                    priority: priority as typeof controller.form.priority,
                  })
                }
                options={KOLAM_TASK_PRIORITY_OPTIONS.filter(
                  option => option.id !== 'all',
                ).map(option => ({
                  label: option.label,
                  value: option.id,
                }))}
                value={controller.form.priority}
              />
              <KolamDateField
                label="Due"
                onChange={dueDate => controller.onChangeForm({ dueDate })}
                value={controller.form.dueDate}
              />
              <KolamTaskField label="Jam batas">
                <KolamFormTextField
                  onChangeText={dueTime => controller.onChangeForm({ dueTime })}
                  placeholder="23:59"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={controller.form.dueTime}
                />
              </KolamTaskField>
              <View style={styles.formSwitchRow}>
                <Text style={styles.cellText}>Urgent</Text>
                <KolamSwitch
                  active={controller.form.urgent}
                  onPress={() =>
                    controller.onChangeForm({
                      urgent: !controller.form.urgent,
                    })
                  }
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function KolamTaskOvertimeRequestModal({
  controller,
}: {
  controller: KolamTaskManagerController;
}) {
  const task =
    controller.selectedTask?.id === controller.overtimeRequestTaskId
      ? controller.selectedTask
      : controller.tasks.find(row => row.id === controller.overtimeRequestTaskId);
  const saving =
    controller.mutatingTaskId ===
    `overtime:${controller.overtimeRequestTaskId}`;

  return (
    <Modal
      animationType="fade"
      onRequestClose={controller.onCloseOvertimeRequest}
      transparent
      visible={Boolean(controller.overtimeRequestTaskId)}
    >
      <View style={styles.modalRoot}>
        <KolamModalBackdrop onPress={controller.onCloseOvertimeRequest} />
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text numberOfLines={1} style={styles.modalTitle}>
              Ajukan lembur
            </Text>
            <View style={styles.modalActions}>
              <KolamButton
                disabled={saving}
                intent="outline"
                label="Batal"
                onPress={controller.onCloseOvertimeRequest}
              />
              <KolamButton
                disabled={saving}
                label={saving ? 'Mengirim...' : 'Kirim pengajuan'}
                onPress={() => {
                  void controller.onSubmitOvertimeRequest();
                }}
              />
            </View>
          </View>
          <Text style={styles.metaText}>
            {task?.title || 'Tugas'} - tersedia 3 jam sebelum deadline
          </Text>
          {controller.overtimeRequestError ? (
            <KolamStatusBadge
              intent="danger"
              label={controller.overtimeRequestError}
              numberOfLines={3}
            />
          ) : null}
          <View style={styles.modalContent}>
            <KolamTaskField label="Alasan lembur" required>
              <KolamFormTextField
                multiline
                onChangeText={controller.onSetOvertimeRequestReason}
                placeholder="Alasan"
                style={[
                  settingsWebFormStyles.settingsWebFormFieldValue,
                  settingsWebFormStyles.settingsWebFormFieldValueTextarea,
                ]}
                value={controller.overtimeRequestReason}
              />
            </KolamTaskField>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function KolamTaskDeleteConfirmModal({
  controller,
}: {
  controller: KolamTaskManagerController;
}) {
  const task = controller.deleteTaskConfirmTask;
  const deleting = Boolean(
    task && controller.mutatingTaskId === `delete:${task.id}`,
  );

  return (
    <Modal
      animationType="fade"
      onRequestClose={controller.onCloseDeleteTaskConfirm}
      transparent
      visible={Boolean(task)}
    >
      <View style={styles.modalRoot}>
        <KolamModalBackdrop onPress={controller.onCloseDeleteTaskConfirm} />
        <View style={styles.categoryModalCard}>
          <View style={styles.modalHeader}>
            <Text numberOfLines={1} style={styles.modalTitle}>
              Hapus task
            </Text>
            <View style={styles.modalActions}>
              <KolamButton
                disabled={deleting}
                intent="outline"
                label="Batal"
                onPress={controller.onCloseDeleteTaskConfirm}
              />
              <KolamButton
                disabled={!task || deleting}
                intent="danger"
                label={deleting ? 'Menghapus...' : 'Hapus'}
                onPress={() => {
                  if (task) {
                    void controller.onDeleteTask(task);
                  }
                }}
              />
            </View>
          </View>
          <Text style={styles.metaText}>{task?.title || 'Task'}</Text>
        </View>
      </View>
    </Modal>
  );
}

function KolamTaskTypeDeleteConfirmModal({
  controller,
}: {
  controller: KolamTaskManagerController;
}) {
  const taskType = controller.deleteTaskTypeConfirmTaskType;
  const deleting = Boolean(
    taskType && controller.mutatingTaskId === `task-type:${taskType.id}`,
  );

  return (
    <Modal
      animationType="fade"
      onRequestClose={controller.onCloseDeleteTaskTypeConfirm}
      transparent
      visible={Boolean(taskType)}
    >
      <View style={styles.modalRoot}>
        <KolamModalBackdrop onPress={controller.onCloseDeleteTaskTypeConfirm} />
        <View style={styles.categoryModalCard}>
          <View style={styles.modalHeader}>
            <Text numberOfLines={1} style={styles.modalTitle}>
              Hapus tipe task
            </Text>
            <View style={styles.modalActions}>
              <KolamButton
                disabled={deleting}
                intent="outline"
                label="Batal"
                onPress={controller.onCloseDeleteTaskTypeConfirm}
              />
              <KolamButton
                disabled={!taskType || deleting}
                intent="danger"
                label={deleting ? 'Menghapus...' : 'Hapus'}
                onPress={() => {
                  if (taskType) {
                    void controller.onDeleteTaskType(taskType);
                  }
                }}
              />
            </View>
          </View>
          <Text style={styles.metaText}>{taskType?.name || 'Tipe task'}</Text>
        </View>
      </View>
    </Modal>
  );
}

function KolamTaskCategorySettingsPanel({
  controller,
}: {
  controller: KolamTaskManagerController;
}) {
  return (
    <View style={styles.detailStack}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.detailContext}>
              Pengaturan Kategori Tugas
            </Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamRefreshButton
              accessibilityLabel="Refresh"
              disabled={controller.loading}

              onPress={() => {
                void controller.onRefresh();
              }}
            />
            <KolamButton
              intent="primary"
              label="Kategori"
              onPress={controller.onCreateCategory}
            />
          </View>
        </View>
      </View>

      <View style={styles.detailCard}>
        <View style={styles.categoryHeaderRow}>
          <Text style={[styles.metaText, styles.categoryNameCell]}>Nama</Text>
          <Text style={[styles.metaText, styles.categorySmallCell]}>Warna</Text>
          <Text style={[styles.metaText, styles.categorySmallCell]}>Urutan</Text>
          <Text style={[styles.metaText, styles.categorySmallCell]}>Aktif</Text>
          <View style={styles.categoryActionsCell} />
        </View>
        {controller.categories.length ? (
          controller.categories.map(category => (
            <View key={category.id} style={styles.categoryRow}>
              <Text numberOfLines={1} style={[styles.cellText, styles.categoryNameCell]}>
                {category.name || '-'}
              </Text>
              <View style={styles.categorySmallCell}>
                <View
                  style={[
                    styles.categoryColorSwatch,
                    { backgroundColor: category.color || '#6366f1' },
                  ]}
                />
              </View>
              <Text style={[styles.cellText, styles.categorySmallCell]}>
                {category.sortOrder}
              </Text>
              <KolamStatusBadge
                intent={category.active ? 'success' : 'muted'}
                label={category.active ? 'Ya' : 'Tidak'}
                style={styles.categorySmallCell}
              />
              <View style={styles.categoryActionsCell}>
                <KolamButton
                  disabled={controller.mutatingTaskId === `category:${category.id}`}
                  label="Edit"
                  onPress={() => controller.onEditCategory(category)}
                />
                <KolamButton
                  disabled={controller.mutatingTaskId === `category:${category.id}`}
                  intent="outline"
                  label="Hapus"
                  onPress={() => {
                    void controller.onDeleteCategory(category);
                  }}
                />
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.metaText}>
            {controller.loading ? 'Memuat...' : 'Belum ada kategori'}
          </Text>
        )}
      </View>
    </View>
  );
}

function KolamTaskCategoryFormModal({
  controller,
}: {
  controller: KolamTaskManagerController;
}) {
  const saving =
    controller.mutatingTaskId === 'category:new' ||
    (controller.categoryFormMode === 'edit' &&
      controller.mutatingTaskId?.startsWith('category:'));

  return (
    <Modal
      animationType="fade"
      onRequestClose={controller.onCloseCategoryForm}
      transparent
      visible={controller.categoryFormOpen}
    >
      <View style={styles.modalRoot}>
        <KolamModalBackdrop onPress={controller.onCloseCategoryForm} />
        <View style={styles.categoryModalCard}>
          <View style={styles.modalHeader}>
            <Text numberOfLines={1} style={styles.modalTitle}>
              {controller.categoryFormMode === 'edit' ? 'Edit kategori' : 'Baru kategori'}
            </Text>
            <View style={styles.modalActions}>
              <KolamButton
                disabled={saving}
                intent="outline"
                label="Batal"
                onPress={controller.onCloseCategoryForm}
              />
              <KolamButton
                disabled={saving}
                label={saving ? 'Menyimpan...' : 'Simpan'}
                onPress={() => {
                  void controller.onSaveCategory();
                }}
              />
            </View>
          </View>
          {controller.categoryFormError ? (
            <KolamStatusBadge
              intent="danger"
              label={controller.categoryFormError}
              numberOfLines={3}
            />
          ) : null}
          <KolamTaskField label="Nama" required>
            <KolamFormTextField
              onChangeText={name => controller.onChangeCategoryForm({ name })}
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={controller.categoryForm.name}
            />
          </KolamTaskField>
          <KolamTaskField label="Warna">
            <KolamFormTextField
              onChangeText={color => controller.onChangeCategoryForm({ color })}
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={controller.categoryForm.color}
            />
          </KolamTaskField>
          <KolamTaskField label="Urutan">
            <KolamFormTextField
              mode="numeric"
              onChangeText={sortOrder =>
                controller.onChangeCategoryForm({ sortOrder })
              }
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={controller.categoryForm.sortOrder}
            />
          </KolamTaskField>
          <View style={styles.formSwitchRow}>
            <Text style={styles.cellText}>Aktif</Text>
            <KolamSwitch
              active={controller.categoryForm.active}
              onPress={() =>
                controller.onChangeCategoryForm({
                  active: !controller.categoryForm.active,
                })
              }
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function KolamTaskRecurringBulkEnrollmentModal({
  controller,
}: {
  controller: KolamTaskManagerController;
}) {
  const saving = controller.mutatingTaskId === 'recurring-bulk';
  const taskTypeOptions = controller.taskTypes
    .filter(type => type.active && type.categoryBuckets.includes('enclosure'))
    .map(type => ({ label: type.name, value: type.id }));
  const locationOptions = [
    { label: 'Semua lokasi', value: '' },
    ...controller.recurringBulkLocations.map(location => ({
      label: location.label || location.name,
      value: location.id,
    })),
  ];

  return (
    <Modal
      animationType="fade"
      onRequestClose={controller.onCloseRecurringBulkForm}
      transparent
      visible={controller.recurringBulkFormOpen}
    >
      <View style={styles.modalRoot}>
        <KolamModalBackdrop onPress={controller.onCloseRecurringBulkForm} />
        <View style={styles.categoryModalCard}>
          <View style={styles.modalHeader}>
            <Text numberOfLines={1} style={styles.modalTitle}>
              Bulk enrollment kandang
            </Text>
            <View style={styles.modalActions}>
              <KolamButton
                disabled={saving}
                intent="outline"
                label="Batal"
                onPress={controller.onCloseRecurringBulkForm}
              />
              <KolamButton
                disabled={saving || !controller.recurringBulkForm.taskTypeId}
                label={saving ? 'Menyimpan...' : 'Simpan'}
                onPress={() => {
                  void controller.onSaveRecurringBulkEnrollment();
                }}
              />
            </View>
          </View>
          {controller.recurringBulkFormError ? (
            <KolamStatusBadge
              intent="danger"
              label={controller.recurringBulkFormError}
              numberOfLines={3}
            />
          ) : null}
          <KolamDropdownSelect
            label="Tipe task"
            onChange={taskTypeId =>
              controller.onChangeRecurringBulkForm({ taskTypeId })
            }
            options={taskTypeOptions}
            searchable
            value={controller.recurringBulkForm.taskTypeId}
          />
          {controller.recurringBulkStats ? (
            <Text style={styles.metaText}>
              Aktif: {controller.recurringBulkStats.activeCount} - PIC:{' '}
              {controller.recurringBulkStats.enclosuresWithPic}
            </Text>
          ) : null}
          <View style={styles.formSwitchRow}>
            <Text style={styles.cellText}>
              {controller.recurringBulkForm.active
                ? 'Aktifkan enrollment'
                : 'Nonaktifkan enrollment'}
            </Text>
            <KolamSwitch
              active={controller.recurringBulkForm.active}
              onPress={() =>
                controller.onChangeRecurringBulkForm({
                  active: !controller.recurringBulkForm.active,
                })
              }
            />
          </View>
          <KolamDropdownSelect
            label="Lokasi"
            onChange={locationId =>
              controller.onChangeRecurringBulkForm({ locationId })
            }
            options={locationOptions}
            searchable
            value={controller.recurringBulkForm.locationId}
          />
          <View style={styles.formSwitchRow}>
            <Text style={styles.cellText}>Hanya kandang yang punya PIC</Text>
            <KolamSwitch
              active={controller.recurringBulkForm.allWithPic}
              onPress={() =>
                controller.onChangeRecurringBulkForm({
                  allWithPic: !controller.recurringBulkForm.allWithPic,
                })
              }
            />
          </View>
          <Text style={styles.metaText}>Maks. 500 kandang per operasi.</Text>
        </View>
      </View>
    </Modal>
  );
}

function KolamTaskTypeSettingsPanel({
  controller,
}: {
  controller: KolamTaskManagerController;
}) {
  return (
    <View style={styles.detailStack}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.detailContext}>Tipe Task</Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamRefreshButton
              accessibilityLabel="Refresh"
              disabled={controller.loading}

              onPress={() => {
                void controller.onRefresh();
              }}
            />
            <KolamButton
              intent="primary"
              label="Tambah tipe"
              onPress={controller.onCreateTaskType}
            />
          </View>
        </View>
      </View>

      <View style={styles.detailCard}>
        {controller.taskTypes.length ? (
          controller.taskTypes.map(row => (
            <View key={row.id} style={styles.taskTypeRow}>
              <View style={styles.taskTypeMain}>
                <View style={styles.titleRow}>
                  <Text style={styles.cellText}>{row.key}</Text>
                  {row.isSystem ? (
                    <KolamStatusBadge intent="muted" label="sistem" />
                  ) : null}
                </View>
                <Text style={styles.primaryText}>{row.name}</Text>
                <Text style={styles.metaText}>{row.description || '-'}</Text>
                <View style={styles.badgeRow}>
                  <KolamStatusBadge intent="info" label={row.handler} />
                  <KolamStatusBadge
                    intent={row.requiresProductComponents ? 'warning' : 'muted'}
                    label={row.requiresProductComponents ? 'Produk' : 'Tanpa produk'}
                  />
                  <KolamStatusBadge
                    intent={row.active ? 'success' : 'danger'}
                    label={row.active ? 'Aktif' : 'Nonaktif'}
                  />
                  <KolamStatusBadge intent="muted" label={`Urutan ${row.sortOrder}`} />
                </View>
                <Text style={styles.metaText}>
                  {row.categoryBuckets.length
                    ? row.categoryBuckets.map(getKolamTaskCategoryBucketLabel).join(', ')
                    : 'Semua'}
                </Text>
              </View>
              <View style={styles.categoryActionsCell}>
                <KolamButton
                  disabled={controller.mutatingTaskId === `task-type:${row.id}`}
                  label="Edit"
                  onPress={() => controller.onEditTaskType(row)}
                />
                {!row.isSystem ? (
                  <KolamButton
                    disabled={controller.mutatingTaskId === `task-type:${row.id}`}
                    intent="outline"
                    label="Hapus"
                    onPress={() => controller.onRequestDeleteTaskType(row)}
                  />
                ) : null}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.metaText}>
            {controller.loading ? 'Memuat...' : 'Belum ada tipe'}
          </Text>
        )}
      </View>
    </View>
  );
}

function KolamTaskTypeFormModal({
  controller,
}: {
  controller: KolamTaskManagerController;
}) {
  const saving =
    controller.mutatingTaskId === 'task-type:new' ||
    (controller.taskTypeFormMode === 'edit' &&
      controller.mutatingTaskId?.startsWith('task-type:'));

  return (
    <Modal
      animationType="fade"
      onRequestClose={controller.onCloseTaskTypeForm}
      transparent
      visible={controller.taskTypeFormOpen}
    >
      <View style={styles.modalRoot}>
        <KolamModalBackdrop onPress={controller.onCloseTaskTypeForm} />
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text numberOfLines={1} style={styles.modalTitle}>
              {controller.taskTypeFormMode === 'edit' ? 'Edit tipe task' : 'Tambah tipe task'}
            </Text>
            <View style={styles.modalActions}>
              <KolamButton
                disabled={saving}
                intent="outline"
                label="Batal"
                onPress={controller.onCloseTaskTypeForm}
              />
              <KolamButton
                disabled={saving}
                label={saving ? 'Menyimpan...' : 'Simpan'}
                onPress={() => {
                  void controller.onSaveTaskType();
                }}
              />
            </View>
          </View>
          {controller.taskTypeFormError ? (
            <KolamStatusBadge
              intent="danger"
              label={controller.taskTypeFormError}
              numberOfLines={3}
            />
          ) : null}
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.formGrid}>
              <KolamTaskField label="Key" required>
                <KolamFormTextField
                  editable={!controller.taskTypeFormKeyLocked}
                  onChangeText={key => controller.onChangeTaskTypeForm({ key })}
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={controller.taskTypeForm.key}
                />
              </KolamTaskField>
              <KolamTaskField label="Nama" required>
                <KolamFormTextField
                  onChangeText={name => controller.onChangeTaskTypeForm({ name })}
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={controller.taskTypeForm.name}
                />
              </KolamTaskField>
              <KolamTaskField label="Deskripsi">
                <KolamFormTextField
                  multiline
                  onChangeText={description =>
                    controller.onChangeTaskTypeForm({ description })
                  }
                  style={[
                    settingsWebFormStyles.settingsWebFormFieldValue,
                    settingsWebFormStyles.settingsWebFormFieldValueTextarea,
                  ]}
                  value={controller.taskTypeForm.description}
                />
              </KolamTaskField>
              <KolamDropdownSelect
                label="Handler"
                onChange={handler =>
                  controller.onChangeTaskTypeForm({
                    handler: handler as typeof controller.taskTypeForm.handler,
                  })
                }
                options={[
                  { label: 'Dosing', value: 'dosing' },
                  { label: 'Maintenance', value: 'maintenance' },
                ]}
                value={controller.taskTypeForm.handler}
              />
              <KolamTaskField label="Urutan">
                <KolamFormTextField
                  mode="numeric"
                  onChangeText={sortOrder =>
                    controller.onChangeTaskTypeForm({ sortOrder })
                  }
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={controller.taskTypeForm.sortOrder}
                />
              </KolamTaskField>
            </View>
            <View style={styles.bucketRow}>
              {TASK_TYPE_BUCKET_OPTIONS.map(option => (
                <KolamButton
                  intent={
                    controller.taskTypeForm.categoryBuckets.includes(option.id)
                      ? 'primary'
                      : 'outline'
                  }
                  key={option.id}
                  label={option.label}
                  onPress={() =>
                    controller.onChangeTaskTypeForm({
                      categoryBuckets: toggleTaskTypeBucket(
                        controller.taskTypeForm.categoryBuckets,
                        option.id,
                      ),
                    })
                  }
                />
              ))}
            </View>
            <View style={styles.formSwitchRow}>
              <Text style={styles.cellText}>Butuh komponen produk</Text>
              <KolamSwitch
                active={controller.taskTypeForm.requiresProductComponents}
                onPress={() =>
                  controller.onChangeTaskTypeForm({
                    requiresProductComponents:
                      !controller.taskTypeForm.requiresProductComponents,
                  })
                }
              />
            </View>
            <View style={styles.formSwitchRow}>
              <Text style={styles.cellText}>Aktif</Text>
              <KolamSwitch
                active={controller.taskTypeForm.active}
                onPress={() =>
                  controller.onChangeTaskTypeForm({
                    active: !controller.taskTypeForm.active,
                  })
                }
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function toggleTaskTypeBucket(
  current: KolamTaskManagerController['taskTypeForm']['categoryBuckets'],
  bucket: KolamTaskManagerController['taskTypeForm']['categoryBuckets'][number],
) {
  const next = current.includes(bucket)
    ? current.filter(item => item !== bucket)
    : current.length >= 2
      ? current
      : [...current, bucket];
  return next;
}

function KolamTaskField({
  children,
  label,
  required = false,
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <View style={settingsWebFormStyles.settingsWebFormField}>
      <KolamSettingsWebFieldLabel label={label} required={required} />
      {children}
    </View>
  );
}

function KolamTaskRecurringTemplateFormModal({
  controller,
}: {
  controller: KolamTaskManagerController;
}) {
  const saving = controller.mutatingTaskId === 'recurring-template:new';
  const taskTypeOptions = controller.taskTypes
    .filter(type => type.active && type.categoryBuckets.includes('enclosure'))
    .map(type => ({ label: type.name, value: type.id }));

  return (
    <Modal
      animationType="fade"
      onRequestClose={controller.onCloseRecurringTemplateForm}
      transparent
      visible={controller.recurringTemplateFormOpen}
    >
      <View style={styles.modalRoot}>
        <KolamModalBackdrop onPress={controller.onCloseRecurringTemplateForm} />
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text numberOfLines={1} style={styles.modalTitle}>
              Template tugas berulang
            </Text>
            <View style={styles.modalActions}>
              <KolamButton
                disabled={saving}
                intent="outline"
                label="Batal"
                onPress={controller.onCloseRecurringTemplateForm}
              />
              <KolamButton
                disabled={saving}
                label={saving ? 'Menyimpan...' : 'Simpan'}
                onPress={() => {
                  void controller.onSaveRecurringTemplate();
                }}
              />
            </View>
          </View>
          {controller.recurringTemplateFormError ? (
            <KolamStatusBadge
              intent="danger"
              label={controller.recurringTemplateFormError}
              numberOfLines={3}
            />
          ) : null}
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.formGrid}>
              <KolamTaskField label="Judul" required>
                <KolamFormTextField
                  onChangeText={title =>
                    controller.onChangeRecurringTemplateForm({ title })
                  }
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={controller.recurringTemplateForm.title}
                />
              </KolamTaskField>
              <KolamTaskField label="Deskripsi">
                <KolamFormTextField
                  multiline
                  onChangeText={description =>
                    controller.onChangeRecurringTemplateForm({ description })
                  }
                  style={[
                    settingsWebFormStyles.settingsWebFormFieldValue,
                    settingsWebFormStyles.settingsWebFormFieldValueTextarea,
                  ]}
                  value={controller.recurringTemplateForm.description}
                />
              </KolamTaskField>
              <KolamDropdownSelect
                label="Maintainer"
                onChange={assignedToId =>
                  controller.onChangeRecurringTemplateForm({ assignedToId })
                }
                options={controller.staffOptions.map(option => ({
                  label: option.label,
                  value: option.id,
                }))}
                value={controller.recurringTemplateForm.assignedToId}
              />
              <KolamDropdownSelect
                label="Tipe task kandang"
                onChange={taskTypeId =>
                  controller.onChangeRecurringTemplateForm({
                    taskTypeId: taskTypeId === '__none__' ? '' : taskTypeId,
                  })
                }
                options={[
                  { label: 'Umum', value: '__none__' },
                  ...taskTypeOptions,
                ]}
                value={
                  controller.recurringTemplateForm.taskTypeId || '__none__'
                }
              />
              {controller.recurringTemplateForm.taskTypeId ? (
                <KolamTaskField label="Review sampel (%)">
                  <KolamFormTextField
                    mode="numeric"
                    onChangeText={sampleReviewPercent =>
                      controller.onChangeRecurringTemplateForm({
                        sampleReviewPercent,
                      })
                    }
                    style={settingsWebFormStyles.settingsWebFormFieldValue}
                    value={controller.recurringTemplateForm.sampleReviewPercent}
                  />
                </KolamTaskField>
              ) : null}
              <KolamDropdownSelect
                label="Frekuensi"
                onChange={recurrenceType =>
                  controller.onChangeRecurringTemplateForm({
                    recurrenceType:
                      recurrenceType as typeof controller.recurringTemplateForm.recurrenceType,
                  })
                }
                options={[
                  { label: 'Harian', value: 'daily' },
                  { label: 'Mingguan', value: 'weekly' },
                  { label: 'Bulanan', value: 'monthly' },
                ]}
                value={controller.recurringTemplateForm.recurrenceType}
              />
              {controller.recurringTemplateForm.recurrenceType === 'weekly' ? (
                <KolamDropdownSelect
                  label="Hari"
                  onChange={weekPreset =>
                    controller.onChangeRecurringTemplateForm({
                      weekPreset:
                        weekPreset as typeof controller.recurringTemplateForm.weekPreset,
                    })
                  }
                  options={[
                    { label: 'Sen-Jum', value: 'weekdays' },
                    { label: 'Setiap hari', value: 'all' },
                  ]}
                  value={controller.recurringTemplateForm.weekPreset}
                />
              ) : null}
              {controller.recurringTemplateForm.recurrenceType === 'monthly' ? (
                <KolamTaskField label="Tanggal">
                  <KolamFormTextField
                    mode="numeric"
                    onChangeText={dayOfMonth =>
                      controller.onChangeRecurringTemplateForm({ dayOfMonth })
                    }
                    style={settingsWebFormStyles.settingsWebFormFieldValue}
                    value={controller.recurringTemplateForm.dayOfMonth}
                  />
                </KolamTaskField>
              ) : null}
              <KolamTaskField label="Jam">
                <KolamFormTextField
                  onChangeText={time =>
                    controller.onChangeRecurringTemplateForm({ time })
                  }
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={controller.recurringTemplateForm.time}
                />
              </KolamTaskField>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function KolamTaskManagerPlaceholder({
  mode,
}: {
  mode: KolamTaskManagerController['mode'];
}) {
  const label =
    mode === 'categories'
        ? 'Kategori'
        : 'Tipe Tugas';
  return (
    <View style={styles.placeholder}>
      <KolamStatusBadge intent="info" label={label} />
      <Text style={styles.placeholderText}>Masuk batch berikutnya</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 12,
    minHeight: 0,
  },
  stack: {
    alignSelf: 'stretch',
    gap: 12,
    minHeight: 0,
    width: '100%',
  },
  tabRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  messageBadge: {
    alignSelf: 'flex-start',
  },
  kpiRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 8,
    minWidth: 0,
    width: '100%',
  },
  kpiCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    overflow: 'hidden',
    padding: 0,
    position: 'relative',
  },
  kpiAccent: {
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
    bottom: 10,
    left: 0,
    position: 'absolute',
    top: 10,
    width: 3,
  },
  kpiAccentDanger: {
    backgroundColor: V.colors.danger,
  },
  kpiAccentInfo: {
    backgroundColor: V.colors.info,
  },
  kpiAccentMuted: {
    backgroundColor: V.colors.border,
  },
  kpiAccentSuccess: {
    backgroundColor: V.colors.success,
  },
  kpiAccentWarning: {
    backgroundColor: V.colors.warning,
  },
  kpiBody: {
    gap: 2,
    minWidth: 0,
    paddingHorizontal: 14,
    paddingLeft: 16,
    paddingVertical: 12,
  },
  kpiBodyWithIcon: {
    paddingRight: 66,
  },
  kpiIconShell: {
    alignItems: 'center',
    borderRadius: 999,
    bottom: 6,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'absolute',
    right: 8,
    top: 6,
    width: 46,
  },
  kpiCardIcon: {
    height: '100%',
    width: '100%',
  },
  kpiLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  kpiValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  taskToolbarWrap: {
    alignSelf: 'stretch',
    elevation: 1000,
    overflow: 'visible',
    position: 'relative',
    width: '100%',
    zIndex: 100000,
  },
  taskToolbarStack: {
    alignSelf: 'stretch',
    gap: 6,
    overflow: 'visible',
    width: '100%',
  },
  taskToolbarSearchRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    overflow: 'visible',
    width: '100%',
  },
  taskFilterFillItem: {
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 82,
  },
  taskFilterFillTrigger: {
    width: '100%',
  },
  taskFilterFillText: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    textAlign: 'left',
  },
  taskToolbarButton: {
    minHeight: 34,
    paddingHorizontal: 10,
  },
  taskFilterOverlayPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 1200,
    padding: 6,
    position: 'absolute',
    shadowColor: V.colors.fg,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    zIndex: 120000,
  },
  taskFilterPanelScroll: {
    maxHeight: 280,
  },
  taskFilterPanelContent: {
    gap: 4,
  },
  taskFilterPanelOption: {
    justifyContent: 'flex-start',
  },
  taskFilterPanelFooter: {
    alignItems: 'flex-end',
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    marginTop: 6,
    paddingTop: 6,
  },
  switchInline: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  metaText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  taskListTable: {
    alignSelf: 'stretch',
    minHeight: 0,
    width: '100%',
  },
  recurringScheduleTable: {
    alignSelf: 'stretch',
    width: '100%',
  },
  taskTitleCell: {
    minWidth: 0,
  },
  recurringScheduleTitleCell: {
    alignItems: 'flex-start',
    gap: 4,
    minWidth: 0,
    width: '100%',
  },
  centerCell: {
    alignItems: 'center',
    minWidth: 0,
    width: '100%',
  },
  centerText: {
    textAlign: 'center',
    width: '100%',
  },
  taskUserTooltip: {
    alignSelf: 'center',
  },
  taskUserAvatar: {
    alignItems: 'center',
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.border,
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 32,
  },
  taskUserAvatarImage: {
    borderRadius: 16,
    height: 32,
    overflow: 'hidden',
    width: 32,
  },
  taskUserAvatarText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  tableSelect: {
    alignSelf: 'stretch',
    minWidth: 0,
    width: '100%',
  },
  tableSelectTrigger: {
    minWidth: 0,
    width: '100%',
  },
  primaryText: {
    color: V.colors.fg,
    flexShrink: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
    minWidth: 0,
  },
  cellText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  dangerText: {
    color: V.colors.danger,
    fontWeight: '900',
  },
  taskCountdownStack: {
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
    width: '100%',
  },
  taskCountdownDuration: {
    textAlign: 'center',
    width: '100%',
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    minWidth: 0,
  },
  urgent: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
  },
  badgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  placeholder: {
    alignItems: 'flex-start',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  placeholderText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  detailStack: {
    gap: 12,
    minHeight: 0,
  },
  detailContext: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  detailHeader: {
    alignItems: 'flex-start',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    padding: 14,
  },
  detailTitleBlock: {
    flex: 1,
    gap: 8,
    minWidth: 240,
  },
  detailTitle: {
    color: V.colors.fg,
    flexShrink: 1,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relatedChipRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailMetric: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    gap: 6,
    minWidth: 160,
    padding: 12,
  },
  detailCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  checklistRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  checklistAddRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  checklistDraftInput: {
    flex: 1,
    minWidth: 220,
  },
  checklistAssigneeSelect: {
    minWidth: 150,
  },
  noteAddRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noteDraftInput: {
    flex: 1,
    minWidth: 260,
  },
  timelineRow: {
    borderColor: V.colors.border,
    borderRadius: V.radius.md,
    borderWidth: 1,
    gap: 4,
    padding: 10,
  },
  discussionRow: {
    borderColor: V.colors.border,
    borderRadius: V.radius.md,
    borderWidth: 1,
    gap: 8,
    padding: 10,
  },
  crmOrderStack: {
    gap: 6,
  },
  crmOrderRow: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: V.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    padding: 10,
  },
  ratingSummaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  ratingScore: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  attachmentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  discussionAttachmentImage: {
    borderRadius: V.radius.md,
    height: 96,
    width: 96,
  },
  discussionAttachmentVideo: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.md,
    borderWidth: 1,
    height: 96,
    justifyContent: 'center',
    width: 128,
  },
  discussionAttachmentVideoText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  discussionActionStack: {
    alignItems: 'flex-start',
    gap: 8,
  },
  enrollmentSummaryList: {
    gap: 8,
  },
  enrollmentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  timelineTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  timelineMessage: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  modalRoot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    elevation: 8,
    gap: 12,
    maxHeight: '92%',
    maxWidth: 900,
    minHeight: 420,
    overflow: 'hidden',
    padding: 14,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  modalTitle: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
    minWidth: 180,
  },
  modalActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalContent: {
    gap: 14,
    paddingBottom: 8,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formSwitchRow: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: V.control.inputHeight,
    minWidth: 180,
    paddingHorizontal: 12,
  },
  categoryHeaderRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 8,
  },
  categoryRow: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: V.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 10,
  },
  categoryNameCell: {
    flex: 1,
    minWidth: 180,
  },
  categorySmallCell: {
    minWidth: 72,
  },
  categoryActionsCell: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
    minWidth: 140,
  },
  categoryColorSwatch: {
    borderColor: V.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 18,
    width: 18,
  },
  categoryModalCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    elevation: 8,
    gap: 12,
    maxWidth: 520,
    padding: 14,
    width: '100%',
  },
  taskTypeRow: {
    alignItems: 'flex-start',
    borderColor: V.colors.border,
    borderRadius: V.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 12,
  },
  taskTypeMain: {
    flex: 1,
    gap: 6,
    minWidth: 260,
  },
  bucketRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
