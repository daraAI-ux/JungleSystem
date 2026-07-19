import React from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export type KolamWarningIconVariant = 'activity' | 'rail' | 'summary';

export interface KolamWarningIconProps {
  color?: string;
  cutoutColor?: string;
  detailColor?: string;
  style?: StyleProp<ViewStyle>;
  variant?: KolamWarningIconVariant;
}

export function KolamWarningIcon({
  color = V.colors.warning,
  cutoutColor = V.colors.warningSoft,
  detailColor,
  style,
  variant = 'activity',
}: KolamWarningIconProps) {
  if (variant === 'summary') {
    const tintStyle = {
      backgroundColor: color,
      borderColor: color,
    };

    return (
      <View style={[styles.summaryIcon, style]}>
        <View style={[styles.summaryBody, tintStyle]} />
        <View style={[styles.summaryStem, tintStyle]} />
        <View style={[styles.summaryDot, tintStyle]} />
      </View>
    );
  }

  const markerColor = detailColor ?? (variant === 'rail' ? color : V.colors.bg);

  if (variant === 'rail') {
    return (
      <View style={[styles.railIcon, style]}>
        <View style={[styles.railBody, {borderBottomColor: color}]} />
        <View style={[styles.railCutout, {borderBottomColor: cutoutColor}]} />
        <View style={[styles.railStem, {backgroundColor: markerColor}]} />
        <View style={[styles.railDot, {backgroundColor: markerColor}]} />
      </View>
    );
  }

  return (
    <View style={[styles.activityIcon, style]}>
      <View style={[styles.activityBody, {borderBottomColor: color}]} />
      <View style={[styles.activityDot, {backgroundColor: markerColor}]} />
    </View>
  );
}

const transparent = 'transparent';

const triangleBase = {
  width: 0,
  height: 0,
  borderLeftColor: transparent,
  borderRightColor: transparent,
};

const styles = StyleSheet.create({
  activityIcon: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityBody: {
    ...triangleBase,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 11,
  },
  activityDot: {
    position: 'absolute',
    bottom: 2,
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  railIcon: {
    width: 18,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  railBody: {
    ...triangleBase,
    backgroundColor: transparent,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 16,
  },
  railCutout: {
    ...triangleBase,
    position: 'absolute',
    top: 3,
    backgroundColor: transparent,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 11,
  },
  railStem: {
    position: 'absolute',
    top: 6,
    width: 2,
    height: 5,
    borderRadius: 999,
  },
  railDot: {
    position: 'absolute',
    bottom: 3,
    width: 2,
    height: 2,
    borderRadius: 999,
  },
  summaryIcon: {
    width: 16,
    height: 15,
    alignItems: 'center',
  },
  summaryBody: {
    width: 15,
    height: 13,
    borderRadius: 4,
    borderWidth: 2,
    transform: [{rotate: '45deg'}],
  },
  summaryStem: {
    position: 'absolute',
    top: 4,
    width: 2,
    height: 5,
    borderRadius: 999,
  },
  summaryDot: {
    position: 'absolute',
    bottom: 2,
    width: 2,
    height: 2,
    borderRadius: 1,
  },
});
