import React from 'react';
import {
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
import { useKolamListTableRowLayer } from './kolam-list-table-row-layer-context';
import { KolamChevronIcon } from './kolam-chevron-icon';
import { KolamCopyStack } from './kolam-copy-stack';
import { kolamFormControlStyles } from './kolam-form-control-styles';
import { KolamInteractionFrame } from './kolam-interaction-frame';

export interface KolamDropdownOption<TValue extends string = string> {
  icon?: React.ReactNode;
  label: string;
  value: TValue;
}

type KolamOpenMenuListener = (activeId: string | null) => void;

const openMenuListeners = new Set<KolamOpenMenuListener>();
let openMenuId: string | null = null;
let openMenuSequence = 0;

function getNextOpenMenuId() {
  openMenuSequence += 1;
  return `kolam-open-menu-${openMenuSequence}`;
}

function subscribeOpenMenu(listener: KolamOpenMenuListener) {
  openMenuListeners.add(listener);
  return () => {
    openMenuListeners.delete(listener);
  };
}

function setActiveOpenMenu(id: string | null) {
  openMenuId = id;
  openMenuListeners.forEach(listener => listener(openMenuId));
}

function clearActiveOpenMenu(id: string) {
  if (openMenuId === id) {
    openMenuId = null;
  }
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
  const openMenuIdRef = React.useRef(getNextOpenMenuId());
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
  React.useEffect(() => {
    if (inlineMenu) {
      return undefined;
    }

    return subscribeOpenMenu(activeId => {
      if (activeId === openMenuIdRef.current) {
        return;
      }

      setOpen(current => {
        if (!current) {
          return current;
        }

        setQuery('');
        onOpenChange?.(false);
        return false;
      });
    });
  }, [inlineMenu, onOpenChange]);

  const closeMenu = () => {
    setOpen(false);
    setQuery('');
    if (!inlineMenu) {
      clearActiveOpenMenu(openMenuIdRef.current);
    }
    onOpenChange?.(false);
  };
  const toggleOpen = () => {
    setOpen(current => {
      const next = !current;
      if (!next) {
        setQuery('');
        if (!inlineMenu) {
          clearActiveOpenMenu(openMenuIdRef.current);
        }
      } else if (!inlineMenu) {
        setActiveOpenMenu(openMenuIdRef.current);
      }
      onOpenChange?.(next);
      return next;
    });
  };

  const menu = (
    <View
      style={[
        styles.menu,
        inlineMenu ? styles.inlineMenu : styles.anchoredMenu,
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
    <View style={[styles.root, style, open && styles.rootOpen]}>
      <KolamInteractionFrame
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ expanded: open }}
        onPress={toggleOpen}
        style={[styles.trigger, kolamFormControlStyles.trigger, triggerStyle]}
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
      {open && !inlineMenu ? (
        <Pressable
          accessibilityLabel="Tutup dropdown"
          accessibilityRole="button"
          onPress={closeMenu}
          style={styles.dismissLayer}
        />
      ) : null}
      {open ? menu : null}
    </View>
  );
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
  const openMenuIdRef = React.useRef(getNextOpenMenuId());
  const viewport = useWindowDimensions();
  const rowLayer = useKolamListTableRowLayer();

  React.useEffect(() => {
    return subscribeOpenMenu(activeId => {
      if (activeId === openMenuIdRef.current) {
        return;
      }

      setOpen(current => {
        if (!current) {
          return current;
        }

        onOpenChange?.(false);
        rowLayer?.setMenuOpen(false);
        return false;
      });
    });
  }, [onOpenChange, rowLayer]);

  const setMenuOpen = (next: boolean) => {
    if (next) {
      setActiveOpenMenu(openMenuIdRef.current);
    } else {
      clearActiveOpenMenu(openMenuIdRef.current);
    }
    setOpen(next);
    rowLayer?.setMenuOpen(next);
    onOpenChange?.(next);
  };
  const measureAndOpen = () => {
    setMenuOpen(true);

    const root = rootRef.current;
    if (!root || typeof root.measureInWindow !== 'function') {
      return;
    }

    root.measureInWindow((_x, y, _width, height) => {
      const estimatedMenuHeight = Math.max(48, actions.length * 35 + 14);
      const availableAbove = y;
      const availableBelow = viewport.height - (y + height);
      const shouldOpenUp =
        availableBelow < estimatedMenuHeight + 12 &&
        availableAbove > availableBelow;

      setPlacement(shouldOpenUp ? 'top' : 'bottom');
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
            placement === 'top'
              ? styles.overflowMenuUp
              : styles.overflowMenuDown,
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
    minWidth: 190,
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
    height: V.control.inputHeight - 2,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftColor: V.colors.border,
    borderLeftWidth: 1,
    marginVertical: 0,
  },
  triggerText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: V.control.fontSize,
    fontWeight: '700',
    lineHeight: 16,
    maxWidth: 220,
  },
  dismissLayer: {
    position: 'absolute',
    top: -4000,
    right: -4000,
    bottom: -4000,
    left: -4000,
    zIndex: 1,
    elevation: 1,
  },
  menu: {
    position: 'absolute',
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
  anchoredMenu: {
    // Same class as profile user menu: fixed pixel anchor, no measureInWindow.
    top: V.control.inputHeight + 4,
    left: 0,
    right: 0,
    minWidth: 260,
    zIndex: 2,
    elevation: 24,
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
    zIndex: 200000,
    elevation: 2000,
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
