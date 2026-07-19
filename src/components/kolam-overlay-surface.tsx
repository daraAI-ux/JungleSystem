import React from 'react';
import {
  KolamAttentionSurface,
  KolamCommandPaletteSurface,
  KolamUserMenuSurface,
  type KolamAttentionPanelProps,
  type KolamCommandPaletteOverlayProps,
  type KolamUserMenuPanelProps,
} from './kolam-overlay-panel-surfaces';

export interface KolamOverlaySurfaceProps {
  attention: KolamAttentionPanelProps;
  commandPalette: KolamCommandPaletteOverlayProps;
  isAttentionOpen: boolean;
  isCommandPaletteOpen: boolean;
  isUserMenuOpen: boolean;
  userMenu: KolamUserMenuPanelProps;
}

export function KolamOverlaySurface({
  attention,
  commandPalette,
  isAttentionOpen,
  isCommandPaletteOpen,
  isUserMenuOpen,
  userMenu,
}: KolamOverlaySurfaceProps) {
  return (
    <>
      <KolamUserMenuSurface open={isUserMenuOpen} userMenu={userMenu} />
      <KolamAttentionSurface open={isAttentionOpen} attention={attention} />
      <KolamCommandPaletteSurface
        open={isCommandPaletteOpen}
        commandPalette={commandPalette}
      />
    </>
  );
}
