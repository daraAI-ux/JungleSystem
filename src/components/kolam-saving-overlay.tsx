import React from 'react';
import {Animated, Easing, StyleSheet, Text, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export function KolamSavingOverlay({
  label = 'Menyimpan...',
  visible,
}: {
  label?: string;
  visible: boolean;
}) {
  const pulse = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!visible) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          duration: 680,
          easing: Easing.inOut(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          duration: 680,
          easing: Easing.inOut(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();

    return () => animation.stop();
  }, [pulse, visible]);

  if (!visible) {
    return null;
  }

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.16],
  });
  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0.88],
  });

  return (
    <View pointerEvents="auto" style={styles.overlay}>
      <View style={styles.panel}>
        <View style={styles.indicatorWrap}>
          <Animated.View style={[styles.indicatorHalo, {opacity, transform: [{scale}]}]} />
          <View style={styles.indicatorCore} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 50,
  },
  panel: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 44,
    paddingHorizontal: 14,
    shadowColor: '#0f172a',
    shadowOffset: {height: 4, width: 0},
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  indicatorWrap: {
    alignItems: 'center',
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  indicatorHalo: {
    backgroundColor: V.colors.primarySoft,
    borderRadius: 11,
    height: 22,
    position: 'absolute',
    width: 22,
  },
  indicatorCore: {
    backgroundColor: V.colors.primary,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  label: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
});
