import React from 'react';
import { KolamRowFrame } from './kolam-row-frame';
import { KolamTextFieldRowCopy } from './kolam-text-field-row-copy';
import { KolamTextFieldRowInput } from './kolam-text-field-row-input';
import type { KolamTextFieldRowProps } from './kolam-text-field-row-types';

export type { KolamTextFieldRowProps } from './kolam-text-field-row-types';

export function KolamTextFieldRow({
  description,
  fieldWidth = 230,
  label,
  multiline,
  numberOfLines,
  onChangeText,
  placeholder,
  renderInput,
  variant,
  value,
}: KolamTextFieldRowProps) {
  return (
    <KolamRowFrame variant={variant}>
      <KolamTextFieldRowCopy description={description} label={label} />
      {renderInput ? (
        renderInput()
      ) : (
        <KolamTextFieldRowInput
          fieldWidth={fieldWidth}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onChangeText={onChangeText}
          placeholder={placeholder}
          value={value}
        />
      )}
    </KolamRowFrame>
  );
}
