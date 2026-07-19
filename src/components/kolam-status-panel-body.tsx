import React from 'react';
import {KolamContentFrame} from './kolam-content-frame';

export function KolamStatusPanelBody({children}: {children: React.ReactNode}) {
  return <KolamContentFrame variant="statusPanelBody">{children}</KolamContentFrame>;
}