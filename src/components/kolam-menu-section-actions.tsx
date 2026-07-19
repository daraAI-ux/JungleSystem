import React from 'react';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMenuCountBadge} from './kolam-menu-count-badge';
import {KolamMenuMoveButton} from './kolam-menu-move-button';
import {KOLAM_NAVIGATION_CHROME} from './kolam-menu-navigation-utils';

export function KolamMenuSectionActions({
  countLabel,
  onMove,
}: {
  countLabel: string;
  onMove: (direction: 'up' | 'down') => void;
}) {
  const moveUpAction = KOLAM_NAVIGATION_CHROME.reorderActions.find(
    action => action.id === 'move-up',
  );
  const moveDownAction = KOLAM_NAVIGATION_CHROME.reorderActions.find(
    action => action.id === 'move-down',
  );

  return (
    <KolamListFrame variant="menuSectionActions">
      <KolamMenuMoveButton
        action={moveUpAction}
        onPress={() => onMove('up')}
      />
      <KolamMenuMoveButton
        action={moveDownAction}
        onPress={() => onMove('down')}
      />
      <KolamMenuCountBadge label={countLabel} />
    </KolamListFrame>
  );
}