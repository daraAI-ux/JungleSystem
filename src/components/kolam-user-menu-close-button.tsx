import React from 'react';
import {getTopNavUserMenuCloseControl} from '../domain/top-nav';
import {KolamIconButton} from './kolam-icon-button';
import {KolamXIcon} from './kolam-x-icon';

const USER_MENU_CLOSE_CONTROL = getTopNavUserMenuCloseControl();

export function KolamUserMenuCloseButton({onClose}: {onClose: () => void}) {
  return (
    <KolamIconButton
      accessibilityLabel={USER_MENU_CLOSE_CONTROL.label}
      onPress={onClose}>
      <KolamXIcon />
    </KolamIconButton>
  );
}
