import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {KOLAM_MEDIA_CAMERA_TOPBAR_ICON_SVG} from '../assets/icons/media-camera-topbar-icon-svg';

const MEDIA_CAMERA_ICON_PATHS = getSvgPathData(KOLAM_MEDIA_CAMERA_TOPBAR_ICON_SVG);

export function KolamTopNavigationMediaIcon({
  color = '#1a1a1a',
}: {
  color?: string;
}) {
  return (
    <Svg height={22} viewBox="0 0 810 809.999993" width={22}>
      {MEDIA_CAMERA_ICON_PATHS.map(path => (
        <Path key={path} d={path} fill={color} fillRule="nonzero" />
      ))}
    </Svg>
  );
}

function getSvgPathData(svg: string) {
  const paths: string[] = [];
  const drawableSvg = svg.replace(/<defs[\s\S]*?<\/defs>/g, '');
  const pattern = /\sd="([^"]+)"/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(drawableSvg)) !== null) {
    if (match[1]) {
      paths.push(match[1]);
    }
  }

  return paths;
}
