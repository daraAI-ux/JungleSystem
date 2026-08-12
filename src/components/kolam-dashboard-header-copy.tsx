import React from 'react';
import type {KolamNavigationModuleIcon} from '../domain/kolam-navigation';
import {KolamPageIdentityHeader} from './kolam-page-identity-header';

export function KolamDashboardHeaderCopy({
  moduleIcon,
  subtitle,
  title,
}: {
  moduleIcon?: KolamNavigationModuleIcon;
  subtitle?: string;
  title: string;
}) {
  return (
    <KolamPageIdentityHeader
      moduleIcon={moduleIcon}
      subtitle={subtitle}
      title={title}
    />
  );
}
