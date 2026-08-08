import React from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamDropdownSelect} from './kolam-dropdown-select';
import {KolamFormTextField} from './kolam-form-text-field';
import {settingsWebFormStyles} from './kolam-settings-web-form-styles';
import {KolamSwitch} from './kolam-switch';

export type KolamCommissionType = 'percentage' | 'fixed';

export interface KolamCommercialPolicyEditorValue {
  commissionEnabled: boolean;
  commissionType: KolamCommissionType;
  commissionValue: string;
  memberPointsEnabled: boolean;
  memberPoints: string;
}

export function KolamCommercialPolicyEditor({
  commissionHidden = false,
  disabled = false,
  memberPointsDisabled = false,
  memberPointsHint,
  onChange,
  style,
  value,
}: {
  commissionHidden?: boolean;
  disabled?: boolean;
  memberPointsDisabled?: boolean;
  memberPointsHint?: string;
  onChange: (value: KolamCommercialPolicyEditorValue) => void;
  style?: StyleProp<ViewStyle>;
  value: KolamCommercialPolicyEditorValue;
}) {
  const patch = (patchValue: Partial<KolamCommercialPolicyEditorValue>) =>
    onChange({...value, ...patchValue});

  return (
    <View style={[styles.root, style]}>
      {!commissionHidden ? (
        <View style={styles.policyPanel}>
          <View style={styles.policyHeader}>
            <KolamCopyStack
              items={[
                {id: 'title', text: 'Komisi', style: styles.title},
                {
                  id: 'hint',
                  text: 'Komisi penjualan untuk staff atau alur komisi backend.',
                  style: styles.hint,
                },
              ]}
            />
            <KolamSwitch
              accessibilityLabel="Aktifkan komisi"
              active={value.commissionEnabled}
              disabled={disabled}
              onPress={() =>
                patch({commissionEnabled: !value.commissionEnabled})
              }
            />
          </View>
          {value.commissionEnabled ? (
            <View style={styles.fieldGrid}>
              <KolamDropdownSelect
                label="Tipe komisi"
                onChange={commissionType => patch({commissionType})}
                options={[
                  {label: 'Persentase', value: 'percentage'},
                  {label: 'Nominal tetap', value: 'fixed'},
                ]}
                showLabelInTrigger={false}
                value={value.commissionType}
              />
              <KolamFormTextField
                editable={!disabled}
                keyboardType="numeric"
                onChangeText={commissionValue => patch({commissionValue})}
                placeholder={value.commissionType === 'percentage' ? 'Persen' : 'Nominal'}
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={value.commissionValue}
              />
            </View>
          ) : null}
        </View>
      ) : null}
      {!memberPointsDisabled ? (
        <View style={styles.policyPanel}>
          <View style={styles.policyHeader}>
            <KolamCopyStack
              items={[
                {id: 'title', text: 'Poin Anggota', style: styles.title},
                {
                  id: 'hint',
                  text: memberPointsHint || 'Poin yang didapat pelanggan per unit pembelian.',
                  style: styles.hint,
                },
              ]}
            />
            <KolamSwitch
              accessibilityLabel="Aktifkan poin anggota"
              active={value.memberPointsEnabled}
              disabled={disabled}
              onPress={() =>
                patch(
                  value.memberPointsEnabled
                    ? {memberPointsEnabled: false, memberPoints: '0'}
                    : {memberPointsEnabled: true},
                )
              }
            />
          </View>
          {value.memberPointsEnabled ? (
            <KolamFormTextField
              editable={!disabled}
              keyboardType="numeric"
              onChangeText={memberPoints => patch({memberPoints})}
              placeholder="Poin per unit"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={value.memberPoints}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    minWidth: 0,
    width: '100%',
  },
  policyPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
    gap: 10,
    minWidth: 320,
    padding: 12,
  },
  policyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  title: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  hint: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  fieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
