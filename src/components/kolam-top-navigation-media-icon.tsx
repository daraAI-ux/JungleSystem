import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {KOLAM_MEDIA_CAMERA_TOPBAR_ICON_SVG} from '../assets/icons/media-camera-topbar-icon-svg';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const MEDIA_CAMERA_ICON_PATHS = getSvgPathData(KOLAM_MEDIA_CAMERA_TOPBAR_ICON_SVG);
const ICON_SIZE = 17;

export function KolamTopNavigationMediaIcon({
  color = V.colors.mutedFg,
}: {
  color?: string;
}) {
  return (
    <Svg height={ICON_SIZE} viewBox="0 0 810 809.999993" width={ICON_SIZE}>
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
