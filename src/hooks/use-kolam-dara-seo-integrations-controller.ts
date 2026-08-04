import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  extractKolamDaraSeoClientEmailFromServiceAccount,
  getKolamDaraSeoTab,
  isKolamDaraSeoRoute,
  isKolamDaraSeoSecretMaskOnly,
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
  gscKeyShown: string;
  gscPrivateKey: string;
  gscPropertyUrl: string;
  indexUrl: string;
  indexingBusy: boolean;
  indexingClientEmail: string;
  indexingEnabled: boolean;
  indexingKeyShown: string;
  indexingPrivateKey: string;
  loading: boolean;
  monitorKeywords: string;
  notice: string | null;
  previewBusy: boolean;
  previewReport: KolamDaraSeoIntegrationReport | null;
  sampleUrl: string;
  saving: boolean;
  searxBaseUrl: string;
  searxEnabled: boolean;
  serpApiKey: string;
  serpEnabled: boolean;
  settings: KolamDaraSeoIntegrationSettings | null;
  testBusyProviderId: KolamDaraSeoIntegrationProviderId | null;
  testKw: string;
  onPasteGscKey: (value: string) => void;
  onPasteIndexingKey: (value: string) => void;
  onPreview: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onSave: () => Promise<void>;
  onSetDdgEnabled: (value: boolean) => void;
  onSetFirecrawlApiKey: (value: string) => void;
  onSetFirecrawlBaseUrl: (value: string) => void;
  onSetFirecrawlEnabled: (value: boolean) => void;
  onSetGscClientEmail: (value: string) => void;
  onSetGscEnabled: (value: boolean) => void;
  onSetGscPropertyUrl: (value: string) => void;
  onSetIndexUrl: (value: string) => void;
  onSetIndexingClientEmail: (value: string) => void;
  onSetIndexingEnabled: (value: boolean) => void;
  onSetMonitorKeywords: (value: string) => void;
  onSetSearxBaseUrl: (value: string) => void;
  onSetSearxEnabled: (value: boolean) => void;
  onSetSerpApiKey: (value: string) => void;
  onSetSerpEnabled: (value: boolean) => void;
  onSetTestKw: (value: string) => void;
  onSubmitIndexing: () => Promise<void>;
  onTest: (providerId: KolamDaraSeoIntegrationProviderId) => Promise<void>;
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
  const [testKw, setTestKw] = useState('dunia anura');
  const [indexUrl, setIndexUrl] = useState('');

  const [monitorKeywords, setMonitorKeywords] = useState('');
  const [serpEnabled, setSerpEnabled] = useState(false);
  const [serpApiKey, setSerpApiKey] = useState('');
  const [ddgEnabled, setDdgEnabled] = useState(false);
  const [searxEnabled, setSearxEnabled] = useState(false);
  const [searxBaseUrl, setSearxBaseUrl] = useState('');
  const [firecrawlEnabled, setFirecrawlEnabled] = useState(false);
  const [firecrawlApiKey, setFirecrawlApiKey] = useState('');
  const [firecrawlBaseUrl, setFirecrawlBaseUrl] = useState(
    'https://api.firecrawl.dev',
  );
  const [gscEnabled, setGscEnabled] = useState(false);
  const [gscPropertyUrl, setGscPropertyUrl] = useState('');
  const [gscClientEmail, setGscClientEmail] = useState('');
  const [gscPrivateKey, setGscPrivateKey] = useState('');
  const [indexingEnabled, setIndexingEnabled] = useState(false);
  const [indexingClientEmail, setIndexingClientEmail] = useState('');
  const [indexingPrivateKey, setIndexingPrivateKey] = useState('');

  const applySettings = useCallback((data: KolamDaraSeoIntegrationSettings) => {
    setSettings(data);
    setMonitorKeywords(data.monitorKeywords);
    setSerpEnabled(data.serpApi.enabled);
    setSerpApiKey('');
    setDdgEnabled(data.duckduckgo.enabled);
    setSearxEnabled(data.searxng.enabled);
    setSearxBaseUrl(data.searxng.baseUrl);
    setFirecrawlEnabled(data.firecrawl.enabled);
    setFirecrawlApiKey('');
    setFirecrawlBaseUrl(
      data.firecrawl.baseUrl || 'https://api.firecrawl.dev',
    );
    setGscEnabled(data.searchConsole.enabled);
    setGscPropertyUrl(data.searchConsole.propertyUrl);
    setGscClientEmail(data.searchConsole.clientEmail);
    setGscPrivateKey('');
    setIndexingEnabled(data.indexingApi.enabled);
    setIndexingClientEmail(data.indexingApi.clientEmail);
    setIndexingPrivateKey('');
  }, []);

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      applySettings(await fetchKolamDaraSeoIntegrationSettings());
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
  }, [applySettings, enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void onRefresh();
  }, [enabled, onRefresh]);

  const sampleUrl = useMemo(
    () => gscPropertyUrl.trim() || 'https://dunia-anura.com',
    [gscPropertyUrl],
  );

  const gscKeyShown = useMemo(() => {
    if (gscPrivateKey) {
      return gscPrivateKey;
    }
    return settings?.searchConsole.privateKeyMasked ? '******' : '';
  }, [gscPrivateKey, settings?.searchConsole.privateKeyMasked]);

  const indexingKeyShown = useMemo(() => {
    if (indexingPrivateKey) {
      return indexingPrivateKey;
    }
    return settings?.indexingApi.privateKeyMasked ? '******' : '';
  }, [indexingPrivateKey, settings?.indexingApi.privateKeyMasked]);

  const onPasteGscKey = useCallback((raw: string) => {
    if (isKolamDaraSeoSecretMaskOnly(raw)) {
      setGscPrivateKey('');
      return;
    }
    setGscPrivateKey(raw);
    const email = extractKolamDaraSeoClientEmailFromServiceAccount(raw);
    if (email) {
      setGscClientEmail(email);
      setIndexingClientEmail(email);
    }
  }, []);

  const onPasteIndexingKey = useCallback((raw: string) => {
    if (isKolamDaraSeoSecretMaskOnly(raw)) {
      setIndexingPrivateKey('');
      return;
    }
    setIndexingPrivateKey(raw);
    const email = extractKolamDaraSeoClientEmailFromServiceAccount(raw);
    if (email) {
      setIndexingClientEmail(email);
    }
  }, []);

  const onSave = useCallback(async () => {
    setSaving(true);
    setNotice(null);
    try {
      const gscKeyTrim = gscPrivateKey.trim();
      const idxKeyTrim = indexingPrivateKey.trim();
      const gscEmailResolved = extractKolamDaraSeoClientEmailFromServiceAccount(
        gscKeyTrim,
        gscClientEmail,
      );
      let idxEmailResolved = extractKolamDaraSeoClientEmailFromServiceAccount(
        idxKeyTrim,
        indexingClientEmail,
      );
      if (
        !idxEmailResolved.endsWith('.iam.gserviceaccount.com') &&
        gscEmailResolved.endsWith('.iam.gserviceaccount.com')
      ) {
        idxEmailResolved = gscEmailResolved;
      }

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
          clientEmail: gscEmailResolved,
          ...(gscKeyTrim && !isKolamDaraSeoSecretMaskOnly(gscKeyTrim)
            ? {privateKey: gscKeyTrim}
            : {}),
        },
        indexingApi: {
          enabled: indexingEnabled,
          clientEmail: idxEmailResolved,
          ...(idxKeyTrim && !isKolamDaraSeoSecretMaskOnly(idxKeyTrim)
            ? {privateKey: idxKeyTrim}
            : {}),
        },
      };
      applySettings(await updateKolamDaraSeoIntegrationSettings(body));
      setNotice('Integrasi SEO disimpan');
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
    applySettings,
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
      const needsSampleUrl =
        providerId === 'firecrawl' || providerId === 'indexingApi';
      try {
        const result = await testKolamDaraSeoIntegration(
          providerId,
          testKw.trim() || undefined,
          needsSampleUrl ? sampleUrl : undefined,
        );
        if (result.count != null) {
          setNotice(`OK — ${result.count} hasil`);
        } else if (result.fallback) {
          setNotice(result.message || 'OK');
        } else {
          setNotice(result.message || 'OK');
        }
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
    [sampleUrl, testKw],
  );

  const onPreview = useCallback(async () => {
    const keyword = testKw.trim();
    if (!keyword) {
      setNotice('Isi keyword uji dulu');
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
    const url = indexUrl.trim();
    if (!url) {
      setNotice('Isi URL indexing dulu');
      return;
    }
    setIndexingBusy(true);
    setNotice(null);
    try {
      setNotice(await submitKolamDaraSeoGoogleIndexing(url));
    } catch (err) {
      setNotice(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Submit indexing gagal',
      );
    } finally {
      setIndexingBusy(false);
    }
  }, [indexUrl]);

  return {
    ddgEnabled,
    error,
    firecrawlApiKey,
    firecrawlBaseUrl,
    firecrawlEnabled,
    gscClientEmail,
    gscEnabled,
    gscKeyShown,
    gscPrivateKey,
    gscPropertyUrl,
    indexUrl,
    indexingBusy,
    indexingClientEmail,
    indexingEnabled,
    indexingKeyShown,
    indexingPrivateKey,
    loading,
    monitorKeywords,
    notice,
    previewBusy,
    previewReport,
    sampleUrl,
    saving,
    searxBaseUrl,
    searxEnabled,
    serpApiKey,
    serpEnabled,
    settings,
    testBusyProviderId,
    testKw,
    onPasteGscKey,
    onPasteIndexingKey,
    onPreview,
    onRefresh,
    onSave,
    onSetDdgEnabled: setDdgEnabled,
    onSetFirecrawlApiKey: setFirecrawlApiKey,
    onSetFirecrawlBaseUrl: setFirecrawlBaseUrl,
    onSetFirecrawlEnabled: setFirecrawlEnabled,
    onSetGscClientEmail: setGscClientEmail,
    onSetGscEnabled: setGscEnabled,
    onSetGscPropertyUrl: setGscPropertyUrl,
    onSetIndexUrl: setIndexUrl,
    onSetIndexingClientEmail: setIndexingClientEmail,
    onSetIndexingEnabled: setIndexingEnabled,
    onSetMonitorKeywords: setMonitorKeywords,
    onSetSearxBaseUrl: setSearxBaseUrl,
    onSetSearxEnabled: setSearxEnabled,
    onSetSerpApiKey: setSerpApiKey,
    onSetSerpEnabled: setSerpEnabled,
    onSetTestKw: setTestKw,
    onSubmitIndexing,
    onTest,
  };
}
