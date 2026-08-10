import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  estimateKolamSourceCostOnAmount,
  formatKolamSourceCostField,
  formatKolamSourceUserDisplayName,
  getKolamSourceCommissionModeLabel,
  getKolamSourcePricingMode,
  getKolamSourceStatusLabel,
  getKolamSourceTypeLabel,
  KOLAM_SOURCE_COMMISSION_MODE_OPTIONS,
  KOLAM_SOURCE_ROOT,
  KOLAM_SOURCE_TYPE_OPTIONS,
  type KolamSource,
  type KolamSourceCostField,
  type KolamSourceCostFieldType,
} from '../domain/kolam-source';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { formatRupiah } from '../lib/money';
import { pickNativeImageFile } from '../services/native-file-picker';
import {
  useKolamSourceController,
  type KolamSourceController,
} from '../hooks/use-kolam-source-controller';
import { KolamButton } from './kolam-button';
import {KolamDeleteButton} from './kolam-delete-button';
import {KolamCancelButton} from './kolam-cancel-button';
import {KolamSaveButton} from './kolam-save-button';
import {KolamDaftarButton} from './kolam-daftar-button';
import {KolamEditButton} from './kolam-edit-button';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import { KolamDetailSummaryCard } from './kolam-detail-summary-card';
import { KolamDescriptionList } from './kolam-description-list';
import {
  KolamDropdownSelect,
  KolamTableRowActionMenu,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamRupiahField } from './kolam-rupiah-field';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamSearchField } from './kolam-search-field';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamSwitch } from './kolam-switch';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

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

function descRow(
  id: string,
  label: string,
  value: string,
): {
  id: string;
  label: string;
  meta: string;
  tone: 'default';
  value: string;
} {
  return { id, label, meta: '', tone: 'default', value };
}

function SourceFormSection({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <KolamContentFrame variant="nativeFormSection">
      <KolamCopyStack
        containerStyle={styles.sectionCopy}
        items={[
          { id: 'title', text: title, style: styles.sectionTitle },
          ...(description
            ? [
                {
                  id: 'description',
                  text: description,
                  style: styles.sectionDescription,
                },
              ]
            : []),
        ]}
      />
      <KolamContentFrame variant="nativeFormControls">{children}</KolamContentFrame>
    </KolamContentFrame>
  );
}

export function KolamSourceSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamSourceController(route);

  return (
    <KolamSourceShell controller={controller} onRouteChange={onRouteChange}>
      {controller.mode === 'list' ? (
        <KolamSourceList controller={controller} onRouteChange={onRouteChange} />
      ) : controller.isEditable ? (
        <KolamSourceForm controller={controller} onRouteChange={onRouteChange} />
      ) : (
        <KolamSourceDetail controller={controller} onRouteChange={onRouteChange} />
      )}
    </KolamSourceShell>
  );
}

