import React from 'react';
import {StyleSheet} from 'react-native';
import {type KolamFormSection} from '../domain/kolam-form';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamContentFrame} from './kolam-content-frame';
import {KolamCopyStack} from './kolam-copy-stack';

export interface KolamNativeFormSectionProps {
  children: React.ReactNode;
  section: KolamFormSection;
}

export function KolamNativeFormSection({
  children,
  section,
}: KolamNativeFormSectionProps) {
  return (
    <KolamContentFrame variant="nativeFormSection">
      <KolamCopyStack
        containerStyle={styles.nativeFormCopy}
        items={[
          {
            id: 'title',
            text: section.title,
            style: styles.nativeFormTitle,
          },
          {
            id: 'description',
            text: section.description,
            style: styles.nativeFormDescription,
          },
        ]}
      />
      <KolamContentFrame variant="nativeFormControls">
        {children}
      </KolamContentFrame>
    </KolamContentFrame>
  );
}

const styles = StyleSheet.create({
  nativeFormCopy: {
    flex: 1,
    minWidth: 220,
  },
  nativeFormTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  nativeFormDescription: {
    marginTop: 4,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 18,
  },
});