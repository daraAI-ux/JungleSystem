import React from 'react';
import type {Customer} from '../domain/pos';
import {KolamMappedSelectorChipGroup} from './kolam-mapped-selector-chip-group';

export interface KolamCustomerSelectorProps {
  customers: Customer[];
  onSelect: (customerId: string) => void;
  selectedCustomerId: string;
}

export function KolamCustomerSelector({
  customers,
  onSelect,
  selectedCustomerId,
}: KolamCustomerSelectorProps) {
  return (
    <KolamMappedSelectorChipGroup
      limit={4}
      items={customers}
      getOption={customer => ({
        id: customer.id,
        label: customer.name,
      })}
      selectedId={selectedCustomerId}
      onSelect={onSelect}
    />
  );
}
