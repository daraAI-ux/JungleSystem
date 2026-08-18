import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  createWysiwygSettingsSavePayload,
  mergeWysiwygSettings,
  normalizeWysiwygSettings,
  type WysiwygIntervalUnit,
  type WysiwygPriceMode,
  type WysiwygSettings,
} from '../domain/kolam-wysiwyg';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {getKolamWebSetting, updateKolamWebSetting} from '../services/kolam-api';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamDropdownSelect} from './kolam-dropdown-select';
import {KolamFormTextField} from './kolam-form-text-field';
import {KolamRupiahField} from './kolam-rupiah-field';
import {KolamSaveButton} from './kolam-save-button';
import {KolamToggleRow} from './kolam-toggle-row';

const INTERVAL_OPTIONS: Array<{label: string; value: WysiwygIntervalUnit}> = [
  {label: 'Hari', value: 'day'},
  {label: 'Minggu', value: 'week'},
  {label: 'Bulan', value: 'month'},
];

const PRICE_MODE_OPTIONS: Array<{label: string; value: WysiwygPriceMode}> = [
  {label: 'Persen (%)', value: 'percent'},
  {label: 'Nominal (Rp)', value: 'fixed'},
];

export function KolamSettingsWebWysiwygPanel({
  canManage,
}: {
  canManage: boolean;
}) {
  const [form, setForm] = React.useState<WysiwygSettings>(
    mergeWysiwygSettings(null),
  );
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const setting = await getKolamWebSetting();
      setForm(normalizeWysiwygSettings(setting.wysiwyg));
      setMessage('');
      setError(false);
    } catch {
      setError(true);
      setMessage('Gagal membaca WYSIWYG.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const patch = (partial: Partial<WysiwygSettings>) => {
    setForm(current => ({...current, ...partial}));
  };

  const save = async () => {
    if (!canManage || saving) {
      return;
    }
    setSaving(true);
    setMessage('');
    setError(false);
    try {
      const updated = await updateKolamWebSetting({
        wysiwyg: createWysiwygSettingsSavePayload(form),
      });
      setForm(normalizeWysiwygSettings(updated.wysiwyg));
      setMessage('Pengaturan WYSIWYG disimpan');
    } catch {
      setError(true);
      setMessage('Gagal menyimpan WYSIWYG');
    } finally {
      setSaving(false);
    }
  };

  const disabled = !canManage || loading || saving;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <KolamCopyStack
          containerStyle={styles.headerCopy}
          items={[
            {
              id: 'wysiwyg-title',
              style: styles.title,
              text: 'WYSIWYG',
            },
            {
              id: 'wysiwyg-help',
              style: styles.help,
              text: 'Default untuk spesies/produk yang mengaktifkan WYSIWYG. Unit boleh override. Harga hanya naik setelah foto baru — Skip tidak mengubah harga.',
            },
          ]}
        />
        <KolamSaveButton
          disabled={disabled}
          label="Simpan WYSIWYG"
          loading={saving}
          loadingLabel="Menyimpan..."
          onPress={() => {
            void save();
          }}
        />
      </View>

      <View style={styles.toggleGrid}>
        <View style={styles.toggleCard}>
          <KolamToggleRow
            active={Boolean(form.enabled)}
            description=""
            disabled={disabled}
            label="Aktifkan mesin WYSIWYG"
            onPress={() => !disabled && patch({enabled: !form.enabled})}
            variant="settingsForm"
          />
        </View>
        <View style={styles.toggleCard}>
          <KolamToggleRow
            active={form.notifyEnabled !== false}
            description=""
            disabled={disabled}
            label="Notifikasi due"
            onPress={() =>
              !disabled && patch({notifyEnabled: form.notifyEnabled === false})
            }
            variant="settingsForm"
          />
        </View>
      </View>

      <View style={styles.grid}>
        <View style={[styles.fieldCell, styles.intervalCell]}>
          <KolamFormTextField
            editable={!disabled}
            label="Interval"
            mode="numeric"
            onChangeText={text =>
              patch({intervalValue: Math.max(1, Math.floor(Number(text) || 1))})
            }
            value={String(form.intervalValue ?? 1)}
          />
        </View>
        <View style={styles.fieldCell}>
          <KolamDropdownSelect<WysiwygIntervalUnit>
            accessibilityLabel="Satuan"
            label="Satuan"
            onChange={intervalUnit => {
              if (!disabled) {
                patch({intervalUnit});
              }
            }}
            options={INTERVAL_OPTIONS}
            showLabelInTrigger={false}
            style={styles.dropdown}
            triggerStyle={styles.dropdownTrigger}
            value={form.intervalUnit || 'month'}
          />
        </View>
        <View style={styles.fieldCell}>
          <KolamDropdownSelect<WysiwygPriceMode>
            accessibilityLabel="Naik harga"
            label="Naik harga"
            onChange={priceMode => {
              if (!disabled) {
                patch({priceMode});
              }
            }}
            options={PRICE_MODE_OPTIONS}
            showLabelInTrigger={false}
            style={styles.dropdown}
            triggerStyle={styles.dropdownTrigger}
            value={form.priceMode || 'percent'}
          />
        </View>
        {form.priceMode === 'fixed' ? (
          <View style={styles.amountCell}>
            <Text style={styles.fieldLabel}>Naik (Rp)</Text>
            <KolamRupiahField
              editable={!disabled}
              onChangeValue={priceAmount =>
                patch({priceAmount: Math.max(0, priceAmount || 0)})
              }
              value={form.priceAmount ?? 0}
            />
          </View>
        ) : (
          <View style={styles.amountCell}>
            <KolamFormTextField
              editable={!disabled}
              label="Naik (%)"
              mode="numeric"
              onChangeText={text =>
                patch({priceAmount: Math.max(0, Number(text) || 0)})
              }
              value={String(form.priceAmount ?? 0)}
            />
          </View>
        )}
        <View style={styles.capField}>
          <Text style={styles.fieldLabel}>Plafon (0 = tanpa batas)</Text>
          <KolamRupiahField
            editable={!disabled}
            onChangeValue={priceCap =>
              patch({priceCap: Math.max(0, priceCap || 0)})
            }
            value={form.priceCap ?? 0}
          />
        </View>
      </View>

      {message ? (
        <Text style={error ? styles.errorText : styles.successText}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: V.colors.fg,
    fontSize: 16,
    fontWeight: '800',
  },
  help: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toggleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toggleCard: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 280,
    overflow: 'hidden',
  },
  fieldCell: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 190,
  },
  intervalCell: {
    flexBasis: 96,
    flexGrow: 0,
    minWidth: 96,
  },
  amountCell: {
    flexBasis: 120,
    flexGrow: 0,
    minWidth: 120,
  },
  capField: {
    flexBasis: 240,
    flexGrow: 1,
    minWidth: 240,
  },
  dropdown: {
    minWidth: 190,
  },
  dropdownTrigger: {
    minHeight: 36,
  },
  fieldLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  successText: {
    color: V.colors.success,
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    color: V.colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
});
