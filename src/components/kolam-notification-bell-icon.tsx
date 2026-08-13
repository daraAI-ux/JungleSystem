import React from 'react';
import {SvgXml} from 'react-native-svg';
import {KOLAM_BEL_TOPBAR_ICON_SVG} from '../assets/icons/bel-topbar-icon-svg';

export interface KolamNotificationBellIconProps {
  color?: string;
}

export function KolamNotificationBellIcon({
  color,
}: KolamNotificationBellIconProps) {
  const xml = color
    ? KOLAM_BEL_TOPBAR_ICON_SVG.replace(/#d11131/gi, color)
    : KOLAM_BEL_TOPBAR_ICON_SVG;

  return <SvgXml height={20} width={20} xml={xml} />;
}
