import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getKolamFinanceExpenseRoot } from '../domain/kolam-finance-expense';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamRoutineExpenseFormController,
  type KolamRoutineExpenseFormController,
} from '../hooks/use-kolam-routine-expense-form-controller';
import { formatRupiah } from '../lib/money';
import { KolamButton } from './kolam-button';
import {KolamCancelButton} from './kolam-cancel-button';
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

export function KolamRoutineExpenseFormSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamRoutineExpenseFormController(route, onRouteChange);

  if (!controller) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState title="Belum tersedia" />
        {onRouteChange ? (
          <KolamButton
            intent="secondary"
            label="Kembali"
            onPress={() =>
              onRouteChange(getKolamFinanceExpenseRoot('routine-expense'))
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
        <KolamEmptyState message="Memuat…" title="Pengeluaran Rutin" />
      </View>
    );
  }

  return <RoutineExpenseFormBody controller={controller} />;
}

function RoutineExpenseFormBody({
  controller,
}: {
  controller: KolamRoutineExpenseFormController;
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
        <Text style={styles.headerTitle}>Pengeluaran Rutin Baru</Text>
        <View style={styles.headerActions}>
          <KolamCancelButton
            disabled={controller.submitting}
            intent="secondary"
            onPress={controller.onCancel}
          />
          <KolamButton
            disabled={!controller.canSubmit}
            intent="primary"
            label={
              controller.submitting ? 'Membuat…' : 'Buat Pengeluaran Rutin'
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
                text: 'Informasi Dasar',
                style: styles.sectionTitle,
              },
              {
                id: 'hint',
                text: 'Masukkan detail pengeluaran rutin. Tersimpan menunggu verifikasi sebelum saldo dompet berkurang.',
                style: styles.sectionHint,
              },
            ]}
          />
          <KolamContentFrame variant="nativeFormControls">
            <View style={settingsWebFormStyles.settingsWebFormFields}>
              <View style={settingsWebFormStyles.settingsWebFormField}>
                <KolamSettingsWebFieldLabel label="Nama Pengeluaran" required />
                <KolamFormTextField
                  onChangeText={value =>
                    controller.onChangeForm({ name: value })
                  }
                  placeholder="mis. Gaji Karyawan, Tagihan Listrik, Sewa Kantor"
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
                <KolamSettingsWebFieldLabel label="Catatan" />
                <KolamFormTextField
                  multiline
                  onChangeText={value =>
                    controller.onChangeForm({ note: value })
                  }
                  placeholder="mis. Gaji bulan Juli 2024, tagihan PLN kantor pusat, dll."
                  value={form.note}
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