function KolamSourceShell({
  children,
  controller,
  onRouteChange,
}: {
  children: React.ReactNode;
  controller: KolamSourceController;
  onRouteChange?: (route: string) => void;
}) {
  if (controller.mode === 'list') {
    return (
      <View style={styles.surface}>
        {controller.error ? (
          <KolamStatusBadge
            intent="danger"
            label={controller.error}
            numberOfLines={3}
            style={styles.errorBadge}
          />
        ) : null}
        {children}
      </View>
    );
  }

  const contextLabel =
    controller.mode === 'new'
      ? 'Sumber penjualan baru'
      : controller.mode === 'edit'
        ? `Ubah · ${controller.selectedSource?.name || controller.form.name || 'Sumber'}`
        : controller.selectedSource?.name || 'Detail sumber penjualan';
  const renderDetailToolbarActions = () => (
    <>
      <KolamDaftarButton
        onPress={() => {
          controller.onBackToList();
          onRouteChange?.(KOLAM_SOURCE_ROOT);
        }}
      />
      <KolamEditButton
        intent="primary"
        onPress={() => {
          controller.onEdit();
          if (controller.selectedSource) {
            onRouteChange?.(
              `${KOLAM_SOURCE_ROOT}/${controller.selectedSource.id}/edit`,
            );
          }
        }}
      />
    </>
  );

  const renderFormToolbarActions = () => (
    <>
      <KolamSaveButton
        disabled={controller.saving}
        label={controller.saving ? 'Menyimpan...' : 'Simpan'}
        onPress={() => {
          void controller.onSave().then(id => {
            if (id) {
              onRouteChange?.(`${KOLAM_SOURCE_ROOT}/${id}`);
            }
          });
        }}
      />
      <KolamCancelButton
        onPress={() => {
          if (controller.mode === 'edit' && controller.selectedSource) {
            onRouteChange?.(
              `${KOLAM_SOURCE_ROOT}/${controller.selectedSource.id}`,
            );
            void controller.onSelectSource(controller.selectedSource);
            return;
          }
          controller.onBackToList();
          onRouteChange?.(KOLAM_SOURCE_ROOT);
        }}
      />
    </>
  );

  return (
    <View style={styles.surface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            {controller.mode === 'new' || controller.mode === 'detail' ? null : (
              <Text numberOfLines={1} style={styles.detailToolbarContext}>
                {contextLabel}
              </Text>
            )}
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            {controller.mode === 'detail'
              ? renderDetailToolbarActions()
              : renderFormToolbarActions()}
          </View>
        </View>
      </View>
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
          style={styles.errorBadge}
        />
      ) : null}
      {children}
    </View>
  );
}

function KolamSourceList({
  controller,
  onRouteChange,
}: {
  controller: KolamSourceController;
  onRouteChange?: (route: string) => void;
}) {
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamSource | null>(null);
  const columns = React.useMemo(
    () => buildSourceListColumns({ controller, onRouteChange }),
    [controller, onRouteChange],
  );

  return (
    <View style={styles.stack}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <KolamSearchField
              containerStyle={kolamTableToolbarStyles.searchInput}
              onChangeText={controller.onSearchChange}
              placeholder="Cari sumber..."
              value={controller.search}
            />
            {controller.search ? (
              <KolamButton
                label="Bersihkan"
                onPress={() => controller.onSearchChange('')}
              />
            ) : null}
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              intent="primary"
              label="Baru"
              tone="positive"
              onPress={() => {
                controller.onCreateNew();
                onRouteChange?.(`${KOLAM_SOURCE_ROOT}/create`);
              }}
            />
          </View>
        </View>
      </View>

      <KolamListTableComposition
        actionsColumn
        columns={columns}
        emptyTitle={
          controller.loading ? 'Memuat sumber...' : 'Sumber penjualan kosong'
        }
        getRowKey={source => source.id}
        loading={controller.loading}
        pagination={{
          onPageChange: controller.onSetPage,
          page: controller.page,
          pageSize: controller.pageSize,
          total: controller.total,
        }}
        renderActions={source => (
          <KolamSourceActionsMenu
            controller={controller}
            onDelete={() => setDeleteCandidate(source)}
            onRouteChange={onRouteChange}
            source={source}
          />
        )}
        rows={controller.sources}
      />

      <KolamDeleteConfirmDialog
        itemLabel={deleteCandidate?.name}
        itemType="sumber penjualan"
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          const candidate = deleteCandidate;
          setDeleteCandidate(null);
          if (!candidate) {
            return;
          }
          void controller.onDeleteSource(candidate).then(ok => {
            if (ok) {
              onRouteChange?.(KOLAM_SOURCE_ROOT);
            }
          });
        }}
        visible={Boolean(deleteCandidate)}
      />
    </View>
  );
}

