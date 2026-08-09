import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
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
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamButton} from './kolam-button';
import {KolamDeleteButton} from './kolam-delete-button';
import {KolamChevronIcon} from './kolam-chevron-icon';
import {kolamFormControlStyles} from './kolam-form-control-styles';
import {KolamInteractionFrame} from './kolam-interaction-frame';

type ScreenOverlayLayout = {
  height: number;
  left: number;
  top: number;
  width: number;
};

export function KolamDateField({
  accessibilityLabel,
  label,
  onChange,
  panelVariant = 'dialog',
  placeholder = 'Pilih tanggal',
  showLabelInTrigger = true,
  style,
  triggerStyle,
  value,
}: {
  accessibilityLabel?: string;
  label: string;
  onChange: (value: string) => void;
  panelVariant?: 'dialog' | 'dropdown';
  placeholder?: string;
  showLabelInTrigger?: boolean;
  style?: StyleProp<ViewStyle>;
  triggerStyle?: StyleProp<ViewStyle>;
  value: string;
}) {
  const selectedDate = parseKolamIsoDate(value);
  const initialCursor = selectedDate ?? new Date();
  const rootRef = React.useRef<View>(null);
  const viewport = useWindowDimensions();
  const [open, setOpen] = React.useState(false);
  const [screenOverlay, setScreenOverlay] =
    React.useState<ScreenOverlayLayout | null>(null);
  const [cursorYear, setCursorYear] = React.useState(initialCursor.getFullYear());
  const [cursorMonth, setCursorMonth] = React.useState(initialCursor.getMonth());
  const dropdownPanel = panelVariant === 'dropdown';

  React.useEffect(() => {
    if (!open) {
      return;
    }
    const next = parseKolamIsoDate(value) ?? new Date();
    setCursorYear(next.getFullYear());
    setCursorMonth(next.getMonth());
  }, [open, value]);

  React.useEffect(() => {
    if (!open) {
      return;
    }
    const root = rootRef.current;
    if (!root || typeof root.measureInWindow !== 'function') {
      return;
    }
    root.measureInWindow((x, y) => {
      setScreenOverlay({
        height: viewport.height,
        left: -x,
        top: -y,
        width: viewport.width,
      });
    });
  }, [open, viewport.height, viewport.width]);

  const cells = React.useMemo(
    () => buildKolamCalendarCells(cursorYear, cursorMonth),
    [cursorMonth, cursorYear],
  );
  const todayIso = formatKolamIsoDate(new Date());
  const displayLabel = formatKolamDateLabel(value, placeholder);
  const triggerLabel = showLabelInTrigger
    ? `${label}: ${displayLabel}`
    : displayLabel;

  const closeCalendar = () => {
    setOpen(false);
    setScreenOverlay(null);
  };

  const openCalendar = () => {
    const root = rootRef.current;
    if (!root || typeof root.measureInWindow !== 'function') {
      setScreenOverlay({
        height: viewport.height,
        left: 0,
        top: 0,
        width: viewport.width,
      });
      setOpen(true);
      return;
    }

    root.measureInWindow((x, y) => {
      setScreenOverlay({
        height: viewport.height,
        left: -x,
        top: -y,
        width: viewport.width,
      });
      setOpen(true);
    });
  };

  const shiftMonth = (delta: number) => {
    const next = new Date(cursorYear, cursorMonth + delta, 1);
    setCursorYear(next.getFullYear());
    setCursorMonth(next.getMonth());
  };

  const dropdownPanelHeight = 360;
  const dropdownTriggerTop = screenOverlay ? -screenOverlay.top : 0;
  const dropdownAvailableAbove = dropdownTriggerTop;
  const dropdownAvailableBelow = screenOverlay
    ? screenOverlay.height - (dropdownTriggerTop + V.control.inputHeight)
    : viewport.height;
  const dropdownOpenUp =
    dropdownPanel &&
    dropdownAvailableBelow < dropdownPanelHeight + 12 &&
    dropdownAvailableAbove > dropdownAvailableBelow;
  const dropdownLeft = screenOverlay
    ? Math.min(
        Math.max(8, -screenOverlay.left),
        Math.max(8, screenOverlay.width - 328),
      )
    : 8;
  const dropdownTop = screenOverlay
    ? dropdownOpenUp
      ? Math.max(8, dropdownTriggerTop - dropdownPanelHeight - 4)
      : Math.min(
          dropdownTriggerTop + V.control.inputHeight + 4,
          Math.max(8, screenOverlay.height - dropdownPanelHeight - 8),
        )
    : V.control.inputHeight + 4;

  return (
    <View
      ref={rootRef}
      collapsable={false}
      style={[styles.root, style, open ? styles.rootOpen : null]}
    >
      <KolamInteractionFrame
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="button"
        accessibilityState={{expanded: open}}
        onPress={openCalendar}
        style={[styles.trigger, kolamFormControlStyles.trigger, triggerStyle]}
      >
        <Text numberOfLines={1} style={styles.triggerText}>
          {triggerLabel}
        </Text>
        <KolamChevronIcon direction={open ? 'up' : 'down'} />
      </KolamInteractionFrame>

      {open && screenOverlay ? (
        <View
          pointerEvents="box-none"
          style={[
            styles.screenOverlay,
            dropdownPanel ? styles.screenOverlayDropdown : null,
            {
              height: screenOverlay.height,
              left: screenOverlay.left,
              top: screenOverlay.top,
              width: screenOverlay.width,
            },
          ]}
        >
          <Pressable
            accessibilityLabel="Tutup kalender"
            accessibilityRole="button"
            onPress={closeCalendar}
            style={[
              styles.backdrop,
              dropdownPanel ? styles.backdropDropdown : null,
            ]}
          />
          <View
            accessibilityLabel={`${label} calendar`}
            style={[
              styles.dialog,
              dropdownPanel ? styles.dropdownDialog : null,
              dropdownPanel ? {left: dropdownLeft, top: dropdownTop} : null,
            ]}
          >
            <View style={styles.monthHeader}>
              <KolamButton
                accessibilityLabel="Bulan sebelumnya"
                label="<"
                onPress={() => shiftMonth(-1)}
              />
              <Text style={styles.monthLabel}>
                {getKolamCalendarMonthLabel(cursorYear, cursorMonth)}
              </Text>
              <KolamButton
                accessibilityLabel="Bulan berikutnya"
                label=">"
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
                const isFuture = cell.iso > todayIso;
                return (
                  <Pressable
                    key={cell.iso}
                    accessibilityRole="button"
                    onPress={() => {
                      onChange(cell.iso!);
                      closeCalendar();
                    }}
                    style={[
                      styles.dayCell,
                      styles.dayPressable,
                      selected ? styles.daySelected : null,
                      isToday && !selected ? styles.dayToday : null,
                      isFuture && !selected ? styles.dayFuture : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isFuture && !selected ? styles.dayTextFuture : null,
                        isToday && !selected ? styles.dayTextToday : null,
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
              <KolamDeleteButton
                label="Hapus"
                onPress={() => {
                  onChange('');
                  closeCalendar();
                }}
              />
              <KolamButton
                label="Hari ini"
                onPress={() => {
                  onChange(todayIso);
                  closeCalendar();
                }}
              />
              <KolamButton
                intent="primary"
                label="Tutup"
                onPress={closeCalendar}
              />
            </View>
          </View>
        </View>
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
    minWidth: 120,
  },
  triggerText: {
    flex: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: V.control.fontSize,
    fontWeight: '700',
    lineHeight: 16,
  },
  screenOverlay: {
    position: 'absolute',
    zIndex: 2,
    elevation: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenOverlayDropdown: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  backdropDropdown: {
    backgroundColor: 'transparent',
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
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.16,
    shadowRadius: 20,
    zIndex: 3,
    elevation: 32,
  },
  dropdownDialog: {
    maxWidth: undefined,
    position: 'absolute',
    width: 320,
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
    backgroundColor: 'transparent',
  },
  dayFuture: {
    opacity: 0.55,
  },
  dayText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '500',
  },
  dayTextToday: {
    color: V.colors.success,
    fontWeight: '700',
  },
  dayTextFuture: {
    color: V.colors.mutedFg,
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
