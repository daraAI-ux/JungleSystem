import {useCallback, useEffect, useState} from 'react';
import {
  getKolamDaraSeoTab,
  isKolamDaraSeoRoute,
  type KolamDaraSeoIntegrationReport,
  type KolamDaraSeoIntegrationSettings,
} from '../domain/kolam-dara-seo';
import {sanitizeApiErrorMessage} from '../lib/api-error';
import {
  fetchKolamDaraSeoIntegrationSettings,
  previewKolamDaraSeoIntegrationReport,
  submitKolamDaraSeoGoogleIndexing,
  testKolamDaraSeoIntegration,
  updateKolamDaraSeoIntegrationSettings,
} from '../services/kolam-dara-seo-api';

export type KolamDaraSeoIntegrationProviderId =
  | 'serpApi'
  | 'duckduckgo'
  | 'searxng'
  | 'firecrawl'
  | 'searchConsole'
  | 'indexingApi';

export interface KolamDaraSeoIntegrationsController {
  ddgEnabled: boolean;
  error: string | null;
  firecrawlApiKey: string;
  firecrawlBaseUrl: string;
  firecrawlEnabled: boolean;
  gscClientEmail: string;
  gscEnabled: boolean;
  gscPrivateKey: string;
  gscPropertyUrl: string;
  indexingBusy: boolean;
  indexingClientEmail: string;
  indexingEnabled: boolean;
  indexingPrivateKey: string;
  loading: boolean;
  monitorKeywords: string;
  notice: string | null;
  previewBusy: boolean;
  previewReport: KolamDaraSeoIntegrationReport | null;
  saving: boolean;
  searxBaseUrl: string;
  searxEnabled: boolean;
  serpApiKey: string;
  serpEnabled: boolean;
  settings: KolamDaraSeoIntegrationSettings | null;
  testBusyProviderId: KolamDaraSeoIntegrationProviderId | null;
  testKw: string;
  onRefresh: () => Promise<void>;
  onSave: () => Promise<void>;
  onSetDdgEnabled: (value: boolean) => void;
  onSetFirecrawlApiKey: (value: string) => void;
  onSetFirecrawlBaseUrl: (value: string) => void;
  onSetFirecrawlEnabled: (value: boolean) => void;
  onSetGscClientEmail: (value: string) => void;
  onSetGscEnabled: (value: boolean) => void;
  onSetGscPrivateKey: (value: string) => void;
  onSetGscPropertyUrl: (value: string) => void;
  onSetIndexingClientEmail: (value: string) => void;
  onSetIndexingEnabled: (value: boolean) => void;
  onSetIndexingPrivateKey: (value: string) => void;
  onSetMonitorKeywords: (value: string) => void;
  onSetSearxBaseUrl: (value: string) => void;
  onSetSearxEnabled: (value: boolean) => void;
  onSetSerpApiKey: (value: string) => void;
  onSetSerpEnabled: (value: boolean) => void;
  onSetTestKw: (value: string) => void;
  onSubmitIndexing: () => Promise<void>;
  onTest: (providerId: KolamDaraSeoIntegrationProviderId) => Promise<void>;
  onPreview: () => Promise<void>;
}

