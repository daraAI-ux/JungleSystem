import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamButton } from './kolam-button';
import { KolamCopyStack } from './kolam-copy-stack';

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
  value,
}: {
  accessibilityLabel?: string;
  label: string;
  menuStyle?: StyleProp<ViewStyle>;
  onChange: (value: TValue) => void;
  options: Array<KolamDropdownOption<TValue>>;
  value: TValue;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find(option => option.value === value) ?? options[0];

  return (
    <View style={styles.root}>
      <KolamButton
        accessibilityLabel={accessibilityLabel ?? label}
        intent="outline"
        label={`${label}: ${selected?.label ?? '-'}`}
        onPress={() => setOpen(current => !current)}
        textStyle={styles.triggerText}
      />
      {open ? (
        <ScrollView
          nestedScrollEnabled
          style={[styles.menu, menuStyle]}
          contentContainerStyle={styles.menuContent}
        >
          {options.map(option => (
            <KolamButton
              icon={option.icon}
              intent={option.value === value ? 'primary' : 'plain'}
              key={option.value}
              label={option.label}
              onPress={() => {
                onChange(option.value);
                setOpen(false);
              }}
              style={styles.option}
              textStyle={styles.optionText}
            />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
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
  triggerText: {
    maxWidth: 220,
  },
  menu: {
    position: 'absolute',
    top: 38,
    left: 0,
    zIndex: 10,
    elevation: 24,
    minWidth: 190,
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
  menuContent: {
    gap: 4,
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
