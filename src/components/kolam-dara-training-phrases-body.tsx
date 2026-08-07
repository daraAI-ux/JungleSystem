import React, {useEffect, useState} from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  KOLAM_DARA_TRAINING_PHRASE_CATEGORY_LABELS,
  KOLAM_DARA_TRAINING_REPLY_CATEGORIES,
  type KolamDaraTrainingPhrase,
  type KolamDaraTrainingPhraseCategory,
} from '../domain/kolam-dara-training';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {ApiError} from '../lib/api-error';
import {
  createKolamDaraTrainingPhrase,
  deleteKolamDaraTrainingPhrase,
  listKolamDaraTrainingPhrases,
  updateKolamDaraTrainingPhrase,
} from '../services/kolam-dara-training-api';
import {KolamButton} from './kolam-button';
import {KolamEditButton} from './kolam-edit-button';
import {KolamDetailScrollSurface} from './kolam-detail-scroll-surface';
import {KolamDropdownSelect} from './kolam-dropdown-select';
import {KolamModalBackdrop} from './kolam-modal-backdrop';
import {KolamStatusBadge} from './kolam-status-badge';
import {KolamSwitch} from './kolam-switch';

/** FE `DaraTrainingPage` tab phrases (Kamus frasa). */
export function KolamDaraTrainingPhrasesBody({
  canManage,
  refreshKey = 0,
}: {
  canManage: boolean;
  refreshKey?: number;
}) {
  const [rows, setRows] = useState<KolamDaraTrainingPhrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<KolamDaraTrainingPhrase | null>(null);
  const [saving, setSaving] = useState(false);

  const [phrase, setPhrase] = useState('');
  const [category, setCategory] =
    useState<KolamDaraTrainingPhraseCategory>('identity');
  const [customReply, setCustomReply] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [priority, setPriority] = useState('0');
  const [notes, setNotes] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setRows(
        await listKolamDaraTrainingPhrases({
          page: 1,
          limit: 50,
          scope: 'reply',
        }),
      );
      setNotice('');
    } catch (err) {
      setRows([]);
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memuat frasa',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [refreshKey]);

  const openCreate = () => {
    setEditing(null);
    setPhrase('');
    setCategory('identity');
    setCustomReply('');
    setEnabled(true);
    setPriority('0');
    setNotes('');
    setNotice('');
    setOpen(true);
  };

  const openEdit = (row: KolamDaraTrainingPhrase) => {
    setEditing(row);
    setPhrase(row.phrase);
    setCategory(
      KOLAM_DARA_TRAINING_REPLY_CATEGORIES.includes(row.category)
        ? row.category
        : 'custom',
    );
    setCustomReply(row.customReply);
    setEnabled(row.enabled);
    setPriority(String(row.priority ?? 0));
    setNotes(row.notes);
    setNotice('');
    setOpen(true);
  };

  const onSave = async () => {
    if (!phrase.trim()) {
      setNotice('Frasa wajib diisi');
      return;
    }
    setSaving(true);
    setNotice('');
    const body = {
      phrase: phrase.trim(),
      category,
      customReply: customReply.trim() || undefined,
      enabled,
      priority: Number(priority) || 0,
      notes: notes.trim() || undefined,
    };
    try {
      if (editing) {
        await updateKolamDaraTrainingPhrase(editing.id, body);
        setNotice('Frasa diperbarui');
      } else {
        await createKolamDaraTrainingPhrase(body);
        setNotice('Frasa ditambahkan');
      }
      setOpen(false);
      await load();
    } catch (err) {
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal menyimpan frasa',
      );
    } finally {
      setSaving(false);
    }
  };

  const onDelete = (row: KolamDaraTrainingPhrase) => {
    Alert.alert('Hapus frasa', `Hapus frasa "${row.phrase}"?`, [
      {text: 'Batal', style: 'cancel'},
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteKolamDaraTrainingPhrase(row.id);
              setNotice('Frasa dihapus');
              await load();
            } catch {
              setNotice('Gagal menghapus frasa');
            }
          })();
        },
      },
    ]);
  };

  const replyLabel =
    category === 'payment_hint'
      ? 'Balasan jika teks saja tanpa foto (opsional)'
      : 'Jawaban kustom (opsional)';

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <View style={styles.headCopy}>
            <Text style={styles.sectionTitle}>Kamus frasa</Text>
            <Text style={styles.meta}>
              Cocokkan teks pelanggan → jawaban instan. Kosongkan jawaban kustom
              untuk pakai template kategori.
            </Text>
          </View>
          {canManage ? (
            <KolamButton
              label="Tambah frasa"
              onPress={openCreate}
              size="sm"
            />
          ) : null}
        </View>

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        {loading ? (
          <Text style={styles.meta}>Memuat…</Text>
        ) : rows.length === 0 ? (
          <Text style={styles.meta}>
            Belum ada frasa. Tambahkan misalnya anda siapa dengan kategori
            Identitas.
          </Text>
        ) : (
          <>
            <View style={styles.tableHead}>
              <Text style={[styles.th, styles.colPhrase]}>Frasa</Text>
              <Text style={[styles.th, styles.colCategory]}>Kategori</Text>
              <Text style={[styles.th, styles.colReply]}>Jawaban</Text>
              <Text style={[styles.th, styles.colStatus]}>Status</Text>
              {canManage ? (
                <Text style={[styles.th, styles.colAction]}> </Text>
              ) : null}
            </View>
            {rows.map(row => (
              <View key={row.id} style={styles.tableRow}>
                <Text style={[styles.tdStrong, styles.colPhrase]}>
                  {row.phrase}
                </Text>
                <View style={styles.colCategory}>
                  <KolamStatusBadge
                    intent="secondary"
                    label={
                      KOLAM_DARA_TRAINING_PHRASE_CATEGORY_LABELS[row.category] ??
                      row.category
                    }
                  />
                </View>
                <Text style={[styles.tdMuted, styles.colReply]} numberOfLines={2}>
                  {row.customReply.trim() || '— template kategori —'}
                </Text>
                <View style={styles.colStatus}>
                  <KolamStatusBadge
                    intent={row.enabled ? 'success' : 'secondary'}
                    label={row.enabled ? 'Aktif' : 'Nonaktif'}
                  />
                </View>
                {canManage ? (
                  <View style={styles.colAction}>
                    <KolamEditButton
                      intent="plain"
                      onPress={() => openEdit(row)}
                      size="sm"
                    />
                    <KolamButton
                      intent="plain"
                      label="Hapus"
                      onPress={() => onDelete(row)}
                      size="sm"
                    />
                  </View>
                ) : null}
              </View>
            ))}
          </>
        )}
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        transparent
        visible={open}>
        <View style={styles.modalRoot}>
          <KolamModalBackdrop
            onPress={() => {
              if (!saving) {
                setOpen(false);
              }
            }}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editing ? 'Edit frasa' : 'Tambah frasa'}
            </Text>
            <Text style={styles.meta}>
              Frasa dicocokkan setelah normalisasi (huruf kecil, tanpa tanda baca
              di akhir).
            </Text>
            <KolamDetailScrollSurface contentContainerStyle={styles.form}>
              <Field
                label="Frasa pelanggan"
                onChangeText={setPhrase}
                placeholder={
                  category === 'payment_hint'
                    ? 'contoh: sudah transfer'
                    : 'contoh: anda siapa'
                }
                value={phrase}
              />
              <KolamDropdownSelect
                label="Kategori"
                onChange={value =>
                  setCategory(value as KolamDaraTrainingPhraseCategory)
                }
                options={KOLAM_DARA_TRAINING_REPLY_CATEGORIES.map(id => ({
                  label: KOLAM_DARA_TRAINING_PHRASE_CATEGORY_LABELS[id],
                  value: id,
                }))}
                showLabelInTrigger={false}
                value={category}
              />
              <Field
                label={replyLabel}
                multiline
                onChangeText={setCustomReply}
                placeholder={
                  category === 'payment_hint'
                    ? 'contoh: Boleh kirim bukti transfer ya kak'
                    : 'Kosongkan untuk pakai template kategori'
                }
                value={customReply}
              />
              <Field
                keyboardType="numeric"
                label="Prioritas"
                onChangeText={setPriority}
                value={priority}
              />
              <Text style={styles.fieldHint}>
                Lebih tinggi = dicek lebih dulu
              </Text>
              <View style={styles.switchRow}>
                <Text style={styles.fieldLabel}>Aktif</Text>
                <KolamSwitch
                  accessibilityLabel="Aktif"
                  active={enabled}
                  onPress={() => setEnabled(current => !current)}
                />
              </View>
              <Field
                label="Catatan internal"
                onChangeText={setNotes}
                value={notes}
              />
            </KolamDetailScrollSurface>
            <View style={styles.modalFooter}>
              <KolamButton
                disabled={saving}
                intent="secondary"
                label="Batal"
                onPress={() => setOpen(false)}
                size="sm"
              />
              <KolamButton
                disabled={saving}
                label={saving ? 'Menyimpan…' : 'Simpan'}
                onPress={() => {
                  void onSave();
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

function Field({
  keyboardType,
  label,
  multiline,
  onChangeText,
  placeholder,
  value,
}: {
  keyboardType?: 'numeric';
  label: string;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={V.colors.mutedFg}
        style={[styles.input, multiline ? styles.inputMultiline : null]}
        value={value}
      />
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
  cardHead: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  headCopy: {
    flex: 1,
    flexShrink: 1,
    gap: 4,
    minWidth: 180,
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
  colPhrase: {flex: 1.4, minWidth: 100},
  colCategory: {flex: 1.2, minWidth: 96},
  colReply: {flex: 1.6, minWidth: 120},
  colStatus: {flex: 0.8, minWidth: 72},
  colAction: {
    alignItems: 'flex-end',
    flex: 0.9,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'flex-end',
    minWidth: 88,
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
    padding: 16,
    width: '100%',
    zIndex: 1,
  },
  modalTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '700',
  },
  form: {gap: 10, paddingBottom: 4},
  field: {gap: 4},
  fieldLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  fieldHint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    marginTop: -6,
  },
  input: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  inputMultiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  modalFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
});
