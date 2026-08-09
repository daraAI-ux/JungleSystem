import React from 'react';
import {View, type StyleProp, type ViewStyle} from 'react-native';
import type {KolamNavigationModuleIcon} from '../domain/kolam-navigation';
import {KolamCopyStack} from './kolam-copy-stack';
import {dashboardHeaderStyles as styles} from './kolam-dashboard-header-styles';
import {KolamModuleIcon} from './kolam-module-icon';

export function KolamPageIdentityHeader({
  containerStyle,
  eyebrow,
  moduleIcon,
  subtitle,
  title,
}: {
  containerStyle?: StyleProp<ViewStyle>;
  eyebrow?: string;
  moduleIcon?: KolamNavigationModuleIcon;
  subtitle?: string;
  title: string;
}) {
  const items = [
    ...(eyebrow ? [{id: 'eyebrow', text: eyebrow, style: styles.eyebrow}] : []),
    {id: 'title', text: title, style: styles.title},
    ...(subtitle
      ? [{id: 'subtitle', text: subtitle, style: styles.headerSubtitle}]
      : []),
  ];

  return (
    <View
      style={[
        styles.headerCopy,
        moduleIcon ? styles.headerCopyWithIcon : null,
        containerStyle,
      ]}>
      {moduleIcon ? <KolamModuleIcon kind={moduleIcon} size="header" /> : null}
      <View style={moduleIcon ? styles.headerCopyText : undefined}>
        <KolamCopyStack items={items} />
      </View>
    </View>
  );
}
