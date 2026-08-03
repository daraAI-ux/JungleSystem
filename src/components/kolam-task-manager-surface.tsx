import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  formatKolamTaskListDatetime,
  getKolamTaskChecklistProgress,
  getKolamTaskCategoryBucketLabel,
  getKolamTaskPriorityBadgeIntent,
  getKolamTaskPriorityLabel,
  getKolamTaskStatusBadgeIntent,
  getKolamTaskStatusLabel,
  getKolamTaskStatusOptionsForUser,
  getKolamTaskTimelineLabel,
  getKolamTaskUserDisplayName,
  isKolamTaskOverdue,
  KOLAM_TASK_CATEGORY_BUCKET_OPTIONS,
  KOLAM_TASK_PRIORITY_OPTIONS,
  KOLAM_TASK_STATUS_OPTIONS,
  type KolamTaskCategoryBucket,
  type KolamTaskManagerTask,
} from '../domain/kolam-task-manager';
import type { KolamTableColumn } from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamTaskManagerController,
  type KolamTaskManagerController,
} from '../hooks/use-kolam-task-manager-controller';
import { KolamButton } from './kolam-button';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamDateField } from './kolam-date-field';
import {
  getKolamDataTableColumnStyle,
  KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  KOLAM_DATA_TABLE_COLUMN_GAP,
} from './kolam-data-table-column-style';
import { KolamDataTableHeader } from './kolam-data-table-header';
import { KolamDataTableRowFrame } from './kolam-data-table-row-frame';
import {
  KolamDataTableActionsTrack,
  KolamDataTableMainTrack,
} from './kolam-data-table-tracks';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamHtmlContent } from './kolam-html-content';
import { KolamModalBackdrop } from './kolam-modal-backdrop';
import { KolamSearchField } from './kolam-search-field';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamSwitch } from './kolam-switch';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';
import { KolamTipTapRichTextEditor } from './kolam-tiptap-rich-text-editor';

const LIST_COLUMNS: KolamTableColumn[] = [
  { id: 'primary', label: 'Tugas', align: 'left', width: 240 },
  { id: 'meta', label: 'PIC', align: 'left', width: 130 },
  { id: 'children', label: 'Asisten', align: 'left', width: 110 },
  { id: 'status', label: 'Status', align: 'left', width: 140 },
  { id: 'notes', label: 'Prioritas', align: 'left', width: 112 },
  { id: 'amount', label: 'Due', align: 'left', width: 120 },
  {
    id: 'actions',
    label: '',
    align: 'right',
    width: KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  },
];

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

  return (
    <View style={styles.surface}>
      <KolamTaskManagerTabs controller={controller} />
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
        <KolamTaskRecurringPanel controller={controller} />
      ) : controller.mode === 'list' ? (
        <KolamTaskManagerList
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : controller.mode === 'detail' ? (
        <KolamTaskManagerDetail controller={controller} />
      ) : controller.mode === 'categories' ? (
        <KolamTaskCategorySettingsPanel controller={controller} />
      ) : controller.mode === 'task-types' ? (
        <KolamTaskTypeSettingsPanel controller={controller} />
      ) : (
        <KolamTaskManagerPlaceholder mode={controller.mode} />
      )}
      <KolamTaskFormModal controller={controller} />
      <KolamTaskCategoryFormModal controller={controller} />
      <KolamTaskTypeFormModal controller={controller} />
    </View>
  );
}

