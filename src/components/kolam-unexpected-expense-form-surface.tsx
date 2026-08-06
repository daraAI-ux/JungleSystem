import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getKolamFinanceExpenseRoot } from '../domain/kolam-finance-expense';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamUnexpectedExpenseFormController,
  type KolamUnexpectedExpenseFormController,
} from '../hooks/use-kolam-unexpected-expense-form-controller';
import { formatRupiah } from '../lib/money';
import { KolamButton } from './kolam-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDateField } from './kolam-date-field';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { KolamStatusBadge } from './kolam-status-badge';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';

export function KolamUnexpectedExpenseFormSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamUnexpectedExpenseFormController(
    route,
    onRouteChange,
  );

  if (!controller) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState title="Belum tersedia" />
        {onRouteChange ? (
          <KolamButton
            intent="secondary"
            label="Kembali"
            onPress={() =>
              onRouteChange(getKolamFinanceExpenseRoot('unexpected-expense'))
            }
            style={styles.backButton}
          />
        ) : null}
      </View>
    );
  }

  if (controller.error === 'Akses ditolak' && !controller.canSubmit) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState title="Akses ditolak" />
        <KolamButton
          intent="secondary"
          label="Kembali"
          onPress={controller.onCancel}
          style={styles.backButton}
        />
      </View>
    );
  }

  if (controller.loading) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState message="Memuat…" title="Pengeluaran Tak Terduga" />
      </View>
    );
  }

  return <UnexpectedExpenseFormBody controller={controller} />;
}

function UnexpectedExpenseFormBody({
  controller,
}: {
  controller: KolamUnexpectedExpenseFormController;
}) {
  const { form } = controller;

  const walletOptions = useMemo(
    () => [
      { label: 'Dompet utama (default)', value: '' },
      ...controller.wallets.map(wallet => ({
        label: `${wallet.name} — ${formatRupiah(wallet.currentBalance)}`,
        value: wallet.id,
      })),
    ],
    [controller.wallets],
  );

  return (
    <View style={styles.surface}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>
          {controller.mode === 'create'
            ? 'Pengeluaran Tak Terduga Baru'
            : 'Ubah Pengeluaran Tak Terduga'}
        </Text>
        <View style={styles.headerActions}>
          <KolamButton
            disabled={controller.submitting}
            intent="secondary"
            label="Batal"
            onPress={controller.onCancel}
          />
          <KolamButton
            disabled={!controller.canSubmit}
            intent="primary"
            label={
              controller.submitting
                ? controller.mode === 'create'
                  ? 'Menyimpan…'
                  : 'Menyimpan…'
                : 'Simpan'
            }
            onPress={() => {
              void controller.onSubmit();
            }}
          />
        </View>
      </View>

      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
          style={styles.banner}
        />
      ) : null}

      <KolamDetailScrollSurface contentContainerStyle={styles.formScroll}>
        <KolamContentFrame variant="nativeFormSection">
          <KolamCopyStack
            containerStyle={styles.sectionCopy}
            items={[
              {
                id: 'title',
                text: 'Data Pengeluaran',
                style: styles.sectionTitle,
              },
              {
                id: 'hint',
                text:
                  controller.mode === 'create'
                    ? 'Pengeluaran tersimpan menunggu verifikasi sebelum saldo dompet berkurang.'
                    : 'Perubahan jumlah/dompet memengaruhi transaksi wallet terkait.',
                style: styles.sectionHint,
              },
            ]}
          />
          <KolamContentFrame variant="nativeFormControls">
            <View style={settingsWebFormStyles.settingsWebFormFields}>
              <View style={settingsWebFormStyles.settingsWebFormField}>
                <KolamSettingsWebFieldLabel label="Nama / Catatan" />
                <KolamFormTextField
                  onChangeText={value =>
                    controller.onChangeForm({ name: value })
                  }
                  placeholder="Opsional (mis. Belanja darurat)"
                  value={form.name}
                />
              </View>

              <View style={settingsWebFormStyles.settingsWebFormField}>
                <KolamSettingsWebFieldLabel label="Jumlah (Rp)" required />
                <KolamFormTextField
                  mode="numeric"
                  onChangeText={value =>
                    controller.onChangeForm({ amountText: value })
                  }
                  placeholder="0"
                  value={form.amountText}
                />
              </View>

              <View style={settingsWebFormStyles.settingsWebFormField}>
                <KolamSettingsWebFieldLabel label="Dompet" />
                <KolamDropdownSelect
                  label="Dompet"
                  onChange={value =>
                    controller.onChangeForm({ walletId: value })
                  }
                  options={walletOptions}
                  searchable
                  showLabelInTrigger={false}
                  value={form.walletId}
                />
              </View>

              <View style={settingsWebFormStyles.settingsWebFormField}>
                <KolamSettingsWebFieldLabel label="Tanggal Eksekusi" required />
                <KolamDateField
                  accessibilityLabel="Tanggal eksekusi"
                  label="Tanggal"
                  onChange={value =>
                    controller.onChangeForm({ executedAt: value })
                  }
                  showLabelInTrigger={false}
                  value={form.executedAt}
                />
              </View>

              <View style={settingsWebFormStyles.settingsWebFormField}>
                <KolamSettingsWebFieldLabel label="Alasan" />
                <KolamFormTextField
                  multiline
                  onChangeText={value =>
                    controller.onChangeForm({ reason: value })
                  }
                  placeholder="Opsional"
                  value={form.reason}
                />
              </View>
            </View>
          </KolamContentFrame>
        </KolamContentFrame>
      </KolamDetailScrollSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 10,
    minHeight: 0,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  banner: {
    alignSelf: 'stretch',
  },
  formScroll: {
    gap: 12,
    paddingBottom: 24,
  },
  sectionCopy: {
    gap: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
});
