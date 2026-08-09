import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type {KolamNavigationModuleIcon} from '../domain/kolam-navigation';
import {KolamCopyStack} from './kolam-copy-stack';
import {dashboardHeaderStyles as styles} from './kolam-dashboard-header-styles';
import {KolamModuleIcon} from './kolam-module-icon';

export function KolamPageIdentityHeader({
  children,
  containerStyle,
  eyebrow,
  eyebrowAccessory,
  moduleIcon,
  placement = 'shell',
  subtitle,
  title,
}: {
  children?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  eyebrow?: string;
  eyebrowAccessory?: React.ReactNode;
  moduleIcon?: KolamNavigationModuleIcon;
  placement?: 'shell' | 'workspace';
  subtitle?: string;
  title: string;
}) {
  const items = [
    ...(eyebrow && !eyebrowAccessory
      ? [{id: 'eyebrow', text: eyebrow, style: styles.eyebrow}]
      : []),
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
        placement === 'workspace' ? pageIdentityHeaderStyles.workspace : null,
        containerStyle,
      ]}>
      {moduleIcon ? <KolamModuleIcon kind={moduleIcon} size="header" /> : null}
      <View style={moduleIcon ? styles.headerCopyText : undefined}>
        {eyebrow && eyebrowAccessory ? (
          <View style={pageIdentityHeaderStyles.eyebrowRow}>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            {eyebrowAccessory}
          </View>
        ) : null}
        <KolamCopyStack items={items} />
        {children}
      </View>
    </View>
  );
}

const pageIdentityHeaderStyles = StyleSheet.create({
  workspace: {
    marginTop: -64,
  },
  eyebrowRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
