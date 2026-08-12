import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {KOLAM_TASK_TOPBAR_ICON_SVG} from '../assets/icons/task-topbar-icon-svg';

const TASK_ICON_PATHS = getSvgPathData(KOLAM_TASK_TOPBAR_ICON_SVG);

export function KolamTopNavigationTaskIcon({
  color = '#1a1a1a',
}: {
  color?: string;
}) {
  return (
    <Svg height={20} viewBox="0 0 810 809.999993" width={20}>
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
