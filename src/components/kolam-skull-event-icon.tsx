import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_SKULL_EVENT_ICON_SVG} from '../assets/icons/skull-event-icon-svg';

export interface KolamSkullEventIconProps {
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function KolamSkullEventIcon({
  accessibilityLabel = 'Icon total event',
  style,
}: KolamSkullEventIconProps) {
  return (
    <View accessibilityLabel={accessibilityLabel} style={style}>
      <SvgXml height="100%" width="100%" xml={KOLAM_SKULL_EVENT_ICON_SVG} />
    </View>
  );
}
