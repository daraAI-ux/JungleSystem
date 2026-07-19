import React from 'react';
import {
  KolamActionControlButton,
  type KolamActionControlButtonProps,
} from './kolam-action-control-button';
import {KolamMappedList} from './kolam-mapped-list';

export interface KolamActionControlItem extends KolamActionControlButtonProps {
  id: string;
}

export function KolamActionControlSet({
  actions,
}: {
  actions: KolamActionControlItem[];
}) {
  return (
    <KolamMappedList
      items={actions}
      getKey={action => action.id}
      renderItem={({id: _id, ...action}) => <KolamActionControlButton {...action} />}
    />
  );
}

