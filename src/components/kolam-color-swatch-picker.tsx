import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { normalizeTagColor } from '../domain/kolam-tag';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamFormTextField } from './kolam-form-text-field';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';

const DEFAULT_SWATCHES = [
  '#10b981',
  '#22c55e',
  '#3b82f6',
  '#06b6d4',
  '#f59e0b',
  '#ef4444',
  '#a855f7',
  '#64748b',
];

export function KolamColorSwatchPicker({
  disabled = false,
  onChange,
  value,
}: {
  disabled?: boolean;
  onChange: (value: string) => void;
  value: string;
}) {
  const normalizedValue = normalizeTagColor(value);

  return (
    <View style={styles.root}>
      <View style={styles.swatchRow}>
        {DEFAULT_SWATCHES.map(color => (
          <Pressable
            accessibilityLabel={`Pilih warna ${color}`}
            accessibilityRole="button"
            disabled={disabled}
            key={color}
            onPress={() => onChange(color)}
            style={[
              styles.swatchButton,
              normalizedValue === color && styles.swatchButtonActive,
              disabled && styles.swatchButtonDisabled,
            ]}
          >
            <View style={[styles.swatchFill, { backgroundColor: color }]} />
          </Pressable>
        ))}
      </View>
      <View style={styles.valueRow}>
        <View style={[styles.preview, { backgroundColor: normalizedValue }]} />
        <KolamFormTextField
          editable={!disabled}
          onChangeText={onChange}
          placeholder="#10b981"
          style={[
            settingsWebFormStyles.settingsWebFormFieldValue,
            styles.hexInput,
          ]}
          value={value}
        />
        <KolamCopyStack
          items={[
            {
              id: 'hint',
              text: 'Format HEX',
              style: styles.hint,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  swatchButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  swatchButtonActive: {
    borderColor: V.colors.primary,
    borderWidth: 2,
  },
  swatchButtonDisabled: {
    opacity: 0.6,
  },
  swatchFill: {
    width: 20,
    height: 20,
    borderRadius: 5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  preview: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  hexInput: {
    flex: 1,
  },
  hint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
});
