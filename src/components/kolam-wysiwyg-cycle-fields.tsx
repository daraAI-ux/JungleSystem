import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  formatWysiwygDueAt,
  isWysiwygDue,
  mergeWysiwygUnit,
  type WysiwygIntervalUnit,
  type WysiwygPriceMode,
  type WysiwygUnitConfig,
} from '../domain/kolam-wysiwyg';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamButton} from './kolam-button';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamDropdownSelect} from './kolam-dropdown-select';
import {KolamFormTextField} from './kolam-form-text-field';
import {KolamRupiahField} from './kolam-rupiah-field';
import {KolamStatusBadge} from './kolam-status-badge';
import {KolamToggleRow} from './kolam-toggle-row';

const INTERVAL_OPTIONS: Array<{label: string; value: WysiwygIntervalUnit}> = [
  {label: 'Hari', value: 'day'},
  {label: 'Minggu', value: 'week'},
  {label: 'Bulan', value: 'month'},
];

const PRICE_MODE_OPTIONS: Array<{label: string; value: WysiwygPriceMode}> = [
  {label: 'Persen (%)', value: 'percent'},
  {label: 'Nominal (Rp)', value: 'fixed'},
];

export function KolamWysiwygCycleFields({
  compact = false,
  disabled = false,
  onChange,
  onSkip,
  skipPending = false,
  value,
}: {
  compact?: boolean;
  disabled?: boolean;
  onChange: (next: WysiwygUnitConfig) => void;
  onSkip?: () => void;
  skipPending?: boolean;
  value?: WysiwygUnitConfig | null;
}) {
  const unit = mergeWysiwygUnit(value);
  const due = isWysiwygDue(unit);
  const useDefaults = unit.useDefaults !== false;
  const dueLabel = formatWysiwygDueAt(unit.nextDueAt);

  const patch = (partial: Partial<WysiwygUnitConfig>) => {
    onChange({...unit, ...partial});
  };

  return (
    <View style={compact ? styles.compactShell : styles.shell}>
      <KolamToggleRow
        active={Boolean(unit.enabled)}
        description="Foto terkini wajib sebelum harga naik. Skip = harga tetap, siklus lanjut."
        disabled={disabled}
        label="WYSIWYG"
        onPress={() => !disabled && patch({enabled: !unit.enabled})}
        variant="settingsForm"
      />

      {unit.enabled ? (
        <>
          <KolamToggleRow
            active={useDefaults}
            description=""
            disabled={disabled}
            label="Pakai default Settings"
            onPress={() => !disabled && patch({useDefaults: !useDefaults})}
            variant="settingsForm"
          />

          {useDefaults ? null : (
            <View style={styles.overrideGrid}>
              <KolamFormTextField
                editable={!disabled}
                label="Interval"
                mode="numeric"
                onChangeText={text =>
                  patch({
                    intervalValue: Math.max(1, Math.floor(Number(text) || 1)),
                  })
                }
                value={String(unit.intervalValue ?? 1)}
              />
              <KolamDropdownSelect<WysiwygIntervalUnit>
                accessibilityLabel="Satuan"
                label="Satuan"
                onChange={intervalUnit => {
                  if (!disabled) {
                    patch({intervalUnit});
                  }
                }}
                options={INTERVAL_OPTIONS}
                showLabelInTrigger={false}
                value={unit.intervalUnit || 'month'}
              />
              <KolamDropdownSelect<WysiwygPriceMode>
                accessibilityLabel="Naik harga"
                label="Naik harga"
                onChange={priceMode => {
                  if (!disabled) {
                    patch({priceMode});
                  }
                }}
                options={PRICE_MODE_OPTIONS}
                showLabelInTrigger={false}
                value={unit.priceMode || 'percent'}
              />
              {unit.priceMode === 'fixed' ? (
                <View>
                  <Text style={styles.fieldLabel}>Naik (Rp)</Text>
                  <KolamRupiahField
                    editable={!disabled}
                    onChangeValue={priceAmount =>
                      patch({priceAmount: Math.max(0, priceAmount || 0)})
                    }
                    value={unit.priceAmount ?? 0}
                  />
                </View>
              ) : (
                <KolamFormTextField
                  editable={!disabled}
                  label="Naik (%)"
                  mode="numeric"
                  onChangeText={text =>
                    patch({priceAmount: Math.max(0, Number(text) || 0)})
                  }
                  value={String(unit.priceAmount ?? 0)}
                />
              )}
              <View style={styles.capField}>
                <Text style={styles.fieldLabel}>Plafon (0 = tanpa batas)</Text>
                <KolamRupiahField
                  editable={!disabled}
                  onChangeValue={priceCap =>
                    patch({priceCap: Math.max(0, priceCap || 0)})
                  }
                  value={unit.priceCap ?? 0}
                />
              </View>
            </View>
          )}

          <KolamToggleRow
            active={Boolean(unit.paused)}
            description=""
            disabled={disabled}
            label="Pause"
            onPress={() => !disabled && patch({paused: !unit.paused})}
            variant="settingsForm"
          />

          {dueLabel ? (
            <View style={styles.dueRow}>
              <KolamCopyStack
                items={[
                  {
                    id: 'due',
                    style: styles.dueText,
                    text: `Due berikutnya: ${dueLabel}`,
                  },
                ]}
              />
              {due ? (
                <KolamStatusBadge
                  intent="warning"
                  label="butuh foto terkini"
                />
              ) : null}
            </View>
          ) : null}

          {due && onSkip ? (
            <KolamButton
              disabled={disabled || skipPending}
              intent="outline"
              label="Skip siklus ini (harga tetap)"
              onPress={onSkip}
              size="sm"
            />
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    gap: 10,
  },
  compactShell: {
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  overrideGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  capField: {
    minWidth: 220,
  },
  fieldLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  dueRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dueText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
  },
});
