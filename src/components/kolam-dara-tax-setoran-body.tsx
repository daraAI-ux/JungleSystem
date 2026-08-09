import React, {useCallback, useEffect, useState} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  formatKolamDaraTaxDateId,
  formatKolamDaraTaxIdr,
} from '../domain/kolam-dara-tax';
import {
  KOLAM_DARA_TAX_SETTLEMENT_TYPE_LABEL,
  KOLAM_DARA_TAX_SETTLEMENT_TYPES,
  type KolamDaraTaxSettlement,
  type KolamDaraTaxSettlementType,
} from '../domain/kolam-dara-tax-settlement';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {ApiError} from '../lib/api-error';
import {
  createKolamDaraTaxSettlement,
  listKolamDaraTaxSettlements,
  listKolamDaraTaxSettlementWallets,
  verifyKolamDaraTaxSettlement,
} from '../services/kolam-dara-tax-settlement-api';
import {KolamButton} from './kolam-button';
import {KolamCancelButton} from './kolam-cancel-button';
import {KolamSaveButton} from './kolam-save-button';
import {KolamDetailScrollSurface} from './kolam-detail-scroll-surface';
import {KolamDropdownSelect} from './kolam-dropdown-select';
import {KolamModalBackdrop} from './kolam-modal-backdrop';
import {KolamRupiahField} from './kolam-rupiah-field';
import {KolamStatusBadge} from './kolam-status-badge';

