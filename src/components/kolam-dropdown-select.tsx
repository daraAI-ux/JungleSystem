import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamButton } from './kolam-button';
import { KolamChevronIcon } from './kolam-chevron-icon';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamInteractionFrame } from './kolam-interaction-frame';

export interface KolamDropdownOption<TValue extends string = string> {
  icon?: React.ReactNode;
  label: string;
  value: TValue;
}

export function KolamDropdownSelect<TValue extends string = string>({
  accessibilityLabel,
  label,
  menuPlacement = 'overlay',
  menuStyle,
  onChange,
  onOpenChange,
  options,
  searchable = false,
  searchPlaceholder = 'Cari...',
  showLabelInTrigger = true,
  style,
  triggerStyle,
  triggerTextStyle,
  value,
}: {
  accessibilityLabel?: string;
  label: string;
  menuPlacement?: 'overlay' | 'inline';
  menuStyle?: StyleProp<ViewStyle>;
  onChange: (value: TValue) => void;
  onOpenChange?: (open: boolean) => void;
  options: Array<KolamDropdownOption<TValue>>;
  searchable?: boolean;
  searchPlaceholder?: string;
  showLabelInTrigger?: boolean;
  style?: StyleProp<ViewStyle>;
  triggerStyle?: StyleProp<ViewStyle>;
  triggerTextStyle?: StyleProp<TextStyle>;
  value: TValue;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const triggerRef = React.useRef<View>(null);
  const viewport = useWindowDimensions();
  const [triggerFrame, setTriggerFrame] = React.useState({
    height: 36,
    width: 190,
    x: 0,
    y: 0,
  });
  const inlineMenu = menuPlacement === 'inline';
  const selected = options.find(option => option.value === value) ?? options[0];
  const selectedLabel = selected?.label ?? '-';
  const triggerLabel = showLabelInTrigger
    ? `${label}: ${selectedLabel}`
    : selectedLabel;
  const visibleOptions = React.useMemo(() => {
    const normalizedQuery = normalizeDropdownSearch(query);

    if (!normalizedQuery) {
      return options;
    }

    return options.filter(option =>
      normalizeDropdownSearch(`${option.label} ${option.value}`).includes(
        normalizedQuery,
      ),
    );
  }, [options, query]);
  const measureTrigger = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setTriggerFrame({
        height: height || 36,
        width: width || 190,
        x,
        y,
      });
    });
  };
  const closeMenu = () => {
    setOpen(false);
    setQuery('');
    onOpenChange?.(false);
  };
  const toggleOpen = () => {
    setOpen(current => {
      const next = !current;
      if (!next) {
        setQuery('');
      }
      if (next && !inlineMenu) {
        requestAnimationFrame(measureTrigger);
      }
      onOpenChange?.(next);
      return next;
    });
  };

  const menu = (
    <View
      style={[
        styles.menu,
        inlineMenu && styles.inlineMenu,
        !inlineMenu && getDropdownPortalMenuStyle(triggerFrame, viewport),
        menuStyle,
      ]}
    >
      {searchable ? (
        <View style={styles.searchRow}>
          <TextInput
            autoFocus
            onChangeText={setQuery}
            placeholder={searchPlaceholder}
            placeholderTextColor={V.colors.mutedFg}
            style={styles.searchInput}
            value={query}
          />
          {query ? (
            <KolamButton
              accessibilityLabel="Bersihkan pencarian"
              label="x"
              onPress={() => setQuery('')}
              style={styles.clearSearchButton}
              textStyle={styles.clearSearchText}
            />
          ) : null}
        </View>
      ) : null}
      <ScrollView
        nestedScrollEnabled
        style={styles.menuScroll}
        contentContainerStyle={styles.menuContent}
      >
        {visibleOptions.map(option => (
          <KolamButton
            icon={option.icon}
            intent={option.value === value ? 'primary' : 'plain'}
            key={option.value}
            label={option.label}
            onPress={() => {
              onChange(option.value);
              closeMenu();
            }}
            style={styles.option}
            textStyle={styles.optionText}
          />
        ))}
        {visibleOptions.length ? null : (
          <KolamCopyStack
            items={[
              {
                id: 'empty',
                text: 'Tidak ada hasil',
                style: styles.emptySearchText,
              },
            ]}
          />
        )}
      </ScrollView>
    </View>
  );

  return (
    <View ref={triggerRef} style={[styles.root, style, open && styles.rootOpen]}>
      <KolamInteractionFrame
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ expanded: open }}
        onPress={toggleOpen}
        style={[styles.trigger, triggerStyle]}
      >
        <View style={styles.triggerValue}>
          {selected?.icon ? (
            <View style={styles.triggerIcon}>{selected.icon}</View>
          ) : null}
          <KolamCopyStack
            items={[
              {
                id: 'value',
                text: triggerLabel,
                style: [styles.triggerText, triggerTextStyle],
              },
            ]}
          />
        </View>
        <View style={styles.triggerChevronButton}>
          <KolamChevronIcon direction={open ? 'up' : 'down'} size="menu-sm" />
        </View>
      </KolamInteractionFrame>
      {open && inlineMenu ? menu : null}
      {open && !inlineMenu ? (
        <Modal
          animationType="none"
          onRequestClose={closeMenu}
          transparent
          visible={open}
        >
          <View style={styles.portalOverlay}>
            <Pressable
              accessibilityLabel="Tutup dropdown"
              accessibilityRole="button"
              onPress={closeMenu}
              style={styles.portalBackdrop}
            />
            {menu}
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

function getDropdownPortalMenuStyle(
  frame: { height: number; width: number; x: number; y: number },
  viewport: { height: number; width: number },
): ViewStyle {
  const menuWidth = Math.min(
    Math.max(frame.width, 260),
    Math.max(260, viewport.width - 24),
  );
  const left = Math.min(
    Math.max(12, frame.x),
    Math.max(12, viewport.width - menuWidth - 12),
  );
  const menuHeight = 292;
  const belowTop = frame.y + frame.height + 4;
  const top =
    belowTop + menuHeight > viewport.height - 12
      ? Math.max(12, frame.y - menuHeight - 4)
      : belowTop;

  return {
    left,
    minWidth: menuWidth,
    top,
    width: menuWidth,
  };
}

function normalizeDropdownSearch(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function KolamPaginationSizeControl({
  onChange,
  value,
}: {
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <KolamDropdownSelect
      accessibilityLabel="Jumlah baris per halaman"
      label="Tampil"
      onChange={next => onChange(Number(next))}
      options={[
        { label: '10', value: '10' },
        { label: '50', value: '50' },
        { label: '100', value: '100' },
      ]}
      value={String(value)}
    />
  );
}

export function KolamOverflowMenuButton({
  actions,
  accessibilityLabel = 'Menu aksi',
  onOpenChange,
}: {
  accessibilityLabel?: string;
  actions: Array<{
    disabled?: boolean;
    label: string;
    onPress: () => void;
    tone?: 'default' | 'danger';
  }>;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [placement, setPlacement] = React.useState<'bottom' | 'top'>('bottom');
  const rootRef = React.useRef<View>(null);
  const viewport = useWindowDimensions();
  const setMenuOpen = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };
  const measureAndOpen = () => {
    const root = rootRef.current;
    if (!root) {
      setMenuOpen(true);
      return;
    }

    root.measureInWindow((_x, y, _width, height) => {
      const estimatedMenuHeight = Math.max(48, actions.length * 35 + 14);
      const availableAbove = y;
      const availableBelow = viewport.height - (y + height);
      const shouldOpenUp =
        availableBelow < estimatedMenuHeight + 12 && availableAbove > availableBelow;

      setPlacement(shouldOpenUp ? 'top' : 'bottom');
      setMenuOpen(true);
    });
  };
  const toggleMenu = () => {
    if (open) {
      setMenuOpen(false);
      return;
    }

    requestAnimationFrame(measureAndOpen);
  };

  return (
    <View ref={rootRef} style={styles.overflowRoot}>
      <KolamButton
        accessibilityLabel={accessibilityLabel}
        intent="outline"
        label="..."
        onPress={toggleMenu}
        style={styles.overflowButton}
        textStyle={styles.overflowText}
      />
      {open ? (
        <View
          style={[
            styles.overflowMenu,
            placement === 'top' ? styles.overflowMenuUp : styles.overflowMenuDown,
          ]}
        >
          {actions.map(action => (
            <KolamButton
              disabled={action.disabled}
              intent={action.tone === 'danger' ? 'danger' : 'plain'}
              key={action.label}
              label={action.label}
              onPress={() => {
                if (action.disabled) {
                  return;
                }

                setMenuOpen(false);
                action.onPress();
              }}
              style={styles.overflowOption}
              textStyle={styles.overflowOptionText}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function KolamPaginationSummaryLabel({
  page,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
}) {
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(page * pageSize, total);

  return (
    <KolamCopyStack
      items={[
        {
          id: 'summary',
          text: `${from}-${to} dari ${total}`,
          style: styles.summary,
        },
      ]}
    />
  );
}

export function KolamTableFooterControls({
  children,
  onPageSizeChange,
  page,
  pageSize,
  total,
}: {
  children?: React.ReactNode;
  onPageSizeChange: (value: number) => void;
  page: number;
  pageSize: number;
  total: number;
}) {
  return (
    <View style={styles.tableFooterControls}>
      <View style={styles.tableFooterLeft}>
        <KolamPaginationSizeControl
          onChange={onPageSizeChange}
          value={pageSize}
        />
        <KolamPaginationSummaryLabel
          page={page}
          pageSize={pageSize}
          total={total}
        />
      </View>
      {children ? (
        <View style={styles.tableFooterRight}>{children}</View>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  root: {
    overflow: 'visible',
    position: 'relative',
    zIndex: 10000,
    elevation: 200,
  },
  rootOpen: {
    zIndex: 2000000,
    elevation: 2000000,
  },
  trigger: {
    minHeight: 36,
    minWidth: 190,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  triggerValue: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  triggerIcon: {
    width: 18,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerChevronButton: {
    width: 28,
    height: 28,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftColor: V.colors.border,
    borderLeftWidth: 1,
  },
  triggerText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    maxWidth: 220,
  },
  portalOverlay: {
    flex: 1,
  },
  portalBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  menu: {
    position: 'absolute',
    top: 38,
    left: 0,
    zIndex: 2,
    elevation: 8,
    minWidth: 190,
    padding: 6,
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    shadowColor: V.colors.fg,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  inlineMenu: {
    alignSelf: 'stretch',
    left: 0,
    marginTop: 4,
    position: 'relative',
    top: 0,
    width: '100%',
  },
  searchRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 6,
    marginBottom: 4,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: V.radius.lg,
    borderColor: V.colors.input,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  clearSearchButton: {
    minWidth: 34,
    paddingHorizontal: 8,
  },
  clearSearchText: {
    fontSize: 14,
    lineHeight: 16,
  },
  menuScroll: {
    maxHeight: 240,
  },
  menuContent: {
    gap: 4,
  },
  emptySearchText: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  option: {
    justifyContent: 'flex-start',
  },
  optionText: {
    textAlign: 'left',
  },
  overflowRoot: {
    position: 'relative',
    zIndex: 900,
    elevation: 20,
  },
  overflowButton: {
    minWidth: 38,
    paddingHorizontal: 10,
  },
  overflowText: {
    fontSize: 18,
    lineHeight: 18,
  },
  overflowMenu: {
    position: 'absolute',
    zIndex: 1200,
    elevation: 32,
    minWidth: 156,
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    shadowColor: V.colors.fg,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  overflowMenuDown: {
    top: 34,
    right: 42,
  },
  overflowMenuUp: {
    bottom: 34,
    right: 42,
  },
  overflowOption: {
    justifyContent: 'flex-start',
    minHeight: 32,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  overflowOptionText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'left',
  },
  summary: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  tableFooterControls: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  tableFooterLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
  },
  tableFooterRight: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-end',
  },
});
