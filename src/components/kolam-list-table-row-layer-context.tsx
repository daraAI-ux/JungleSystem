import React from 'react';

export type KolamListTableRowLayerContextValue = {
  setMenuOpen: (open: boolean) => void;
};

export const KolamListTableRowLayerContext =
  React.createContext<KolamListTableRowLayerContextValue | null>(null);

export function useKolamListTableRowLayer() {
  return React.useContext(KolamListTableRowLayerContext);
}
