import React from 'react';
import type {AccessScope} from '../domain/auth';
import type {TopNavUserMenuItem} from '../domain/top-nav';
import {KolamPanelFrame} from './kolam-panel-frame';
import {KolamUserMenuHeader} from './kolam-user-menu-header';
import {KolamUserMenuList} from './kolam-user-menu-list';

export function KolamUserMenuPanel({
  items,
  displayName,
  initials,
  email,
  accessScope,
  onClose,
  onSelect,
  profilePhotoUrl,
}: {
  items: TopNavUserMenuItem[];
  displayName: string;
  initials: string;
  email: string;
  accessScope: AccessScope;
  onClose: () => void;
  onSelect: (item: TopNavUserMenuItem) => void;
  profilePhotoUrl?: string | null;
}) {
  return (
    <KolamPanelFrame variant="userMenu">
      <KolamUserMenuHeader
        accessScope={accessScope}
        displayName={displayName}
        email={email}
        initials={initials}
        onClose={onClose}
        profilePhotoUrl={profilePhotoUrl}
      />
      <KolamUserMenuList items={items} onSelect={onSelect} />
    </KolamPanelFrame>
  );
}
