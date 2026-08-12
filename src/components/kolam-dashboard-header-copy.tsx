import React from 'react';
import type {KolamNavigationModuleIcon} from '../domain/kolam-navigation';
import {KolamPageIdentityHeader} from './kolam-page-identity-header';
import {dashboardHeaderStyles as styles} from './kolam-dashboard-header-styles';

export function KolamDashboardHeaderCopy({
  centered = false,
  moduleIcon,
  subtitle,
  title,
}: {
  centered?: boolean;
  moduleIcon?: KolamNavigationModuleIcon;
  subtitle?: string;
  title: string;
}) {
  return (
    <KolamPageIdentityHeader
      containerStyle={centered ? styles.centeredHeaderIdentity : undefined}
      copyStyle={centered ? styles.centeredHeaderTextStack : undefined}
      subtitleStyle={centered ? styles.centeredHeaderSubtitle : undefined}
      titleStyle={centered ? styles.centeredHeaderTitle : undefined}
      moduleIcon={moduleIcon}
      subtitle={subtitle}
      title={title}
    />
  );
}
