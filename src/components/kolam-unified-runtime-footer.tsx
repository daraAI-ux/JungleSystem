import React from 'react';
import {StyleSheet} from 'react-native';
import {appConfig} from '../config/app';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamCopyStack} from './kolam-copy-stack';

export function KolamUnifiedRuntimeFooter() {
  return (
    <KolamCardFrame variant="unifiedRuntimeFooter">
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: 'Unified runtime',
            style: styles.unifiedFooterTitle,
          },
          {
            id: 'description',
            text: `${appConfig.appName} mengikat Kolam, POS, AM, dan plugin ke satu sesi native Windows. API: ${appConfig.apiBaseUrl}`,
            style: styles.unifiedFooterText,
          },
        ]}
      />
    </KolamCardFrame>
  );
}

const styles = StyleSheet.create({
  unifiedFooterTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
  },
  unifiedFooterText: {
    marginTop: 4,
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 18,
  },
});