import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { KOLAM_PAYABLE_ROOT } from '../domain/kolam-payable';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamPayableFormController,
  type KolamPayableFormController,
} from '../hooks/use-kolam-payable-form-controller';
import { formatRupiah } from '../lib/money';
import { KolamButton } from './kolam-button';
import {KolamCancelButton} from './kolam-cancel-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamDateField } from './kolam-date-field';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import {KolamNotesField} from './kolam-notes-field';
import {KolamSaveButton} from './kolam-save-button';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';

export function KolamPayableFormSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamPayableFormController(route, onRouteChange);

  if (!controller) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState title="Belum tersedia" />
        {onRouteChange ? (
          <KolamButton
            intent="secondary"
            label="Kembali"
            onPress={() => onRouteChange(KOLAM_PAYABLE_ROOT)}
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
        <KolamEmptyState message="Memuat..." title="Hutang Baru" />
      </View>
    );
  }

  return <PayableFormBody controller={controller} />;
}

function PayableFormBody({
  controller,
}: {
  controller: KolamPayableFormController;
}) {
  const { form } = controller;
  const walletOptions = useMemo(
    () =>
      controller.wallets.map(wallet => ({
        label: `${wallet.name} - ${formatRupiah(wallet.currentBalance)}`,
        value: wallet.id,
      })),
    [controller.wallets],
  );
  const selectedWallet = controller.wallets.find(
    wallet => wallet.id === form.walletId,
  );

  return (
    <View style={styles.surface}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Hutang Baru</Text>
        <View style={styles.headerActions}>
          <KolamCancelButton
            disabled={controller.submitting}
            intent="secondary"
            onPress={controller.onCancel}
          />
          <KolamSaveButton
            disabled={!controller.canSubmit}
            intent="primary"
            label={controller.submitting ? 'Menyimpan...' : 'Catat Hutang'}
            onPress={() => {
              controller.onSubmit().catch(() => undefined);
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
          <Text style={styles.sectionTitle}>Informasi Hutang</Text>
          <KolamContentFrame variant="nativeFormControls">
            <View style={settingsWebFormStyles.settingsWebFormFields}>
              <View style={settingsWebFormStyles.settingsWebFormField}>
                <KolamSettingsWebFieldLabel label="Nama Hutang" required />
                <KolamFormTextField
                  onChangeText={value =>
                    controller.onChangeForm({ name: value })
                  }
                  placeholder="mis. Pinjaman personal"
                  value={form.name}
                />
              </View>

              <View style={settingsWebFormStyles.settingsWebFormField}>
                <KolamSettingsWebFieldLabel label="Jumlah Hutang" required />
                <KolamFormTextField
                  mode="numeric"
                  onChangeText={value =>
                    controller.onChangeForm({ amountText: value })
                  }
                  placeholder="0"
                  value={form.amountText}
                />
              </View>
            </View>
          </KolamContentFrame>
        </KolamContentFrame>

        <KolamContentFrame variant="nativeFormSection">
          <Text style={styles.sectionTitle}>Sumber Pembayaran</Text>
          <KolamContentFrame variant="nativeFormControls">
            <View style={settingsWebFormStyles.settingsWebFormFields}>
              <View style={settingsWebFormStyles.settingsWebFormField}>
                <KolamSettingsWebFieldLabel label="Wallet" required />
                <KolamDropdownSelect
                  label="Wallet"
                  onChange={value =>
                    controller.onChangeForm({ walletId: value })
                  }
                  options={walletOptions}
                  searchable
                  showLabelInTrigger={false}
                  value={form.walletId}
                />
              </View>
              {selectedWallet ? (
                <Text style={styles.walletBalance}>
                  Saldo tersedia: {formatRupiah(selectedWallet.currentBalance)}
                </Text>
              ) : null}
            </View>
          </KolamContentFrame>
        </KolamContentFrame>

        <KolamContentFrame variant="nativeFormSection">
          <Text style={styles.sectionTitle}>Jatuh Tempo</Text>
          <KolamContentFrame variant="nativeFormControls">
            <View style={settingsWebFormStyles.settingsWebFormFields}>
              <View style={settingsWebFormStyles.settingsWebFormField}>
                <KolamSettingsWebFieldLabel label="Jatuh Tempo" required />
                <KolamDateField
                  accessibilityLabel="Jatuh tempo"
                  label="Tanggal"
                  onChange={value =>
                    controller.onChangeForm({ dueDate: value })
                  }
                  showLabelInTrigger={false}
                  value={form.dueDate}
                />
              </View>
            </View>
          </KolamContentFrame>
        </KolamContentFrame>

        <KolamContentFrame variant="nativeFormSection">
          <KolamContentFrame variant="nativeFormControls">
            <View style={settingsWebFormStyles.settingsWebFormFields}>
              <View style={settingsWebFormStyles.settingsWebFormField}>
                <KolamNotesField
                  label="Catatan"
                  onChangeText={value =>
                    controller.onChangeForm({ notes: value })
                  }
                  placeholder="Opsional"
                  value={form.notes}
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
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  walletBalance: {
    color: V.colors.muted,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
});
