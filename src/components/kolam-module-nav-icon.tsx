import React from 'react';
import {StyleSheet} from 'react-native';
import {type ShellModule} from '../domain/app-shell';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {ModuleNavAutomationIcon} from './kolam-module-nav-automation-icon';
import {ModuleNavCartIcon} from './kolam-module-nav-cart-icon';
import {ModuleNavCatalogIcon} from './kolam-module-nav-catalog-icon';
import {ModuleNavDashboardIcon} from './kolam-module-nav-dashboard-icon';
import {ModuleNavPeopleIcon} from './kolam-module-nav-people-icon';
import {ModuleNavPluginIcon} from './kolam-module-nav-plugin-icon';
import {ModuleNavSalesIcon} from './kolam-module-nav-sales-icon';
import {ModuleNavSettingsIcon} from './kolam-module-nav-settings-icon';
import {ModuleNavWalletIcon} from './kolam-module-nav-wallet-icon';

export function ModuleNavIcon({
  kind,
  active = false,
}: {
  kind: ShellModule['iconKind'];
  active?: boolean;
}) {
  const tintStyle = active ? styles.iconActiveTint : styles.iconTint;

  if (kind === 'dashboard') {
    return <ModuleNavDashboardIcon tintStyle={tintStyle} />;
  }

  if (kind === 'settings') {
    return <ModuleNavSettingsIcon tintStyle={tintStyle} />;
  }

  if (kind === 'cart') {
    return <ModuleNavCartIcon tintStyle={tintStyle} />;
  }

  if (kind === 'catalog') {
    return <ModuleNavCatalogIcon tintStyle={tintStyle} />;
  }

  if (kind === 'sales') {
    return <ModuleNavSalesIcon tintStyle={tintStyle} />;
  }

  if (kind === 'wallet') {
    return <ModuleNavWalletIcon tintStyle={tintStyle} />;
  }

  if (kind === 'people') {
    return <ModuleNavPeopleIcon tintStyle={tintStyle} />;
  }

  if (kind === 'automation') {
    return <ModuleNavAutomationIcon tintStyle={tintStyle} />;
  }

  return <ModuleNavPluginIcon tintStyle={tintStyle} />;
}

const styles = StyleSheet.create({
  iconTint: {
    backgroundColor: V.colors.mutedFg,
    borderColor: V.colors.mutedFg,
  },
  iconActiveTint: {
    backgroundColor: V.colors.primary,
    borderColor: V.colors.primary,
  },
});