function KolamTaskManagerDetail({
  controller,
}: {
  controller: KolamTaskManagerController;
}) {
  const task = controller.selectedTask;
  if (controller.loading && !task) {
    return <KolamEmptyState message="Memuat tugas..." title="Detail tugas" />;
  }
  if (!task) {
    return <KolamEmptyState message="Tugas tidak ditemukan" title="Detail tugas" />;
  }

  const checklistProgress = getKolamTaskChecklistProgress(task);
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
            <KolamButton
              disabled={controller.mutatingTaskId === task.id}
              label="Ubah"
              onPress={() => controller.onEditTask(task)}
            />
            <KolamButton
              disabled={controller.loading}
              label="Refresh"
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
            {task.urgent ? <Text style={styles.urgent}>!</Text> : null}
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

      <View style={styles.detailGrid}>
        <KolamTaskDetailMetric label="PIC" value={getKolamTaskUserDisplayName(task.assignedTo)} />
        <KolamTaskDetailMetric label="Dibantu" value={getKolamTaskUserDisplayName(task.assistedBy)} />
        <KolamTaskDetailMetric label="Due" value={formatKolamTaskListDatetime(task.dueDate)} />
        <KolamTaskDetailMetric
          label="Checklist"
          value={
            checklistProgress
              ? `${checklistProgress.done}/${checklistProgress.total}`
              : '-'
          }
        />
      </View>

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
        {task.checklist.length ? (
          task.checklist.map((item, index) => (
            <View key={item.id || item.title} style={styles.checklistRow}>
              <KolamButton
                disabled={controller.mutatingTaskId === `checklist:${task.id}`}
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
              <KolamButton
                disabled={controller.mutatingTaskId === `checklist:${task.id}`}
                intent="outline"
                label="Hapus"
                onPress={() => {
                  void controller.onRemoveChecklistItem(index);
                }}
              />
            </View>
          ))
        ) : (
          <Text style={styles.metaText}>Kosong</Text>
        )}
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
                    <KolamStatusBadge
                      intent="muted"
                      key={
                        attachment.path || attachment.fileName || attachment.mimeType
                      }
                      label={
                        attachment.fileName || attachment.path || attachment.type
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
        <View style={styles.noteAddRow}>
          <KolamFormTextField
            multiline
            onChangeText={controller.onSetDiscussionDraft}
            placeholder="Pesan"
            style={[
              settingsWebFormStyles.settingsWebFormFieldValue,
              settingsWebFormStyles.settingsWebFormFieldValueTextarea,
              styles.noteDraftInput,
            ]}
            value={controller.discussionDraft}
          />
          <KolamButton
            disabled={
              controller.mutatingTaskId === `discussion:${task.id}` ||
              !controller.discussionDraft.trim()
            }
            label="Kirim"
            onPress={() => {
              void controller.onAddDiscussion();
            }}
          />
        </View>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Timeline</Text>
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
        {task.timeline.length ? (
          task.timeline.map(item => (
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
  const [tableBodyWidth, setTableBodyWidth] = React.useState(0);
  const columns = React.useMemo(
    () => fitTaskColumns(tableBodyWidth),
    [tableBodyWidth],
  );

  return (
    <View style={styles.stack}>
      <KolamTaskKpiRow controller={controller} />
      <KolamTaskToolbar controller={controller} />
      <KolamCatalogListTableShell
        footer={
          <KolamTableFooterControls
            onPageSizeChange={controller.onSetPageSize}
            page={controller.page}
            pageSize={controller.pageSize}
            total={controller.total}
          >
            {controller.totalPages > 1 ? (
              <View style={styles.paginationRow}>
                <KolamButton
                  disabled={controller.page <= 1 || controller.loading}
                  label="Sebelumnya"
                  onPress={() =>
                    controller.onSelectPage(Math.max(1, controller.page - 1))
                  }
                />
                <Text style={styles.pageLabel}>
                  {controller.page} / {controller.totalPages}
                </Text>
                <KolamButton
                  disabled={
                    controller.page >= controller.totalPages || controller.loading
                  }
                  label="Berikutnya"
                  onPress={() =>
                    controller.onSelectPage(
                      Math.min(controller.totalPages, controller.page + 1),
                    )
                  }
                />
              </View>
            ) : null}
          </KolamTableFooterControls>
        }
        onBodyWidthChange={setTableBodyWidth}
      >
        <KolamDataTableHeader columns={columns} />
        {controller.loading && controller.tasks.length === 0 ? (
          <KolamEmptyState message="Memuat tugas..." title="Task Manager" />
        ) : null}
        {!controller.loading && controller.tasks.length === 0 ? (
          <KolamEmptyState message="Belum ada tugas" title="Tugas kosong" />
        ) : null}
        {controller.tasks.map(task => (
          <KolamTaskRow
            columns={columns}
            controller={controller}
            key={task.id}
            onRouteChange={onRouteChange}
            task={task}
          />
        ))}
      </KolamCatalogListTableShell>
    </View>
  );
}

function KolamTaskKpiRow({
  controller,
}: {
  controller: KolamTaskManagerController;
}) {
  const cards = [
    { id: 'todo', label: 'To Do', value: controller.kpi.todo, tone: 'primary' },
    {
      id: 'progress',
      label: 'Sedang berjalan',
      value: controller.kpi.inProgress,
      tone: 'info',
    },
    { id: 'done', label: 'Selesai', value: controller.kpi.done, tone: 'success' },
    {
      id: 'overdue',
      label: 'Overdue',
      value: controller.kpi.overdue,
      tone: 'danger',
    },
    { id: 'total', label: 'Total', value: controller.kpi.total, tone: 'muted' },
  ] as const;

  return (
    <View style={styles.kpiRow}>
      {cards.map(card => (
        <View key={card.id} style={styles.kpiCard}>
          <KolamStatusBadge intent={card.tone} label={card.label} />
          <Text style={styles.kpiValue}>{card.value}</Text>
        </View>
      ))}
    </View>
  );
}

function KolamTaskToolbar({
  controller,
}: {
  controller: KolamTaskManagerController;
}) {
  return (
    <View style={kolamTableToolbarStyles.shell}>
      <View style={kolamTableToolbarStyles.row}>
        <View style={kolamTableToolbarStyles.filters}>
          <KolamSearchField
            containerStyle={kolamTableToolbarStyles.searchInput}
            onChangeText={controller.onSetSearch}
            placeholder="Cari tugas..."
            value={controller.search}
          />
          <KolamDropdownSelect
            label="Bucket"
            onChange={value =>
              controller.onSetCategoryBucketFilter(
                value as typeof controller.categoryBucketFilter,
              )
            }
            options={KOLAM_TASK_CATEGORY_BUCKET_OPTIONS.map(option => ({
              label: option.label,
              value: option.id,
            }))}
            showLabelInTrigger={false}
            value={controller.categoryBucketFilter}
          />
          <KolamDropdownSelect
            label="Kategori"
            onChange={controller.onSetCategoryFilter}
            options={[
              { label: 'Kategori', value: 'all' },
              ...controller.categories.map(category => ({
                label: category.name,
                value: category.id,
              })),
            ]}
            searchable
            showLabelInTrigger={false}
            value={controller.categoryFilter}
          />
          <KolamDropdownSelect
            label="Status"
            onChange={value =>
              controller.onSetStatusFilter(value as typeof controller.statusFilter)
            }
            options={KOLAM_TASK_STATUS_OPTIONS.map(option => ({
              label: option.label,
              value: option.id,
            }))}
            showLabelInTrigger={false}
            value={controller.statusFilter}
          />
          <KolamDropdownSelect
            label="Prioritas"
            onChange={value =>
              controller.onSetPriorityFilter(
                value as typeof controller.priorityFilter,
              )
            }
            options={KOLAM_TASK_PRIORITY_OPTIONS.map(option => ({
              label: option.label,
              value: option.id,
            }))}
            showLabelInTrigger={false}
            value={controller.priorityFilter}
          />
        </View>
        <View style={kolamTableToolbarStyles.actions}>
          <View style={styles.switchInline}>
            <Text style={styles.metaText}>Tugas saya</Text>
            <KolamSwitch
              active={controller.mineOnly}
              onPress={() => controller.onSetMineOnly(!controller.mineOnly)}
            />
          </View>
          <KolamButton
            disabled={controller.loading}
            label="Reset"
            onPress={controller.onResetFilters}
          />
          <KolamButton
            disabled={controller.loading}
            label="Refresh"
            onPress={() => {
              void controller.onRefresh();
            }}
          />
          <KolamButton
            intent="primary"
            label="Baru"
            onPress={controller.onCreateNew}
          />
        </View>
      </View>
    </View>
  );
}

function KolamTaskRow({
  columns,
  controller,
  onRouteChange,
  task,
}: {
  columns: KolamTableColumn[];
  controller: KolamTaskManagerController;
  onRouteChange?: (route: string) => void;
  task: KolamTaskManagerTask;
}) {
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

  return (
    <KolamDataTableRowFrame>
      <KolamDataTableMainTrack>
        <Pressable
          accessibilityRole="button"
          onPress={() => onRouteChange?.(`/task-manager/${task.id}`)}
          style={getKolamDataTableColumnStyle(columns[0])}
        >
          <View style={styles.titleRow}>
            {task.urgent ? <Text style={styles.urgent}>!</Text> : null}
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
            {task.category && typeof task.category === 'object' ? (
              <KolamStatusBadge intent="info" label={task.category.name} />
            ) : null}
          </View>
        </Pressable>
        <View style={getKolamDataTableColumnStyle(columns[1])}>
          <Text numberOfLines={1} style={styles.cellText}>
            {getKolamTaskUserDisplayName(task.assignedTo)}
          </Text>
        </View>
        <View style={getKolamDataTableColumnStyle(columns[2])}>
          <Text numberOfLines={1} style={styles.cellText}>
            {getKolamTaskUserDisplayName(task.assistedBy)}
          </Text>
        </View>
        <View style={getKolamDataTableColumnStyle(columns[3])}>
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
                label: option.label,
                value: option.id,
              }))}
              showLabelInTrigger={false}
              value={task.status}
            />
          )}
        </View>
        <View style={getKolamDataTableColumnStyle(columns[4])}>
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
              value={task.priority}
            />
          )}
        </View>
        <View style={getKolamDataTableColumnStyle(columns[5])}>
          <Text
            numberOfLines={1}
            style={[styles.cellText, overdue && styles.dangerText]}
          >
            {formatKolamTaskListDatetime(task.dueDate)}
          </Text>
        </View>
      </KolamDataTableMainTrack>
      <KolamDataTableActionsTrack>
        <KolamOverflowMenuButton
          actions={[
            {
              label: 'Detail',
              onPress: () => onRouteChange?.(`/task-manager/${task.id}`),
            },
            {
              disabled: controller.mutatingTaskId === task.id,
              label: 'Ubah',
              onPress: () => controller.onEditTask(task),
            },
          ]}
        />
      </KolamDataTableActionsTrack>
    </KolamDataTableRowFrame>
  );
}

