import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamModalBackdrop} from './kolam-modal-backdrop';

export function KolamModalDialog({
  accessibilityLabel,
  children,
  description,
  dialogStyle,
  footer,
  height,
  maxHeight,
  maxWidth = '88%',
  onClose,
  title,
  visible,
  width = 780,
}: {
  accessibilityLabel?: string;
  children?: React.ReactNode;
  description?: string;
  dialogStyle?: StyleProp<ViewStyle>;
  footer?: React.ReactNode;
  height?: ViewStyle['height'];
  maxHeight?: ViewStyle['maxHeight'];
  maxWidth?: ViewStyle['maxWidth'];
  onClose: () => void;
  title: string;
  visible: boolean;
  width?: ViewStyle['width'];
}) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <KolamModalBackdrop onPress={onClose} />
      <View
        accessibilityLabel={accessibilityLabel ?? title}
        style={[
          styles.dialog,
          {height, maxHeight, maxWidth, width},
          dialogStyle,
        ]}>
        <View style={styles.header}>
          <KolamCopyStack
            items={[
              {id: 'title', text: title, style: styles.title},
              ...(description
                ? [
                    {
                      id: 'description',
                      text: description,
                      style: styles.description,
                    },
                  ]
                : []),
            ]}
          />
        </View>
        {children}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    bottom: 0,
    elevation: 1400,
    justifyContent: 'center',
    left: 0,
    padding: 24,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 140000,
  },
  dialog: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 1401,
    gap: 12,
    padding: 16,
    shadowColor: V.colors.fg,
    shadowOffset: {height: 16, width: 0},
    shadowOpacity: 0.18,
    shadowRadius: 24,
    zIndex: 140001,
  },
  header: {
    gap: 8,
  },
  title: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
  },
  description: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexShrink: 0,
    gap: 8,
    justifyContent: 'flex-end',
    paddingTop: 12,
  },
});
