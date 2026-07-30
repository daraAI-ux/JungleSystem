import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamPressable } from './kolam-pressable';

export function KolamHoverTooltip({
  align = 'start',
  children,
  containerStyle,
  label,
  onOpenChange,
  placement = 'top',
}: {
  align?: 'start' | 'center';
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  label: string;
  onOpenChange?: (open: boolean) => void;
  placement?: 'top' | 'bottom';
}) {
  const [visible, setVisible] = React.useState(false);

  const setOpen = React.useCallback(
    (open: boolean) => {
      setVisible(open);
      onOpenChange?.(open);
    },
    [onOpenChange],
  );

  return (
    <View
      style={[
        styles.root,
        align === 'center' ? styles.rootCenter : null,
        visible ? styles.rootOpen : null,
        containerStyle,
      ]}
    >
      <KolamPressable
        accessibilityLabel={label}
        accessibilityRole="button"
        onHoverIn={() => setOpen(true)}
        onHoverOut={() => setOpen(false)}
        // RNW sometimes delivers pointer events when hover props are quiet.
        onPointerEnter={() => setOpen(true)}
        onPointerLeave={() => setOpen(false)}
        style={[styles.trigger, align === 'center' ? styles.triggerCenter : null]}
      >
        {children}
      </KolamPressable>
      {visible ? (
        <View
          pointerEvents="none"
          style={[
            styles.tooltip,
            placement === 'bottom' ? styles.tooltipBottom : styles.tooltipTop,
            align === 'center' ? styles.tooltipCenter : null,
          ]}
        >
          <Text numberOfLines={2} style={styles.tooltipText}>
            {label}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    alignSelf: 'flex-start',
    overflow: 'visible',
  },
  rootCenter: {
    alignSelf: 'center',
  },
  rootOpen: {
    zIndex: 12000,
    elevation: 120,
  },
  trigger: {
    alignSelf: 'flex-start',
  },
  triggerCenter: {
    alignSelf: 'center',
  },
  tooltip: {
    position: 'absolute',
    zIndex: 13000,
    elevation: 130,
    maxWidth: 240,
    minWidth: 96,
    minHeight: 28,
    justifyContent: 'center',
    borderRadius: 6,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.fg,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  tooltipTop: {
    bottom: '100%',
    left: 0,
    marginBottom: 7,
  },
  tooltipBottom: {
    top: '100%',
    left: 0,
    marginTop: 7,
  },
  tooltipCenter: {
    left: '50%',
    transform: [{ translateX: -48 }],
  },
  tooltipText: {
    color: V.colors.bg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
});
