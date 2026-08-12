import React from 'react';
import {SvgXml} from 'react-native-svg';
import {KOLAM_CHAT_KE_KUSTOMER_ICON_SVG} from '../assets/icons/chat-ke-kustomer-icon-svg';

export function KolamChatKeKustomerIcon({
  color = '#000000',
  size = 16,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <SvgXml
      height={size}
      width={size}
      xml={KOLAM_CHAT_KE_KUSTOMER_ICON_SVG.replace(/#000000/g, color)}
    />
  );
}
