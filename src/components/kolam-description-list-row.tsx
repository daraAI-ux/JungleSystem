import React from 'react';
import {View} from 'react-native';
import type {KolamDescriptionListRow as Row} from './kolam-description-list-types';
import {KolamDescriptionListDetails} from './kolam-description-list-details';
import {KolamDescriptionListTerm} from './kolam-description-list-term';
import {descriptionListStyles as styles} from './kolam-description-list-styles';

export function KolamDescriptionListRow({
  first,
  row,
}: {
  first: boolean;
  row: Row;
}) {
  return (
    <View style={[styles.row, first && styles.rowFirst]}>
      <KolamDescriptionListTerm label={row.label} />
      <KolamDescriptionListDetails row={row} />
    </View>
  );
}
