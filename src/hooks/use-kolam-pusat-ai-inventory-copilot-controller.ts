import {useCallback, useEffect, useState} from 'react';
import {getKolamPusatAiHubTab} from '../domain/kolam-pusat-ai';
import {
  KOLAM_INVENTORY_COPILOT_DEFAULT_BOT_NAME,
  type KolamInventoryCopilotDashboard,
  type KolamInventoryOpsLog,
  type KolamPangeranIsopodHealth,
} from '../domain/kolam-pusat-ai-inventory-copilot';
import {getErrorMessage as getApiErrorMessage} from '../lib/api-error';
import {uploadKolamPangeranIsopodWorkerPhoto} from '../services/kolam-ai-dara-settings-api';
import {
  fetchKolamInventoryCopilotDashboard,
  fetchKolamInventoryOpsLog,
  fetchKolamPangeranIsopodHealth,
} from '../services/kolam-dara-inventory-copilot-api';
import {
  getKolamTeamChatRooms,
  getKolamWebSetting,
  updateKolamWebSetting,
  type KolamTeamChatRoom,
} from '../services/kolam-api';
import {pickNativeImageFile} from '../services/native-file-picker';

export type KolamPusatAiInventoryCopilotDataSource = 'idle' | 'live' | 'error';

export interface KolamPusatAiInventoryCopilotController {
  botNameDraft: string;
  botPhotoUrl: string;
  dashboard: KolamInventoryCopilotDashboard | null;
  dataSource: KolamPusatAiInventoryCopilotDataSource;
  error: string | null;
  health: KolamPangeranIsopodHealth | null;
  healthLoading: boolean;
  loading: boolean;
  notice: string | null;
  notifyEnabled: boolean;
  opsLog: KolamInventoryOpsLog | null;
  photoUploading: boolean;
  roomSaving: boolean;
  rooms: KolamTeamChatRoom[];
  selectedRoomId: string;
  onPickBotPhoto: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onRefreshHealth: () => Promise<void>;
  onSaveBotName: () => Promise<void>;
  onSetBotNameDraft: (value: string) => void;
  onSetNotifyEnabled: (enabled: boolean) => Promise<void>;
  onSetNotifyRoom: (roomId: string) => Promise<void>;
}

export function useKolamPusatAiInventoryCopilotController(
  route: string,
): KolamPusatAiInventoryCopilotController {
  const enabled = getKolamPusatAiHubTab(route) === 'inventory-copilot';
  const [dashboard, setDashboard] =
    useState<KolamInventoryCopilotDashboard | null>(null);
  const [opsLog, setOpsLog] = useState<KolamInventoryOpsLog | null>(null);
  const [health, setHealth] = useState<KolamPangeranIsopodHealth | null>(null);
  const [rooms, setRooms] = useState<KolamTeamChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);
  const [roomSaving, setRoomSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamPusatAiInventoryCopilotDataSource>('idle');
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [botNameDraft, setBotNameDraft] = useState(
    KOLAM_INVENTORY_COPILOT_DEFAULT_BOT_NAME,
  );
  const [botPhotoUrl, setBotPhotoUrl] = useState('');
  const [savedBotName, setSavedBotName] = useState(
    KOLAM_INVENTORY_COPILOT_DEFAULT_BOT_NAME,
  );

  const loadHealth = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setHealthLoading(true);
    try {
      setHealth(await fetchKolamPangeranIsopodHealth());
    } catch (err) {
      setNotice(
        getApiErrorMessage(err, 'Gagal cek kesehatan Pangeran Isopod'),
      );
    } finally {
      setHealthLoading(false);
    }
  }, [enabled]);

  const loadWebSetting = useCallback(async () => {
    const ws = await getKolamWebSetting();
    const record = ws as Record<string, unknown>;
    const name =
      typeof record.pangeranIsopodWorkerName === 'string' &&
      record.pangeranIsopodWorkerName.trim()
        ? record.pangeranIsopodWorkerName.trim()
        : KOLAM_INVENTORY_COPILOT_DEFAULT_BOT_NAME;
    const photo =
      typeof record.pangeranIsopodWorkerPhotoUrl === 'string'
        ? record.pangeranIsopodWorkerPhotoUrl
        : '';
    setNotifyEnabled(record.inventoryCopilotChatNotifyEnabled !== false);
    setSelectedRoomId(
      typeof record.inventoryCopilotTeamRoomId === 'string'
        ? String(record.inventoryCopilotTeamRoomId)
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
      const [dashRes, logRes, wsProfile] = await Promise.all([
        fetchKolamInventoryCopilotDashboard(24, 12),
        fetchKolamInventoryOpsLog(),
        loadWebSetting(),
      ]);
      setDashboard(dashRes);
      setOpsLog(logRes);
      const profileName =
        dashRes.pangeranIsopodProfile.name || wsProfile.name;
      const profilePhoto =
        dashRes.pangeranIsopodProfile.photoUrl || wsProfile.photo;
      setSavedBotName(profileName || KOLAM_INVENTORY_COPILOT_DEFAULT_BOT_NAME);
      setBotNameDraft(profileName || KOLAM_INVENTORY_COPILOT_DEFAULT_BOT_NAME);
      setBotPhotoUrl(profilePhoto);
      if (dashRes.teamChat.aiRoomId) {
        setSelectedRoomId(prev => prev || dashRes.teamChat.aiRoomId);
      }
      setDataSource('live');
    } catch (err) {
      setDashboard(null);
      setOpsLog(null);
      setDataSource('error');
      setError(getApiErrorMessage(err, 'Gagal memuat Inventory Copilot'));
    } finally {
      setLoading(false);
    }
  }, [enabled, loadWebSetting]);

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
          inventoryCopilotChatNotifyEnabled: enabledValue,
        });
        setNotifyEnabled(enabledValue);
        setNotice(
          enabledValue ? 'Notifikasi chat aktif' : 'Notifikasi chat dimatikan',
        );
        await loadWebSetting();
      } catch {
        setNotice('Gagal menyimpan notifikasi');
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
          inventoryCopilotTeamRoomId: roomId,
        });
        setSelectedRoomId(roomId);
        setNotice('Room Inventory Copilot disimpan');
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
      await updateKolamWebSetting({pangeranIsopodWorkerName: trimmed});
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
      const response = await uploadKolamPangeranIsopodWorkerPhoto(localUri);
      if (response.pangeranIsopodWorkerPhotoUrl) {
        setBotPhotoUrl(response.pangeranIsopodWorkerPhotoUrl);
      }
      setNotice('Foto Pangeran Isopod diperbarui');
      await onRefresh();
      void loadHealth();
    } catch (err) {
      setNotice(getApiErrorMessage(err, 'Gagal mengunggah foto bot'));
    } finally {
      setPhotoUploading(false);
    }
  }, [loadHealth, onRefresh]);

  return {
    botNameDraft,
    botPhotoUrl,
    dashboard,
    dataSource,
    error,
    health,
    healthLoading,
    loading,
    notice,
    notifyEnabled,
    opsLog,
    photoUploading,
    roomSaving,
    rooms,
    selectedRoomId,
    onPickBotPhoto,
    onRefresh,
    onRefreshHealth: loadHealth,
    onSaveBotName,
    onSetBotNameDraft: setBotNameDraft,
    onSetNotifyEnabled,
    onSetNotifyRoom,
  };
}
