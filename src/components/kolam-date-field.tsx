import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  KOLAM_CALENDAR_WEEKDAY_LABELS,
  buildKolamCalendarCells,
  formatKolamDateLabel,
  formatKolamIsoDate,
  getKolamCalendarMonthLabel,
  parseKolamIsoDate,
} from '../domain/kolam-date';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamButton } from './kolam-button';
import { KolamChevronIcon } from './kolam-chevron-icon';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import { KolamModalBackdrop } from './kolam-modal-backdrop';

export function KolamDateField({
  accessibilityLabel,
  label,
  onChange,
  placeholder = 'Pilih tanggal',
  showLabelInTrigger = true,
  style,
  value,
}: {
  accessibilityLabel?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showLabelInTrigger?: boolean;
  style?: StyleProp<ViewStyle>;
  value: string;
}) {
  const selectedDate = parseKolamIsoDate(value);
  const initialCursor = selectedDate ?? new Date();
  const [open, setOpen] = React.useState(false);
  const [cursorYear, setCursorYear] = React.useState(initialCursor.getFullYear());
  const [cursorMonth, setCursorMonth] = React.useState(initialCursor.getMonth());

  React.useEffect(() => {
    if (!open) {
      return;
    }
    const next = parseKolamIsoDate(value) ?? new Date();
    setCursorYear(next.getFullYear());
    setCursorMonth(next.getMonth());
  }, [open, value]);

  const cells = React.useMemo(
    () => buildKolamCalendarCells(cursorYear, cursorMonth),
    [cursorMonth, cursorYear],
  );
  const todayIso = formatKolamIsoDate(new Date());
  const displayLabel = formatKolamDateLabel(value, placeholder);
  const triggerLabel = showLabelInTrigger
    ? `${label}: ${displayLabel}`
    : displayLabel;

  const shiftMonth = (delta: number) => {
    const next = new Date(cursorYear, cursorMonth + delta, 1);
    setCursorYear(next.getFullYear());
    setCursorMonth(next.getMonth());
  };

  return (
    <View style={style}>
      <KolamInteractionFrame
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={styles.trigger}
      >
        <Text numberOfLines={1} style={styles.triggerText}>
          {triggerLabel}
        </Text>
        <KolamChevronIcon direction="down" />
      </KolamInteractionFrame>

      <Modal
        animationType="fade"
        transparent
        visible={open}
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.overlay}>
          <KolamModalBackdrop onPress={() => setOpen(false)} />
          <View
            accessibilityLabel={`${label} calendar`}
            style={styles.dialog}
          >
            <View style={styles.monthHeader}>
              <KolamButton
                accessibilityLabel="Bulan sebelumnya"
                label="‹"
                onPress={() => shiftMonth(-1)}
              />
              <Text style={styles.monthLabel}>
                {getKolamCalendarMonthLabel(cursorYear, cursorMonth)}
              </Text>
              <KolamButton
                accessibilityLabel="Bulan berikutnya"
                label="›"
                onPress={() => shiftMonth(1)}
              />
            </View>

            <View style={styles.weekdayRow}>
              {KOLAM_CALENDAR_WEEKDAY_LABELS.map(day => (
                <Text key={day} style={styles.weekdayText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.grid}>
              {cells.map((cell, index) => {
                if (!cell.inMonth || !cell.iso) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }
                const selected = cell.iso === value;
                const isToday = cell.iso === todayIso;
                return (
                  <Pressable
                    key={cell.iso}
                    accessibilityRole="button"
                    onPress={() => {
                      onChange(cell.iso!);
                      setOpen(false);
                    }}
                    style={[
                      styles.dayCell,
                      styles.dayPressable,
                      selected ? styles.daySelected : null,
                      isToday && !selected ? styles.dayToday : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        selected ? styles.dayTextSelected : null,
                      ]}
                    >
                      {cell.day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.footer}>
              <KolamButton
                label="Hapus"
                onPress={() => {
                  onChange('');
                  setOpen(false);
                }}
              />
              <KolamButton
                label="Hari ini"
                onPress={() => {
                  onChange(todayIso);
                  setOpen(false);
                }}
              />
              <KolamButton
                intent="primary"
                label="Tutup"
                onPress={() => setOpen(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: V.control.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: V.control.inputPaddingX,
    borderWidth: 1,
    borderColor: V.colors.border,
    borderRadius: V.radius.md,
    backgroundColor: V.colors.bg,
  },
  triggerText: {
    flex: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: V.control.fontSize,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    width: 340,
    maxWidth: '92%',
    gap: 12,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: V.colors.border,
    backgroundColor: V.colors.bg,
    shadowColor: V.colors.fg,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  monthLabel: {
    flex: 1,
    textAlign: 'center',
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekdayText: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPressable: {
    borderRadius: 999,
  },
  daySelected: {
    backgroundColor: V.colors.primary,
  },
  dayToday: {
    borderWidth: 1,
    borderColor: V.colors.primary,
  },
  dayText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '500',
  },
  dayTextSelected: {
    color: V.colors.primaryFg,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
