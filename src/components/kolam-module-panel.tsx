import React from 'react';
import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamHeaderFrame} from './kolam-header-frame';
import {KolamPanelFrame} from './kolam-panel-frame';

export interface KolamModulePanelProps {
  children: React.ReactNode;
  hint: string;
  title: string;
}

export function KolamModulePanel({
  children,
  hint,
  title,
}: KolamModulePanelProps) {
  return (
    <KolamPanelFrame variant="module">
      <KolamHeaderFrame variant="moduleSection">
        <KolamCopyStack
          items={[
            {id: 'title', text: title, style: styles.sectionTitle},
            {id: 'hint', text: hint, style: styles.sectionHint},
          ]}
        />
      </KolamHeaderFrame>
      {children}
    </KolamPanelFrame>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionHint: {
    marginTop: 4,
    color: V.colors.mutedFg,
    fontSize: 13,
  },
});