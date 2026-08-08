import React from 'react';
import {SvgXml} from 'react-native-svg';
import {KOLAM_BEL_TOPBAR_ICON_SVG} from '../assets/icons/bel-topbar-icon-svg';

export interface KolamNotificationBellIconProps {
  color?: string;
}

export function KolamNotificationBellIcon(
  _props: KolamNotificationBellIconProps,
) {
  return <SvgXml height={20} width={20} xml={KOLAM_BEL_TOPBAR_ICON_SVG} />;
}
