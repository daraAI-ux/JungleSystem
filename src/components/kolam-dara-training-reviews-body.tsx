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
import {KolamModalBackdrop} from './kolam-modal-backdrop';
import {KolamNotesField} from './kolam-notes-field';
import {KolamStatusBadge} from './kolam-status-badge';

const PAGE_SIZE = 20;

/** FE `DaraConversationReviewsTab` — Review percakapan DARA. */
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
      setNotice('Catatan review wajib diisi');
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
      setNotice('Review DARA disimpan');
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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Review percakapan DARA</Text>
        <Text style={styles.meta}>
          Rating rendah (1–3) dari chat pure DARA — catat kendala untuk perbaikan
          model.
        </Text>

        <View style={styles.filterRow}>
          <KolamButton
            intent={status === 'pending' ? 'primary' : 'secondary'}
            label="Menunggu review"
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

        {loading ? (
          <Text style={styles.meta}>Memuat…</Text>
        ) : rows.length === 0 ? (
          <Text style={styles.meta}>Tidak ada data review DARA.</Text>
        ) : (
          <>
            <View style={styles.tableHead}>
              <Text style={[styles.th, styles.colDate]}>Tanggal</Text>
              <Text style={[styles.th, styles.colContact]}>Kontak</Text>
              <Text style={[styles.th, styles.colChannel]}>Channel</Text>
              <Text style={[styles.th, styles.colRating]}>★</Text>
              <Text style={[styles.th, styles.colComment]}>Komentar buyer</Text>
              <Text style={[styles.th, styles.colAction]}>
                {status === 'done' ? 'Catatan review' : 'Aksi'}
              </Text>
            </View>
            {rows.map(row => (
              <View key={row.id} style={styles.tableRow}>
                <Text style={[styles.tdMuted, styles.colDate]}>
                  {formatKolamDaraTrainingDateTime(
                    row.conversationStartedAt || row.createdAt,
                  )}
                </Text>
                <Text numberOfLines={2} style={[styles.td, styles.colContact]}>
                  {row.contactLabel}
                </Text>
                <View style={styles.colChannel}>
                  <KolamStatusBadge
                    intent="muted"
                    label={row.platform}
                    numberOfLines={1}
                  />
                </View>
                <Text style={[styles.tdStrong, styles.colRating]}>
                  {row.rating}
                </Text>
                <Text numberOfLines={2} style={[styles.tdMuted, styles.colComment]}>
                  {row.customerComment || '—'}
                </Text>
                <View style={styles.colAction}>
                  {status === 'done' ? (
                    <Text numberOfLines={3} style={styles.tdMuted}>
                      {row.reviewNotes || '—'}
                    </Text>
                  ) : (
                    <KolamButton
                      intent="secondary"
                      label="Review"
                      onPress={() => {
                        setActive(row);
                        setNotes('');
                        setNotice('');
                      }}
                      size="sm"
                    />
                  )}
                </View>
              </View>
            ))}
          </>
        )}

        {total > PAGE_SIZE ? (
          <View style={styles.pager}>
            <KolamButton
              disabled={page <= 1 || loading}
              intent="secondary"
              label="←"
              onPress={() => setPage(current => Math.max(1, current - 1))}
              size="sm"
            />
            <Text style={styles.meta}>
              {page} / {totalPages}
            </Text>
            <KolamButton
              disabled={page * PAGE_SIZE >= total || loading}
              intent="secondary"
              label="→"
              onPress={() => setPage(current => current + 1)}
              size="sm"
            />
          </View>
        ) : null}
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
              Review DARA — ★{active?.rating ?? ''}
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
              label="Catatan kendala / perbaikan DARA"
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
                label={saving ? 'Menyimpan…' : 'Selesai review'}
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
  tableHead: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 6,
  },
  tableRow: {
    alignItems: 'flex-start',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 8,
  },
  th: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
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
  colDate: {flex: 1.1, minWidth: 88},
  colContact: {flex: 1.2, minWidth: 90},
  colChannel: {flex: 0.9, minWidth: 72},
  colRating: {flex: 0.4, minWidth: 28},
  colComment: {flex: 1.4, minWidth: 100},
  colAction: {flex: 1.2, minWidth: 96},
  pager: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  modalRoot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    maxHeight: '90%',
    maxWidth: 520,
    padding: 14,
    width: '100%',
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
  fieldLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
});
