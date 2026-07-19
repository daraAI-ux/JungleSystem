import React from 'react';
import type {PaymentMethod} from '../domain/pos';
import {KolamMappedSelectorChipGroup} from './kolam-mapped-selector-chip-group';

export interface KolamPaymentSelectorProps {
  methods: PaymentMethod[];
  onSelect: (methodId: string) => void;
  selectedMethodId: string;
}

export function KolamPaymentSelector({
  methods,
  onSelect,
  selectedMethodId,
}: KolamPaymentSelectorProps) {
  return (
    <KolamMappedSelectorChipGroup
      limit={4}
      items={methods}
      getOption={method => ({
        id: method.id,
        label: method.name,
      })}
      selectedId={selectedMethodId}
      onSelect={onSelect}
    />
  );
}
