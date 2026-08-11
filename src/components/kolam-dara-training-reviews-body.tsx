import React, {useEffect, useState} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  formatKolamDaraTrainingDateTime,
  type KolamDaraTrainingConversationReview,
  type KolamDaraTrainingConversationReviewStatus,
} from '../domain/kolam-dara-training';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {ApiError} from '../lib/api-error';
import {
  completeKolamDaraTrainingConversationReview,
  listKolamDaraTrainingConversationReviews,
} from '../services/kolam-dara-training-api';
import {KolamButton} from './kolam-button';
import {KolamCancelButton} from './kolam-cancel-button';
import {KolamListTableComposition} from './kolam-list-table-composition';
import {KolamModalBackdrop} from './kolam-modal-backdrop';
import {KolamNotesField} from './kolam-notes-field';
import {KolamStatusBadge} from './kolam-status-badge';

const PAGE_SIZE = 20;

/** FE `DaraConversationReviewsTab` — Ulasan percakapan DARA. */
export function KolamDaraTrainingReviewsBody({
  refreshKey = 0,
}: {
  refreshKey?: number;
}) {
  const [status, setStatus] =
    useState<KolamDaraTrainingConversationReviewStatus>('pending');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<KolamDaraTrainingConversationReview[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [active, setActive] =
    useState<KolamDaraTrainingConversationReview | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async (
    nextStatus: KolamDaraTrainingConversationReviewStatus = status,
    nextPage = page,
  ) => {
    setLoading(true);
    try {
      const res = await listKolamDaraTrainingConversationReviews({
        status: nextStatus,
        page: nextPage,
        limit: PAGE_SIZE,
      });
      setRows(res.rows);
      setTotal(res.total);
      setNotice('');
    } catch (err) {
      setRows([]);
      setTotal(0);
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memuat',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [refreshKey, status, page]);

  const selectStatus = (next: KolamDaraTrainingConversationReviewStatus) => {
    setStatus(next);
    setPage(1);
  };

  const saveReview = async () => {
    if (!active) {
      return;
    }
    if (!notes.trim()) {
      setNotice('Catatan ulasan wajib diisi');
      return;
    }
    setSaving(true);
    try {
      await completeKolamDaraTrainingConversationReview(
        active.conversationId,
        notes.trim(),
      );
      setActive(null);
      setNotes('');
      setNotice('Ulasan DARA disimpan');
      await load();
    } catch (err) {
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal menyimpan',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Ulasan percakapan DARA</Text>
        <Text style={styles.meta}>
          Rating rendah (1–3) dari chat pure DARA — catat kendala untuk perbaikan
          model.
        </Text>

        <View style={styles.filterRow}>
          <KolamButton
            intent={status === 'pending' ? 'primary' : 'secondary'}
            label="Menunggu ulasan"
            onPress={() => selectStatus('pending')}
            size="sm"
          />
          <KolamButton
            intent={status === 'done' ? 'primary' : 'secondary'}
            label="Selesai"
            onPress={() => selectStatus('done')}
            size="sm"
          />
        </View>

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        <KolamListTableComposition
          columns={[
            {
              flex: 1,
              id: 'date',
              label: 'Tanggal',
              render: row => (
                <Text numberOfLines={2} style={styles.tdMuted}>
                  {formatKolamDaraTrainingDateTime(
                    row.conversationStartedAt || row.createdAt,
                  )}
                </Text>
              ),
            },
            {
              flex: 1,
              id: 'contact',
              label: 'Kontak',
              render: row => (
                <Text numberOfLines={2} style={styles.td}>
                  {row.contactLabel}
                </Text>
              ),
            },
            {
              flex: 0.8,
              id: 'channel',
              label: 'Kanal',
              render: row => (
                <KolamStatusBadge
                  intent="muted"
                  label={row.platform}
                  numberOfLines={1}
                />
              ),
            },
            {
              align: 'center',
              flex: 0.42,
              id: 'rating',
              label: 'Bintang',
              render: row => (
                <Text style={styles.tdStrong}>{row.rating}</Text>
              ),
            },
            {
              flex: 1.35,
              id: 'comment',
              label: 'Komentar pembeli',
              render: row => (
                <Text numberOfLines={2} style={styles.tdMuted}>
                  {row.customerComment || '-'}
                </Text>
              ),
            },
            {
              flex: 1.1,
              id: 'action',
              label: status === 'done' ? 'Catatan ulasan' : 'Aksi',
              render: row =>
                status === 'done' ? (
                  <Text numberOfLines={3} style={styles.tdMuted}>
                    {row.reviewNotes || '-'}
                  </Text>
                ) : (
                  <KolamButton
                    intent="secondary"
                    label="Ulas"
                    onPress={() => {
                      setActive(row);
                      setNotes('');
                      setNotice('');
                    }}
                    size="sm"
                  />
                ),
            },
          ]}
          emptyTitle={loading ? 'Memuat...' : 'Tidak ada data ulasan DARA'}
          getRowKey={row => row.id}
          loading={loading}
          pagination={
            !loading && total > 0
              ? {
                  onPageChange: setPage,
                  page,
                  pageSize: PAGE_SIZE,
                  total,
                }
              : undefined
          }
          rows={loading ? [] : rows}
          showFooter={!loading && total > 0}
        />

      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => {
          if (!saving) {
            setActive(null);
          }
        }}
        transparent
        visible={active != null}>
        <View style={styles.modalRoot}>
          <KolamModalBackdrop
            onPress={() => {
              if (!saving) {
                setActive(null);
              }
            }}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Ulasan DARA — ★{active?.rating ?? ''}
            </Text>
            <Text style={styles.meta}>
              {active?.contactLabel} · {active?.platform}
            </Text>
            {active?.customerComment ? (
              <View style={styles.commentBox}>
                <Text style={styles.td}>{active.customerComment}</Text>
              </View>
            ) : null}
            <KolamNotesField
              containerStyle={styles.modalNotes}
              inputStyle={styles.modalNotesInput}
              label="Catatan kendala / perbaikan DARA"
              numberOfLines={5}
              onChangeText={setNotes}
              value={notes}
            />
            <View style={styles.modalFooter}>
              <KolamCancelButton
                disabled={saving}
                intent="secondary"
                onPress={() => setActive(null)}
                size="sm"
              />
              <KolamButton
                disabled={saving}
                label={saving ? 'Menyimpan…' : 'Selesai ulasan'}
                onPress={() => {
                  void saveReview();
                }}
                size="sm"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {gap: 12},
  card: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  meta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  notice: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  td: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  tdStrong: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  tdMuted: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  modalRoot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  modalCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
    maxHeight: '86%',
    maxWidth: 640,
    minWidth: 420,
    paddingHorizontal: 18,
    paddingVertical: 18,
    width: '92%',
    zIndex: 2,
  },
  modalTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  commentBox: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  modalNotes: {
    flexShrink: 1,
  },
  modalNotesInput: {
    minHeight: 92,
  },
  fieldLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  modalFooter: {
    alignItems: 'center',
    borderTopColor: V.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
    minHeight: 42,
    paddingTop: 12,
  },
});
