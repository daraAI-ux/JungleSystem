import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_CASES_REPORTED_ICON_SVG} from '../assets/icons/cases-reported-icon-svg';

export interface KolamCasesReportedIconProps {
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function KolamCasesReportedIcon({
  accessibilityLabel = 'Icon kasus dilaporkan',
  style,
}: KolamCasesReportedIconProps) {
  return (
    <View accessibilityLabel={accessibilityLabel} style={style}>
      <SvgXml height="100%" width="100%" xml={KOLAM_CASES_REPORTED_ICON_SVG} />
    </View>
  );
}
