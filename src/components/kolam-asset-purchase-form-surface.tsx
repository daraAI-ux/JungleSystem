import React, { useMemo } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  getAssetPurchaseFormTotal,
  getKolamFinanceExpenseRoot,
} from '../domain/kolam-finance-expense';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamAssetPurchaseFormController,
  type KolamAssetPurchaseFormController,
} from '../hooks/use-kolam-asset-purchase-form-controller';
import { getKolamFileUrl } from '../lib/file-url';
import { formatRupiah } from '../lib/money';
import { pickNativeImageFile } from '../services/native-file-picker';
import { KolamButton } from './kolam-button';
import {KolamDeleteButton} from './kolam-delete-button';
import {KolamCancelButton} from './kolam-cancel-button';
import {KolamSaveButton} from './kolam-save-button';
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
import {KolamUploadButton} from './kolam-upload-button';

const PHOTO_MAX = 5;

function FieldShell({
  children,
  label,
  required = false,
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <View style={settingsWebFormStyles.settingsWebFormField}>
      <KolamSettingsWebFieldLabel label={label} required={required} />
      {children}
    </View>
  );
}

function FormSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <KolamContentFrame variant="nativeFormSection">
      <KolamCopyStack
        containerStyle={styles.sectionCopy}
        items={[
          {
            id: 'title',
            text: title,
            style: styles.sectionTitle,
          },
        ]}
      />
      <KolamContentFrame variant="nativeFormControls">
        <View style={settingsWebFormStyles.settingsWebFormFields}>
          {children}
        </View>
      </KolamContentFrame>
    </KolamContentFrame>
  );
}

export function KolamAssetPurchaseFormSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamAssetPurchaseFormController(route, onRouteChange);

  if (!controller) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState title="Belum tersedia" />
        {onRouteChange ? (
          <KolamButton
            intent="secondary"
            label="Kembali"
            onPress={() =>
              onRouteChange(getKolamFinanceExpenseRoot('asset-purchase'))
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
        <KolamEmptyState message="Memuat…" title="Pembelian Aset" />
      </View>
    );
  }

  return <AssetPurchaseFormBody controller={controller} />;
}

