import React from 'react';
import {KolamChevronIcon} from './kolam-chevron-icon';
import {KolamIconButton} from './kolam-icon-button';
import {
  getKolamChevronDirection,
  KOLAM_NAVIGATION_CHROME,
} from './kolam-menu-navigation-utils';

export function KolamMenuMoveButton({
  action,
  onPress,
}: {
  action?: (typeof KOLAM_NAVIGATION_CHROME.reorderActions)[number];
  onPress: () => void;
}) {
  return (
    <KolamIconButton
      accessibilityLabel={action?.label}
      onPress={onPress}
      size={22}
      radius="sm"
      variant="ghost">
      {action ? (
        <KolamChevronIcon
          direction={getKolamChevronDirection(action.iconKind)}
          size="menu-sm"
        />
      ) : null}
    </KolamIconButton>
  );
}
