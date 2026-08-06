import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import { KolamListTableRowLayerContext } from './kolam-list-table-row-layer-context';

export type KolamListTableColumn<TRow> = {
  align?: 'left' | 'center' | 'right';
  flex: number;
  id: string;
  label: string;
  render: (row: TRow) => React.ReactNode;
};

export type KolamListTablePagination = {
  onPageChange: (page: number) => void;
  page: number;
  pageSize: number;
  siblingCount?: number;
  total: number;
};

export function KolamListTableComposition<TRow>({
  actionsColumn = false,
  emptyTitle,
  fill = false,
  footer,
  getRowKey,
  loading = false,
  onBodyWidthChange,
  pagination,
  renderActions,
  rowStyle,
  rows,
  showFooter = true,
  style,
  columns,
}: {
  actionsColumn?: boolean;
  columns: Array<KolamListTableColumn<TRow>>;
  emptyTitle?: string;
  fill?: boolean;
  footer?: React.ReactNode;
  getRowKey: (row: TRow, index: number) => string;
  loading?: boolean;
  onBodyWidthChange?: (width: number) => void;
  pagination?: KolamListTablePagination;
  renderActions?: (row: TRow) => React.ReactNode;
  rowStyle?: StyleProp<ViewStyle>;
  rows: TRow[];
  showFooter?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const shouldRenderActionsColumn = actionsColumn || Boolean(renderActions);
  const resolvedFooter = pagination ? (
    <KolamListTablePaginationFooter {...pagination} />
  ) : (
    footer ?? null
  );

  return (
    <View style={[styles.root, fill ? styles.rootFill : null]}>
      <KolamCatalogListTableShell
        fill={fill}
        footer={resolvedFooter}
        onBodyWidthChange={onBodyWidthChange}
        showFooter={showFooter}
        style={[styles.tableFrame, style]}
      >
        <View style={styles.headerRow}>
          {columns.map(column => (
            <View
              key={column.id}
              style={[
                styles.cell,
                getColumnAlignStyle(column.align),
                { flex: column.flex },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.headerCellText,
                  getHeaderAlignStyle(column.align),
                ]}
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
            <KolamListTableRow
              columns={columns}
              getRowKey={getRowKey}
              index={index}
              key={getRowKey(row, index)}
              renderActions={renderActions}
              row={row}
              rowStyle={rowStyle}
              shouldRenderActionsColumn={shouldRenderActionsColumn}
            />
          ))
        )}
      </KolamCatalogListTableShell>
    </View>
  );
}

