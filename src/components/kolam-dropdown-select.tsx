import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
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
  menuStyle,
  onChange,
  options,
  searchable = false,
  searchPlaceholder = 'Cari...',
  showLabelInTrigger = true,
  triggerStyle,
  triggerTextStyle,
  value,
}: {
  accessibilityLabel?: string;
  label: string;
  menuStyle?: StyleProp<ViewStyle>;
  onChange: (value: TValue) => void;
  options: Array<KolamDropdownOption<TValue>>;
  searchable?: boolean;
  searchPlaceholder?: string;
  showLabelInTrigger?: boolean;
  triggerStyle?: StyleProp<ViewStyle>;
  triggerTextStyle?: StyleProp<TextStyle>;
  value: TValue;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
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
  const closeMenu = () => {
    setOpen(false);
    setQuery('');
  };
  const toggleOpen = () => {
    setOpen(current => {
      const next = !current;
      if (!next) {
        setQuery('');
      }
      return next;
    });
  };

  return (
    <View style={[styles.root, open && styles.rootOpen]}>
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
      {open ? (
        <>
          <Pressable
            accessibilityLabel="Tutup dropdown"
            accessibilityRole="button"
            onPress={closeMenu}
            style={styles.backdrop}
          />
          <View style={[styles.menu, menuStyle]}>
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
        </>
      ) : null}
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
  const setMenuOpen = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  return (
    <View style={styles.overflowRoot}>
      <KolamButton
        accessibilityLabel={accessibilityLabel}
        intent="outline"
        label="..."
        onPress={() => setMenuOpen(!open)}
        style={styles.overflowButton}
        textStyle={styles.overflowText}
      />
      {open ? (
        <View style={styles.overflowMenu}>
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
              textStyle={styles.optionText}
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

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    zIndex: 20,
    elevation: 8,
  },
  rootOpen: {
    zIndex: 1000,
    elevation: 40,
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
  backdrop: {
    position: 'absolute',
    top: -4096,
    right: -4096,
    bottom: -4096,
    left: -4096,
    zIndex: 1,
    elevation: 1,
    backgroundColor: 'transparent',
  },
  menu: {
    position: 'absolute',
    top: 38,
    left: 0,
    zIndex: 2,
    elevation: 48,
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
    top: 34,
    right: 42,
    zIndex: 1200,
    elevation: 32,
    minWidth: 132,
    gap: 4,
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
  overflowOption: {
    justifyContent: 'flex-start',
  },
  summary: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
});
