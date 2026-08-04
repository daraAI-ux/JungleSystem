import {useCallback, useEffect, useState} from 'react';
import {
  getKolamDaraSeoTab,
  isKolamDaraSeoRoute,
  type KolamDaraSeoWebsitePreview,
} from '../domain/kolam-dara-seo';
import {sanitizeApiErrorMessage} from '../lib/api-error';
import {
  fetchKolamDaraSeoWebsitePreview,
  submitKolamDaraSeoGoogleIndexing,
  updateKolamDaraSeoWebsite,
} from '../services/kolam-dara-seo-api';

export interface KolamDaraSeoWebsiteController {
  error: string | null;
  indexingBusy: boolean;
  keywordsInput: string;
  loading: boolean;
  metaDescription: string;
  metaTitle: string;
  notice: string | null;
  preview: KolamDaraSeoWebsitePreview | null;
  publicSiteUrl: string;
  saving: boolean;
  onRefresh: () => Promise<void>;
  onSaveManual: () => Promise<void>;
  onSetKeywordsInput: (value: string) => void;
  onSetMetaDescription: (value: string) => void;
  onSetMetaTitle: (value: string) => void;
  onSetPublicSiteUrl: (value: string) => void;
  onSubmitIndexing: () => Promise<void>;
}

export function useKolamDaraSeoWebsiteController(
  route: string,
): KolamDaraSeoWebsiteController {
  const enabled =
    isKolamDaraSeoRoute(route) && getKolamDaraSeoTab(route) === 'website';
  const [preview, setPreview] = useState<KolamDaraSeoWebsitePreview | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [indexingBusy, setIndexingBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [publicSiteUrl, setPublicSiteUrl] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchKolamDaraSeoWebsitePreview();
      setPreview(data);
      setPublicSiteUrl(data.publicSiteUrl);
      setMetaTitle(data.metaTitle);
      setMetaDescription(data.metaDescription);
      setKeywordsInput(data.keywords.join(', '));
    } catch (err) {
      setPreview(null);
      setError(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal memuat SEO website',
      );
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void onRefresh();
  }, [enabled, onRefresh]);

  const onSaveManual = useCallback(async () => {
    setSaving(true);
    setNotice(null);
    try {
      await updateKolamDaraSeoWebsite({
        publicSiteUrl: publicSiteUrl.trim(),
        metaTitle: metaTitle.trim(),
        metaDescription: metaDescription.trim(),
        keywords: keywordsInput
          .split(',')
          .map(item => item.trim())
          .filter(Boolean),
      });
      setNotice('SEO website tersimpan');
      await onRefresh();
    } catch (err) {
      setNotice(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal menyimpan',
      );
    } finally {
      setSaving(false);
    }
  }, [keywordsInput, metaDescription, metaTitle, onRefresh, publicSiteUrl]);

  const onSubmitIndexing = useCallback(async () => {
    const url = publicSiteUrl.trim() || preview?.publicSiteUrl.trim() || '';
    if (!url) {
      setNotice('Isi URL publik dulu');
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
  }, [preview, publicSiteUrl]);

  return {
    error,
    indexingBusy,
    keywordsInput,
    loading,
    metaDescription,
    metaTitle,
    notice,
    preview,
    publicSiteUrl,
    saving,
    onRefresh,
    onSaveManual,
    onSetKeywordsInput: setKeywordsInput,
    onSetMetaDescription: setMetaDescription,
    onSetMetaTitle: setMetaTitle,
    onSetPublicSiteUrl: setPublicSiteUrl,
    onSubmitIndexing,
  };
}
