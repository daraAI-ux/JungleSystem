import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {KOLAM_DOWNLOAD_TOPBAR_ICON_SVG} from '../assets/icons/download-topbar-icon-svg';

const DOWNLOAD_ICON_PATHS = getSvgPathData(KOLAM_DOWNLOAD_TOPBAR_ICON_SVG);

export function KolamTopNavigationDownloadIcon({
  color = '#1a1a1a',
}: {
  color?: string;
}) {
  return (
    <Svg height={20} viewBox="0 0 810 809.999993" width={20}>
      {DOWNLOAD_ICON_PATHS.map(path => (
        <Path key={path} d={path} fill={color} fillRule="nonzero" />
      ))}
    </Svg>
  );
}

function getSvgPathData(svg: string) {
  const paths: string[] = [];
  const pattern = /\sd="([^"]+)"/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(svg)) !== null) {
    if (match[1]) {
      paths.push(match[1]);
    }
  }

  return paths;
}
