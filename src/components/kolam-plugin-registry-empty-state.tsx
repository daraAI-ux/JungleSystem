import React from 'react';
import {KolamEmptyState} from './kolam-empty-state';

export function KolamPluginRegistryEmptyState() {
  return (
    <KolamEmptyState
      title="Plugin tidak ditemukan"
      message="Coba cari nama plugin, route, package, versi, atau capability lain."
      compact
    />
  );
}
