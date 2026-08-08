import React from 'react';
import {SvgXml} from 'react-native-svg';
import {KOLAM_TASK_TOPBAR_ICON_SVG} from '../assets/icons/task-topbar-icon-svg';

export function KolamTopNavigationTaskIcon(_props: {color?: string}) {
  return (
    <SvgXml
      height={20}
      width={20}
      xml={KOLAM_TASK_TOPBAR_ICON_SVG}
    />
  );
}
