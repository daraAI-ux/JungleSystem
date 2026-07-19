import React from 'react';
import {KolamRowFrame} from './kolam-row-frame';
import {KolamTextFieldRowCopy} from './kolam-text-field-row-copy';
import {KolamTextFieldRowInput} from './kolam-text-field-row-input';
import type {KolamTextFieldRowProps} from './kolam-text-field-row-types';

export type {KolamTextFieldRowProps} from './kolam-text-field-row-types';

export function KolamTextFieldRow({
  description,
  fieldWidth = 230,
  label,
  onChangeText,
  placeholder,
  value,
}: KolamTextFieldRowProps) {
  return (
    <KolamRowFrame>
      <KolamTextFieldRowCopy description={description} label={label} />
      <KolamTextFieldRowInput
        fieldWidth={fieldWidth}
        onChangeText={onChangeText}
        placeholder={placeholder}
        value={value}
      />
    </KolamRowFrame>
  );
}
