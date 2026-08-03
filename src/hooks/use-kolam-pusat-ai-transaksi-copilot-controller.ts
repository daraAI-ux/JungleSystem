import {useCallback, useEffect, useState} from 'react';
import {getKolamPusatAiHubTab} from '../domain/kolam-pusat-ai';
import {
  buildKolamDeliveryChannelSourcesFromRows,
  mergeKolamDeliveryChannelSources,
  type KolamDeliveryChannelMeta,
  type KolamDeliveryChannelKey,
  type KolamKatakTerbangHealth,
  type KolamShippingDeliveryStats,
  type KolamShippingOpsLog,
  type KolamTransaksiCopilotRange,
} from '../domain/kolam-pusat-ai-transaksi-copilot';
import {getErrorMessage as getApiErrorMessage} from '../lib/api-error';
import {uploadKolamKatakTerbangWorkerPhoto} from '../services/kolam-ai-dara-settings-api';
import {
  fetchKolamKatakTerbangHealth,
  fetchKolamShippingDeliveryStats,
  fetchKolamShippingOpsLog,
} from '../services/kolam-dara-shipping-copilot-api';
import {
  getKolamTeamChatRooms,
  getKolamWebSetting,
  updateKolamWebSetting,
  type KolamTeamChatRoom,
} from '../services/kolam-api';
import {getKolamSources} from '../services/kolam-source-api';
import {pickNativeImageFile} from '../services/native-file-picker';

export type KolamPusatAiTransaksiCopilotDataSource = 'idle' | 'live' | 'error';

export interface KolamPusatAiTransaksiCopilotController {
  botNameDraft: string;
  botPhotoUrl: string;
  channelSources: Record<KolamDeliveryChannelKey, KolamDeliveryChannelMeta>;
  dataSource: KolamPusatAiTransaksiCopilotDataSource;
  error: string | null;
  health: KolamKatakTerbangHealth | null;
  healthLoading: boolean;
  loading: boolean;
  notice: string | null;
  notifyEnabled: boolean;
  opsLog: KolamShippingOpsLog | null;
  photoUploading: boolean;
  range: KolamTransaksiCopilotRange;
  roomSaving: boolean;
  rooms: KolamTeamChatRoom[];
  selectedRoomId: string;
  stats: KolamShippingDeliveryStats | null;
  onPickBotPhoto: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onRefreshHealth: () => Promise<void>;
  onSaveBotName: () => Promise<void>;
  onSetBotNameDraft: (value: string) => void;
  onSetNotifyEnabled: (enabled: boolean) => Promise<void>;
  onSetNotifyRoom: (roomId: string) => Promise<void>;
  onSetRange: (range: KolamTransaksiCopilotRange) => void;
}