/** FE `TaxSettlementPanel` (tab Setoran / pelunasan). */
export function KolamDaraTaxSetoranBody() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<KolamDaraTaxSettlement[]>([]);
  const [wallets, setWallets] = useState<Array<{id: string; name: string}>>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const [taxType, setTaxType] = useState<KolamDaraTaxSettlementType>('ppn');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [walletId, setWalletId] = useState('');
  const [periodKey, setPeriodKey] = useState('');
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [settlementRows, walletRows] = await Promise.all([
        listKolamDaraTaxSettlements({limit: 50}),
        listKolamDaraTaxSettlementWallets(),
      ]);
      setRows(settlementRows);
      setWallets(walletRows);
      setNotice('');
    } catch (err) {
      setRows([]);
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memuat setoran pajak',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setTaxType('ppn');
    setTitle('');
    setAmount('');
    setWalletId('');
    setPeriodKey('');
    setNote('');
  };

  const submit = async () => {
    const num = Number(amount);
    if (!title.trim() || !walletId || !Number.isFinite(num) || num <= 0) {
      setNotice('Lengkapi judul, wallet, dan jumlah');
      return;
    }
    setSaving(true);
    setNotice('');
    try {
      await createKolamDaraTaxSettlement({
        taxType,
        title: title.trim(),
        amount: num,
        walletId,
        periodKey: periodKey.trim() || undefined,
        note: note.trim() || undefined,
      });
      setNotice('Setoran dibuat — verifikasi untuk debit wallet & R&E');
      setOpen(false);
      resetForm();
      await load();
    } catch (err) {
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal membuat setoran',
      );
    } finally {
      setSaving(false);
    }
  };

  const verify = async (id: string) => {
    setVerifyingId(id);
    setNotice('');
    try {
      await verifyKolamDaraTaxSettlement(id);
      setNotice('Terverifikasi');
      await load();
    } catch (err) {
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal verifikasi',
      );
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <Text style={styles.meta}>
          Catat setoran DJP — debit wallet setelah verifikasi, masuk Finance
          Summary.
        </Text>
        <KolamButton
          label="Setoran baru"
          onPress={() => {
            setNotice('');
            setOpen(true);
          }}
          size="sm"
        />
      </View>
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {loading ? (
        <Text style={styles.meta}>Memuat…</Text>
      ) : rows.length === 0 ? (
        <Text style={styles.meta}>Belum ada setoran.</Text>
      ) : (
        <View style={styles.list}>
          {rows.map(row => (
            <View key={row.id} style={styles.row}>
              <View style={styles.rowMain}>
                <Text style={styles.code}>{row.code || row.id}</Text>
                <KolamStatusBadge
                  intent="secondary"
                  label={
                    KOLAM_DARA_TAX_SETTLEMENT_TYPE_LABEL[row.taxType] ??
                    row.taxType
                  }
                />
              </View>
              <Text style={styles.title}>{row.title}</Text>
              <View style={styles.rowMeta}>
                <Text style={styles.meta}>
                  {formatKolamDaraTaxIdr(row.amount)}
                </Text>
                <Text style={styles.meta}>{row.periodKey || '—'}</Text>
                <KolamStatusBadge
                  intent={row.status === 'verified' ? 'success' : 'warning'}
                  label={row.status}
                />
                <Text style={styles.meta}>
                  {formatKolamDaraTaxDateId(row.executedAt)}
                </Text>
              </View>
              {row.status === 'unverified' ? (
                <KolamButton
                  disabled={verifyingId === row.id}
                  intent="secondary"
                  label={
                    verifyingId === row.id ? 'Memverifikasi…' : 'Verifikasi'
                  }
                  onPress={() => {
                    void verify(row.id);
                  }}
                  size="sm"
                />
              ) : null}
            </View>
          ))}
        </View>
      )}

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
            <Text style={styles.modalTitle}>Setoran pajak baru</Text>
            <Text style={styles.meta}>
              Debit wallet setelah verifikasi. Periode opsional (YYYY-MM).
            </Text>
            <KolamDetailScrollSurface contentContainerStyle={styles.form}>
              <KolamDropdownSelect
                label="Jenis pajak"
                onChange={value =>
                  setTaxType(value as KolamDaraTaxSettlementType)
                }
                options={KOLAM_DARA_TAX_SETTLEMENT_TYPES.map(opt => ({
                  label: opt.label,
                  value: opt.id,
                }))}
                showLabelInTrigger={false}
                value={taxType}
              />
              <Field
                label="Judul"
                onChangeText={setTitle}
                placeholder="Setoran PPN Mei 2026"
                value={title}
              />
              <Field
                currency
                label="Jumlah"
                onChangeText={setAmount}
                value={amount}
              />
              <Field
                label="Periode (YYYY-MM)"
                onChangeText={setPeriodKey}
                placeholder="2026-05"
                value={periodKey}
              />
              <KolamDropdownSelect
                label="Wallet"
                onChange={setWalletId}
                options={[
                  {label: 'Pilih wallet', value: ''},
                  ...wallets.map(w => ({
                    label: w.name,
                    value: w.id,
                  })),
                ]}
                showLabelInTrigger={false}
                value={walletId}
              />
              <Field
                label="Catatan"
                multiline
                onChangeText={setNote}
                value={note}
              />
            </KolamDetailScrollSurface>
            <View style={styles.modalFooter}>
              <KolamCancelButton
                disabled={saving}
                intent="secondary"
                onPress={() => setOpen(false)}
                size="sm"
              />
              <KolamSaveButton
                disabled={saving}
                label={saving ? 'Menyimpan…' : 'Simpan'}
                onPress={() => {
                  void submit();
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
  currency,
  keyboardType,
  label,
  multiline,
  onChangeText,
  placeholder,
  value,
}: {
  currency?: boolean;
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
      {currency ? (
        <KolamRupiahField
          accessibilityLabel={label}
          onChangeValue={nextValue => onChangeText(String(nextValue))}
          placeholder={placeholder}
          value={Number(value) || 0}
        />
      ) : (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
  },
  head: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  meta: {
    color: V.colors.mutedFg,
    flexShrink: 1,
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
  list: {
    gap: 8,
  },
  row: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  rowMain: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  rowMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  code: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
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
  form: {
    gap: 10,
    paddingBottom: 4,
  },
  field: {
    gap: 4,
  },
  fieldLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
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
  modalFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
});