function KolamListTableRow<TRow>({
  columns,
  getRowKey,
  index,
  renderActions,
  row,
  rowStyle,
  shouldRenderActionsColumn,
}: {
  columns: Array<KolamListTableColumn<TRow>>;
  getRowKey: (row: TRow, index: number) => string;
  index: number;
  renderActions?: (row: TRow) => React.ReactNode;
  row: TRow;
  rowStyle?: StyleProp<ViewStyle>;
  shouldRenderActionsColumn: boolean;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const layerContext = React.useMemo(() => ({ setMenuOpen }), []);

  return (
    <KolamListTableRowLayerContext.Provider value={layerContext}>
      <View
        key={getRowKey(row, index)}
        style={[styles.row, menuOpen ? styles.rowRaised : null, rowStyle]}
      >
        {columns.map(column => (
          <View
            key={column.id}
            style={[
              styles.cell,
              getColumnAlignStyle(column.align),
              { flex: column.flex },
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
    </KolamListTableRowLayerContext.Provider>
  );
}

export function KolamListTablePaginationFooter({
  onPageChange,
  page,
  pageSize,
  siblingCount = 1,
  total,
}: KolamListTablePagination) {
  const pageCount = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const from = total ? (safePage - 1) * pageSize + 1 : 0;
  const to = Math.min(safePage * pageSize, total);
  const pages = getPaginationItems(safePage, pageCount, siblingCount);

  return (
    <View style={styles.paginationFooter}>
      <Text style={styles.paginationSummary}>
        Menampilkan{' '}
        <Text style={styles.paginationSummaryStrong}>
          {from}-{to}
        </Text>{' '}
        dari <Text style={styles.paginationSummaryStrong}>{total}</Text> hasil
      </Text>
      <View style={styles.paginationControls}>
        <KolamListTablePaginationIconButton
          accessibilityLabel="Halaman pertama"
          disabled={safePage <= 1}
          direction="first"
          onPress={() => onPageChange(1)}
        />
        <KolamListTablePaginationIconButton
          accessibilityLabel="Halaman sebelumnya"
          disabled={safePage <= 1}
          direction="prev"
          onPress={() => onPageChange(Math.max(1, safePage - 1))}
        />
        {pages.map((item, index) =>
          item === 'ellipsis' ? (
            <Text key={`ellipsis-${index}`} style={styles.paginationEllipsis}>
              ...
            </Text>
          ) : (
            <KolamInteractionFrame
              accessibilityLabel={`Halaman ${item}`}
              accessibilityState={{ selected: item === safePage }}
              key={item}
              onPress={() => onPageChange(item)}
              selected={item === safePage}
              style={[
                styles.paginationPageButton,
                item === safePage ? styles.paginationPageButtonActive : null,
              ]}
            >
              <Text
                style={[
                  styles.paginationPageText,
                  item === safePage ? styles.paginationPageTextActive : null,
                ]}
              >
                {item}
              </Text>
            </KolamInteractionFrame>
          ),
        )}
        <KolamListTablePaginationIconButton
          accessibilityLabel="Halaman berikutnya"
          disabled={safePage >= pageCount}
          direction="next"
          onPress={() => onPageChange(Math.min(pageCount, safePage + 1))}
        />
        <KolamListTablePaginationIconButton
          accessibilityLabel="Halaman terakhir"
          disabled={safePage >= pageCount}
          direction="last"
          onPress={() => onPageChange(pageCount)}
        />
      </View>
    </View>
  );
}

type KolamPaginationItem = number | 'ellipsis';

function getPaginationItems(
  page: number,
  pageCount: number,
  siblingCount: number,
): KolamPaginationItem[] {
  const safeSiblingCount = Math.max(0, siblingCount);
  const visible = new Set<number>([1, pageCount]);

  if (page <= safeSiblingCount + 2) {
    for (
      let next = 1;
      next <= Math.min(pageCount, safeSiblingCount + 2);
      next += 1
    ) {
      visible.add(next);
    }
  } else if (page >= pageCount - safeSiblingCount - 1) {
    for (
      let next = Math.max(1, pageCount - safeSiblingCount - 1);
      next <= pageCount;
      next += 1
    ) {
      visible.add(next);
    }
  } else {
    for (
      let next = Math.max(1, page - safeSiblingCount);
      next <= Math.min(pageCount, page + safeSiblingCount);
      next += 1
    ) {
      visible.add(next);
    }
  }

  const sorted = Array.from(visible).sort((a, b) => a - b);
  const items: KolamPaginationItem[] = [];
  sorted.forEach((item, index) => {
    const previous = sorted[index - 1];
    if (previous && item - previous > 1) {
      items.push('ellipsis');
    }
    items.push(item);
  });

  return items;
}

function KolamListTablePaginationIconButton({
  accessibilityLabel,
  direction,
  disabled,
  onPress,
}: {
  accessibilityLabel: string;
  direction: 'first' | 'prev' | 'next' | 'last';
  disabled: boolean;
  onPress: () => void;
}) {
  const color = disabled ? V.colors.mutedFg : V.colors.fg;

  return (
    <KolamInteractionFrame
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.paginationIconButton,
        disabled ? styles.paginationIconButtonDisabled : null,
      ]}
    >
      <KolamListTablePaginationIcon color={color} direction={direction} />
    </KolamInteractionFrame>
  );
}

function KolamListTablePaginationIcon({
  color,
  direction,
}: {
  color: string;
  direction: 'first' | 'prev' | 'next' | 'last';
}) {
  const isLeft = direction === 'first' || direction === 'prev';
  const isEdge = direction === 'first' || direction === 'last';
  const trianglePath = isLeft ? 'M13 4 L6 10 L13 16 Z' : 'M7 4 L14 10 L7 16 Z';
  const secondTrianglePath = isLeft
    ? 'M17 4 L10 10 L17 16 Z'
    : 'M3 4 L10 10 L3 16 Z';
  const barPath = isLeft ? 'M4 4 H5.5 V16 H4 Z' : 'M14.5 4 H16 V16 H14.5 Z';

  return (
    <Svg height={16} viewBox="0 0 20 20" width={16}>
      {isEdge ? <Path d={barPath} fill={color} /> : null}
      {isEdge ? <Path d={secondTrianglePath} fill={color} /> : null}
      <Path d={trianglePath} fill={color} />
    </Svg>
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
    paddingHorizontal: 8,
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
  rootFill: {
    flex: 1,
    minHeight: 0,
  },
  tableFrame: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    overflow: 'visible',
    position: 'relative',
    width: '100%',
    zIndex: 1,
  },
  headerRow: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 42,
    overflow: 'visible',
    paddingHorizontal: 12,
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
    minHeight: V.layout.tableRowMinHeight,
    overflow: 'visible',
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'relative',
    zIndex: 1,
  },
  rowRaised: {
    elevation: 2000,
    zIndex: 2000,
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
    flex: 0.36,
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: 'center',
    minWidth: 52,
    overflow: 'visible',
    zIndex: 2,
  },
  emptyWrap: {
    paddingVertical: 24,
  },
  paginationFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 36,
    width: '100%',
  },
  paginationSummary: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '500',
  },
  paginationSummaryStrong: {
    color: V.colors.fg,
    fontWeight: '800',
  },
  paginationControls: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'flex-end',
  },
  paginationIconButton: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    minWidth: 28,
  },
  paginationIconButtonDisabled: {
    opacity: 0.4,
  },
  paginationPageButton: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 6,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    minWidth: 28,
    paddingHorizontal: 8,
  },
  paginationPageButtonActive: {
    borderColor: V.colors.border,
    backgroundColor: V.colors.secondary,
  },
  paginationPageText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  paginationPageTextActive: {
    color: V.colors.fg,
    fontWeight: '800',
  },
  paginationEllipsis: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    minWidth: 22,
    textAlign: 'center',
  },
});
