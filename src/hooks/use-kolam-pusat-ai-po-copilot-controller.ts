import {useCallback, useEffect, useState} from 'react';
import {getKolamPusatAiHubTab} from '../domain/kolam-pusat-ai';
import {
  type KolamPoCopilotRange,
  type KolamPoCopilotStats,
  type KolamPoOpsLog,
  type KolamRajaAnemonHealth,
} from '../domain/kolam-pusat-ai-po-copilot';
import {getErrorMessage as getApiErrorMessage} from '../lib/api-error';
import {uploadKolamRajaAnemonWorkerPhoto} from '../services/kolam-ai-dara-settings-api';
import {
  fetchKolamPoCopilotStats,
  fetchKolamPoOpsLog,
  fetchKolamRajaAnemonHealth,
} from '../services/kolam-dara-po-copilot-api';
import {
  getKolamTeamChatRooms,
  getKolamWebSetting,
  updateKolamWebSetting,
  type KolamTeamChatRoom,
} from '../services/kolam-api';
import {pickNativeImageFile} from '../services/native-file-picker';

export type KolamPusatAiPoCopilotDataSource = 'idle' | 'live' | 'error';

export interface KolamPusatAiPoCopilotController {
  botNameDraft: string;
  botPhotoUrl: string;
  dataSource: KolamPusatAiPoCopilotDataSource;
  error: string | null;
  health: KolamRajaAnemonHealth | null;
  healthLoading: boolean;
  loading: boolean;
  notice: string | null;
  notifyEnabled: boolean;
  opsLog: KolamPoOpsLog | null;
  photoUploading: boolean;
  range: KolamPoCopilotRange;
  roomSaving: boolean;
  rooms: KolamTeamChatRoom[];
  selectedRoomId: string;
  stats: KolamPoCopilotStats | null;
  onPickBotPhoto: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onRefreshHealth: () => Promise<void>;
  onSaveBotName: () => Promise<void>;
  onSetBotNameDraft: (value: string) => void;
  onSetNotifyEnabled: (enabled: boolean) => Promise<void>;
  onSetNotifyRoom: (roomId: string) => Promise<void>;
  onSetRange: (range: KolamPoCopilotRange) => void;
}

export function useKolamPusatAiPoCopilotController(
  route: string,
): KolamPusatAiPoCopilotController {
  const enabled = getKolamPusatAiHubTab(route) === 'po-copilot';
  const [range, setRange] = useState<KolamPoCopilotRange>('month');
  const [stats, setStats] = useState<KolamPoCopilotStats | null>(null);
  const [opsLog, setOpsLog] = useState<KolamPoOpsLog | null>(null);
  const [health, setHealth] = useState<KolamRajaAnemonHealth | null>(null);
  const [rooms, setRooms] = useState<KolamTeamChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);
  const [roomSaving, setRoomSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamPusatAiPoCopilotDataSource>('idle');
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
      setHealth(await fetchKolamRajaAnemonHealth());
    } catch (err) {
      setNotice(getApiErrorMessage(err, 'Gagal cek health Raja Anemon'));
    } finally {
      setHealthLoading(false);
    }
  }, [enabled]);

  const loadWebSetting = useCallback(async () => {
    const ws = await getKolamWebSetting();
    const record = ws as Record<string, unknown>;
    const name =
      typeof record.rajaAnemonWorkerName === 'string'
        ? record.rajaAnemonWorkerName
        : '';
    const photo =
      typeof record.rajaAnemonWorkerPhotoUrl === 'string'
        ? record.rajaAnemonWorkerPhotoUrl
        : '';
    setNotifyEnabled(record.poCopilotChatNotifyEnabled !== false);
    setSelectedRoomId(
      typeof record.poCopilotTeamRoomId === 'string'
        ? String(record.poCopilotTeamRoomId)
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
      const [statsRes, logRes, wsProfile] = await Promise.all([
        fetchKolamPoCopilotStats(range),
        fetchKolamPoOpsLog(),
        loadWebSetting(),
      ]);
      setStats(statsRes);
      setOpsLog(logRes);
      const profileName = statsRes.rajaAnemonProfile.name || wsProfile.name;
      const profilePhoto =
        statsRes.rajaAnemonProfile.photoUrl || wsProfile.photo;
      setSavedBotName(profileName);
      setBotNameDraft(profileName);
      setBotPhotoUrl(profilePhoto);
      setDataSource('live');
    } catch (err) {
      setStats(null);
      setOpsLog(null);
      setDataSource('error');
      setError(getApiErrorMessage(err, 'Gagal memuat PO Copilot'));
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

  const onSetNotifyEnabled = useCallback(
    async (enabledValue: boolean) => {
      setRoomSaving(true);
      setNotice(null);
      try {
        await updateKolamWebSetting({
          poCopilotChatNotifyEnabled: enabledValue,
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
    },
    [loadWebSetting],
  );

  const onSetNotifyRoom = useCallback(
    async (roomId: string) => {
      setRoomSaving(true);
      setNotice(null);
      try {
        await updateKolamWebSetting({
          poCopilotTeamRoomId: roomId,
        });
        setSelectedRoomId(roomId);
        setNotice('Room log PO disimpan');
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
      await updateKolamWebSetting({rajaAnemonWorkerName: trimmed});
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
      const response = await uploadKolamRajaAnemonWorkerPhoto(localUri);
      if (response.rajaAnemonWorkerPhotoUrl) {
        setBotPhotoUrl(response.rajaAnemonWorkerPhotoUrl);
      }
      setNotice('Foto Raja Anemon diperbarui');
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
