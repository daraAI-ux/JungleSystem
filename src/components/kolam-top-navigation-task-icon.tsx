import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {KOLAM_TASK_TOPBAR_ICON_SVG} from '../assets/icons/task-topbar-icon-svg';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const TASK_ICON_PATHS = getSvgPathData(KOLAM_TASK_TOPBAR_ICON_SVG);
const ICON_SIZE = 17;

export function KolamTopNavigationTaskIcon({
  color = V.colors.mutedFg,
}: {
  color?: string;
}) {
  return (
    <Svg height={ICON_SIZE} viewBox="0 0 810 809.999993" width={ICON_SIZE}>
      {TASK_ICON_PATHS.map(path => (
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
