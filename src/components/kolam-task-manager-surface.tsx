import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
import { KolamHtmlContent } from './kolam-html-content';
import { KolamSearchField } from './kolam-search-field';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamSwitch } from './kolam-switch';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

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
        <KolamTaskRecurringPlaceholder />
      ) : controller.mode === 'list' ? (
        <KolamTaskManagerList
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : controller.mode === 'detail' ? (
        <KolamTaskManagerDetail controller={controller} />
      ) : (
        <KolamTaskManagerPlaceholder mode={controller.mode} />
      )}
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
        <Text style={styles.sectionTitle}>Checklist</Text>
        {task.checklist.length ? (
          task.checklist.map(item => (
            <View key={item.id || item.title} style={styles.checklistRow}>
              <KolamStatusBadge
                intent={item.done ? 'success' : 'muted'}
                label={item.done ? 'Selesai' : 'Open'}
              />
              <Text style={styles.cellText}>{item.title}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.metaText}>Kosong</Text>
        )}
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Timeline</Text>
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
          ]}
        />
      </KolamDataTableActionsTrack>
    </KolamDataTableRowFrame>
  );
}

function KolamTaskRecurringPlaceholder() {
  return (
    <View style={styles.placeholder}>
      <KolamStatusBadge intent="info" label="Tugas Terjadwal" />
      <Text style={styles.placeholderText}>Recurring masuk batch berikutnya</Text>
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
  checklistRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timelineRow: {
    borderColor: V.colors.border,
    borderRadius: V.radius.md,
    borderWidth: 1,
    gap: 4,
    padding: 10,
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
});
