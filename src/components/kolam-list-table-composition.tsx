import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCatalogListTableShell} from './kolam-catalog-list-table-shell';
import {KolamEmptyState} from './kolam-empty-state';

export type KolamListTableColumn<TRow> = {
  align?: 'left' | 'center' | 'right';
  flex: number;
  id: string;
  label: string;
  render: (row: TRow) => React.ReactNode;
};

export function KolamListTableComposition<TRow>({
  actionsColumn = false,
  emptyTitle,
  fill = false,
  footer,
  getRowKey,
  loading = false,
  onBodyWidthChange,
  renderActions,
  rowStyle,
  rows,
  style,
  columns,
}: {
  actionsColumn?: boolean;
  columns: Array<KolamListTableColumn<TRow>>;
  emptyTitle?: string;
  fill?: boolean;
  footer: React.ReactNode;
  getRowKey: (row: TRow, index: number) => string;
  loading?: boolean;
  onBodyWidthChange?: (width: number) => void;
  renderActions?: (row: TRow) => React.ReactNode;
  rowStyle?: StyleProp<ViewStyle>;
  rows: TRow[];
  style?: StyleProp<ViewStyle>;
}) {
  const shouldRenderActionsColumn = actionsColumn || Boolean(renderActions);

  return (
    <View style={styles.root}>
      <KolamCatalogListTableShell
        fill={fill}
        footer={footer}
        onBodyWidthChange={onBodyWidthChange}
        style={[styles.tableFrame, style]}
      >
        <View style={styles.headerRow}>
          {columns.map(column => (
            <View
              key={column.id}
              style={[
                styles.cell,
                getColumnAlignStyle(column.align),
                {flex: column.flex},
              ]}
            >
              <Text
                numberOfLines={1}
                style={[styles.headerCellText, getHeaderAlignStyle(column.align)]}
              >
                {column.label}
              </Text>
            </View>
          ))}
          {shouldRenderActionsColumn ? (
            <View style={[styles.cell, styles.actionsCell]} />
          ) : null}
        </View>
        {rows.length === 0 ? (
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              compact
              title={loading ? 'Memuat...' : emptyTitle ?? 'Tidak ada data'}
            />
          </View>
        ) : (
          rows.map((row, index) => (
            <View key={getRowKey(row, index)} style={[styles.row, rowStyle]}>
              {columns.map(column => (
                <View
                  key={column.id}
                  style={[
                    styles.cell,
                    getColumnAlignStyle(column.align),
                    {flex: column.flex},
                  ]}
                >
                  {column.render(row)}
                </View>
              ))}
              {shouldRenderActionsColumn ? (
                <View style={[styles.cell, styles.actionsCell]}>
                  {renderActions?.(row)}
                </View>
              ) : null}
            </View>
          ))
        )}
      </KolamCatalogListTableShell>
    </View>
  );
}

function getColumnAlignStyle(
  align: KolamListTableColumn<unknown>['align'],
): StyleProp<ViewStyle> {
  switch (align) {
    case 'center':
      return styles.cellCenter;
    case 'right':
      return styles.cellRight;
    case 'left':
    default:
      return null;
  }
}

function getHeaderAlignStyle(
  align: KolamListTableColumn<unknown>['align'],
): StyleProp<TextStyle> {
  switch (align) {
    case 'center':
      return styles.headerTextCenter;
    case 'right':
      return styles.headerTextRight;
    case 'left':
    default:
      return null;
  }
}

export const kolamListTableCompositionStyles = StyleSheet.create({
  cell: {
    minWidth: 0,
    overflow: 'visible',
    paddingHorizontal: 4,
  },
  primaryText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '500',
  },
  metaText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
});

const styles = StyleSheet.create({
  root: {
    gap: 8,
    overflow: 'visible',
    position: 'relative',
    zIndex: 1,
  },
  tableFrame: {
    overflow: 'visible',
    position: 'relative',
    width: '100%',
    zIndex: 1,
  },
  headerRow: {
    alignItems: 'center',
    backgroundColor: V.colors.tableHeader,
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 36,
    overflow: 'visible',
    paddingHorizontal: 8,
    zIndex: 0,
  },
  headerCellText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  row: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 44,
    overflow: 'visible',
    paddingHorizontal: 8,
    paddingVertical: 6,
    position: 'relative',
    zIndex: 1,
  },
  cell: kolamListTableCompositionStyles.cell,
  cellCenter: {
    alignItems: 'center',
  },
  cellRight: {
    alignItems: 'flex-end',
  },
  headerTextCenter: {
    textAlign: 'center',
  },
  headerTextRight: {
    textAlign: 'right',
  },
  actionsCell: {
    alignItems: 'flex-end',
    flex: 0.45,
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: 'center',
    minWidth: 48,
    overflow: 'visible',
    zIndex: 2,
  },
  emptyWrap: {
    paddingVertical: 24,
  },
});
