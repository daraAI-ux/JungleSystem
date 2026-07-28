import React, { type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamMenuSectionIcon } from './kolam-menu-section-icon';
import { KolamMenuPressableFrame } from './kolam-menu-pressable-frame';

export interface KolamMenuSectionToggleProps {
  expanded?: boolean;
  icon: ReactNode;
  label: string;
  onPress: () => void;
  sectionId: string;
}

export function KolamMenuSectionToggle({
  expanded = false,
  icon,
  label,
  onPress,
  sectionId,
}: KolamMenuSectionToggleProps) {
  return (
    <KolamMenuPressableFrame onPress={onPress} variant="sectionToggle">
      {icon}
      <KolamMenuSectionIcon active={expanded} sectionId={sectionId} />
      <KolamCopyStack
        items={[{ id: 'label', text: label, style: styles.sectionTitle }]}
      />
    </KolamMenuPressableFrame>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    flex: 1,
    color: V.colors.sidebarFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
});
