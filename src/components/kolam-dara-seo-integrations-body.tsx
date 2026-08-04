import React from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {
  KolamDaraSeoIntegrationProviderId,
  KolamDaraSeoIntegrationsController,
} from '../hooks/use-kolam-dara-seo-integrations-controller';
import {KolamButton} from './kolam-button';
import {KolamSwitch} from './kolam-switch';

export function KolamDaraSeoIntegrationsBody({
  canManageSettings,
  controller,
}: {
  canManageSettings: boolean;
  controller: KolamDaraSeoIntegrationsController;
}) {
  const disabled = !canManageSettings;
  const settings = controller.settings;

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      {!canManageSettings ? (
        <Text style={styles.notice}>
          Lihat & test tersedia; simpan hanya Admin/Owner
        </Text>
      ) : null}
      {controller.notice ? (
        <Text style={styles.notice}>{controller.notice}</Text>
      ) : null}
      {controller.error ? (
        <Text style={styles.warnText}>{controller.error}</Text>
      ) : null}
      {controller.loading && !settings ? (
        <Text style={styles.meta}>Memuat…</Text>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Monitor keywords</Text>
        <TextInput
          editable={!disabled}
          onChangeText={controller.onSetMonitorKeywords}
          placeholder="keyword1, keyword2"
          placeholderTextColor={V.colors.mutedFg}
          style={styles.input}
          value={controller.monitorKeywords}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Test keyword / URL</Text>
        <TextInput
          onChangeText={controller.onSetTestKw}
          placeholder="Keyword atau URL untuk test/preview"
          placeholderTextColor={V.colors.mutedFg}
          style={styles.input}
          value={controller.testKw}
        />
        <View style={styles.rowActions}>
          <KolamButton
            disabled={controller.previewBusy}
            label={controller.previewBusy ? 'Memuat…' : 'Preview laporan'}
            onPress={() => {
              void controller.onPreview();
            }}
          />
          {canManageSettings ? (
            <KolamButton
              disabled={controller.indexingBusy}
              label={
                controller.indexingBusy ? 'Mengirim…' : 'Kirim indexing'
              }
              onPress={() => {
                void controller.onSubmitIndexing();
              }}
            />
          ) : null}
        </View>
        {controller.previewReport ? (
          <View style={styles.previewBlock}>
            <Text style={styles.meta}>{controller.previewReport.summary}</Text>
            {controller.previewReport.sections.map(section => (
              <Text key={section.providerId} style={styles.meta}>
                {`${section.label}: ${section.ok ? 'OK' : 'Gagal'}${
                  section.message ? ` — ${section.message}` : ''
                }`}
              </Text>
            ))}
          </View>
        ) : null}
      </View>

      <ProviderRow
        disabled={disabled}
        enabled={controller.serpEnabled}
        onSetEnabled={controller.onSetSerpEnabled}
        onTest={() => void controller.onTest('serpApi')}
        testBusy={controller.testBusyProviderId === 'serpApi'}
        title="SERP API">
        <TextField
          disabled={disabled}
          label={`API key${
            settings?.serpApi.apiKeyMasked
              ? ` (tersimpan: ${settings.serpApi.apiKeyMasked})`
              : ''
          }`}
          onChangeText={controller.onSetSerpApiKey}
          placeholder="Isi untuk mengganti key"
          value={controller.serpApiKey}
        />
      </ProviderRow>

      <ProviderRow
        disabled={disabled}
        enabled={controller.ddgEnabled}
        onSetEnabled={controller.onSetDdgEnabled}
        onTest={() => void controller.onTest('duckduckgo')}
        testBusy={controller.testBusyProviderId === 'duckduckgo'}
        title="DuckDuckGo"
      />

      <ProviderRow
        disabled={disabled}
        enabled={controller.searxEnabled}
        onSetEnabled={controller.onSetSearxEnabled}
        onTest={() => void controller.onTest('searxng')}
        testBusy={controller.testBusyProviderId === 'searxng'}
        title="SearXNG">
        <TextField
          disabled={disabled}
          label="Base URL"
          onChangeText={controller.onSetSearxBaseUrl}
          value={controller.searxBaseUrl}
        />
      </ProviderRow>

      <ProviderRow
        disabled={disabled}
        enabled={controller.firecrawlEnabled}
        onSetEnabled={controller.onSetFirecrawlEnabled}
        onTest={() => void controller.onTest('firecrawl')}
        testBusy={controller.testBusyProviderId === 'firecrawl'}
        title="Firecrawl">
        <TextField
          disabled={disabled}
          label="Base URL"
          onChangeText={controller.onSetFirecrawlBaseUrl}
          value={controller.firecrawlBaseUrl}
        />
        <TextField
          disabled={disabled}
          label={`API key${
            settings?.firecrawl.apiKeyMasked
              ? ` (tersimpan: ${settings.firecrawl.apiKeyMasked})`
              : ''
          }`}
          onChangeText={controller.onSetFirecrawlApiKey}
          placeholder="Isi untuk mengganti key"
          value={controller.firecrawlApiKey}
        />
      </ProviderRow>

      <ProviderRow
        disabled={disabled}
        enabled={controller.gscEnabled}
        onSetEnabled={controller.onSetGscEnabled}
        onTest={() => void controller.onTest('searchConsole')}
        testBusy={controller.testBusyProviderId === 'searchConsole'}
        title="Google Search Console">
        <TextField
          disabled={disabled}
          label="Property URL"
          onChangeText={controller.onSetGscPropertyUrl}
          value={controller.gscPropertyUrl}
        />
        <TextField
          disabled={disabled}
          label="Client email"
          onChangeText={controller.onSetGscClientEmail}
          value={controller.gscClientEmail}
        />
        <TextField
          disabled={disabled}
          label={`Private key${
            settings?.searchConsole.privateKeyMasked
              ? ` (tersimpan: ${settings.searchConsole.privateKeyMasked})`
              : ''
          }`}
          onChangeText={controller.onSetGscPrivateKey}
          placeholder="Isi untuk mengganti key"
          value={controller.gscPrivateKey}
        />
      </ProviderRow>

      <ProviderRow
        disabled={disabled}
        enabled={controller.indexingEnabled}
        onSetEnabled={controller.onSetIndexingEnabled}
        onTest={() => void controller.onTest('indexingApi')}
        testBusy={controller.testBusyProviderId === 'indexingApi'}
        title="Indexing API">
        <TextField
          disabled={disabled}
          label="Client email"
          onChangeText={controller.onSetIndexingClientEmail}
          value={controller.indexingClientEmail}
        />
        <TextField
          disabled={disabled}
          label={`Private key${
            settings?.indexingApi.privateKeyMasked
              ? ` (tersimpan: ${settings.indexingApi.privateKeyMasked})`
              : ''
          }`}
          onChangeText={controller.onSetIndexingPrivateKey}
          placeholder="Isi untuk mengganti key"
          value={controller.indexingPrivateKey}
        />
      </ProviderRow>

      {canManageSettings ? (
        <KolamButton
          disabled={controller.saving}
          intent="primary"
          label={controller.saving ? 'Menyimpan…' : 'Simpan'}
          onPress={() => {
            void controller.onSave();
          }}
        />
      ) : null}
    </ScrollView>
  );
}

function ProviderRow({
  children,
  disabled,
  enabled,
  onSetEnabled,
  onTest,
  testBusy,
  title,
}: {
  children?: React.ReactNode;
  disabled: boolean;
  enabled: boolean;
  onSetEnabled: (value: boolean) => void;
  onTest: () => void;
  testBusy: boolean;
  title: string;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.providerHead}>
        <Text style={styles.cardTitle}>{title}</Text>
        <KolamSwitch
          active={enabled}
          disabled={disabled}
          onPress={() => onSetEnabled(!enabled)}
        />
      </View>
      {children}
      <View style={styles.rowActions}>
        <KolamButton
          disabled={testBusy}
          label={testBusy ? 'Test…' : 'Test'}
          onPress={onTest}
        />
      </View>
    </View>
  );
}

function TextField({
  disabled,
  label,
  onChangeText,
  placeholder,
  value,
}: {
  disabled: boolean;
  label: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        editable={!disabled}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={V.colors.mutedFg}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1},
  content: {gap: 10, paddingBottom: 24},
  notice: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  warnText: {color: V.colors.warning, fontFamily: V.fontFamily, fontSize: 12},
  meta: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  card: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  cardTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  providerHead: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  field: {gap: 4},
  fieldLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  rowActions: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  previewBlock: {gap: 4, marginTop: 4},
});