export function useKolamDaraSeoIntegrationsController(
  route: string,
): KolamDaraSeoIntegrationsController {
  const enabled =
    isKolamDaraSeoRoute(route) && getKolamDaraSeoTab(route) === 'integrations';
  const [settings, setSettings] =
    useState<KolamDaraSeoIntegrationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [testBusyProviderId, setTestBusyProviderId] =
    useState<KolamDaraSeoIntegrationProviderId | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [previewReport, setPreviewReport] =
    useState<KolamDaraSeoIntegrationReport | null>(null);
  const [indexingBusy, setIndexingBusy] = useState(false);
  const [testKw, setTestKw] = useState('');

  const [monitorKeywords, setMonitorKeywords] = useState('');
  const [serpEnabled, setSerpEnabled] = useState(false);
  const [serpApiKey, setSerpApiKey] = useState('');
  const [ddgEnabled, setDdgEnabled] = useState(false);
  const [searxEnabled, setSearxEnabled] = useState(false);
  const [searxBaseUrl, setSearxBaseUrl] = useState('');
  const [firecrawlEnabled, setFirecrawlEnabled] = useState(false);
  const [firecrawlApiKey, setFirecrawlApiKey] = useState('');
  const [firecrawlBaseUrl, setFirecrawlBaseUrl] = useState('');
  const [gscEnabled, setGscEnabled] = useState(false);
  const [gscPropertyUrl, setGscPropertyUrl] = useState('');
  const [gscClientEmail, setGscClientEmail] = useState('');
  const [gscPrivateKey, setGscPrivateKey] = useState('');
  const [indexingEnabled, setIndexingEnabled] = useState(false);
  const [indexingClientEmail, setIndexingClientEmail] = useState('');
  const [indexingPrivateKey, setIndexingPrivateKey] = useState('');

  const applySettings = (data: KolamDaraSeoIntegrationSettings) => {
    setSettings(data);
    setMonitorKeywords(data.monitorKeywords);
    setSerpEnabled(data.serpApi.enabled);
    setSerpApiKey('');
    setDdgEnabled(data.duckduckgo.enabled);
    setSearxEnabled(data.searxng.enabled);
    setSearxBaseUrl(data.searxng.baseUrl);
    setFirecrawlEnabled(data.firecrawl.enabled);
    setFirecrawlApiKey('');
    setFirecrawlBaseUrl(data.firecrawl.baseUrl);
    setGscEnabled(data.searchConsole.enabled);
    setGscPropertyUrl(data.searchConsole.propertyUrl);
    setGscClientEmail(data.searchConsole.clientEmail);
    setGscPrivateKey('');
    setIndexingEnabled(data.indexingApi.enabled);
    setIndexingClientEmail(data.indexingApi.clientEmail);
    setIndexingPrivateKey('');
  };

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchKolamDaraSeoIntegrationSettings();
      applySettings(data);
    } catch (err) {
      setSettings(null);
      setError(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal memuat integrasi',
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- applySettings closes over setters only.
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void onRefresh();
  }, [enabled, onRefresh]);

  const onSave = useCallback(async () => {
    setSaving(true);
    setNotice(null);
    try {
      const body: Record<string, unknown> = {
        monitorKeywords: monitorKeywords.trim(),
        serpApi: {
          enabled: serpEnabled,
          ...(serpApiKey.trim() ? {apiKey: serpApiKey.trim()} : {}),
        },
        duckduckgo: {enabled: ddgEnabled},
        searxng: {enabled: searxEnabled, baseUrl: searxBaseUrl.trim()},
        firecrawl: {
          enabled: firecrawlEnabled,
          baseUrl: firecrawlBaseUrl.trim(),
          ...(firecrawlApiKey.trim() ? {apiKey: firecrawlApiKey.trim()} : {}),
        },
        searchConsole: {
          enabled: gscEnabled,
          propertyUrl: gscPropertyUrl.trim(),
          clientEmail: gscClientEmail.trim(),
          ...(gscPrivateKey.trim() ? {privateKey: gscPrivateKey.trim()} : {}),
        },
        indexingApi: {
          enabled: indexingEnabled,
          clientEmail: indexingClientEmail.trim(),
          ...(indexingPrivateKey.trim()
            ? {privateKey: indexingPrivateKey.trim()}
            : {}),
        },
      };
      const next = await updateKolamDaraSeoIntegrationSettings(body);
      applySettings(next);
      setNotice('Integrasi tersimpan');
    } catch (err) {
      setNotice(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal menyimpan',
      );
    } finally {
      setSaving(false);
    }
  }, [
    ddgEnabled,
    firecrawlApiKey,
    firecrawlBaseUrl,
    firecrawlEnabled,
    gscClientEmail,
    gscEnabled,
    gscPrivateKey,
    gscPropertyUrl,
    indexingClientEmail,
    indexingEnabled,
    indexingPrivateKey,
    monitorKeywords,
    searxBaseUrl,
    searxEnabled,
    serpApiKey,
    serpEnabled,
  ]);

  const onTest = useCallback(
    async (providerId: KolamDaraSeoIntegrationProviderId) => {
      setTestBusyProviderId(providerId);
      setNotice(null);
      try {
        const result = await testKolamDaraSeoIntegration(
          providerId,
          testKw.trim() || undefined,
          testKw.trim() || undefined,
        );
        setNotice(result.message);
      } catch (err) {
        setNotice(
          err instanceof Error && err.message.trim()
            ? sanitizeApiErrorMessage(err.message)
            : 'Test gagal',
        );
      } finally {
        setTestBusyProviderId(null);
      }
    },
    [testKw],
  );

  const onPreview = useCallback(async () => {
    const keyword = testKw.trim();
    if (!keyword) {
      setNotice('Isi keyword dulu');
      return;
    }
    setPreviewBusy(true);
    setNotice(null);
    try {
      setPreviewReport(await previewKolamDaraSeoIntegrationReport(keyword));
    } catch (err) {
      setPreviewReport(null);
      setNotice(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Preview gagal',
      );
    } finally {
      setPreviewBusy(false);
    }
  }, [testKw]);

  const onSubmitIndexing = useCallback(async () => {
    const url = testKw.trim();
    if (!url) {
      setNotice('Isi URL dulu');
      return;
    }
    setIndexingBusy(true);
    setNotice(null);
    try {
      const message = await submitKolamDaraSeoGoogleIndexing(url);
      setNotice(message);
    } catch (err) {
      setNotice(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal mengirim ke Google Indexing',
      );
    } finally {
      setIndexingBusy(false);
    }
  }, [testKw]);

  return {
    ddgEnabled,
    error,
    firecrawlApiKey,
    firecrawlBaseUrl,
    firecrawlEnabled,
    gscClientEmail,
    gscEnabled,
    gscPrivateKey,
    gscPropertyUrl,
    indexingBusy,
    indexingClientEmail,
    indexingEnabled,
    indexingPrivateKey,
    loading,
    monitorKeywords,
    notice,
    previewBusy,
    previewReport,
    saving,
    searxBaseUrl,
    searxEnabled,
    serpApiKey,
    serpEnabled,
    settings,
    testBusyProviderId,
    testKw,
    onRefresh,
    onSave,
    onSetDdgEnabled: setDdgEnabled,
    onSetFirecrawlApiKey: setFirecrawlApiKey,
    onSetFirecrawlBaseUrl: setFirecrawlBaseUrl,
    onSetFirecrawlEnabled: setFirecrawlEnabled,
    onSetGscClientEmail: setGscClientEmail,
    onSetGscEnabled: setGscEnabled,
    onSetGscPrivateKey: setGscPrivateKey,
    onSetGscPropertyUrl: setGscPropertyUrl,
    onSetIndexingClientEmail: setIndexingClientEmail,
    onSetIndexingEnabled: setIndexingEnabled,
    onSetIndexingPrivateKey: setIndexingPrivateKey,
    onSetMonitorKeywords: setMonitorKeywords,
    onSetSearxBaseUrl: setSearxBaseUrl,
    onSetSearxEnabled: setSearxEnabled,
    onSetSerpApiKey: setSerpApiKey,
    onSetSerpEnabled: setSerpEnabled,
    onSetTestKw: setTestKw,
    onSubmitIndexing,
    onTest,
    onPreview,
  };
}