function buildSourceListColumns({
  controller,
  onRouteChange,
}: {
  controller: KolamSourceController;
  onRouteChange?: (route: string) => void;
}): Array<KolamListTableColumn<KolamSource>> {
  return [
    {
      flex: 1.18,
      id: 'name',
      label: 'Nama',
      render: source => (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void controller.onSelectSource(source).then(() => {
              onRouteChange?.(`${KOLAM_SOURCE_ROOT}/${source.id}`);
            });
          }}
          style={styles.identityCell}
        >
          <Text numberOfLines={1} style={styles.primaryText}>
            {source.name}
          </Text>
          {source.description ? (
            <Text numberOfLines={1} style={styles.metaText}>
              {source.description}
            </Text>
          ) : null}
        </Pressable>
      ),
    },
    {
      align: 'center',
      flex: 0.48,
      id: 'logo',
      label: 'Logo',
      render: source =>
        source.logoUri ? (
          <KolamRemoteImage
            accessibilityLabel={`Logo ${source.name}`}
            resizeMode="contain"
            sourceUri={source.logoUri}
            style={styles.listLogo}
          />
        ) : (
          <Text style={styles.metaText}>-</Text>
        ),
    },
    {
      align: 'center',
      flex: 0.64,
      id: 'type',
      label: 'Tipe',
      render: source => (
        <KolamStatusBadge
          intent={source.type === 'online' ? 'info' : 'secondary'}
          label={getKolamSourceTypeLabel(source.type)}
        />
      ),
    },
    {
      align: 'center',
      flex: 0.86,
      id: 'wallet',
      label: 'Dompet',
      render: source => (
        <Text numberOfLines={1} style={styles.cellText}>
          {source.wallet?.name || '-'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 1,
      id: 'costFields',
      label: 'Field Biaya',
      render: source => (
        <Text numberOfLines={2} style={styles.metaText}>
          {source.costFields.length
            ? source.costFields.map(field => formatKolamSourceCostField(field)).join(' · ')
            : '-'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.72,
      id: 'status',
      label: 'Status',
      render: source => (
        <View style={styles.statusCell}>
          <KolamSwitch
            active={source.isActive}
            disabled={controller.saving}
            onPress={() => {
              void controller.onToggleActive(source, !source.isActive);
            }}
          />
          <Text style={styles.metaText}>
            {getKolamSourceStatusLabel(source.isActive)}
          </Text>
        </View>
      ),
    },
  ];
}

function KolamSourceActionsMenu({
  controller,
  onDelete,
  onRouteChange,
  source,
}: {
  controller: KolamSourceController;
  onDelete: () => void;
  onRouteChange?: (route: string) => void;
  source: KolamSource;
}) {
  return (
    <KolamTableRowActionMenu
      accessibilityLabel={`Menu ${source.name}`}
      actions={[
        {
          label: 'Lihat',
          onPress: () => {
            void controller.onSelectSource(source).then(() => {
              onRouteChange?.(`${KOLAM_SOURCE_ROOT}/${source.id}`);
            });
          },
        },
        {
          label: 'Ubah',
          onPress: () => {
            void controller.onSelectSource(source).then(() => {
              controller.onEdit();
              onRouteChange?.(`${KOLAM_SOURCE_ROOT}/${source.id}/edit`);
            });
          },
        },
        { label: 'Hapus', onPress: onDelete, tone: 'danger' },
      ]}
    />
  );
}

function KolamSourceDetail({
  controller,
  onRouteChange,
}: {
  controller: KolamSourceController;
  onRouteChange?: (route: string) => void;
}) {
  const source = controller.selectedSource;
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  if (!source) {
    return (
      <KolamEmptyState
        message="Sumber penjualan tidak ditemukan."
        title="Tidak ada data"
      />
    );
  }

  const pricing = getKolamSourcePricingMode(source);
  const sampleFee = estimateKolamSourceCostOnAmount(
    source.costFields,
    100_000,
  );

  return (
    <KolamDetailScrollSurface contentContainerStyle={styles.detailContent}>
      <KolamDetailSummaryCard
        body={
          source.description ? (
            <Text style={styles.metaText}>{source.description}</Text>
          ) : undefined
        }
        bodyTitle={source.description ? 'Deskripsi' : undefined}
        description="Identitas, harga, dompet, komisi, dan markup."
        fieldColumns={2}
        fields={[
          {
            id: 'status',
            label: 'Status',
            value: (
              <KolamStatusBadge
                intent={source.isActive ? 'success' : 'danger'}
                label={getKolamSourceStatusLabel(source.isActive)}
              />
            ),
          },
          {
            id: 'type',
            label: 'Tipe',
            value: (
              <KolamStatusBadge
                intent={source.type === 'online' ? 'info' : 'secondary'}
                label={getKolamSourceTypeLabel(source.type)}
              />
            ),
          },
          {
            id: 'marketplace',
            label: 'Marketplace',
            value: source.isMarketplace ? (
              <KolamStatusBadge intent="warning" label="Marketplace" />
            ) : (
              'Tidak'
            ),
          },
          {
            id: 'pricing',
            label: 'Mode harga',
            value: `${pricing.label}\n${pricing.detail}`,
          },
          {
            id: 'wallet',
            label: 'Dompet tujuan',
            value: source.wallet
              ? `${source.wallet.name} (${source.wallet.type})`
              : '-',
          },
          {
            id: 'commission',
            label: 'Komisi penjualan',
            value: getKolamSourceCommissionModeLabel(source),
          },
          {
            id: 'markup-percent',
            label: 'Markup persen',
            value: `${source.markupPercent}%`,
          },
          {
            id: 'markup-fixed',
            label: 'Markup tetap',
            value: formatRupiah(source.markupFixed),
          },
          {
            id: 'created',
            label: 'Dibuat',
            value: [
              source.createdAt || '-',
              source.createdByLabel ? `oleh ${source.createdByLabel}` : '',
            ]
              .filter(Boolean)
              .join(' '),
          },
          {
            id: 'updated',
            label: 'Diperbarui',
            value: [
              source.updatedAt || '-',
              source.updatedByLabel ? `oleh ${source.updatedByLabel}` : '',
            ]
              .filter(Boolean)
              .join(' '),
          },
        ]}
        leading={
          source.logoUri ? (
            <KolamRemoteImage
              accessibilityLabel={`Logo ${source.name}`}
              resizeMode="contain"
              sourceUri={source.logoUri}
              style={styles.detailLogo}
            />
          ) : (
            <View style={styles.detailLogoPlaceholder}>
              <Text style={styles.metaText}>Tanpa logo</Text>
            </View>
          )
        }
        leadingStyle={styles.sourceSummaryLeadingSlot}
        sections={[
          {
            id: 'cost-fields',
            title: 'Field Biaya',
            content: source.costFields.length ? (
              <KolamDescriptionList
                accessibilityLabel="Field biaya sumber"
                rows={[
                  ...source.costFields.map((field, index) =>
                    descRow(
                      `fee-${index}`,
                      field.name,
                      field.type === 'percentage'
                        ? `${field.value}%`
                        : formatRupiah(field.value),
                    ),
                  ),
                  descRow(
                    'sample',
                    'Estimasi potongan (Rp 100.000)',
                    formatRupiah(sampleFee),
                  ),
                ]}
              />
            ) : (
              <Text style={styles.metaText}>Belum ada field biaya.</Text>
            ),
          },
        ]}
        style={styles.sourceSummaryCard}
        title={source.name}
      />

      <View style={styles.detailActions}>
        <KolamDeleteButton
          intent="danger"
          label="Hapus"
          onPress={() => setDeleteOpen(true)}
        />
      </View>

      <KolamDeleteConfirmDialog
        itemLabel={source.name}
        itemType="sumber penjualan"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          void controller.onDeleteSource(source).then(ok => {
            if (ok) {
              setDeleteOpen(false);
              onRouteChange?.(KOLAM_SOURCE_ROOT);
            }
          });
        }}
        visible={deleteOpen}
      />
    </KolamDetailScrollSurface>
  );
}

