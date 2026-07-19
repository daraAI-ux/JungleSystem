import React from 'react';
import {
  KolamAttentionPanel,
  KolamCommandPaletteOverlay,
  KolamUserMenuPanel,
} from './kolam-status-runtime-widgets';

export type KolamAttentionPanelProps = React.ComponentProps<
  typeof KolamAttentionPanel
>;
export type KolamCommandPaletteOverlayProps = React.ComponentProps<
  typeof KolamCommandPaletteOverlay
>;
export type KolamUserMenuPanelProps = React.ComponentProps<
  typeof KolamUserMenuPanel
>;

export function KolamUserMenuSurface({
  open,
  userMenu,
}: {
  open: boolean;
  userMenu: KolamUserMenuPanelProps;
}) {
  return open ? <KolamUserMenuPanel {...userMenu} /> : null;
}

export function KolamAttentionSurface({
  attention,
  open,
}: {
  attention: KolamAttentionPanelProps;
  open: boolean;
}) {
  return open ? <KolamAttentionPanel {...attention} /> : null;
}

export function KolamCommandPaletteSurface({
  commandPalette,
  open,
}: {
  commandPalette: KolamCommandPaletteOverlayProps;
  open: boolean;
}) {
  return open ? <KolamCommandPaletteOverlay {...commandPalette} /> : null;
}
