import React from 'react';
import { StyleSheet, View } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';

export function KolamMenuSectionIcon({
  active = false,
  sectionId,
}: {
  active?: boolean;
  sectionId: string;
}) {
  const spec = getSectionIconSpec(sectionId);
  const color = active ? V.colors.primary : spec.color;

  return (
    <View
      testID={`kolam-menu-section-icon:${sectionId}`}
      style={[styles.icon, { backgroundColor: spec.soft }]}
    >
      <View style={[styles[spec.shape], { borderColor: color }]} />
      <View
        style={[styles.accent, styles[spec.accent], { backgroundColor: color }]}
      />
    </View>
  );
}

type SectionShape = 'leaf' | 'flow' | 'spark' | 'vault' | 'people' | 'stack';
type SectionAccent =
  | 'accentNorth'
  | 'accentEast'
  | 'accentSouth'
  | 'accentWest';

function getSectionIconSpec(sectionId: string): {
  accent: SectionAccent;
  color: string;
  shape: SectionShape;
  soft: string;
} {
  switch (sectionId) {
    case 'inventory':
      return {
        accent: 'accentNorth',
        color: V.colors.success,
        shape: 'stack',
        soft: V.colors.successSoft,
      };
    case 'sales':
      return {
        accent: 'accentEast',
        color: V.colors.warning,
        shape: 'flow',
        soft: V.colors.warningSoft,
      };
    case 'pusatAi':
      return {
        accent: 'accentSouth',
        color: V.colors.info,
        shape: 'spark',
        soft: V.colors.infoSoft,
      };
    case 'finance':
      return {
        accent: 'accentWest',
        color: V.colors.primary,
        shape: 'vault',
        soft: V.colors.primarySoft,
      };
    case 'user':
      return {
        accent: 'accentNorth',
        color: '#7c3aed',
        shape: 'people',
        soft: '#f3e8ff',
      };
    default:
      return {
        accent: 'accentEast',
        color: '#0f766e',
        shape: 'leaf',
        soft: '#ccfbf1',
      };
  }
}

const styles = StyleSheet.create({
  icon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  accent: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 999,
  },
  accentNorth: {
    top: 2,
    right: 3,
  },
  accentEast: {
    right: 2,
    bottom: 5,
  },
  accentSouth: {
    left: 4,
    bottom: 2,
  },
  accentWest: {
    left: 2,
    top: 5,
  },
  leaf: {
    width: 10,
    height: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 8,
    borderWidth: 2,
    transform: [{ rotate: '35deg' }],
  },
  flow: {
    width: 12,
    height: 10,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderLeftWidth: 0,
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
  },
  spark: {
    width: 10,
    height: 10,
    borderRadius: 2,
    borderWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  vault: {
    width: 12,
    height: 10,
    borderRadius: 999,
    borderWidth: 2,
  },
  people: {
    width: 12,
    height: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    borderWidth: 2,
  },
  stack: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 2,
  },
});
