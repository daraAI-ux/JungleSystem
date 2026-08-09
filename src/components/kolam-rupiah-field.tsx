import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {
  formatRupiahAccountingNumber,
  parseRupiahAccountingInput,
} from '../lib/money';
import {
  KolamFormTextField,
  type KolamFormTextFieldProps,
} from './kolam-form-text-field';

type KolamRupiahFieldProps = Omit<
  KolamFormTextFieldProps,
  'keyboardType' | 'mode' | 'onBlur' | 'onChangeText' | 'style' | 'value'
> & {
  inputStyle?: StyleProp<TextStyle>;
  onBlur?: KolamFormTextFieldProps['onBlur'];
  onChangeValue: (value: number) => void;
  style?: StyleProp<ViewStyle>;
  value: number;
};

export function KolamRupiahField({
  editable,
  inputStyle,
  onBlur,
  onChangeValue,
  style,
  value,
  ...inputProps
}: KolamRupiahFieldProps) {
  const [focused, setFocused] = React.useState(false);
  const [draft, setDraft] = React.useState(formatRupiahAccountingNumber(value));

  React.useEffect(() => {
    if (!focused) {
      setDraft(formatRupiahAccountingNumber(value));
    }
  }, [focused, value]);

  return (
    <View style={[styles.shell, editable === false ? styles.disabled : null, style]}>
      <Text style={styles.prefix}>Rp</Text>
      <KolamFormTextField
        {...inputProps}
        editable={editable}
        mode="numeric"
        onBlur={event => {
          setFocused(false);
          setDraft(formatRupiahAccountingNumber(value));
          onBlur?.(event);
        }}
        onChangeText={text => {
          setDraft(text);
          onChangeValue(parseRupiahAccountingInput(text));
        }}
        onFocus={event => {
          setFocused(true);
          inputProps.onFocus?.(event);
        }}
        style={[styles.input, inputStyle]}
        value={draft}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    height: V.control.inputHeight,
    minHeight: V.control.inputHeight,
    paddingLeft: V.control.inputPaddingX,
  },
  disabled: {
    opacity: 0.55,
  },
  prefix: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: V.control.fontSize,
    fontWeight: '800',
  },
  input: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    flex: 1,
    fontVariant: ['tabular-nums'],
    height: V.control.inputHeight - 2,
    minHeight: V.control.inputHeight - 2,
    paddingHorizontal: 0,
    paddingRight: V.control.inputPaddingX,
  },
});
