import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_NOTES_ICON_SVG} from '../assets/icons/notes-icon-svg';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export interface KolamNotesFieldProps
  extends Omit<TextInputProps, 'multiline' | 'style'> {
  label?: string;
  required?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<ViewStyle>;
}

export function KolamNotesField({
  label,
  required = false,
  containerStyle,
  inputStyle,
  iconStyle,
  numberOfLines = 4,
  textAlignVertical = 'top',
  ...inputProps
}: KolamNotesFieldProps) {
  return (
    <View style={[styles.stack, containerStyle]}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? ' *' : ''}
        </Text>
      ) : null}
      <View style={styles.noteBox}>
        <View pointerEvents="none" style={[styles.iconBadge, iconStyle]}>
          <SvgXml height="100%" width="100%" xml={KOLAM_NOTES_ICON_SVG} />
        </View>
        <TextInput
          {...inputProps}
          multiline
          numberOfLines={numberOfLines}
          placeholderTextColor={V.colors.mutedFg}
          textAlignVertical={textAlignVertical}
          style={[styles.input, inputStyle]}
        />
      </View>
    </View>
  );
}

export interface KolamNotesDisplayProps {
  label?: string;
  text?: string | null;
  emptyText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<ViewStyle>;
}

export function KolamNotesDisplay({
  label,
  text,
  emptyText = '-',
  containerStyle,
  textStyle,
  iconStyle,
}: KolamNotesDisplayProps) {
  const resolvedText = text && text.trim().length > 0 ? text : emptyText;

  return (
    <View style={[styles.stack, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.noteBox}>
        <View pointerEvents="none" style={[styles.iconBadge, iconStyle]}>
          <SvgXml height="100%" width="100%" xml={KOLAM_NOTES_ICON_SVG} />
        </View>
        <Text style={[styles.displayText, textStyle]}>{resolvedText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 6,
    width: '100%',
  },
  label: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  noteBox: {
    backgroundColor: V.colors.warningSoft,
    borderColor: V.colors.warning,
    borderRadius: V.radius.md,
    borderWidth: 1,
    minHeight: 86,
    paddingHorizontal: 12,
    paddingVertical: 10,
    position: 'relative',
    width: '100%',
  },
  iconBadge: {
    height: 18,
    position: 'absolute',
    right: 12,
    top: 10,
    width: 18,
    zIndex: 1,
  },
  input: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    minHeight: 64,
    padding: 0,
    paddingRight: 30,
  },
  displayText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
    paddingRight: 30,
  },
});
