import React from 'react';
import type {TopNavUserMenuIconKind} from '../domain/top-nav';
import {KolamUserMenuCommandIcon} from './kolam-user-menu-command-icon';
import {KolamUserMenuDashboardIcon} from './kolam-user-menu-dashboard-icon';
import {KolamUserMenuLogoutIcon} from './kolam-user-menu-logout-icon';
import {KolamUserMenuSettingsIcon} from './kolam-user-menu-settings-icon';
import {KolamUserMenuSupportIcon} from './kolam-user-menu-support-icon';

export interface KolamUserMenuIconProps {
  danger?: boolean;
  kind: TopNavUserMenuIconKind;
}

export function KolamUserMenuIcon({
  danger = false,
  kind,
}: KolamUserMenuIconProps) {
  if (kind === 'dashboard') {
    return <KolamUserMenuDashboardIcon danger={danger} />;
  }

  if (kind === 'settings') {
    return <KolamUserMenuSettingsIcon danger={danger} />;
  }

  if (kind === 'command') {
    return <KolamUserMenuCommandIcon danger={danger} />;
  }

  if (kind === 'logout') {
    return <KolamUserMenuLogoutIcon danger={danger} />;
  }

  return <KolamUserMenuSupportIcon danger={danger} />;
}
