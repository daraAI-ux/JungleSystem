import React from 'react';
import {StyleSheet} from 'react-native';
import {KolamInteractionFrame} from './kolam-interaction-frame';

export interface KolamModalBackdropProps {
  onPress: () => void;
}

export function KolamModalBackdrop({onPress}: KolamModalBackdropProps) {
  return <KolamInteractionFrame onPress={onPress} style={styles.backdrop} />;
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.20)',
  },
});
