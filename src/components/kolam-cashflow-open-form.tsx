import React from 'react';
import {getKolamFormSection} from '../domain/kolam-form';
import {KolamNativeFormSection} from './kolam-native-form-section';
import {KolamFormTextField} from './kolam-form-text-field';
import {KolamListFrame} from './kolam-list-frame';
import {cashflowModuleStyles as styles} from './kolam-cashflow-module-styles';

export function KolamCashflowOpenForm({
  cashflowShiftName,
  onCashflowShiftNameChange,
}: {
  cashflowShiftName: string;
  onCashflowShiftNameChange: (value: string) => void;
}) {
  return (
    <KolamNativeFormSection section={getKolamFormSection('cashflow-open')}>
      <KolamListFrame variant="formGrid">
        <KolamFormTextField
          value={cashflowShiftName}
          onChangeText={onCashflowShiftNameChange}
          placeholder="nama shift, contoh: Morning Shift"
          style={styles.formInput}
        />
      </KolamListFrame>
    </KolamNativeFormSection>
  );
}