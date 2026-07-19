import React from 'react';
import type {AccessScope} from '../domain/auth';
import {KolamHeaderFrame} from './kolam-header-frame';
import {KolamUserMenuAvatar} from './kolam-user-menu-avatar';
import {KolamUserMenuCloseButton} from './kolam-user-menu-close-button';
import {KolamUserMenuProfile} from './kolam-user-menu-profile';

export function KolamUserMenuHeader({
  accessScope,
  displayName,
  email,
  initials,
  onClose,
  profilePhotoUrl,
}: {
  accessScope: AccessScope;
  displayName: string;
  email: string;
  initials: string;
  onClose: () => void;
  profilePhotoUrl?: string | null;
}) {
  return (
    <KolamHeaderFrame variant="userMenuHeader">
      <KolamUserMenuAvatar
        initials={initials}
        profilePhotoUrl={profilePhotoUrl}
      />
      <KolamUserMenuProfile
        accessScope={accessScope}
        displayName={displayName}
        email={email}
      />
      <KolamUserMenuCloseButton onClose={onClose} />
    </KolamHeaderFrame>
  );
}