export function useKolamPusatAiTransaksiCopilotController(
  route: string,
): KolamPusatAiTransaksiCopilotController {
  const enabled = getKolamPusatAiHubTab(route) === 'transaksi-copilot';
  const [range, setRange] = useState<KolamTransaksiCopilotRange>('month');
  const [stats, setStats] = useState<KolamShippingDeliveryStats | null>(null);
  const [opsLog, setOpsLog] = useState<KolamShippingOpsLog | null>(null);
  const [channelSources, setChannelSources] = useState(
    () =>
      mergeKolamDeliveryChannelSources(null, null) as Record<
        KolamDeliveryChannelKey,
        KolamDeliveryChannelMeta
      >,
  );
  const [health, setHealth] = useState<KolamKatakTerbangHealth | null>(null);
  const [rooms, setRooms] = useState<KolamTeamChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);
  const [roomSaving, setRoomSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamPusatAiTransaksiCopilotDataSource>('idle');
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [botNameDraft, setBotNameDraft] = useState('');
  const [botPhotoUrl, setBotPhotoUrl] = useState('');
  const [savedBotName, setSavedBotName] = useState('');

  const loadHealth = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setHealthLoading(true);
    try {
      setHealth(await fetchKolamKatakTerbangHealth());
    } catch (err) {
      setNotice(getApiErrorMessage(err, 'Gagal cek kesehatan bot'));
    } finally {
      setHealthLoading(false);
    }
  }, [enabled]);

  const loadWebSetting = useCallback(async () => {
    const ws = await getKolamWebSetting();
    const record = ws as Record<string, unknown>;
    const name =
      typeof record.katakTerbangWorkerName === 'string'
        ? record.katakTerbangWorkerName
        : '';
    const photo =
      typeof record.katakTerbangWorkerPhotoUrl === 'string'
        ? record.katakTerbangWorkerPhotoUrl
        : '';
    setNotifyEnabled(record.transaksiCopilotChatNotifyEnabled !== false);
    setSelectedRoomId(
      typeof record.transaksiCopilotTeamRoomId === 'string'
        ? String(record.transaksiCopilotTeamRoomId)
        : '',
    );
    setSavedBotName(name);
    setBotNameDraft(name);
    setBotPhotoUrl(photo);
    return {name, photo};
  }, []);

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [statsRes, logRes, sourcesRes, wsProfile] = await Promise.all([
        fetchKolamShippingDeliveryStats(range),
        fetchKolamShippingOpsLog(72, 80),
        getKolamSources({page: 1, limit: 50, isActive: true}),
        loadWebSetting(),
      ]);
      const dbChannels = buildKolamDeliveryChannelSourcesFromRows(
        sourcesRes.items.map(item => ({
          id: item.id,
          name: item.name,
          logo: item.logo,
          type: item.type,
          isMarketplace: item.isMarketplace,
        })),
      );
      setStats(statsRes);
      setOpsLog(logRes);
      setChannelSources(
        mergeKolamDeliveryChannelSources(statsRes.channelSources, dbChannels),
      );
      const profileName = statsRes.katakTerbangProfile.name || wsProfile.name;
      const profilePhoto =
        statsRes.katakTerbangProfile.photoUrl || wsProfile.photo;
      setSavedBotName(profileName);
      setBotNameDraft(profileName);
      setBotPhotoUrl(profilePhoto);
      setDataSource('live');
    } catch (err) {
      setStats(null);
      setOpsLog(null);
      setDataSource('error');
      setError(getApiErrorMessage(err, 'Gagal memuat Transaksi Copilot'));
    } finally {
      setLoading(false);
    }
  }, [enabled, loadWebSetting, range]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void onRefresh();
  }, [enabled, onRefresh]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void loadHealth();
    void getKolamTeamChatRooms()
      .then(setRooms)
      .catch(() => {
        setNotice('Gagal memuat daftar room Team Chat');
      });
  }, [enabled, loadHealth]);

  const onSetNotifyEnabled = useCallback(async (enabledValue: boolean) => {
    setRoomSaving(true);
    setNotice(null);
    try {
      await updateKolamWebSetting({
        transaksiCopilotChatNotifyEnabled: enabledValue,
      });
      setNotifyEnabled(enabledValue);
      setNotice(
        enabledValue ? 'Notifikasi chat aktif' : 'Notifikasi chat dimatikan',
      );
      await loadWebSetting();
    } catch {
      setNotice('Gagal menyimpan pengaturan notifikasi');
    } finally {
      setRoomSaving(false);
    }
  }, [loadWebSetting]);

  const onSetNotifyRoom = useCallback(
    async (roomId: string) => {
      setRoomSaving(true);
      setNotice(null);
      try {
        await updateKolamWebSetting({
          transaksiCopilotTeamRoomId: roomId,
        });
        setSelectedRoomId(roomId);
        setNotice('Room log transaksi disimpan');
        await loadWebSetting();
        void loadHealth();
      } catch {
        setNotice('Gagal menyimpan room');
      } finally {
        setRoomSaving(false);
      }
    },
    [loadHealth, loadWebSetting],
  );

  const onSaveBotName = useCallback(async () => {
    const trimmed = botNameDraft.trim();
    if (trimmed === savedBotName.trim()) {
      return;
    }
    setNotice(null);
    try {
      await updateKolamWebSetting({katakTerbangWorkerName: trimmed});
      setSavedBotName(trimmed);
      setNotice('Nama bot disimpan');
      await onRefresh();
    } catch {
      setBotNameDraft(savedBotName);
      setNotice('Gagal menyimpan nama');
    }
  }, [botNameDraft, onRefresh, savedBotName]);

  const onPickBotPhoto = useCallback(async () => {
    setPhotoUploading(true);
    setNotice(null);
    try {
      const picked = await pickNativeImageFile();
      if (picked.cancelled) {
        return;
      }
      const localUri = picked.uri || picked.path || '';
      if (!localUri) {
        return;
      }
      const response = await uploadKolamKatakTerbangWorkerPhoto(localUri);
      if (response.katakTerbangWorkerPhotoUrl) {
        setBotPhotoUrl(response.katakTerbangWorkerPhotoUrl);
      }
      setNotice('Foto bot diperbarui');
      await onRefresh();
    } catch (err) {
      setNotice(getApiErrorMessage(err, 'Gagal mengunggah foto bot'));
    } finally {
      setPhotoUploading(false);
    }
  }, [onRefresh]);

  return {
    botNameDraft,
    botPhotoUrl,
    channelSources,
    dataSource,
    error,
    health,
    healthLoading,
    loading,
    notice,
    notifyEnabled,
    opsLog,
    photoUploading,
    range,
    roomSaving,
    rooms,
    selectedRoomId,
    stats,
    onPickBotPhoto,
    onRefresh,
    onRefreshHealth: loadHealth,
    onSaveBotName,
    onSetBotNameDraft: setBotNameDraft,
    onSetNotifyEnabled,
    onSetNotifyRoom,
    onSetRange: setRange,
  };
}
