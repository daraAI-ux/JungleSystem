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
  children,
  containerStyle,
  label,
}: {
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  label: string;
}) {
  const [visible, setVisible] = React.useState(false);

  return (
    <View style={[styles.root, containerStyle]}>
      <KolamPressable
        accessibilityLabel={label}
        accessibilityRole="text"
        onHoverIn={() => setVisible(true)}
        onHoverOut={() => setVisible(false)}
        style={styles.trigger}
      >
        {children}
      </KolamPressable>
      {visible ? (
        <View pointerEvents="none" style={styles.tooltip}>
          <Text numberOfLines={1} style={styles.tooltipText}>
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
  trigger: {
    alignSelf: 'flex-start',
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    zIndex: 50,
    maxWidth: 240,
    minHeight: 28,
    marginBottom: 7,
    justifyContent: 'center',
    borderRadius: 6,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.fg,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  tooltipText: {
    color: V.colors.bg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
});
