import React from 'react';
import {KolamContentFrame} from './kolam-content-frame';
import {KolamEmptyState} from './kolam-empty-state';

export function KolamCommandPaletteEmptyState() {
  return (
    <KolamContentFrame variant="commandPaletteEmpty">
      <KolamEmptyState
        title="Command tidak ditemukan"
        message="Coba nama module, route navigasi, action runtime, route plugin, atau source repo."
        compact
      />
    </KolamContentFrame>
  );
}