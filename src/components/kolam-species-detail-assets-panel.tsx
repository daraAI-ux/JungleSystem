import React from 'react';
import {Linking, StyleSheet, Text, View} from 'react-native';
import {appConfig} from '../config/app';
import type {KolamSpecies} from '../domain/kolam-species';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {pickNativeAssetFile, type NativeImagePickerResult} from '../services/native-file-picker';
import {deleteKolamSpeciesAsset, uploadKolamSpeciesAsset} from '../services/kolam-species-api';
import {KolamButton} from './kolam-button';
import {KolamContentFrame} from './kolam-content-frame';
import {KolamDeleteConfirmDialog} from './kolam-delete-confirm-dialog';
import {KolamTextField} from './kolam-text-field';

export function KolamSpeciesDetailAssetsPanel({
  onSpeciesChange,
  species,
}: {
  onSpeciesChange?: (species: KolamSpecies) => void;
  species: KolamSpecies;
}) {
  const [assets, setAssets] = React.useState(species.assets ?? []);
  const [assetTitle, setAssetTitle] = React.useState('');
  const [assetFile, setAssetFile] = React.useState<NativeImagePickerResult | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<KolamSpecies['assets'][number] | null>(null);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setAssets(Array.isArray(species.assets) ? species.assets : []);
  }, [species.id, species.assets]);

  const chooseFile = React.useCallback(async () => {
    setError('');
    setMessage('');
    try {
      const result = await pickNativeAssetFile();
      if (!result.cancelled) {
        setAssetFile(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuka pemilih file aset.');
    }
  }, []);

  const uploadAsset = React.useCallback(async () => {
    const title = assetTitle.trim();
    const localUri = assetFile?.uri ?? assetFile?.path ?? '';
    if (!title) {
      setError('Judul aset wajib diisi.');
      return;
    }
    if (!localUri) {
      setError('Pilih file aset terlebih dahulu.');
      return;
    }

    setBusy(true);
    setError('');
    setMessage('');
    try {
      const updated = await uploadKolamSpeciesAsset(species.id, title, localUri);
      setAssets(Array.isArray(updated.assets) ? updated.assets : []);
      setAssetTitle('');
      setAssetFile(null);
      setMessage('Aset berhasil diunggah.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah aset.');
    } finally {
      setBusy(false);
    }
  }, [assetFile, assetTitle, onSpeciesChange, species.id]);

  const deleteAsset = React.useCallback(async () => {
    if (!deleteTarget) {
      return;
    }

    setBusy(true);
    setError('');
    setMessage('');
    try {
      const updated = await deleteKolamSpeciesAsset(species.id, deleteTarget.id);
      setAssets(Array.isArray(updated.assets) ? updated.assets : []);
      onSpeciesChange?.(updated);
      setDeleteTarget(null);
      setMessage('Aset berhasil dihapus.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus aset.');
    } finally {
      setBusy(false);
    }
  }, [deleteTarget, onSpeciesChange, species.id]);

  return (
    <KolamContentFrame style={styles.sectionCardFull} variant="settingsWebConfig">
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>Aset</Text>
          <Text style={styles.sectionDescription}>Dokumen internal (PDF, Word, Excel, gambar). Tidak ditampilkan di webstore.</Text>
        </View>
      </View>

      <View style={styles.assetUploadCard}>
        <View style={styles.assetTitleInputWrap}>
          <Text style={styles.assetLabel}>Judul</Text>
          <KolamTextField
            editable={!busy}
            onChangeText={setAssetTitle}
            placeholder="Judul aset"
            style={styles.assetInput}
            value={assetTitle}
          />
          <Text style={styles.assetHelp}>Tipe file: PDF, Word, Excel, PNG, JPG.</Text>
        </View>
        <View style={styles.assetUploadActions}>
          <KolamButton disabled={busy} label="Pilih file" onPress={chooseFile} />
          <KolamButton disabled={busy || !assetTitle.trim() || !assetFile} label={busy ? 'Mengunggah...' : 'Unggah file'} onPress={uploadAsset} />
        </View>
        {assetFile ? <Text style={styles.assetSelectedFile}>File dipilih: {assetFile.name ?? assetFile.path ?? assetFile.uri}</Text> : null}
        {error ? <Text style={styles.assetError}>{error}</Text> : null}
        {message ? <Text style={styles.assetSuccess}>{message}</Text> : null}
      </View>

      {assets.length ? (
        <View style={styles.materialTable}>
          <View style={[styles.materialTableRow, styles.materialTableHeader]}>
            <Text style={[styles.materialTableHeadText, styles.materialNameCell]}>Judul</Text>
            <Text style={[styles.materialTableHeadText, styles.materialSmallCell]}>Ukuran file</Text>
            <Text style={[styles.materialTableHeadText, styles.materialSmallCell]}>Tipe file</Text>
            <Text style={[styles.materialTableHeadText, styles.materialSmallCell]}>Unduh</Text>
            <Text style={[styles.materialTableHeadText, styles.materialSmallCell]}>Aksi</Text>
          </View>
          {assets.map(asset => (
            <View key={asset.id} style={styles.materialTableRow}>
              <View style={styles.materialNameCell}>
                <Text style={styles.logisticsMethodTitle}>{asset.title}</Text>
                {asset.originalFilename ? <Text style={styles.logisticsMethodMeta}>{asset.originalFilename}</Text> : null}
              </View>
              <Text style={[styles.materialTableText, styles.materialSmallCell]}>{formatFileSize(asset.fileSize)}</Text>
              <Text style={[styles.materialTableText, styles.materialSmallCell]}>{formatAssetType(asset)}</Text>
              <KolamButton label="Unduh" onPress={() => openAssetDownload(species.id, asset.id)} style={styles.tableActionButton} />
              <KolamButton disabled={busy} intent="danger" label="Hapus" onPress={() => setDeleteTarget(asset)} style={styles.tableActionButton} />
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>Belum ada aset.</Text>
      )}
      <KolamDeleteConfirmDialog
        itemLabel={deleteTarget?.title}
        itemType="aset"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          void deleteAsset();
        }}
        visible={Boolean(deleteTarget)}
      />
    </KolamContentFrame>
  );
}

function formatFileSize(value: number) {
  if (!value || value <= 0) {
    return '-';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = value;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatAssetType(asset: KolamSpecies['assets'][number]) {
  if (asset.mimeType) {
    if (asset.mimeType.includes('pdf')) return 'PDF';
    if (asset.mimeType.includes('word')) return 'Word';
    if (asset.mimeType.includes('excel') || asset.mimeType.includes('spreadsheet')) return 'Excel';
    if (asset.mimeType.startsWith('image/')) return 'Gambar';
    return asset.mimeType;
  }
  const ext = asset.originalFilename.split('.').pop()?.toUpperCase();
  return ext || '-';
}

function openAssetDownload(speciesId: string, assetId: string) {
  const base = appConfig.kolamApiBaseUrl.replace(/\/$/, '');
  void Linking.openURL(`${base}/species/${encodeURIComponent(speciesId)}/assets/${encodeURIComponent(assetId)}/download`);
}

const styles = StyleSheet.create({
  sectionCardFull: {
    gap: 0,
    minWidth: 320,
    overflow: 'hidden',
    padding: 0,
    width: '100%',
  },
  sectionHeader: {
    alignItems: 'flex-start',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sectionTitleWrap: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 21,
  },
  sectionDescription: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  assetUploadCard: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    gap: 10,
    padding: 12,
  },
  assetTitleInputWrap: {
    gap: 6,
  },
  assetLabel: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  assetInput: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.input,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    minHeight: V.control.inputHeight,
    paddingHorizontal: V.control.inputPaddingX,
  },
  assetHelp: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  assetUploadActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  assetSelectedFile: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  assetError: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
  },
  assetSuccess: {
    color: V.colors.primary,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
  },
  emptyText: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    padding: 18,
    textAlign: 'center',
  },
  logisticsMethodTitle: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  logisticsMethodMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  materialTable: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    margin: 12,
    overflow: 'hidden',
  },
  materialTableRow: {
    alignItems: 'center',
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  materialTableHeader: {
    backgroundColor: V.colors.mutedSoft,
    borderTopWidth: 0,
  },
  materialNameCell: {
    flex: 2,
    minWidth: 220,
  },
  materialSmallCell: {
    flex: 1,
    minWidth: 86,
  },
  materialTableHeadText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  materialTableText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  tableActionButton: {
    minHeight: 26,
    paddingHorizontal: 8,
  },
});
