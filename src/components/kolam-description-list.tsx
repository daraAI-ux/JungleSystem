import React from 'react';
import {KolamDescriptionListRow} from './kolam-description-list-row';
import {
  type KolamDescriptionListProps,
  type KolamDescriptionListRow as KolamDescriptionListRowData,
  type KolamDescriptionListTone,
} from './kolam-description-list-types';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';

export type {
  KolamDescriptionListProps,
  KolamDescriptionListRowData as KolamDescriptionListRow,
  KolamDescriptionListTone,
};

export function KolamDescriptionList({
  accessibilityLabel,
  rows,
}: KolamDescriptionListProps) {
  return (
    <KolamListFrame
      variant="descriptionList"
      accessibilityLabel={accessibilityLabel}>
      <KolamMappedList
        items={rows}
        getKey={row => row.id}
        renderItem={(row, index) => (
          <KolamDescriptionListRow first={index === 0} row={row} />
        )}
      />
    </KolamListFrame>
  );
}