function AssetPurchaseFormBody({
  controller,
}: {
  controller: KolamAssetPurchaseFormController;
}) {
  const { form } = controller;
  const total = getAssetPurchaseFormTotal(form);
  const selectedWallet = controller.wallets.find(
    wallet => wallet.id === form.walletId,
  );

  const walletOptions = useMemo(
    () => [
      { label: 'Dompet utama', value: '' },
      ...controller.wallets.map(wallet => ({
        label: `${wallet.name} — ${formatRupiah(wallet.currentBalance)}`,
        value: wallet.id,
      })),
    ],
    [controller.wallets],
  );

  const locationOptions = useMemo(
    () => [
      { label: 'Tanpa lokasi', value: '' },
      ...controller.locations.map(location => ({
        label: location.type
          ? `${location.name} (${location.type})`
          : location.name,
        value: location.id,
      })),
    ],
    [controller.locations],
  );

  const pickPhoto = async () => {
    if (form.photos.length >= PHOTO_MAX || controller.uploadingPhotos) {
      return;
    }
    try {
      const result = await pickNativeImageFile();
      if (result.cancelled || !result.uri) {
        return;
      }
      await controller.onAddPhotos([result.uri]);
    } catch {
      // Native picker may be unavailable outside Windows runtime.
    }
  };

  return (
    <View style={styles.surface}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>
          {controller.mode === 'create'
            ? 'Pembelian Aset Baru'
            : 'Ubah Pembelian Aset'}
        </Text>
        <View style={styles.headerActions}>
          <KolamCancelButton
            disabled={controller.submitting}
            intent="secondary"
            onPress={controller.onCancel}
          />
          <KolamSaveButton
            disabled={!controller.canSubmit}
            label={
              controller.submitting
                ? controller.mode === 'create'
                  ? 'Membuat…'
                  : 'Menyimpan…'
                : controller.mode === 'create'
                  ? 'Buat Pembelian Aset'
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

      <KolamDetailScrollSurface contentContainerStyle={styles.content}>
        <FormSection title="Informasi Aset">
          <FieldShell label="Nama Aset" required>
            <KolamFormTextField
              editable={!controller.submitting}
              onChangeText={name => controller.onChangeForm({ name })}
              placeholder="Nama aset"
              value={form.name}
            />
          </FieldShell>
          <FieldShell label="Nomor Seri">
            <KolamFormTextField
              editable={!controller.submitting}
              onChangeText={series => controller.onChangeForm({ series })}
              placeholder="Nomor seri"
              value={form.series}
            />
          </FieldShell>
          <FieldShell label="Foto">
            <View style={styles.photoBlock}>
              {form.photos.length > 0 ? (
                <View style={styles.photoGrid}>
                  {form.photos.map((path, index) => (
                    <View key={`${path}-${index}`} style={styles.photoItem}>
                      <Image
                        source={{
                          uri: getKolamFileUrl(path) || path,
                        }}
                        style={styles.photoThumb}
                      />
                      <KolamDeleteButton
                        disabled={controller.submitting}
                        intent="secondary"
                        label="Hapus"
                        onPress={() => {
                          void controller.onRemovePhoto(index);
                        }}
                      />
                    </View>
                  ))}
                </View>
              ) : null}
              {form.photos.length < PHOTO_MAX ? (
                <View style={styles.photoActions}>
                  <KolamUploadButton
                    disabled={
                      controller.submitting || controller.uploadingPhotos
                    }
                    label="Unggah Foto"
                    loading={controller.uploadingPhotos}
                    loadingLabel="Mengunggah…"
                    onPress={() => {
                      void pickPhoto();
                    }}
                  />
                  <Text style={styles.metaText}>
                    {form.photos.length}/{PHOTO_MAX}
                  </Text>
                </View>
              ) : null}
            </View>
          </FieldShell>
          <FieldShell label="Spesifikasi">
            <View style={styles.specBlock}>
              {form.customFieldValues.map((field, index) => (
                <View key={`spec-${index}`} style={styles.specRow}>
                  <View style={styles.specField}>
                    <KolamFormTextField
                      editable={!controller.submitting}
                      onChangeText={label =>
                        controller.onUpdateCustomField(index, { label })
                      }
                      placeholder="Label"
                      value={field.label}
                    />
                  </View>
                  <View style={styles.specField}>
                    <KolamFormTextField
                      editable={!controller.submitting}
                      onChangeText={value =>
                        controller.onUpdateCustomField(index, { value })
                      }
                      placeholder="Nilai"
                      value={field.value}
                    />
                  </View>
                  <KolamDeleteButton
                    disabled={controller.submitting}
                    intent="secondary"
                    label="Hapus"
                    onPress={() => controller.onRemoveCustomField(index)}
                  />
                </View>
              ))}
              <KolamButton
                disabled={controller.submitting}
                intent="secondary"
                label="Tambah Spesifikasi"
                onPress={controller.onAddCustomField}
              />
            </View>
          </FieldShell>
        </FormSection>

        <FormSection title="Informasi Harga">
          <FieldShell label="Harga Aset" required>
            <KolamFormTextField
              editable={!controller.submitting}
              keyboardType="numeric"
              onChangeText={priceText =>
                controller.onChangeForm({
                  priceText: sanitizeMoneyText(priceText),
                })
              }
              placeholder="0"
              value={form.priceText}
            />
          </FieldShell>
          <FieldShell label="Biaya Pengiriman">
            <KolamFormTextField
              editable={!controller.submitting}
              keyboardType="numeric"
              onChangeText={shippingCostText =>
                controller.onChangeForm({
                  shippingCostText: sanitizeMoneyText(shippingCostText),
                })
              }
              placeholder="0"
              value={form.shippingCostText}
            />
          </FieldShell>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatRupiah(total)}</Text>
          </View>
        </FormSection>

        <FormSection title="Sumber Pembayaran">
          <FieldShell label="Dompet">
            <KolamDropdownSelect
              label={
                walletOptions.find(option => option.value === form.walletId)
                  ?.label ?? 'Dompet utama'
              }
              onChange={walletId => controller.onChangeForm({ walletId })}
              options={walletOptions}
              searchable
              searchPlaceholder="Cari dompet…"
              showLabelInTrigger={false}
              value={form.walletId}
            />
          </FieldShell>
          {selectedWallet ? (
            <Text style={styles.metaText}>
              Saldo {selectedWallet.name}:{' '}
              {formatRupiah(selectedWallet.currentBalance)}
            </Text>
          ) : null}
        </FormSection>

        <FormSection title="Lokasi">
          <FieldShell label="Lokasi">
            <KolamDropdownSelect
              label={
                locationOptions.find(option => option.value === form.locationId)
                  ?.label ?? 'Tanpa lokasi'
              }
              onChange={locationId => controller.onChangeForm({ locationId })}
              options={locationOptions}
              searchable
              searchPlaceholder="Cari lokasi…"
              showLabelInTrigger={false}
              value={form.locationId}
            />
          </FieldShell>
        </FormSection>

        <FormSection title="Tanggal Eksekusi">
          <FieldShell label="Dieksekusi Pada" required>
            <KolamDateField
              label="Dieksekusi Pada"
              onChange={executedAt => controller.onChangeForm({ executedAt })}
              showLabelInTrigger={false}
              value={form.executedAt}
            />
          </FieldShell>
        </FormSection>

        <FormSection title="Justifikasi Pembelian">
          <FieldShell label="Alasan">
            <KolamFormTextField
              editable={!controller.submitting}
              multiline
              onChangeText={reason => controller.onChangeForm({ reason })}
              placeholder="Alasan pembelian"
              value={form.reason}
            />
          </FieldShell>
        </FormSection>
      </KolamDetailScrollSurface>
    </View>
  );
}

function sanitizeMoneyText(value: string): string {
  return value.replace(/[^\d]/g, '');
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 12,
    padding: 16,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: V.colors.fg,
    fontSize: 18,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  banner: {
    alignSelf: 'stretch',
  },
  content: {
    gap: 16,
    paddingBottom: 32,
  },
  sectionCopy: {
    marginBottom: 8,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '700',
  },
  metaText: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  photoBlock: {
    gap: 8,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoItem: {
    gap: 6,
    width: 112,
  },
  photoThumb: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 96,
    width: 112,
  },
  photoActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  specBlock: {
    gap: 8,
  },
  specRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specField: {
    flexGrow: 1,
    minWidth: 140,
  },
  totalBox: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  totalLabel: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '600',
  },
  totalValue: {
    color: V.colors.danger,
    fontSize: 18,
    fontWeight: '700',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
});