function KolamSourceForm({
  controller,
  onRouteChange,
}: {
  controller: KolamSourceController;
  onRouteChange?: (route: string) => void;
}) {
  const { form } = controller;
  const previewUri =
    form.pendingLogoLocalUri || controller.selectedSource?.logoUri;

  const handlePickLogo = async () => {
    try {
      const picked = await pickNativeImageFile();
      if (picked.cancelled) {
        return;
      }
      const localUri = picked.uri ?? picked.path ?? '';
      if (!localUri) {
        return;
      }
      await controller.onUploadLogo(localUri);
    } catch {
      // Picker/runtime errors are rare; API errors surface via controller.error.
    }
  };

  const addCostField = () => {
    controller.onChangeForm({
      costFields: [
        ...form.costFields,
        { name: '', type: 'percentage', value: 0 },
      ],
    });
  };

  const updateCostField = (
    index: number,
    patch: Partial<KolamSourceCostField>,
  ) => {
    controller.onChangeForm({
      costFields: form.costFields.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, ...patch } : field,
      ),
    });
  };

  const removeCostField = (index: number) => {
    controller.onChangeForm({
      costFields: form.costFields.filter((_, fieldIndex) => fieldIndex !== index),
    });
  };

  const toggleRecipient = (userId: string) => {
    const exists = form.defaultCommissionRecipientIds.includes(userId);
    controller.onChangeForm({
      defaultCommissionRecipientIds: exists
        ? form.defaultCommissionRecipientIds.filter(id => id !== userId)
        : [...form.defaultCommissionRecipientIds, userId],
    });
  };

  return (
    <KolamDetailScrollSurface contentContainerStyle={styles.detailContent}>
      <SourceFormSection
        description="Nama, tipe saluran, status, dan flag marketplace."
        title="Informasi Dasar"
      >
        <FieldShell label="Nama" required>
          <KolamFormTextField
            onChangeText={value => controller.onChangeForm({ name: value })}
            placeholder="Contoh: Shopee, Tokopedia, POS"
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={form.name}
          />
        </FieldShell>
        <KolamDropdownSelect
          label="Tipe"
          onChange={value =>
            controller.onChangeForm({
              type: value as 'online' | 'offline',
            })
          }
          options={KOLAM_SOURCE_TYPE_OPTIONS.map(option => ({
            label: option.label,
            value: option.id,
          }))}
          value={form.type}
        />
        <FieldShell label="Deskripsi">
          <KolamFormTextField
            multiline
            onChangeText={value =>
              controller.onChangeForm({ description: value })
            }
            placeholder="Opsional"
            style={[
              settingsWebFormStyles.settingsWebFormFieldValue,
              settingsWebFormStyles.settingsWebFormFieldValueTextarea,
            ]}
            value={form.description}
          />
        </FieldShell>
        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.primaryText}>Aktif</Text>
            <Text style={styles.metaText}>
              Sumber nonaktif tidak muncul di picker penjualan.
            </Text>
          </View>
          <KolamSwitch
            active={form.isActive}
            onPress={() =>
              controller.onChangeForm({ isActive: !form.isActive })
            }
          />
        </View>
        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.primaryText}>Marketplace / olshop</Text>
            <Text style={styles.metaText}>
              Wajib pilih dompet escrow. Komisi dipaksa bagi rata semua karyawan.
            </Text>
          </View>
          <KolamSwitch
            active={form.isMarketplace}
            onPress={() =>
              controller.onChangeForm({ isMarketplace: !form.isMarketplace })
            }
          />
        </View>
        {form.isMarketplace || form.walletId ? (
          <KolamDropdownSelect
            label={form.isMarketplace ? 'Dompet (wajib)' : 'Dompet'}
            onChange={value =>
              controller.onChangeForm({
                walletId: value === '' ? null : value,
              })
            }
            options={[
              { label: '— Tidak ada —', value: '' },
              ...controller.wallets.map(wallet => ({
                label: `${wallet.name} (${wallet.type})`,
                value: wallet.id,
              })),
            ]}
            value={form.walletId ?? ''}
          />
        ) : null}
      </SourceFormSection>

      <SourceFormSection
        description="Atur apakah sale dari sumber ini men-accrue komisi karyawan."
        title="Komisi penjualan"
      >
        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.primaryText}>Komisi aktif</Text>
            <Text style={styles.metaText}>
              Matikan agar sale eligible tidak accrue komisi.
            </Text>
          </View>
          <KolamSwitch
            active={form.commissionEnabled}
            onPress={() =>
              controller.onChangeForm({
                commissionEnabled: !form.commissionEnabled,
              })
            }
          />
        </View>
        {form.commissionEnabled ? (
          form.isMarketplace ? (
            <Text style={styles.metaText}>
              Olshop / marketplace: pembagian tetap bagi rata semua karyawan
              eligible.
            </Text>
          ) : (
            <>
              <KolamDropdownSelect
                label="Pembagian penerima komisi"
                onChange={value =>
                  controller.onChangeForm({
                    commissionRecipientMode:
                      value as typeof form.commissionRecipientMode,
                  })
                }
                options={KOLAM_SOURCE_COMMISSION_MODE_OPTIONS.map(option => ({
                  label: option.label,
                  value: option.id,
                }))}
                value={form.commissionRecipientMode}
              />
              {form.commissionRecipientMode === 'selected_users' ? (
                <View style={styles.recipientList}>
                  {controller.eligibleUsers.length === 0 ? (
                    <Text style={styles.metaText}>
                      Tidak ada user eligible komisi.
                    </Text>
                  ) : (
                    controller.eligibleUsers.map(user => {
                      const selected =
                        form.defaultCommissionRecipientIds.includes(user.id);
                      return (
                        <KolamInteractionFrame
                          key={user.id}
                          onPress={() => toggleRecipient(user.id)}
                          style={[
                            styles.recipientRow,
                            selected && styles.recipientRowSelected,
                          ]}
                        >
                          <Text style={styles.primaryText}>
                            {user.displayName ||
                              formatKolamSourceUserDisplayName({
                                firstName: user.firstName,
                                lastName: user.lastName,
                                username: user.username,
                                email: user.email,
                              })}
                          </Text>
                          <Text style={styles.metaText}>
                            {user.isOwner
                              ? 'Pemilik'
                              : user.isEmployee
                                ? 'Staf'
                                : ''}
                          </Text>
                        </KolamInteractionFrame>
                      );
                    })
                  )}
                </View>
              ) : null}
            </>
          )
        ) : null}
      </SourceFormSection>

      <SourceFormSection
        description="Logo kotak untuk list penjualan. JPG/PNG/GIF/WEBP."
        title="Logo"
      >
        {previewUri ? (
          <KolamRemoteImage
            accessibilityLabel="Pratinjau logo sumber"
            resizeMode="contain"
            sourceUri={previewUri}
            style={styles.formLogo}
          />
        ) : (
          <Text style={styles.metaText}>Belum ada logo.</Text>
        )}
        <View style={styles.badgeRow}>
          <KolamButton label="Pilih logo" onPress={() => void handlePickLogo()} />
          {previewUri ? (
            <KolamDeleteButton
              intent="danger"
              label="Hapus logo"
              onPress={() => {
                void controller.onDeleteLogo();
              }}
            />
          ) : null}
        </View>
      </SourceFormSection>

      <SourceFormSection
        description="Target markup rekomendasi harga channel — tidak mengurangi total invoice."
        title="Markup Channel (DARA)"
      >
        <FieldShell label="Markup persen (0–100)">
          <KolamFormTextField
            mode="numeric"
            onChangeText={value =>
              controller.onChangeForm({ markupPercent: value })
            }
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={form.markupPercent}
          />
        </FieldShell>
        <FieldShell label="Markup tetap">
          <KolamRupiahField
            onChangeValue={value =>
              controller.onChangeForm({ markupFixed: String(value) })
            }
            value={Number(form.markupFixed) || 0}
          />
        </FieldShell>
      </SourceFormSection>

      <SourceFormSection
        description="Field biaya dinamis untuk estimasi potongan / profit preview."
        title="Field Biaya"
      >
        {form.costFields.map((field, index) => (
          <View key={`cost-${index}`} style={styles.costFieldCard}>
            <FieldShell label="Nama biaya">
              <KolamFormTextField
                onChangeText={value => updateCostField(index, { name: value })}
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={field.name}
              />
            </FieldShell>
            <KolamDropdownSelect
              label="Tipe"
              onChange={value =>
                updateCostField(index, {
                  type: value as KolamSourceCostFieldType,
                })
              }
              options={[
                { label: 'Persentase', value: 'percentage' },
                { label: 'Nominal tetap', value: 'fixed' },
              ]}
              value={field.type}
            />
            <FieldShell
              label={field.type === 'percentage' ? 'Nilai (%)' : 'Nilai'}
            >
              {field.type === 'percentage' ? (
                <KolamFormTextField
                  mode="numeric"
                  onChangeText={value =>
                    updateCostField(index, {
                      value: Number(value.replace(/[^\d.-]/g, '')) || 0,
                    })
                  }
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={String(field.value)}
                />
              ) : (
                <KolamRupiahField
                  onChangeValue={value =>
                    updateCostField(index, { value })
                  }
                  value={Number(field.value) || 0}
                />
              )}
            </FieldShell>
            <KolamDeleteButton
              intent="danger"
              label="Hapus field"
              onPress={() => removeCostField(index)}
            />
          </View>
        ))}
        <KolamButton label="Tambah field biaya" onPress={addCostField} />
      </SourceFormSection>
    </KolamDetailScrollSurface>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 8,
  },
  stack: {
    flex: 1,
    gap: 8,
  },
  errorBadge: {
    alignSelf: 'stretch',
    marginHorizontal: 4,
  },
  detailToolbarContext: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 420,
  },
  primaryText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  metaText: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  cellText: {
    color: V.colors.fg,
    fontSize: 13,
    textAlign: 'center',
    width: '100%',
  },
  identityCell: {
    minWidth: 0,
    width: '100%',
  },
  listLogo: {
    height: 36,
    width: 36,
  },
  statusCell: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  detailContent: {
    gap: 16,
    paddingBottom: 32,
    paddingHorizontal: 8,
  },
  detailHero: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 8,
  },
  detailLogo: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    height: 128,
    width: 128,
  },
  detailLogoPlaceholder: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    height: 128,
    justifyContent: 'center',
    width: 128,
  },
  sourceSummaryLeadingSlot: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexBasis: 180,
    flexGrow: 0,
    justifyContent: 'center',
    minWidth: 180,
  },
  sourceSummaryCard: {
    alignSelf: 'stretch',
    width: '100%',
  },
  detailHeroText: {
    flex: 1,
    gap: 6,
  },
  detailTitle: {
    color: V.colors.fg,
    fontSize: 18,
    fontWeight: '700',
  },
  badgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  switchCopy: {
    flex: 1,
    gap: 2,
  },
  formLogo: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    height: 96,
    width: 96,
  },
  costFieldCard: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
    padding: 10,
  },
  recipientList: {
    gap: 6,
  },
  recipientRow: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  recipientRowSelected: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.primary,
  },
  sectionCopy: {
    gap: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionDescription: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
});
