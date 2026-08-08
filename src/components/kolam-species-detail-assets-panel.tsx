import React from 'react';
import { Linking } from 'react-native';
import { appConfig } from '../config/app';
import type { KolamSpecies } from '../domain/kolam-species';
import { deleteKolamSpeciesAsset, uploadKolamSpeciesAsset } from '../services/kolam-species-api';
import {
  KolamEntityDetailAssetsPanel,
  type KolamEntityDetailAsset,
} from './kolam-entity-detail-assets-panel';

export function KolamSpeciesDetailAssetsPanel({
  onSpeciesChange,
  species,
}: {
  onSpeciesChange?: (species: KolamSpecies) => void;
  species: KolamSpecies;
}) {
  const handleUpload = React.useCallback(async (title: string, localUri: string) => {
    const updated = await uploadKolamSpeciesAsset(species.id, title, localUri);
    onSpeciesChange?.(updated);
    return updated.assets;
  }, [onSpeciesChange, species.id]);

  const handleDelete = React.useCallback(async (assetId: string) => {
    const updated = await deleteKolamSpeciesAsset(species.id, assetId);
    onSpeciesChange?.(updated);
    return updated.assets;
  }, [onSpeciesChange, species.id]);

  const handleDownload = React.useCallback((asset: KolamEntityDetailAsset) => {
    const base = appConfig.kolamApiBaseUrl.replace(/\/$/, '');
    void Linking.openURL(`${base}/species/${encodeURIComponent(species.id)}/assets/${encodeURIComponent(asset.id)}/download`);
  }, [species.id]);

  return (
    <KolamEntityDetailAssetsPanel
      assets={species.assets}
      deleteAsset={handleDelete}
      downloadAsset={handleDownload}
      inlineTitleUploadActions
      uploadAsset={handleUpload}
    />
  );
}
