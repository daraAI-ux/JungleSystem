import React from 'react';
import {SvgXml} from 'react-native-svg';

export function KolamUploadDeleteIcon({size = 18}: {size?: number}) {
  return <SvgXml height={size} width={size} xml={KOLAM_UPLOAD_DELETE_ICON_SVG} />;
}

const KOLAM_UPLOAD_DELETE_ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
  <path d="M9 3.75h6l.7 1.5H20v2H4v-2h4.3L9 3.75Z" fill="#dc2626"/>
  <path d="M6.25 8.5h11.5l-.72 10.6c-.08 1.2-1.08 2.15-2.29 2.15H9.26c-1.21 0-2.21-.94-2.29-2.15L6.25 8.5Z" fill="#dc2626"/>
  <path d="M10 10.5v7.25M14 10.5v7.25" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/>
</svg>
`;