function KolamTaskRecurringPanel({
  controller,
}: {
  controller: KolamTaskManagerController;
}) {
  const scheduleRows = [
    ...controller.recurringOccurrences.map(row => ({
      id: `occ-${row.id}`,
      kind: 'internal' as const,
      title: row.title,
      category: row.categoryLabel || getKolamTaskCategoryBucketLabel(row.categoryBucket),
      status: row.status,
      assignedTo: row.assignedTo,
      scheduledAt: row.scheduledAt,
      dueAt: row.dueAt,
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
      taskId: '',
    })),
  ].sort(
    (a, b) =>
      new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
  );

  return (
    <View style={styles.detailStack}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text style={styles.detailContext}>Tugas berulang</Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            {controller.isTaskAdmin ? (
              <View style={styles.switchInline}>
                <Text style={styles.metaText}>Hanya enclosure</Text>
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
            <KolamButton
              disabled={controller.loading}
              label="Refresh"
              onPress={() => {
                void controller.onRefresh();
              }}
            />
            {controller.isTaskAdmin ? (
              <KolamButton
                disabled={controller.mutatingTaskId === 'recurring'}
                label="Generate hari ini"
                onPress={() => {
                  void controller.onRunRecurringTick();
                }}
              />
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Template aktif</Text>
        {controller.recurringTemplates.length ? (
          controller.recurringTemplates.map(template => (
            <View key={template.id} style={styles.timelineRow}>
              <Text style={styles.timelineTitle}>{template.title}</Text>
              <View style={styles.badgeRow}>
                <KolamStatusBadge
                  intent={getKolamTaskPriorityBadgeIntent(template.priority)}
                  label={getKolamTaskPriorityLabel(template.priority)}
                />
                <KolamStatusBadge
                  intent={template.active ? 'success' : 'muted'}
                  label={template.active ? 'Aktif' : 'Nonaktif'}
                />
              </View>
              <Text style={styles.metaText}>
                {getRecurrenceLabel(template.recurrence)} -{' '}
                {getKolamTaskUserDisplayName(template.assignedTo)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.metaText}>
            {controller.loading ? 'Memuat...' : 'Belum ada template'}
          </Text>
        )}
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Jadwal / occurrence</Text>
        {scheduleRows.length ? (
          scheduleRows.map(row => (
            <Pressable
              accessibilityRole="button"
              key={row.id}
              style={styles.timelineRow}
            >
              <View style={styles.titleRow}>
                <Text style={styles.timelineTitle}>{row.title || '-'}</Text>
                <KolamStatusBadge
                  intent={getRecurringStatusIntent(row.status)}
                  label={row.status}
                />
              </View>
              <Text style={styles.metaText}>
                {row.kind === 'internal' ? 'Internal' : 'Subscription'} -{' '}
                {row.category || '-'}
              </Text>
              <Text style={styles.metaText}>
                {formatKolamTaskListDatetime(row.scheduledAt)} -{' '}
                {formatKolamTaskListDatetime(row.dueAt)}
              </Text>
              <Text style={styles.metaText}>
                {getKolamTaskUserDisplayName(row.assignedTo)}
              </Text>
            </Pressable>
          ))
        ) : (
          <Text style={styles.metaText}>
            {controller.loading ? 'Memuat...' : 'Belum ada occurrence'}
          </Text>
        )}
      </View>
    </View>
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
  const categoryOptions = [
    { label: 'Pilih kategori', value: '' },
    ...controller.categories.map(category => ({
      label: category.name,
      value: category.id,
    })),
  ];
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
                onChangeText={description =>
                  controller.onChangeForm({ description })
                }
                placeholder="Deskripsi"
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
                onChange={categoryId => controller.onChangeForm({ categoryId })}
                options={categoryOptions}
                searchable
                value={controller.form.categoryId}
              />
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
            <KolamButton
              disabled={controller.loading}
              label="Refresh"
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
            <KolamButton
              disabled={controller.loading}
              label="Refresh"
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
                    intent={row.active ? 'success' : 'muted'}
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
                    onPress={() => {
                      void controller.onDeleteTaskType(row);
                    }}
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

function fitTaskColumns(tableBodyWidth: number): KolamTableColumn[] {
  if (tableBodyWidth <= 0) return LIST_COLUMNS;
  const flexible = LIST_COLUMNS.filter(column => column.id !== 'actions');
  const actionsWidth = KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH;
  const gapTotal = KOLAM_DATA_TABLE_COLUMN_GAP * (LIST_COLUMNS.length - 1);
  const available = Math.max(520, tableBodyWidth - actionsWidth - gapTotal);
  const baseWidth = flexible.reduce(
    (sum, column) => sum + (column.width ?? 100),
    0,
  );
  const scale = available / Math.max(1, baseWidth);
  return [
    ...flexible.map(column => ({
      ...column,
      width: Math.max(72, Math.round((column.width ?? 100) * scale)),
    })),
    { ...LIST_COLUMNS[LIST_COLUMNS.length - 1], width: actionsWidth },
  ];
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 12,
    minHeight: 0,
    padding: 16,
  },
  stack: {
    gap: 12,
    minHeight: 0,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kpiCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    gap: 8,
    minWidth: 120,
    padding: 12,
  },
  kpiValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
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
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
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
  attachmentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
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
