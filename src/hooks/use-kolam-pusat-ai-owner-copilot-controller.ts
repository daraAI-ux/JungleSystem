import {useCallback, useEffect, useState} from 'react';
import {getKolamPusatAiHubTab} from '../domain/kolam-pusat-ai';
import type {KolamOwnerCopilotDashboard} from '../domain/kolam-pusat-ai-owner-copilot';
import {getErrorMessage as getApiErrorMessage} from '../lib/api-error';
import {getKolamWebSetting, uploadKolamDaraAvatar} from '../services/kolam-api';
import {fetchKolamOwnerCopilotDashboard} from '../services/kolam-dara-owner-copilot-api';
import {pickNativeImageFile} from '../services/native-file-picker';

export type KolamPusatAiOwnerCopilotDataSource = 'idle' | 'live' | 'error';

export interface KolamPusatAiOwnerCopilotController {
  avatarUploading: boolean;
  dash: KolamOwnerCopilotDashboard | null;
  dataSource: KolamPusatAiOwnerCopilotDataSource;
  daraAvatarUrl: string;
  error: string | null;
  loading: boolean;
  notice: string | null;
  onPickDaraAvatar: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function useKolamPusatAiOwnerCopilotController(
  route: string,
): KolamPusatAiOwnerCopilotController {
  const enabled = getKolamPusatAiHubTab(route) === 'owner-copilot';
  const [dash, setDash] = useState<KolamOwnerCopilotDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [daraAvatarUrl, setDaraAvatarUrl] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamPusatAiOwnerCopilotDataSource>('idle');

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [nextDash, webSetting] = await Promise.all([
        fetchKolamOwnerCopilotDashboard(24),
        getKolamWebSetting().catch(() => null),
      ]);
      setDash(nextDash);
      if (webSetting) {
        setDaraAvatarUrl(
          typeof webSetting.daraAvatarUrl === 'string'
            ? webSetting.daraAvatarUrl
            : '',
        );
      }
      setDataSource('live');
    } catch (err) {
      setDash(null);
      setDataSource('error');
      setError(getApiErrorMessage(err, 'Gagal memuat Owner Copilot'));
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const onPickDaraAvatar = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setAvatarUploading(true);
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
      const response = await uploadKolamDaraAvatar(localUri);
      if (response.daraAvatarUrl) {
        setDaraAvatarUrl(response.daraAvatarUrl);
      }
      setNotice('Avatar DARA diperbarui');
    } catch (err) {
      setNotice(getApiErrorMessage(err, 'Gagal mengunggah avatar DARA'));
    } finally {
      setAvatarUploading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void onRefresh();
  }, [enabled, onRefresh]);

  return {
    avatarUploading,
    dash,
    dataSource,
    daraAvatarUrl,
    error,
    loading,
    notice,
    onPickDaraAvatar,
    onRefresh,
  };
}
