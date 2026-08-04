import React from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraSeoIntegrationsController} from '../hooks/use-kolam-dara-seo-integrations-controller';
import {KolamButton} from './kolam-button';
import {KolamStatusBadge} from './kolam-status-badge';
import {KolamSwitch} from './kolam-switch';

/**
 * FE parity: DA-Dara-Plugin `dara-seo-integrations.tsx`
 * Monitor card · Sumber SERP tiles · Google & crawl · Alat cepat · Hasil preview.
 */
export function KolamDaraSeoIntegrationsBody({
  canDraft,
  canManageSettings,
  controller,
}: {
  canDraft: boolean;
  canManageSettings: boolean;
  controller: KolamDaraSeoIntegrationsController;
}) {
  const disabled = !canManageSettings;
  const settings = controller.settings;
  const showTest = canDraft;

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      {canManageSettings ? (
        <View style={styles.topActions}>
          <KolamButton
            disabled={controller.saving}
            intent="primary"
            label={controller.saving ? 'Menyimpan…' : 'Simpan semua'}
            onPress={() => {
              void controller.onSave();
            }}
          />
        </View>
      ) : (
        <Text style={styles.notice}>
          Lihat & test tersedia; simpan hanya Admin/Owner
        </Text>
      )}

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
        <Text style={styles.cardTitle}>Keyword monitor & uji</Text>
        <Text style={styles.hint}>
          Cron SERP memakai keyword ini. Prioritas laporan: GSC → SerpAPI →
          DuckDuckGo → SearXNG.
        </Text>
        <View style={styles.inlineFields}>
          <TextInput
            editable={!disabled}
            onChangeText={controller.onSetMonitorKeywords}
            placeholder="keyword1, keyword2"
            placeholderTextColor={V.colors.mutedFg}
            style={[styles.input, styles.inlineField]}
            value={controller.monitorKeywords}
          />
          <TextInput
            onChangeText={controller.onSetTestKw}
            placeholder="Keyword uji integrasi"
            placeholderTextColor={V.colors.mutedFg}
            style={[styles.input, styles.inlineField]}
            value={controller.testKw}
          />
        </View>
        <View style={styles.badges}>
          {settings?.serpApi.envConfigured ? (
            <KolamStatusBadge intent="success" label="SerpAPI dari env" />
          ) : null}
          {settings?.serpApi.apiKeyMasked ? (
            <KolamStatusBadge
              intent="secondary"
              label={`Key: ${settings.serpApi.apiKeyMasked}`}
            />
          ) : null}
          {settings?.searxng.local ? (
            <KolamStatusBadge
              intent={settings.searxng.local.reachable ? 'success' : 'danger'}
              label={
                settings.searxng.local.reachable
                  ? `SearXNG online (${
                      settings.searxng.local.latencyMs ?? '?'
                    } ms)`
                  : 'SearXNG offline'
              }
            />
          ) : null}
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Sumber SERP</Text>
        <View style={styles.tilesRow}>
          <IntegrationTile
            disabled={disabled}
            enabled={controller.serpEnabled}
            hint="Override key opsional; kosongkan untuk pakai env DARA_SEO_SERP_API_KEY."
            onEnabled={controller.onSetSerpEnabled}
            onTest={
              showTest
                ? () => void controller.onTest('serpApi')
                : undefined
            }
            testBusy={controller.testBusyProviderId === 'serpApi'}
            title="SerpAPI">
            <TextInput
              editable={!disabled}
              onChangeText={controller.onSetSerpApiKey}
              placeholder={
                settings?.serpApi.apiKeyMasked ||
                'API key (kosong = tidak ubah)'
              }
              placeholderTextColor={V.colors.mutedFg}
              secureTextEntry
              style={styles.input}
              value={controller.serpApiKey}
            />
          </IntegrationTile>

          <IntegrationTile
            disabled={disabled}
            enabled={controller.ddgEnabled}
            hint="Gratis, tanpa API key."
            onEnabled={controller.onSetDdgEnabled}
            onTest={
              showTest
                ? () => void controller.onTest('duckduckgo')
                : undefined
            }
            testBusy={controller.testBusyProviderId === 'duckduckgo'}
            title="DuckDuckGo"
          />

          <IntegrationTile
            disabled={disabled}
            enabled={controller.searxEnabled}
            hint="deploy/searxng — loopback JSON API."
            onEnabled={controller.onSetSearxEnabled}
            onTest={
              showTest
                ? () => void controller.onTest('searxng')
                : undefined
            }
            testBusy={controller.testBusyProviderId === 'searxng'}
            title="SearXNG (lokal)">
            <TextInput
              editable={!disabled}
              onChangeText={controller.onSetSearxBaseUrl}
              placeholder={
                settings?.searxng.defaultBaseUrl || 'http://127.0.0.1:8080'
              }
              placeholderTextColor={V.colors.mutedFg}
              style={styles.input}
              value={controller.searxBaseUrl}
            />
          </IntegrationTile>
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Google & crawl</Text>
        <Text style={styles.groupHint}>
          Paste JSON service account (client_email + private_key), bukan .p12 /
          .pfx.
        </Text>
        <View style={styles.tilesRow}>
          <IntegrationTile
            disabled={disabled}
            enabled={controller.gscEnabled}
            onEnabled={controller.onSetGscEnabled}
            onTest={
              showTest
                ? () => void controller.onTest('searchConsole')
                : undefined
            }
            testBusy={controller.testBusyProviderId === 'searchConsole'}
            title="Search Console">
            <View style={styles.stack}>
              <TextInput
                editable={!disabled}
                onChangeText={controller.onSetGscPropertyUrl}
                placeholder="https://www.example.com/"
                placeholderTextColor={V.colors.mutedFg}
                style={styles.input}
                value={controller.gscPropertyUrl}
              />
              <TextInput
                editable={!disabled}
                onChangeText={controller.onSetGscClientEmail}
                placeholder="client_email dari JSON"
                placeholderTextColor={V.colors.mutedFg}
                style={styles.input}
                value={controller.gscClientEmail}
              />
              <TextInput
                editable={!disabled}
                multiline
                onChangeText={controller.onPasteGscKey}
                placeholder={
                  settings?.searchConsole.privateKeyMasked
                    ? 'JSON tersimpan — paste untuk ganti'
                    : 'Paste file JSON'
                }
                placeholderTextColor={V.colors.mutedFg}
                style={[styles.input, styles.textarea]}
                textAlignVertical="top"
                value={controller.gscKeyShown}
              />
            </View>
          </IntegrationTile>

          <IntegrationTile
            disabled={disabled}
            enabled={controller.firecrawlEnabled}
            onEnabled={controller.onSetFirecrawlEnabled}
            onTest={
              showTest
                ? () => void controller.onTest('firecrawl')
                : undefined
            }
            testBusy={controller.testBusyProviderId === 'firecrawl'}
            title="Firecrawl">
            <View style={styles.stack}>
              <TextInput
                editable={!disabled}
                onChangeText={controller.onSetFirecrawlBaseUrl}
                placeholderTextColor={V.colors.mutedFg}
                style={styles.input}
                value={controller.firecrawlBaseUrl}
              />
              <TextInput
                editable={!disabled}
                onChangeText={controller.onSetFirecrawlApiKey}
                placeholder={settings?.firecrawl.apiKeyMasked || 'API key'}
                placeholderTextColor={V.colors.mutedFg}
                secureTextEntry
                style={styles.input}
                value={controller.firecrawlApiKey}
              />
            </View>
          </IntegrationTile>

          <IntegrationTile
            disabled={disabled}
            enabled={controller.indexingEnabled}
            onEnabled={controller.onSetIndexingEnabled}
            onTest={
              showTest
                ? () => void controller.onTest('indexingApi')
                : undefined
            }
            testBusy={controller.testBusyProviderId === 'indexingApi'}
            title="Indexing API">
            <View style={styles.stack}>
              <TextInput
                editable={!disabled}
                onChangeText={controller.onSetIndexingClientEmail}
                placeholder="Sama dengan GSC"
                placeholderTextColor={V.colors.mutedFg}
                style={styles.input}
                value={controller.indexingClientEmail}
              />
              <TextInput
                editable={!disabled}
                multiline
                onChangeText={controller.onPasteIndexingKey}
                placeholder={
                  settings?.indexingApi.privateKeyMasked
                    ? 'Key tersimpan — paste untuk ganti'
                    : 'JSON atau private_key'
                }
                placeholderTextColor={V.colors.mutedFg}
                style={[styles.input, styles.textarea]}
                textAlignVertical="top"
                value={controller.indexingKeyShown}
              />
            </View>
          </IntegrationTile>
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Alat cepat</Text>
        <View style={styles.toolsRow}>
          <View style={[styles.card, styles.toolCard]}>
            <View style={styles.toolCopy}>
              <Text style={styles.tileTitle}>Preview gabungan</Text>
              <Text style={styles.hint}>
                Uji keyword dengan semua sumber aktif.
              </Text>
            </View>
            <View style={styles.toolFooter}>
              <KolamButton
                disabled={controller.previewBusy || !controller.testKw.trim()}
                label={controller.previewBusy ? 'Memuat…' : 'Preview'}
                onPress={() => {
                  void controller.onPreview();
                }}
              />
            </View>
          </View>

          <View style={[styles.card, styles.toolCard]}>
            <View style={styles.toolCopy}>
              <Text style={styles.tileTitle}>Submit indexing</Text>
              <Text style={styles.hint}>
                Kirim URL ke Google Indexing API.
              </Text>
            </View>
            <View style={styles.toolRow}>
              <TextInput
                editable={!disabled}
                onChangeText={controller.onSetIndexUrl}
                placeholder={controller.sampleUrl}
                placeholderTextColor={V.colors.mutedFg}
                style={[styles.input, styles.toolUrl]}
                value={controller.indexUrl}
              />
              <KolamButton
                disabled={
                  controller.indexingBusy ||
                  !controller.indexUrl.trim() ||
                  disabled
                }
                intent="primary"
                label={controller.indexingBusy ? '…' : 'Kirim'}
                onPress={() => {
                  void controller.onSubmitIndexing();
                }}
              />
            </View>
          </View>
        </View>
      </View>

      {controller.previewReport ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hasil preview</Text>
          <Text style={styles.summary}>{controller.previewReport.summary}</Text>
          <View style={styles.reportGrid}>
            {controller.previewReport.sections.map(section => (
              <View key={section.providerId} style={styles.reportItem}>
                <Text style={styles.reportLabel}>
                  {`${section.label} ${section.ok ? '✓' : '—'}`}
                </Text>
                {section.message ? (
                  <Text style={styles.meta}>{section.message}</Text>
                ) : null}
                {section.rankings.slice(0, 2).map((rank, index) => (
                  <Text
                    key={`${section.providerId}-${index}`}
                    numberOfLines={1}
                    style={styles.meta}>
                    {`#${rank.position} ${rank.url}`}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

function IntegrationTile({
  children,
  disabled,
  enabled,
  hint,
  onEnabled,
  onTest,
  testBusy,
  title,
}: {
  children?: React.ReactNode;
  disabled: boolean;
  enabled: boolean;
  hint?: string;
  onEnabled: (value: boolean) => void;
  onTest?: () => void;
  testBusy: boolean;
  title: string;
}) {
  return (
    <View style={[styles.card, styles.tile]}>
      <View style={styles.tileHead}>
        <View style={styles.tileCopy}>
          <Text style={styles.tileTitle}>{title}</Text>
          {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
        <View style={styles.tileControls}>
          <KolamSwitch
            active={enabled}
            disabled={disabled}
            onPress={() => onEnabled(!enabled)}
          />
          {onTest ? (
            <KolamButton
              disabled={testBusy}
              label={testBusy ? 'Test…' : 'Test'}
              onPress={onTest}
            />
          ) : null}
        </View>
      </View>
      {children ? <View style={styles.tileBody}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1},
  content: {gap: 14, paddingBottom: 24},
  topActions: {alignItems: 'flex-end'},
  notice: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  warnText: {color: V.colors.warning, fontFamily: V.fontFamily, fontSize: 12},
  meta: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 11},
  card: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  cardTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  hint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 15,
  },
  inlineFields: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  inlineField: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 220,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  group: {gap: 10},
  groupTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '800',
  },
  groupHint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    marginTop: -4,
  },
  tilesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 260,
    maxWidth: '100%',
  },
  tileHead: {
    alignItems: 'flex-start',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  tileCopy: {
    flexGrow: 1,
    flexShrink: 1,
    gap: 4,
    minWidth: 0,
  },
  tileTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  tileControls: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: 6,
  },
  tileBody: {gap: 8},
  stack: {gap: 8},
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
  textarea: {
    fontFamily: 'Consolas',
    fontSize: 11,
    minHeight: 88,
  },
  toolsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  toolCard: {
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'space-between',
    minWidth: 280,
  },
  toolCopy: {gap: 4},
  toolFooter: {
    alignItems: 'flex-end',
  },
  toolRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toolUrl: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 160,
  },
  summary: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  reportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reportItem: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    flexShrink: 1,
    gap: 4,
    minWidth: 160,
    padding: 10,
  },
  reportLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
});
