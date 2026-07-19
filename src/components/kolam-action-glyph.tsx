import React from 'react';
import {StyleSheet, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export type KolamActionGlyphTone = 'default' | 'danger';
export type KolamActionGlyphVariant = 'delete' | 'edit' | 'plus';

export interface KolamActionGlyphProps {
  tone?: KolamActionGlyphTone;
  variant: KolamActionGlyphVariant;
}

export function KolamActionGlyph({
  tone = 'default',
  variant,
}: KolamActionGlyphProps) {
  const tintStyle = tone === 'danger' ? styles.dangerTint : styles.tint;

  if (variant === 'plus') {
    return (
      <View style={styles.icon}>
        <View style={[styles.plusVertical, tintStyle]} />
        <View style={[styles.plusHorizontal, tintStyle]} />
      </View>
    );
  }

  if (variant === 'delete') {
    return (
      <View style={styles.icon}>
        <View style={[styles.trashLid, tintStyle]} />
        <View style={[styles.trashCan, tintStyle]} />
      </View>
    );
  }

  return (
    <View style={styles.icon}>
      <View style={[styles.editStem, tintStyle]} />
      <View style={[styles.editTip, tintStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  tint: {
    backgroundColor: V.colors.fg,
    borderColor: V.colors.fg,
  },
  dangerTint: {
    backgroundColor: V.colors.warning,
    borderColor: V.colors.warning,
  },
  icon: {
    width: 12,
    height: 12,
    position: 'relative',
  },
  plusVertical: {
    position: 'absolute',
    left: 5,
    top: 1,
    width: 2,
    height: 10,
    borderRadius: 999,
  },
  plusHorizontal: {
    position: 'absolute',
    left: 1,
    top: 5,
    width: 10,
    height: 2,
    borderRadius: 999,
  },
  trashLid: {
    position: 'absolute',
    left: 2,
    top: 1,
    width: 8,
    height: 2,
    borderRadius: 999,
  },
  trashCan: {
    position: 'absolute',
    left: 3,
    top: 4,
    width: 6,
    height: 7,
    borderRadius: 2,
  },
  editStem: {
    position: 'absolute',
    left: 5,
    top: 1,
    width: 3,
    height: 10,
    borderRadius: 999,
    transform: [{rotate: '35deg'}],
  },
  editTip: {
    position: 'absolute',
    left: 2,
    bottom: 1,
    width: 5,
    height: 2,
    borderRadius: 999,
  },
});
