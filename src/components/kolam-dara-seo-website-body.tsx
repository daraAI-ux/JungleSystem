import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {formatKolamDaraSeoScoreStatus} from '../domain/kolam-dara-seo';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraSeoJobsProgressController} from '../hooks/use-kolam-dara-seo-jobs-progress';
import type {KolamDaraSeoWebsiteController} from '../hooks/use-kolam-dara-seo-website-controller';
import {KolamButton} from './kolam-button';
import {KolamDetailScrollSurface} from './kolam-detail-scroll-surface';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamSaveButton} from './kolam-save-button';
import {KolamSeoAuditButton} from './kolam-seo-audit-button';

const AUDIT_JOB_TYPE = 'seo.audit_website';

export function KolamDaraSeoWebsiteBody({
  canApprove,
  canDraft,
  controller,
  jobsProgress,
  onRouteChange,
}: {
  canApprove: boolean;
  canDraft: boolean;
  controller: KolamDaraSeoWebsiteController;
  jobsProgress: KolamDaraSeoJobsProgressController;
  onRouteChange?: (route: string) => void;
}) {
  const {preview} = controller;
  const score = preview?.auditScore ?? preview?.lastSeoScore ?? null;
  const auditing = jobsProgress.isRunning(AUDIT_JOB_TYPE);
  const canIndex = canApprove && controller.publicSiteUrl.trim().length > 0;

  return (
    <KolamDetailScrollSurface contentContainerStyle={styles.content} style={styles.scroll}>
      {controller.notice ? (
        <Text style={styles.notice}>{controller.notice}</Text>
      ) : null}
      {controller.loading && !preview ? (
        <Text style={styles.meta}>Memuat…</Text>
      ) : null}
      {controller.error && !preview ? (
        <KolamEmptyState message={controller.error} title="Gagal memuat" />
      ) : null}

      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Skor audit</Text>
          {score == null ? (
            <Text style={styles.emptyLine}>Belum diaudit</Text>
          ) : (
            <>
              <Text style={styles.scoreValue}>{String(score)}</Text>
              <Text style={styles.meta}>
                {formatKolamDaraSeoScoreStatus(score)}
              </Text>
            </>
          )}

          <View style={styles.issuesBlock}>
            {!preview || preview.issues.length === 0 ? (
              <Text style={styles.emptyLine}>
                Tidak ada isu kritis terdeteksi.
              </Text>
            ) : (
              preview.issues.map(issue => (
                <Text key={`${issue.code}-${issue.message}`} style={styles.issueLine}>
                  {`• ${issue.message || issue.code}`}
                </Text>
              ))
            )}
          </View>

          <View style={styles.cardActions}>
            {canDraft ? (
              <KolamSeoAuditButton
                disabled={auditing}
                intent="primary"
                label={auditing ? 'Mengaudit…' : 'Audit + draf'}
                onPress={() => {
                  void jobsProgress.onStartSeoJob(
                    AUDIT_JOB_TYPE,
                    {generateDraft: true},
                    'Audit website',
                  );
                }}
              />
            ) : null}
            <KolamButton
              label="Buka persetujuan"
              onPress={() =>
                onRouteChange?.(
                  '/campaign/dara-seo/approvals?target=website',
                )
              }
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Field homepage</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>URL publik</Text>
            <TextInput
              onChangeText={controller.onSetPublicSiteUrl}
              placeholder="https://..."
              placeholderTextColor={V.colors.mutedFg}
              style={styles.input}
              value={controller.publicSiteUrl}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Meta title</Text>
            <TextInput
              onChangeText={controller.onSetMetaTitle}
              style={styles.input}
              value={controller.metaTitle}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Meta description</Text>
            <TextInput
              multiline
              onChangeText={controller.onSetMetaDescription}
              style={[styles.input, styles.textarea]}
              value={controller.metaDescription}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Kata kunci (pisah koma)</Text>
            <TextInput
              onChangeText={controller.onSetKeywordsInput}
              style={styles.input}
              value={controller.keywordsInput}
            />
          </View>

          <View style={styles.cardActions}>
            {canDraft ? (
              <KolamSaveButton
                disabled={controller.saving}
                label={controller.saving ? 'Menyimpan…' : 'Simpan manual'}
                onPress={() => {
                  void controller.onSaveManual();
                }}
              />
            ) : null}
            {canIndex ? (
              <KolamButton
                disabled={controller.indexingBusy}
                label={
                  controller.indexingBusy
                    ? 'Mengirim…'
                    : 'Kirim ke Google Indexing'
                }
                onPress={() => {
                  void controller.onSubmitIndexing();
                }}
              />
            ) : null}
          </View>
        </View>
      </View>
    </KolamDetailScrollSurface>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1},
  content: {gap: 12, paddingBottom: 24},
  notice: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  meta: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  emptyLine: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexBasis: 320,
    flexGrow: 1,
    gap: 8,
    padding: 12,
  },
  cardTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  scoreValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 28,
    fontWeight: '800',
  },
  issuesBlock: {gap: 4, marginTop: 4},
  issueLine: {color: V.colors.warning, fontFamily: V.fontFamily, fontSize: 12},
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
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
  textarea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
});
