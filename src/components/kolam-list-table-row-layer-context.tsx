import React from 'react';

export type KolamListTableFloatingMenuAnchor = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export type KolamListTableFloatingMenuRequest = {
  anchor: KolamListTableFloatingMenuAnchor;
  content: React.ReactNode;
  estimatedHeight: number;
  id: string;
  placement: 'bottom' | 'top';
  width: number;
};

export type KolamListTableRowLayerContextValue = {
  closeFloatingMenu?: (id?: string) => void;
  openFloatingMenu?: (menu: KolamListTableFloatingMenuRequest) => void;
  setMenuOpen: (open: boolean) => void;
};

export const KolamListTableRowLayerContext =
  React.createContext<KolamListTableRowLayerContextValue | null>(null);

export function useKolamListTableRowLayer() {
  return React.useContext(KolamListTableRowLayerContext);
}
