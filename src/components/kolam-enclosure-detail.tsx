import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  KOLAM_ENCLOSURE_ROOT,
  canKolamEnclosureBeListed,
  canKolamProductionSaleBranch,
  climateDraftFromRow,
  climateDraftsEqual,
  filterKolamEnclosureTaskTypesForCategoryBucket,
  formatKolamEnclosureTaskStatusLabel,
  getKolamEnclosureParameterChartValues,
  getKolamEnclosureParameterLastUpdated,
  getKolamEnclosureTaskStatusIntent,
  getKolamProductionSaleStageKey,
  getKolamSpeciesSizeUpgradeTargets,
  mergeKolamEnclosureClimateRows,
  resolveKolamProductionAdvanceTarget,
  supportsKolamEnclosureClimateParameters,
  type KolamEnclosure,
  type KolamEnclosureClimateDraft,
  type KolamEnclosureClimateRow,
  type KolamEnclosureComment,
  type KolamEnclosureLivestockFilter,
  type KolamEnclosureProductionEvent,
  type KolamEnclosureStatistics,
  type KolamEnclosureStatisticsEvent,
  type KolamSpeciesTaxonomyProduction,
} from '../domain/kolam-enclosure';
import { formatRupiah } from '../lib/money';
import type {KolamBarcodeLabelItem} from '../domain/kolam-barcode';
import type {KolamSpecies} from '../domain/kolam-species';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {getKolamFileUrl} from '../lib/file-url';
import {pickNativeImageFile} from '../services/native-file-picker';
import {
  getKolamSpeciesList,
  getKolamSpeciesTaxonomyProduction,
} from '../services/kolam-species-api';
import {getKolamEnclosures} from '../services/kolam-enclosure-api';
import {getKolamUnits} from '../services/kolam-unit-api';
import type {KolamEnclosureController} from '../hooks/use-kolam-enclosure-controller';
import {KolamBarcodePanel} from './kolam-barcode-panel';
import {KolamBarcodePrintDialog} from './kolam-barcode-print-dialog';
import {KolamButton} from './kolam-button';
import {KolamDeleteButton} from './kolam-delete-button';
import {KolamCancelButton} from './kolam-cancel-button';
import {KolamSaveButton} from './kolam-save-button';
import {KolamDaftarButton} from './kolam-daftar-button';
import {KolamEditButton} from './kolam-edit-button';
import {KolamRefreshButton} from './kolam-refresh-button';
import {KolamStockTransactionButton} from './kolam-stock-transaction-button';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamDashboardMetricSparkline} from './kolam-dashboard-metric-sparkline';
import {KolamDropdownSelect} from './kolam-dropdown-select';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamFormTextField} from './kolam-form-text-field';
import {KolamRupiahField} from './kolam-rupiah-field';
import {KolamHtmlContent} from './kolam-html-content';
import {KolamRemoteImage} from './kolam-remote-image';
import {KolamStatusBadge} from './kolam-status-badge';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';
import {
  KolamTipTapExclusiveField,
  KolamTipTapExclusiveGroup,
} from './kolam-tiptap-exclusive-host';
import {KolamToggleRow} from './kolam-toggle-row';

type EnclosureDetailTab =
  | 'overview'
  | 'species'
  | 'production'
  | 'tasks'
  | 'statistics';

const ENCLOSURE_DETAIL_BASE_TABS: Array<{
  id: Exclude<EnclosureDetailTab, 'production'>;
  label: string;
}> = [
  {id: 'overview', label: 'Ringkasan'},
  {id: 'species', label: 'Spesies'},
  {id: 'tasks', label: 'Tugas'},
  {id: 'statistics', label: 'Statistik'},
];

const ENCLOSURE_DETAIL_TABS_WITH_PRODUCTION: Array<{
  id: EnclosureDetailTab;
  label: string;
}> = [
  {id: 'overview', label: 'Ringkasan'},
  {id: 'species', label: 'Spesies'},
  {id: 'production', label: 'Produksi'},
  {id: 'tasks', label: 'Tugas'},
  {id: 'statistics', label: 'Statistik'},
];


export function KolamEnclosureDetailSurface({
  controller,
  onRouteChange,
}: {
  controller: KolamEnclosureController;
  onRouteChange?: (route: string) => void;
}) {
  const enclosure = controller.selectedEnclosure;
  const [activeDetailTab, setActiveDetailTab] =
    React.useState<EnclosureDetailTab>('overview');
  const showProductionTab = Boolean(
    enclosure &&
      (enclosure.computed.productionPhaseTabVisible ||
        enclosure.livestockPurpose === 'production'),
  );
  const detailTabs = React.useMemo(
    () => getEnclosureDetailTabs(showProductionTab),
    [showProductionTab],
  );
  const safeActiveDetailTab = detailTabs.some(tab => tab.id === activeDetailTab)
    ? activeDetailTab
    : 'overview';

  React.useEffect(() => {
    if (!detailTabs.some(tab => tab.id === activeDetailTab)) {
      setActiveDetailTab('overview');
    }
  }, [activeDetailTab, detailTabs]);

  if (controller.loading && controller.dataSource === 'idle') {
    return <InlineState title="Memuat detail kandang..." />;
  }
  if (controller.error) {
    return (
      <View style={styles.surface}>
        <InlineState
          message={controller.error}
          title="Gagal memuat detail kandang"
        />
        <View style={styles.detailActions}>
          <KolamDaftarButton
            onPress={() => onRouteChange?.(`${KOLAM_ENCLOSURE_ROOT}?scope=dashboard`)}
          />
          <KolamRefreshButton
            accessibilityLabel="Muat ulang"
            disabled={controller.loading}

            onPress={() => void controller.onRefresh()}
          />
        </View>
      </View>
    );
  }
  if (!enclosure) {
    return (
      <InlineState
        message="Data kandang tidak ditemukan dari response Kolam."
        title="Kandang tidak ditemukan"
      />
    );
  }

  const scopeLabel =
    enclosure.clientScope === 'client_linked' ? 'Pelanggan' : 'Internal';
  const toolbarContext =
    enclosure.code.trim() || enclosure.name.trim() || enclosure.id;

  return (
    <View style={styles.detailSurface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.detailToolbarContext}>
              {toolbarContext}
            </Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            {detailTabs.map(tab => (
              <KolamButton
                intent={safeActiveDetailTab === tab.id ? 'primary' : 'outline'}
                key={tab.id}
                label={tab.label}
                onPress={() => setActiveDetailTab(tab.id)}
                style={styles.toolbarButton}
              />
            ))}
            <KolamDaftarButton
              onPress={() =>
                onRouteChange?.(`${KOLAM_ENCLOSURE_ROOT}?scope=dashboard`)
              }
              style={styles.toolbarButton}
            />
            <KolamEditButton
              onPress={() =>
                onRouteChange?.(
                  `${KOLAM_ENCLOSURE_ROOT}/${enclosure.id}/edit`,
                )
              }
              style={styles.toolbarButton}
            />
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
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}

      <ScrollView
        contentContainerStyle={styles.detailContent}
        style={styles.detailRoot}
      >
        {safeActiveDetailTab === 'overview' ? (
          <KolamEnclosureDetailOverview
            controller={controller}
            enclosure={enclosure}
            scopeLabel={scopeLabel}
          />
        ) : null}
        {safeActiveDetailTab === 'species' ? (
          <KolamEnclosureDetailSpeciesTab
            controller={controller}
            enclosure={enclosure}
          />
        ) : null}
        {safeActiveDetailTab === 'production' ? (
          <KolamEnclosureDetailProductionTab
            controller={controller}
            enclosure={enclosure}
          />
        ) : null}
        {safeActiveDetailTab === 'tasks' ? (
          <KolamEnclosureDetailTasksTab
            controller={controller}
            onRouteChange={onRouteChange}
          />
        ) : null}
        {safeActiveDetailTab === 'statistics' ? (
          <KolamEnclosureDetailStatisticsTab
            controller={controller}
            enclosure={enclosure}
            onRouteChange={onRouteChange}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

function KolamEnclosureDetailOverview({
  controller,
  enclosure,
  scopeLabel,
}: {
  controller: KolamEnclosureController;
  enclosure: KolamEnclosure;
  scopeLabel: string;
}) {
  const [barcodeOpen, setBarcodeOpen] = React.useState(false);
  const coverUri = getKolamFileUrl(enclosure.coverPhotoUrl);
  const photoUris = getEnclosureDetailPhotoUris(enclosure);
  const showProvisioning =
    enclosure.computed.needsProvisioning && !enclosure.code.trim();
  const sizeLine = formatMediaMetaSize(enclosure);
  const ageLabel = enclosure.computed.ageLabel || '';
  const brandName = enclosure.brand?.name || '';
  const waterLabel =
    enclosure.type === 'Aquarium'
      ? getAquariumWaterLabel(enclosure.aquariumWaterType)
      : '';
  const hasBarcode = Boolean(enclosure.code.trim());
  const showMediaMeta =
    enclosure.livestockPurpose === 'production' ||
    hasBarcode ||
    Boolean(sizeLine) ||
    Boolean(ageLabel) ||
    Boolean(brandName) ||
    Boolean(waterLabel);
  const barcodeItems = React.useMemo<KolamBarcodeLabelItem[]>(
    () =>
      enclosure.code.trim()
        ? [
            {
              id: enclosure.id,
              name: enclosure.name || enclosure.code,
              code: enclosure.code,
            },
          ]
        : [],
    [enclosure.code, enclosure.id, enclosure.name],
  );

  return (
    <>
      <KolamCardFrame style={styles.stripCard} variant="compact">
        <View style={styles.stripRow}>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>Status</Text>
            <KolamStatusBadge
              intent={getEnclosureStatusIntent(enclosure.status)}
              label={enclosure.status || 'active'}
              textStyle={styles.badgeTextSm}
            />
          </View>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>Tujuan</Text>
            <KolamStatusBadge
              intent={
                enclosure.livestockPurpose === 'production' ? 'warning' : 'muted'
              }
              label={getLivestockPurposeLabel(enclosure.livestockPurpose)}
              textStyle={styles.badgeTextSm}
            />
          </View>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>Tipe</Text>
            <KolamStatusBadge
              intent="muted"
              label={String(enclosure.type || '-')}
              textStyle={styles.badgeTextSm}
            />
          </View>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>Cakupan</Text>
            <KolamStatusBadge
              intent={
                enclosure.clientScope === 'client_linked' ? 'success' : 'muted'
              }
              label={scopeLabel}
              textStyle={styles.badgeTextSm}
            />
          </View>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>Penjualan</Text>
            <Text style={styles.stripValue}>
              {getSaleStatusLabel(enclosure.saleStatus)}
            </Text>
          </View>
        </View>
      </KolamCardFrame>

      <View style={styles.columns}>
        <View style={styles.columnSide}>
          <View style={styles.detailMediaPanel}>
            <View style={styles.detailMainPhoto}>
              {coverUri ? (
                <KolamRemoteImage
                  accessibilityLabel={`Foto utama ${enclosure.name || enclosure.code}`}
                  resizeMode="cover"
                  scope="enclosure-detail-gallery"
                  sourceUri={coverUri}
                  style={styles.detailMainPhotoImage}
                />
              ) : (
                <Text style={styles.mutedText}>Tidak ada foto</Text>
              )}
            </View>
            {photoUris.length > 1 ? (
              <View style={styles.detailThumbRow}>
                {photoUris.slice(0, 4).map((uri, index) => (
                  <KolamRemoteImage
                  accessibilityLabel={`Foto kandang ${index + 1}`}
                    key={`${uri}:${index}`}
                    resizeMode="cover"
                    scope="enclosure-detail-thumbs"
                    sourceUri={uri}
                    style={styles.detailThumb}
                  />
                ))}
              </View>
            ) : null}
          </View>

          {showMediaMeta ? (
            <View style={styles.mediaMetaCard}>
              {enclosure.livestockPurpose === 'production' ? (
                <View style={styles.detailWarningBand}>
                  <Text style={styles.warningText}>
                    Kandang produksi (indukan — tidak dijual)
                  </Text>
                </View>
              ) : null}
              {hasBarcode ? (
                <KolamBarcodePanel
                  name={enclosure.name || enclosure.code}
                  onPrint={() => setBarcodeOpen(true)}
                  sku={enclosure.code}
                />
              ) : null}
              {sizeLine ? (
                <View>
                  <Text style={styles.mediaMetaLabel}>Ukuran</Text>
                  <Text style={styles.mediaMetaValue}>{sizeLine}</Text>
                </View>
              ) : null}
              {ageLabel ? (
                <View>
                  <Text style={styles.mediaMetaLabel}>Usia</Text>
                  <Text style={styles.mediaMetaValue}>{ageLabel}</Text>
                </View>
              ) : null}
              {brandName ? (
                <View>
                  <Text style={styles.mediaMetaLabel}>Merek</Text>
                  <Text style={styles.mediaMetaValue}>{brandName}</Text>
                </View>
              ) : null}
              {waterLabel ? (
                <View>
                  <Text style={styles.mediaMetaLabel}>Tipe air</Text>
                  <Text style={styles.mediaMetaValue}>{waterLabel}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.columnMain}>
          <EnclosureClimateParameters
            controller={controller}
            enclosure={enclosure}
          />

          <EnclosureSaleListingOperation
            controller={controller}
            enclosure={enclosure}
          />

          {showProvisioning ? (
            <EnclosureProvisioningOperation controller={controller} />
          ) : null}

          {enclosure.note.trim() ? (
            <DetailSection title="Catatan">
              <Text style={styles.detailParagraph}>{enclosure.note}</Text>
            </DetailSection>
          ) : null}

          <EnclosureCommentsOperation controller={controller} />
        </View>
      </View>

      <KolamBarcodePrintDialog
        description="Label CODE128 memakai kode kandang. Ukuran label mengikuti web kandang: 75mm × 45mm."
        items={barcodeItems}
        onOpenChange={setBarcodeOpen}
        title="Cetak Barcode Kandang"
        visible={barcodeOpen}
      />
    </>
  );
}

function KolamEnclosureDetailSpeciesTab({
  controller,
  enclosure,
}: {
  controller: KolamEnclosureController;
  enclosure: KolamEnclosure;
}) {
  return (
    <>
      <View style={styles.detailTwoColumn}>
        <DetailSection title="Spesies di kandang">
          {enclosure.species.length ? (
            enclosure.species.map(item => {
              const photoUri = getKolamFileUrl(item.thumbnailUrl);
              return (
                <View
                  key={`${item.speciesId}:${item.variantId}`}
                  style={styles.detailMiniRow}
                >
                  {photoUri ? (
                    <KolamRemoteImage
                      accessibilityLabel={`Foto ${item.speciesName || item.scientificName || 'spesies'}`}
                      resizeMode="cover"
                      scope="enclosure-species-list"
                      sourceUri={photoUri}
                      style={styles.speciesPhoto}
                    />
                  ) : (
                    <View style={styles.speciesPhotoPlaceholder}>
                      <Text style={styles.mutedText}>—</Text>
                    </View>
                  )}
                  <KolamCopyStack
                    containerStyle={styles.panelRowCopy}
                    items={[
                      {
                        id: 'title',
                        text: item.speciesName || item.scientificName || '-',
                        style: styles.rowTitle,
                      },
                      {
                        id: 'meta',
                        text: [item.scientificName, item.variantLabel]
                          .filter(Boolean)
                          .join(' / '),
                        style: styles.rowMeta,
                      },
                    ]}
                  />
                  <Text style={styles.qtyText}>
                    {item.quantity} {item.unitLabel}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.mutedText}>Belum ada spesies.</Text>
          )}
        </DetailSection>
        <DetailSection title="Riwayat populasi">
          {enclosure.speciesPopulationHistory.length ? (
            enclosure.speciesPopulationHistory.slice(0, 12).map((item, index) => (
              <View key={item.id || `${item.createdAt}:${index}`} style={styles.detailMiniRow}>
                <KolamCopyStack
                  containerStyle={styles.panelRowCopy}
                  items={[
                    {
                      id: 'title',
                      text: item.speciesName || item.scientificName || '-',
                      style: styles.rowTitle,
                    },
                    {
                      id: 'meta',
                      text: [
                        formatDashboardDateTime(item.createdAt),
                        item.eventTypeLabel || item.eventType,
                        item.reason,
                      ]
                        .filter(Boolean)
                        .join(' / '),
                      style: styles.rowMeta,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.qtyText,
                    item.delta < 0 ? styles.warningText : null,
                  ]}
                >
                  {item.delta > 0 ? '+' : ''}
                  {item.delta} {item.unitLabel}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.mutedText}>Belum ada riwayat populasi.</Text>
          )}
        </DetailSection>
      </View>
      <EnclosureSpeciesOperation
        controller={controller}
        enclosure={enclosure}
      />
    </>
  );
}

function KolamEnclosureDetailProductionTab({
  controller,
  enclosure,
}: {
  controller: KolamEnclosureController;
  enclosure: KolamEnclosure;
}) {
  const statistics = controller.enclosureStatistics;
  const production = statistics?.production ?? null;
  const productionSummary = production?.summary;
  const showEndpointState =
    controller.enclosureStatisticsLoading ||
    Boolean(controller.enclosureStatisticsError);

  return (
    <View style={styles.detailTwoColumn}>
      <DetailSection title="Ringkasan produksi">
        {showEndpointState ? (
          <DetailEndpointState
            error={controller.enclosureStatisticsError}
            loading={controller.enclosureStatisticsLoading}
          />
        ) : null}
        <View style={styles.summaryGrid}>
          <SummaryTile
            accent="primary"
            hint="Populasi (+) alasan KELAHIRAN"
            icon="+"
            label="Kelahiran indukan"
            value={
              productionSummary?.indukanBirthQty ??
              countProductionBirthQty(enclosure)
            }
          />
          <SummaryTile
            icon="P"
            label="Populasi indukan"
            value={
              statistics?.summary.currentPopulationQty ??
              sumDetailSpeciesQty(enclosure)
            }
          />
          <SummaryTile
            hint={
              productionSummary
                ? `Tambah ${productionSummary.eggAddedQty} / tetas ${productionSummary.hatchQty}`
                : undefined
            }
            icon="T"
            label="Telur produksi"
            value={
              productionSummary?.currentEggQty ??
              sumProductionEggQty(enclosure)
            }
          />
          <SummaryTile
            hint={
              productionSummary
                ? `Antar kandang ${productionSummary.transferInQty} / stok jual ${productionSummary.fromSaleableQty}`
                : undefined
            }
            icon="M"
            label="Pindah masuk"
            value={
              productionSummary
                ? productionSummary.transferInQty +
                  productionSummary.fromSaleableQty
                : 0
            }
          />
        </View>
      </DetailSection>
      {production ? (
        <DetailSection title="Log produksi">
          <ProductionEventList
            emptyLabel="Belum ada catatan produksi."
            rows={production.events.slice(0, 12)}
          />
        </DetailSection>
      ) : null}
      <DetailSection title="Telur di kandang">
        {(production?.eggsBySpecies.length
          ? production.eggsBySpecies
          : enclosure.productionEggs
        ).length ? (
          (production?.eggsBySpecies.length
            ? production.eggsBySpecies
            : enclosure.productionEggs
          ).map(item => (
            <View
              key={item.speciesId || item.speciesName}
              style={styles.detailMiniRow}
            >
              <KolamCopyStack
                containerStyle={styles.panelRowCopy}
                items={[
                  {
                    id: 'title',
                    text: item.speciesName || item.scientificName || '-',
                    style: styles.rowTitle,
                  },
                  {
                    id: 'meta',
                    text: item.scientificName,
                    style: styles.rowMeta,
                  },
                ]}
              />
              <Text style={styles.qtyText}>
                {item.quantity}{' '}
                {String('unitLabel' in item ? item.unitLabel : 'telur')}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.mutedText}>Belum ada telur produksi.</Text>
        )}
      </DetailSection>
      <EnclosureProductionOperation
        controller={controller}
        enclosure={enclosure}
      />
    </View>
  );
}

function KolamEnclosureDetailTasksTab({
  controller,
  onRouteChange,
}: {
  controller: KolamEnclosureController;
  onRouteChange?: (route: string) => void;
}) {
  const [createOpen, setCreateOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [taskTypeId, setTaskTypeId] = React.useState('');
  const filteredTypes = React.useMemo(
    () =>
      filterKolamEnclosureTaskTypesForCategoryBucket(
        controller.enclosureTaskTypes,
        'enclosure',
      ),
    [controller.enclosureTaskTypes],
  );
  const recurringRows = React.useMemo(
    () =>
      controller.enclosureRecurringEnrollments.filter(row =>
        filteredTypes.some(type => type.id === row.taskType.id),
      ),
    [controller.enclosureRecurringEnrollments, filteredTypes],
  );
  const taskTypeOptions = React.useMemo(
    () => [
      {label: '— Opsional —', value: ''},
      ...filteredTypes.map(type => ({label: type.name, value: type.id})),
    ],
    [filteredTypes],
  );

  const onCreate = async () => {
    try {
      await controller.onSpawnTask({
        title: title.trim() || undefined,
        taskTypeId: taskTypeId || undefined,
      });
      setCreateOpen(false);
      setTitle('');
      setTaskTypeId('');
    } catch {
      // Error surfaced via controller.error / status badge.
    }
  };

  return (
    <View style={styles.detailStatsStack}>
      <DetailSection title="Tugas terkait">
        <View style={styles.detailSectionIntroRow}>
          <Text style={styles.sectionMeta}>
            Task manual & sub-task dari kandang ini
          </Text>
          <KolamButton
            label="Buat"
            onPress={() => setCreateOpen(current => !current)}
            style={styles.toolbarButton}
          />
        </View>
        {createOpen ? (
          <View style={styles.operationGrid}>
            <KolamFormTextField
              onChangeText={setTitle}
              placeholder="Judul (opsional)"
              style={styles.operationInput}
              value={title}
            />
            <KolamDropdownSelect
              label="Tipe task"
              menuPlacement="inline"
              onChange={setTaskTypeId}
              options={taskTypeOptions}
              style={styles.operationInput}
              value={taskTypeId}
            />
            <KolamSaveButton
              disabled={controller.operationLoading}
              onPress={() => void onCreate()}
              style={styles.toolbarButton}
            />
            <KolamCancelButton
              onPress={() => {
                setCreateOpen(false);
                setTitle('');
                setTaskTypeId('');
              }}
              style={styles.toolbarButton}
            />
          </View>
        ) : null}
        {controller.enclosureTasksLoading ? (
          <Text style={styles.sectionMeta}>Memuat…</Text>
        ) : controller.enclosureTasks.length === 0 ? (
          <Text style={styles.sectionMeta}>Belum ada tugas.</Text>
        ) : (
          controller.enclosureTasks.map(task => (
            <View key={task.id} style={styles.detailMiniRow}>
              <KolamCopyStack
                containerStyle={styles.panelRowCopy}
                items={[
                  {
                    id: 'title',
                    text: task.title,
                    style: styles.rowTitle,
                  },
                ]}
              />
              <View style={styles.detailActions}>
                <KolamStatusBadge
                  intent={getKolamEnclosureTaskStatusIntent(task.status)}
                  label={formatKolamEnclosureTaskStatusLabel(task.status)}
                  textStyle={styles.badgeTextSm}
                />
                <KolamButton
                  label="Buka"
                  onPress={() => onRouteChange?.(`/task-manager/${task.id}`)}
                  style={styles.toolbarButton}
                />
              </View>
            </View>
          ))
        )}
        <KolamRefreshButton
          accessibilityLabel="Muat ulang tugas"
          disabled={controller.enclosureTasksLoading}

          onPress={() => void controller.onRefreshTasks()}
          style={styles.toolbarButton}
        />
      </DetailSection>

      <DetailSection title="Jadwal berulang">
        <Text style={styles.sectionMeta}>
          Per tipe task · PIC dari kandang
        </Text>
        {controller.enclosureRecurringLoading ? (
          <Text style={styles.sectionMeta}>Memuat…</Text>
        ) : recurringRows.length === 0 ? (
          <Text style={styles.sectionMeta}>Tidak ada tipe task kandang.</Text>
        ) : (
          recurringRows.map(row => (
            <KolamToggleRow
              key={row.taskType.id}
              active={row.active}
              description="PIC dari kandang"
              disabled={controller.operationLoading}
              label={row.taskType.name}
              onPress={() =>
                void controller
                  .onSetRecurringEnrollment({
                    taskTypeId: row.taskType.id,
                    active: !row.active,
                  })
                  .catch(() => undefined)
              }
            />
          ))
        )}
      </DetailSection>
    </View>
  );
}

function KolamEnclosureDetailStatisticsTab({
  controller,
  enclosure,
  onRouteChange,
}: {
  controller: KolamEnclosureController;
  enclosure: KolamEnclosure;
  onRouteChange?: (route: string) => void;
}) {
  const statistics = controller.enclosureStatistics;
  const deathQty = enclosure.speciesPopulationHistory
    .filter(item => item.eventType === 'death')
    .reduce((sum, item) => sum + Math.abs(item.delta), 0);
  const lostQty = enclosure.speciesPopulationHistory
    .filter(item => item.eventType === 'lost')
    .reduce((sum, item) => sum + Math.abs(item.delta), 0);
  const birthQty = countProductionBirthQty(enclosure);
  const summary = statistics?.summary;
  const stockRows = controller.enclosureStockTransactions;

  return (
    <View style={styles.detailStatsStack}>
      <DetailSection title="Ringkasan kondisi">
        <View style={styles.detailSectionIntroRow}>
          <Text style={styles.sectionMeta}>
            Perkiraan nilai dari harga jual species, bukan laba bersih setelah
            biaya.
          </Text>
          {summary ? (
            <KolamStatusBadge
              intent={getStatisticsHealthIntent(summary.healthTone)}
              label={summary.healthLabel}
              textStyle={styles.badgeTextSm}
            />
          ) : null}
        </View>
        <DetailEndpointState
          error={controller.enclosureStatisticsError}
          loading={controller.enclosureStatisticsLoading}
        />
        <View style={styles.summaryGrid}>
          <SummaryTile
            hint={formatKolamCurrency(summary?.deathValue ?? 0)}
            accent="warning"
            icon="!"
            label="Kematian"
            value={summary?.deathQty ?? deathQty}
          />
          <SummaryTile
            hint={formatKolamCurrency(summary?.lostValue ?? 0)}
            accent="warning"
            icon="L"
            label="Hilang"
            value={summary?.lostQty ?? lostQty}
          />
          <SummaryTile
            hint={formatKolamCurrency(summary?.saleRevenue ?? 0)}
            accent="primary"
            icon="J"
            label="Penjualan"
            value={summary?.saleQty ?? 0}
          />
          <SummaryTile
            hint={formatKolamCurrency(summary?.currentPopulationValue ?? 0)}
            icon="S"
            label="Populasi sekarang"
            value={summary?.currentPopulationQty ?? sumDetailSpeciesQty(enclosure)}
          />
          <SummaryTile
            hint={
              summary?.mortalityRate != null
                ? `Mortalitas ${summary.mortalityRate}%`
                : undefined
            }
            accent={
              (summary?.netBalance ?? 0) < 0 ? 'warning' : 'primary'
            }
            icon="N"
            label="Saldo jual-rugi"
            value={Math.round((summary?.netBalance ?? 0) / 1000)}
          />
          <SummaryTile
            accent="primary"
            icon="+"
            label="Kelahiran"
            value={birthQty}
          />
        </View>
      </DetailSection>

      {statistics?.livestockPurpose === 'production' ||
      enclosure.livestockPurpose === 'production' ? (
        <DetailSection title="Ringkasan produksi">
          <KolamEnclosureStatisticsProductionSummary
            enclosure={enclosure}
            statistics={statistics}
          />
        </DetailSection>
      ) : null}

      {statistics?.production ? (
        <DetailSection title="Log produksi">
          <ProductionEventList
            emptyLabel="Belum ada catatan produksi."
            rows={statistics.production.events.slice(0, 12)}
          />
        </DetailSection>
      ) : null}

      <View style={styles.detailTwoColumn}>
        <DetailSection title="Kematian">
          <StatisticsEventList
            emptyLabel="Belum ada catatan kematian."
            rows={statistics?.deaths ?? []}
          />
        </DetailSection>
        <DetailSection title="Hilang">
          <StatisticsEventList
            emptyLabel="Belum ada catatan hilang."
            rows={statistics?.lost ?? []}
          />
        </DetailSection>
      </View>

      <View style={styles.detailTwoColumn}>
        <DetailSection title="Penjualan">
          <StatisticsEventList
            emptyLabel="Belum ada penjualan dari kandang ini."
            rows={statistics?.sales ?? []}
            showInvoice
          />
        </DetailSection>
        <DetailSection title="Pergerakan stok">
          {controller.enclosureStockTransactionsLoading ? (
            <Text style={styles.sectionMeta}>Memuat…</Text>
          ) : controller.enclosureStockTransactionsError ? (
            <KolamStatusBadge
              intent="warning"
              label={controller.enclosureStockTransactionsError}
              numberOfLines={2}
              textStyle={styles.badgeTextSm}
            />
          ) : stockRows.length ? (
            <>
              {stockRows.map(row => (
                <View key={row.id} style={styles.detailMiniRow}>
                  <KolamCopyStack
                    containerStyle={styles.panelRowCopy}
                    items={[
                      {
                        id: 'title',
                        text: row.target?.label || '—',
                        style: styles.rowTitle,
                      },
                      {
                        id: 'meta',
                        text: [
                          formatDashboardDateTime(row.createdAt),
                          String(row.type || '').toUpperCase(),
                          row.reason || '',
                        ]
                          .filter(Boolean)
                          .join(' · '),
                        style: styles.rowMeta,
                      },
                    ]}
                  />
                  <View style={styles.detailActions}>
                    <Text
                      style={[
                        styles.qtyText,
                        row.quantity < 0 ? styles.warningText : null,
                      ]}
                    >
                      {row.quantity > 0 ? '+' : ''}
                      {row.quantity}
                    </Text>
                    <KolamButton
                      label="Lihat"
                      onPress={() =>
                        onRouteChange?.(`/stock-transaction/${row.id}`)
                      }
                      style={styles.toolbarButton}
                    />
                    {row.reference?.href ? (
                      <KolamButton
                        label="Invoice"
                        onPress={() => onRouteChange?.(row.reference!.href!)}
                        style={styles.toolbarButton}
                      />
                    ) : null}
                  </View>
                </View>
              ))}
              <KolamStockTransactionButton
                label="Lihat semua"
                onPress={() =>
                  onRouteChange?.(
                    `/stock-transaction?enclosureId=${encodeURIComponent(enclosure.id)}`,
                  )
                }
                style={styles.detailInlineButton}
              />
              <KolamRefreshButton
                accessibilityLabel="Refresh stok"
                disabled={controller.enclosureStockTransactionsLoading}

                onPress={() => void controller.onRefreshStockTransactions()}
                style={styles.toolbarButton}
              />
            </>
          ) : (
            <Text style={styles.mutedText}>Belum ada transaksi.</Text>
          )}
        </DetailSection>
      </View>

      <DetailSection title="Parameter terbaca">
        <DetailParameterList enclosure={enclosure} />
      </DetailSection>
    </View>
  );
}

function KolamEnclosureStatisticsProductionSummary({
  enclosure,
  statistics,
}: {
  enclosure: KolamEnclosure;
  statistics: KolamEnclosureStatistics | null;
}) {
  const summary = statistics?.production?.summary;
  return (
    <View style={styles.summaryGrid}>
      <SummaryTile
        accent="primary"
        icon="+"
        label="Kelahiran indukan"
        value={summary?.indukanBirthQty ?? countProductionBirthQty(enclosure)}
      />
      <SummaryTile
        hint={
          summary
            ? `Tambah ${summary.eggAddedQty} / tetas ${summary.hatchQty}`
            : undefined
        }
        icon="T"
        label="Telur saat ini"
        value={summary?.currentEggQty ?? sumProductionEggQty(enclosure)}
      />
      <SummaryTile
        icon="A"
        label="Penempatan awal"
        value={summary?.placementQty ?? 0}
      />
      <SummaryTile
        icon="M"
        label="Pindah masuk"
        value={
          summary ? summary.transferInQty + summary.fromSaleableQty : 0
        }
      />
    </View>
  );
}

function DetailParameterList({
  enclosure,
  limit,
}: {
  enclosure: KolamEnclosure;
  limit?: number;
}) {
  const rows = limit ? enclosure.parameters.slice(0, limit) : enclosure.parameters;
  if (!rows.length) {
    return <Text style={styles.mutedText}>Belum ada parameter.</Text>;
  }
  return (
    <>
      {rows.map(item => (
        <View key={item.id || item.name} style={styles.detailMiniRow}>
          <Text numberOfLines={1} style={styles.cellText}>
            {item.name || '-'}
          </Text>
          <Text style={styles.qtyText}>
            {item.currentValue ?? '-'} {item.unitLabel}
          </Text>
        </View>
      ))}
    </>
  );
}

function EnclosureClimateParameters({
  controller,
  enclosure,
}: {
  controller: KolamEnclosureController;
  enclosure: KolamEnclosure;
}) {
  const isAquarium = enclosure.type === 'Aquarium';
  const title = isAquarium ? 'Parameter air' : 'Parameter iklim';
  const [unitByInitial, setUnitByInitial] = React.useState<
    Record<string, string>
  >({});

  React.useEffect(() => {
    let cancelled = false;
    void getKolamUnits()
      .then(units => {
        if (cancelled) {
          return;
        }
        const next: Record<string, string> = {};
        for (const unit of units) {
          if (unit.initial && !next[unit.initial]) {
            next[unit.initial] = unit.id;
          }
          if (unit.name && !next[unit.name]) {
            next[unit.name] = unit.id;
          }
        }
        setUnitByInitial(next);
      })
      .catch(() => {
        if (!cancelled) {
          setUnitByInitial({});
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (isAquarium && !enclosure.aquariumWaterType.trim()) {
    return (
      <DetailSection title={title}>
        <View style={styles.detailWarningBand}>
          <Text style={styles.warningText}>
            Sub-tipe air (tawar/laut) belum diset. Atur saat setup kandang di
            form edit.
          </Text>
        </View>
      </DetailSection>
    );
  }

  if (
    !supportsKolamEnclosureClimateParameters(
      enclosure.type,
      enclosure.aquariumWaterType,
    )
  ) {
    return null;
  }

  const rows = React.useMemo(
    () =>
      mergeKolamEnclosureClimateRows(
        enclosure.type,
        enclosure.parameters,
        enclosure.aquariumWaterType,
      ),
    [enclosure.aquariumWaterType, enclosure.parameters, enclosure.type],
  );
  if (!rows.length) {
    return null;
  }

  return (
    <DetailSection title={title}>
      <Text style={styles.sectionMeta}>
        Perubahan disimpan otomatis — grafik riwayat dari setiap update nilai
      </Text>
      {rows.map(row => (
        <EnclosureClimateParameterCard
          key={row.parameterName}
          enclosureId={enclosure.id}
          onUpsert={controller.onUpsertClimateParameter}
          resolveUnitId={() =>
            row.server?.unitId ||
            unitByInitial[row.unitInitial] ||
            null
          }
          row={row}
        />
      ))}
    </DetailSection>
  );
}

function EnclosureClimateParameterCard({
  enclosureId,
  onUpsert,
  resolveUnitId,
  row,
}: {
  enclosureId: string;
  onUpsert: KolamEnclosureController['onUpsertClimateParameter'];
  resolveUnitId: () => string | null;
  row: KolamEnclosureClimateRow;
}) {
  const [draft, setDraft] = React.useState<KolamEnclosureClimateDraft>(() =>
    climateDraftFromRow(row),
  );
  const [saveState, setSaveState] = React.useState<
    'idle' | 'pending' | 'saving' | 'saved' | 'error'
  >('idle');
  const baselineRef = React.useRef(climateDraftFromRow(row));
  const savingRef = React.useRef(false);
  const draftRef = React.useRef(draft);
  const rowRef = React.useRef(row);
  const resolveUnitIdRef = React.useRef(resolveUnitId);
  const onUpsertRef = React.useRef(onUpsert);
  draftRef.current = draft;
  rowRef.current = row;
  resolveUnitIdRef.current = resolveUnitId;
  onUpsertRef.current = onUpsert;

  React.useEffect(() => {
    const fromServer = climateDraftFromRow(row);
    baselineRef.current = fromServer;
    setDraft(current =>
      climateDraftsEqual(current, fromServer) ? fromServer : current,
    );
    if (!savingRef.current) {
      setSaveState('idle');
    }
  }, [row]);

  React.useEffect(() => {
    if (climateDraftsEqual(draft, baselineRef.current)) {
      setSaveState(current => (current === 'pending' ? 'idle' : current));
      return;
    }
    setSaveState('pending');
    const timer = setTimeout(() => {
      void (async () => {
        const next = draftRef.current;
        const currentRow = rowRef.current;
        if (climateDraftsEqual(next, baselineRef.current)) {
          return;
        }
        if (next.min > next.max) {
          setSaveState('error');
          return;
        }
        savingRef.current = true;
        setSaveState('saving');
        try {
          await onUpsertRef.current({
            parameter_name: currentRow.parameterName,
            current_value: next.current,
            unit: resolveUnitIdRef.current(),
            alert_setting: {
              constant: next.constant,
              range: {min: next.min, max: next.max},
            },
          });
          baselineRef.current = {...next};
          setSaveState('saved');
        } catch {
          setSaveState('error');
        } finally {
          savingRef.current = false;
        }
      })();
    }, 800);
    return () => clearTimeout(timer);
  }, [draft, enclosureId]);

  React.useEffect(() => {
    if (saveState !== 'saved') {
      return;
    }
    const timer = setTimeout(() => setSaveState('idle'), 2400);
    return () => clearTimeout(timer);
  }, [saveState]);

  const chartValues = getKolamEnclosureParameterChartValues(row.server);
  const lastUpdated = getKolamEnclosureParameterLastUpdated(row.server);
  const statusText =
    saveState === 'pending'
      ? 'Menyimpan otomatis…'
      : saveState === 'saving'
        ? 'Menyimpan…'
        : saveState === 'saved'
          ? 'Tersimpan'
          : saveState === 'error'
            ? 'Gagal menyimpan — periksa nilai min/max'
            : null;

  const patch = (key: keyof KolamEnclosureClimateDraft, raw: string) => {
    const normalized = raw.trim().replace(',', '.');
    if (
      normalized === '' ||
      normalized === '-' ||
      normalized === '.' ||
      normalized === '-.'
    ) {
      return;
    }
    const value = Number(normalized);
    if (!Number.isFinite(value)) {
      return;
    }
    setDraft(current => ({...current, [key]: value}));
  };

  return (
    <View style={styles.climateCard}>
      <Text style={styles.rowTitle}>
        {row.parameterName}
        <Text style={styles.rowMeta}> ({row.unitInitial})</Text>
      </Text>
      <KolamFormTextField
        mode="numeric"
        onChangeText={value => patch('current', value)}
        placeholder="Nilai saat ini"
        style={styles.operationInput}
        value={String(draft.current)}
      />
      <Text style={styles.sectionMeta}>
        Update: {formatDashboardDateTime(lastUpdated) || '—'}
      </Text>
      {statusText ? <Text style={styles.sectionMeta}>{statusText}</Text> : null}
      {chartValues.length ? (
        <KolamDashboardMetricSparkline tone="success" values={chartValues} />
      ) : (
        <Text style={styles.mutedText}>Belum ada riwayat</Text>
      )}
      <View style={styles.operationGrid}>
        <KolamFormTextField
          mode="numeric"
          onChangeText={value => patch('constant', value)}
          placeholder="Target"
          style={styles.operationInput}
          value={String(draft.constant)}
        />
        <KolamFormTextField
          mode="numeric"
          onChangeText={value => patch('min', value)}
          placeholder="Min"
          style={styles.operationInput}
          value={String(draft.min)}
        />
        <KolamFormTextField
          mode="numeric"
          onChangeText={value => patch('max', value)}
          placeholder="Max"
          style={styles.operationInput}
          value={String(draft.max)}
        />
      </View>
    </View>
  );
}

function EnclosureProvisioningOperation({
  controller,
}: {
  controller: KolamEnclosureController;
}) {
  const [code, setCode] = React.useState('');
  return (
    <DetailSection title="Provisioning kode">
      <View style={styles.detailWarningBand}>
        <Text style={styles.warningText}>
          Kandang belum punya kode. Simpan kode agar bisa dilacak dan dicetak
          barcode.
        </Text>
      </View>
      <View style={styles.operationGrid}>
        <KolamFormTextField
          autoCapitalize="characters"
          onChangeText={value => setCode(value.toUpperCase())}
          placeholder="ENC-AQUA-01"
          style={styles.operationInput}
          value={code}
        />
        <KolamSaveButton
          disabled={controller.operationLoading || !code.trim()}
          label="Simpan kode"
          onPress={() => void controller.onProvisionCode(code)}
          style={styles.toolbarButton}
        />
      </View>
    </DetailSection>
  );
}

function EnclosureSaleListingOperation({
  controller,
  enclosure,
}: {
  controller: KolamEnclosureController;
  enclosure: KolamEnclosure;
}) {
  const status = enclosure.saleStatus || 'not_for_sale';
  const eligibility = canKolamEnclosureBeListed(enclosure);
  const [price, setPrice] = React.useState(
    enclosure.salePrice && enclosure.salePrice > 0
      ? String(enclosure.salePrice)
      : '',
  );
  React.useEffect(() => {
    setPrice(
      enclosure.salePrice && enclosure.salePrice > 0
        ? String(enclosure.salePrice)
        : '',
    );
  }, [enclosure.salePrice]);

  const showListForm = status === 'not_for_sale' && eligibility.ok;
  const showClear = status === 'for_sale';
  const reservedPaid =
    enclosure.saleReservedInvoiceStatus === 'paid' ||
    enclosure.saleReservedInvoiceStatus === 'partial_paid';

  return (
    <DetailSection title="Jual unit kandang">
      <View style={styles.detailSectionIntroRow}>
        <Text style={styles.sectionMeta}>
          Jual kandang fisik (bukan livestock) lewat invoice tipe Kandang. Qty
          selalu 1.
        </Text>
        <KolamStatusBadge
          intent={getSaleStatusIntent(status)}
          label={getSaleStatusLabel(status)}
          textStyle={styles.badgeTextSm}
        />
      </View>
      {enclosure.salePrice != null && enclosure.salePrice > 0 ? (
        <Text style={styles.sectionMeta}>
          Harga listing: {formatKolamCurrency(enclosure.salePrice)}
        </Text>
      ) : null}
      {status === 'sold' && enclosure.soldAt ? (
        <Text style={styles.sectionMeta}>
          Terjual {formatDashboardDateTime(enclosure.soldAt)}
        </Text>
      ) : null}
      {status === 'reserved' ? (
        <View style={styles.detailWarningBand}>
          <Text style={styles.warningText}>
            {reservedPaid
              ? 'Invoice sudah lunas — kandang seharusnya terjual. Muat ulang halaman; jika masih muncul, hubungi admin (repair reservasi stale).'
              : 'Kandang ini ada di draft/pending invoice. Batalkan invoice atau hapus baris kandang untuk melepas reservasi.'}
          </Text>
          {enclosure.saleReservedInvoiceCode ? (
            <Text style={styles.sectionMeta}>
              Invoice: {enclosure.saleReservedInvoiceCode}
              {enclosure.saleReservedInvoiceStatus
                ? ` (${enclosure.saleReservedInvoiceStatus})`
                : ''}
            </Text>
          ) : null}
        </View>
      ) : null}
      {!eligibility.ok && status !== 'sold' && status !== 'reserved' ? (
        <View style={[styles.detailWarningBand, styles.detailDangerBand]}>
          <Text style={styles.dangerText}>{eligibility.reason}</Text>
        </View>
      ) : null}
      {showListForm ? (
        <View style={styles.operationGrid}>
          <KolamRupiahField
            onChangeValue={value => setPrice(String(value))}
            placeholder="Harga jual"
            style={styles.operationInput}
            value={Number(price) || 0}
          />
          <KolamButton
            disabled={
              controller.operationLoading ||
              !(Number(price) > 0)
            }
            label="Tandai for_sale"
            onPress={() =>
              controller.onUpdateSaleListing({
                action: 'list',
                salePrice: Math.max(0, Number(price) || 0),
              })
            }
            style={styles.toolbarButton}
          />
        </View>
      ) : null}
      {showClear ? (
        <KolamButton
          disabled={controller.operationLoading}
          label="Batalkan listing"
          onPress={() => controller.onUpdateSaleListing({action: 'clear'})}
          style={styles.toolbarButton}
        />
      ) : null}
      {status === 'sold' ? (
        <Text style={styles.sectionMeta}>
          Kandang nonaktif operasional setelah lunas.
        </Text>
      ) : null}
    </DetailSection>
  );
}

const ENCLOSURE_COMMENT_COMPOSE_FIELD = 'compose';

function EnclosureCommentsOperation({
  controller,
}: {
  controller: KolamEnclosureController;
}) {
  const [comment, setComment] = React.useState('');
  const comments = controller.enclosureComments ?? [];
  const canSend = Boolean(stripHtmlText(comment));

  return (
    <DetailSection title="Komentar">
      <Text style={styles.sectionMeta}>
        Catatan tim terkait kandang ini
      </Text>
      <KolamTipTapExclusiveGroup initialFieldId={ENCLOSURE_COMMENT_COMPOSE_FIELD}>
        <View style={styles.commentComposer}>
          <KolamTipTapExclusiveField
            fieldId={ENCLOSURE_COMMENT_COMPOSE_FIELD}
            onChangeText={setComment}
            placeholder="Tulis komentar…"
            value={comment}
          />
          <View style={styles.detailActions}>
            <KolamButton
              disabled={controller.operationLoading || !canSend}
              label="Kirim"
              onPress={() =>
                void controller.onCreateComment(comment).then(() => setComment(''))
              }
              style={styles.toolbarButton}
            />
            <KolamRefreshButton
              accessibilityLabel="Muat ulang"
              disabled={controller.operationLoading}

              onPress={() => void controller.onRefreshComments()}
              style={styles.toolbarButton}
            />
          </View>
        </View>
        {comments.length ? (
          <View style={styles.commentThread}>
            {comments.map(item => (
              <EnclosureCommentItem
                comment={item}
                controller={controller}
                depth={0}
                key={item.id}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.mutedText}>Belum ada komentar.</Text>
        )}
      </KolamTipTapExclusiveGroup>
    </DetailSection>
  );
}

function EnclosureCommentItem({
  comment,
  controller,
  depth,
}: {
  comment: KolamEnclosureComment;
  controller: KolamEnclosureController;
  depth: number;
}) {
  const [replyOpen, setReplyOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [replyText, setReplyText] = React.useState('');
  const [editText, setEditText] = React.useState(comment.comment);
  const author =
    comment.user?.displayName || comment.customer?.name || 'Komentar';
  const likeLabel = comment.likedByMe
    ? `♥ ${comment.totalLikes}`
    : `♡ ${comment.totalLikes}`;
  const replyFieldId = `reply:${comment.id}`;
  const editFieldId = `edit:${comment.id}`;
  const canSendReply = Boolean(stripHtmlText(replyText));
  const canSaveEdit = Boolean(stripHtmlText(editText));

  React.useEffect(() => {
    setEditText(comment.comment);
  }, [comment.comment]);

  const body = (
    <View style={styles.commentCard}>
      <KolamCopyStack
        containerStyle={styles.panelRowCopy}
        items={[
          {id: 'title', text: author, style: styles.rowTitle},
          {
            id: 'meta',
            text: formatDashboardDateTime(comment.createdAt),
            style: styles.rowMeta,
          },
        ]}
      />
      {comment.edited ? (
        <Text style={styles.commentEdited}>(diedit)</Text>
      ) : null}
      {editOpen ? (
        <View style={styles.commentComposer}>
          <KolamTipTapExclusiveField
            fieldId={editFieldId}
            onChangeText={setEditText}
            placeholder="Ubah komentar…"
            value={editText}
          />
          <View style={styles.detailActions}>
            <KolamSaveButton
              disabled={controller.operationLoading || !canSaveEdit}
              onPress={() =>
                void controller
                  .onEditComment(comment.id, editText)
                  .then(() => setEditOpen(false))
              }
              style={styles.toolbarButton}
            />
            <KolamCancelButton
              onPress={() => {
                setEditOpen(false);
                setEditText(comment.comment);
              }}
              style={styles.toolbarButton}
            />
          </View>
        </View>
      ) : (
        <KolamHtmlContent html={comment.comment} style={styles.commentHtml} />
      )}
      <View style={styles.detailActions}>
        <KolamButton
          disabled={controller.operationLoading}
          label={likeLabel}
          onPress={() => void controller.onLikeComment(comment.id)}
          style={styles.toolbarButton}
        />
        {depth === 0 ? (
          <KolamButton
            label="Balas"
            onPress={() => setReplyOpen(current => !current)}
            style={styles.toolbarButton}
          />
        ) : null}
        {comment.isMyOwn && !editOpen ? (
          <>
            <KolamEditButton
              onPress={() => setEditOpen(true)}
              style={styles.toolbarButton}
            />
            <KolamDeleteButton
              disabled={controller.operationLoading}
              label="Hapus"
              onPress={() => void controller.onDeleteComment(comment.id)}
              style={styles.toolbarButton}
            />
          </>
        ) : null}
      </View>
      {replyOpen ? (
        <View style={styles.commentComposer}>
          <KolamTipTapExclusiveField
            fieldId={replyFieldId}
            onChangeText={setReplyText}
            placeholder="Tulis balasan…"
            value={replyText}
          />
          <KolamButton
            disabled={controller.operationLoading || !canSendReply}
            label="Kirim balasan"
            onPress={() =>
              void controller.onReplyComment(comment.id, replyText).then(() => {
                setReplyText('');
                setReplyOpen(false);
              })
            }
            style={styles.toolbarButton}
          />
        </View>
      ) : null}
    </View>
  );

  return (
    <View>
      {depth > 0 ? <View style={styles.commentReplyWrap}>{body}</View> : body}
      {comment.replies?.length
        ? comment.replies.map(reply => (
            <EnclosureCommentItem
              comment={reply}
              controller={controller}
              depth={depth + 1}
              key={reply.id}
            />
          ))
        : null}
    </View>
  );
}

function EnclosureSpeciesOperation({
  controller,
  enclosure,
}: {
  controller: KolamEnclosureController;
  enclosure: KolamEnclosure;
}) {
  const [speciesCatalog, setSpeciesCatalog] = React.useState<KolamSpecies[]>(
    [],
  );
  const [transferTargets, setTransferTargets] = React.useState<
    Array<{id: string; label: string}>
  >([]);
  const [crossPoolTargets, setCrossPoolTargets] = React.useState<
    Array<{id: string; label: string}>
  >([]);
  const [speciesId, setSpeciesId] = React.useState('');
  const [variantId, setVariantId] = React.useState('');
  const [lineKey, setLineKey] = React.useState('');
  const [qty, setQty] = React.useState('1');
  const [reason, setReason] = React.useState('');
  const [eventType, setEventType] = React.useState('death');
  const [delta, setDelta] = React.useState('-1');
  const [targetEnclosureId, setTargetEnclosureId] = React.useState('');
  const [toVariantId, setToVariantId] = React.useState('');
  const [eventPhotoUri, setEventPhotoUri] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    void getKolamSpeciesList({limit: 500, page: 1, view: ''})
      .then(result => {
        if (!cancelled) {
          setSpeciesCatalog(result.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSpeciesCatalog([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    const samePurpose = enclosure.livestockPurpose;
    const oppositePurpose =
      samePurpose === 'production' ? 'saleable' : 'production';
    void Promise.all([
      getKolamEnclosures({
        enclosureType: 'all',
        limit: 200,
        livestockPurpose: samePurpose,
        page: 1,
        scope: 'internal',
        search: '',
      }),
      getKolamEnclosures({
        enclosureType: 'all',
        limit: 200,
        livestockPurpose: oppositePurpose,
        page: 1,
        scope: 'internal',
        search: '',
      }),
    ])
      .then(([same, opposite]) => {
        if (cancelled) {
          return;
        }
        setTransferTargets(
          same.data
            .filter(item => item.id !== enclosure.id)
            .map(item => ({
              id: item.id,
              label: `${item.code || item.id} · ${item.name || '-'}`,
            })),
        );
        setCrossPoolTargets(
          opposite.data
            .filter(item => item.id !== enclosure.id)
            .map(item => ({
              id: item.id,
              label: `${item.code || item.id} · ${item.name || '-'}`,
            })),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setTransferTargets([]);
          setCrossPoolTargets([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [enclosure.id, enclosure.livestockPurpose]);

  const selectedSpecies =
    speciesCatalog.find(item => item.id === speciesId) ?? null;
  const variantOptions = React.useMemo(
    () => [
      {label: '— Tanpa variant —', value: ''},
      ...(selectedSpecies?.variants ?? []).map(variant => ({
        label: variant.label || variant.sku || variant.id,
        value: variant.id,
      })),
    ],
    [selectedSpecies],
  );
  const lineOptions = React.useMemo(
    () => [
      {label: '— Pilih line —', value: ''},
      ...enclosure.species.map(item => ({
        label: `${item.speciesName || item.scientificName || item.speciesId}${
          item.variantLabel ? ` / ${item.variantLabel}` : ''
        } (${item.quantity})`,
        value: `${item.speciesId}:${item.variantId}`,
      })),
    ],
    [enclosure.species],
  );
  const upgradeTargets = React.useMemo(() => {
    if (!selectedSpecies || !variantId) {
      return [];
    }
    return getKolamSpeciesSizeUpgradeTargets(selectedSpecies, variantId);
  }, [selectedSpecies, variantId]);

  React.useEffect(() => {
    if (!lineKey) {
      return;
    }
    const [nextSpeciesId = '', nextVariantId = ''] = lineKey.split(':');
    setSpeciesId(nextSpeciesId);
    setVariantId(nextVariantId);
  }, [lineKey]);

  React.useEffect(() => {
    if (
      toVariantId &&
      !upgradeTargets.some(item => item.variantId === toVariantId)
    ) {
      setToVariantId(upgradeTargets[0]?.variantId ?? '');
    }
  }, [toVariantId, upgradeTargets]);

  const speciesOptions = React.useMemo(
    () => [
      {label: '— Pilih species —', value: ''},
      ...speciesCatalog.map(item => ({
        label: item.displayName || item.scientificName || item.id,
        value: item.id,
      })),
    ],
    [speciesCatalog],
  );
  const transferOptions = React.useMemo(
    () => [
      {label: '— Target transfer —', value: ''},
      ...transferTargets.map(item => ({label: item.label, value: item.id})),
    ],
    [transferTargets],
  );
  const crossPoolOptions = React.useMemo(
    () => [
      {label: '— Target cross-pool —', value: ''},
      ...crossPoolTargets.map(item => ({label: item.label, value: item.id})),
    ],
    [crossPoolTargets],
  );
  const eventTypeOptions = [
    {label: 'Kematian', value: 'death'},
    {label: 'Hilang', value: 'lost'},
    {label: 'Transfer keluar', value: 'transfer'},
    {label: 'Cross-pool', value: 'cross-pool'},
    {label: 'Adopsi', value: 'adoption'},
    {label: 'Kelahiran', value: 'birth'},
  ];
  const upgradeOptions = React.useMemo(
    () => [
      {label: '— Target ukuran —', value: ''},
      ...upgradeTargets.map(item => ({
        label: item.label,
        value: item.variantId,
      })),
    ],
    [upgradeTargets],
  );

  const baseInput = {
    enclosureId: enclosure.id,
    quantity: Math.max(1, Number(qty) || 1),
    reason: reason.trim() || undefined,
    speciesId: speciesId.trim(),
    variantId: variantId.trim() || null,
  };

  return (
    <DetailSection title="Operasional species">
      <KolamDropdownSelect
        label="Katalog spesies"
        menuPlacement="inline"
        onChange={value => {
          setSpeciesId(value);
          setVariantId('');
          setLineKey('');
          setToVariantId('');
        }}
        options={speciesOptions}
        searchable
        style={styles.operationInput}
        value={speciesId}
      />
      <KolamDropdownSelect
        label="Variant"
        menuPlacement="inline"
        onChange={setVariantId}
        options={variantOptions}
        style={styles.operationInput}
        value={variantId}
      />
      <View style={styles.operationGrid}>
        <KolamFormTextField
          mode="numeric"
          onChangeText={setQty}
          placeholder="Qty"
          style={styles.operationInputSmall}
          value={qty}
        />
        <KolamFormTextField
          onChangeText={setReason}
          placeholder="Alasan / catatan"
          style={styles.operationInput}
          value={reason}
        />
        <KolamButton
          disabled={controller.operationLoading || !speciesId.trim()}
          label="Attach"
          onPress={() => controller.onAttachSpecies(baseInput)}
          style={styles.toolbarButton}
        />
      </View>

      <Text style={styles.sectionMeta}>Event populasi</Text>
      <KolamDropdownSelect
        label="Line di kandang"
        menuPlacement="inline"
        onChange={setLineKey}
        options={lineOptions}
        style={styles.operationInput}
        value={lineKey}
      />
      <View style={styles.operationGrid}>
        <KolamDropdownSelect
          label="Tipe event"
          menuPlacement="inline"
          onChange={value => {
            setEventType(value);
            setDelta(value === 'birth' ? '1' : '-1');
          }}
          options={eventTypeOptions}
          style={styles.operationInput}
          value={eventType}
        />
        <KolamFormTextField
          mode="numeric"
          onChangeText={setDelta}
          placeholder="Delta"
          style={styles.operationInputSmall}
          value={delta}
        />
        <KolamFormTextField
          onChangeText={setEventPhotoUri}
          placeholder="Foto event URI opsional"
          style={styles.operationInput}
          value={eventPhotoUri}
        />
        <KolamButton
          label="Pilih foto"
          onPress={() =>
            void pickNativeImageFile().then(picked => {
              if (!picked.cancelled && picked.uri) {
                setEventPhotoUri(picked.uri);
              }
            })
          }
          style={styles.toolbarButton}
        />
        <KolamButton
          disabled={
            controller.operationLoading ||
            !speciesId.trim() ||
            (eventType === 'death' && !eventPhotoUri.trim())
          }
          label="Catat event"
          onPress={() =>
            controller.onRecordPopulationEvent({
              enclosureId: enclosure.id,
              speciesId: speciesId.trim(),
              variantId: variantId.trim() || null,
              delta: Number(delta) || 0,
              eventType: eventType.trim() || null,
              reason: reason.trim() || undefined,
              photoUris: eventPhotoUri.trim() ? [eventPhotoUri.trim()] : [],
            })
          }
          style={styles.toolbarButton}
        />
      </View>

      <Text style={styles.sectionMeta}>Transfer / cross-pool</Text>
      <KolamDropdownSelect
        label="Target transfer (same purpose)"
        menuPlacement="inline"
        onChange={setTargetEnclosureId}
        options={transferOptions}
        searchable
        style={styles.operationInput}
        value={
          transferTargets.some(item => item.id === targetEnclosureId)
            ? targetEnclosureId
            : ''
        }
      />
      <View style={styles.operationGrid}>
        <KolamButton
          disabled={
            controller.operationLoading ||
            !speciesId.trim() ||
            !targetEnclosureId.trim() ||
            !transferTargets.some(item => item.id === targetEnclosureId)
          }
          label="Transfer"
          onPress={() =>
            controller.onTransferSpecies({
              ...baseInput,
              targetEnclosureId: targetEnclosureId.trim(),
            })
          }
          style={styles.toolbarButton}
        />
      </View>
      <KolamDropdownSelect
        label="Target cross-pool"
        menuPlacement="inline"
        onChange={setTargetEnclosureId}
        options={crossPoolOptions}
        searchable
        style={styles.operationInput}
        value={
          crossPoolTargets.some(item => item.id === targetEnclosureId)
            ? targetEnclosureId
            : ''
        }
      />
      <KolamButton
        disabled={
          controller.operationLoading ||
          !speciesId.trim() ||
          !targetEnclosureId.trim() ||
          !crossPoolTargets.some(item => item.id === targetEnclosureId)
        }
        label="Cross pool"
        onPress={() =>
          controller.onCrossPoolTransferSpecies({
            ...baseInput,
            direction:
              enclosure.livestockPurpose === 'production'
                ? 'release_to_sale'
                : 'take_to_production',
            targetEnclosureId: targetEnclosureId.trim(),
          })
        }
        style={styles.toolbarButton}
      />

      <Text style={styles.sectionMeta}>Naik ukuran variant</Text>
      {upgradeTargets.length ? (
        <View style={styles.operationGrid}>
          <KolamDropdownSelect
            label="Ke ukuran"
            menuPlacement="inline"
            onChange={setToVariantId}
            options={upgradeOptions}
            style={styles.operationInput}
            value={toVariantId}
          />
          <KolamButton
            disabled={
              controller.operationLoading ||
              !speciesId.trim() ||
              !variantId.trim() ||
              !toVariantId.trim()
            }
            label="Switch variant"
            onPress={() =>
              controller.onSwitchSpeciesVariant({
                enclosureId: enclosure.id,
                speciesId: speciesId.trim(),
                fromVariantId: variantId.trim(),
                toVariantId: toVariantId.trim(),
                quantity: Math.max(1, Number(qty) || 1),
                reason: reason.trim() || undefined,
              })
            }
            style={styles.toolbarButton}
          />
        </View>
      ) : (
        <Text style={styles.mutedText}>Tidak bisa naik ukuran.</Text>
      )}
    </DetailSection>
  );
}

function EnclosureProductionOperation({
  controller,
  enclosure,
}: {
  controller: KolamEnclosureController;
  enclosure: KolamEnclosure;
}) {
  const [speciesCatalog, setSpeciesCatalog] = React.useState<KolamSpecies[]>(
    [],
  );
  const [speciesId, setSpeciesId] = React.useState('');
  const [qty, setQty] = React.useState('1');
  const [reason, setReason] = React.useState('');
  const [taxonomyBySpecies, setTaxonomyBySpecies] = React.useState<
    Record<string, KolamSpeciesTaxonomyProduction | null>
  >({});
  const parsedQty = Math.max(1, Number(qty) || 1);

  React.useEffect(() => {
    let cancelled = false;
    void getKolamSpeciesList({limit: 500, page: 1, view: ''})
      .then(result => {
        if (!cancelled) {
          setSpeciesCatalog(result.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSpeciesCatalog([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    const ids = Array.from(
      new Set(
        [
          ...enclosure.species.map(item => item.speciesId),
          ...enclosure.productionEggs.map(item => item.speciesId),
          speciesId,
        ].filter(Boolean),
      ),
    ).sort();
    if (!ids.length) {
      return;
    }
    let cancelled = false;
    void Promise.all(
      ids.map(async id => {
        try {
          const taxonomy = await getKolamSpeciesTaxonomyProduction(id);
          return {id, taxonomy};
        } catch {
          return {id, taxonomy: null as KolamSpeciesTaxonomyProduction | null};
        }
      }),
    ).then(results => {
      if (cancelled) {
        return;
      }
      setTaxonomyBySpecies(current => {
        const next = {...current};
        for (const row of results) {
          next[row.id] = row.taxonomy;
        }
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [
    enclosure.productionEggs,
    enclosure.species,
    speciesId,
  ]);

  const speciesOptions = React.useMemo(
    () => [
      {label: '— Pilih species —', value: ''},
      ...speciesCatalog.map(item => ({
        label: item.displayName || item.scientificName || item.id,
        value: item.id,
      })),
    ],
    [speciesCatalog],
  );
  const eggTaxonomy = speciesId ? taxonomyBySpecies[speciesId] : null;
  const canAddEggs = Boolean(eggTaxonomy?.profile || eggTaxonomy?.ready);

  return (
    <DetailSection title="Operasional produksi">
      <KolamDropdownSelect
        label="Spesies telur"
        menuPlacement="inline"
        onChange={setSpeciesId}
        options={speciesOptions}
        searchable
        style={styles.operationInput}
        value={speciesId}
      />
      <View style={styles.operationGrid}>
        <KolamFormTextField
          mode="numeric"
          onChangeText={setQty}
          placeholder="Qty"
          style={styles.operationInputSmall}
          value={qty}
        />
        <KolamFormTextField
          onChangeText={setReason}
          placeholder="Alasan / catatan"
          style={styles.operationInput}
          value={reason}
        />
        <KolamButton
          disabled={
            controller.operationLoading || !speciesId.trim() || !canAddEggs
          }
          label="Tambah telur"
          onPress={() =>
            controller.onAddProductionEggs({
              enclosureId: enclosure.id,
              speciesId: speciesId.trim(),
              quantity: parsedQty,
              reason: reason.trim() || undefined,
            })
          }
          style={styles.toolbarButton}
        />
        <KolamButton
          disabled={controller.operationLoading || !speciesId.trim()}
          label="Advance telur → kecebong"
          onPress={() =>
            controller.onAdvanceProductionEggs({
              enclosureId: enclosure.id,
              speciesId: speciesId.trim(),
              quantity: parsedQty,
              toStageKey: 'kecebong',
              reason: reason.trim() || undefined,
            })
          }
          style={styles.toolbarButton}
        />
      </View>
      {speciesId && !canAddEggs ? (
        <Text style={styles.mutedText}>
          Species belum punya profil taxonomy produksi.
        </Text>
      ) : null}

      {enclosure.productionEggs.length ? (
        <>
          <Text style={styles.sectionMeta}>Stok telur</Text>
          {enclosure.productionEggs.map(egg => (
            <View
              key={`${egg.speciesId}:${egg.scientificName}`}
              style={styles.detailMiniRow}
            >
              <KolamCopyStack
                containerStyle={styles.panelRowCopy}
                items={[
                  {
                    id: 'title',
                    text: egg.speciesName || egg.scientificName || egg.speciesId,
                    style: styles.rowTitle,
                  },
                  {
                    id: 'meta',
                    text: `${egg.quantity} ${egg.unitLabel}`,
                    style: styles.rowMeta,
                  },
                ]}
              />
              <KolamButton
                disabled={controller.operationLoading || egg.quantity <= 0}
                label="Advance"
                onPress={() =>
                  controller.onAdvanceProductionEggs({
                    enclosureId: enclosure.id,
                    speciesId: egg.speciesId,
                    quantity: Math.min(parsedQty, Math.max(1, egg.quantity)),
                    toStageKey: 'kecebong',
                    reason: reason.trim() || undefined,
                  })
                }
                style={styles.toolbarButton}
              />
            </View>
          ))}
        </>
      ) : null}

      {enclosure.species.length ? (
        <>
          <Text style={styles.sectionMeta}>Fase variant</Text>
          {enclosure.species.map(line => {
            const taxonomy = taxonomyBySpecies[line.speciesId];
            const advance = resolveKolamProductionAdvanceTarget(
              taxonomy,
              line.variantId,
            );
            const canSale = canKolamProductionSaleBranch(
              taxonomy,
              line.variantId,
            );
            const saleStageKey = getKolamProductionSaleStageKey(
              taxonomy,
              line.variantId,
            );
            return (
              <View
                key={`${line.speciesId}:${line.variantId}`}
                style={styles.climateCard}
              >
                <Text style={styles.rowTitle}>
                  {line.speciesName || line.scientificName}
                  {line.variantLabel ? ` / ${line.variantLabel}` : ''}
                </Text>
                <Text style={styles.sectionMeta}>
                  Qty {line.quantity} {line.unitLabel}
                  {advance
                    ? ` · next: ${advance.toLabel}`
                    : ' · tanpa advance'}
                </Text>
                <View style={styles.operationGrid}>
                  <KolamButton
                    disabled={
                      controller.operationLoading ||
                      !advance ||
                      line.quantity <= 0
                    }
                    label={
                      advance ? `Advance → ${advance.toLabel}` : 'Advance'
                    }
                    onPress={() =>
                      advance
                        ? controller.onChangeProductionPhase({
                            enclosureId: enclosure.id,
                            speciesId: line.speciesId,
                            fromStageKey: advance.fromStageKey,
                            toStageKey: advance.toStageKey,
                            quantity: Math.min(
                              parsedQty,
                              Math.max(1, line.quantity),
                            ),
                            reason: reason.trim() || undefined,
                          })
                        : undefined
                    }
                    style={styles.toolbarButton}
                  />
                  {canSale ? (
                    <KolamButton
                      disabled={
                        controller.operationLoading ||
                        !saleStageKey ||
                        line.quantity <= 0
                      }
                      label="Ke stok jual"
                      onPress={() =>
                        controller.onMoveProductionPhaseToSale({
                          enclosureId: enclosure.id,
                          speciesId: line.speciesId,
                          stageKey: saleStageKey,
                          quantity: Math.min(
                            parsedQty,
                            Math.max(1, line.quantity),
                          ),
                          reason: reason.trim() || undefined,
                        })
                      }
                      style={styles.toolbarButton}
                    />
                  ) : null}
                </View>
              </View>
            );
          })}
        </>
      ) : null}
    </DetailSection>
  );
}

function DetailEndpointState({
  error,
  loading,
}: {
  error: string | null;
  loading: boolean;
}) {
  if (loading) {
    return <Text style={styles.sectionMeta}>Memuat statistik detail...</Text>;
  }
  if (error) {
    return (
      <KolamStatusBadge
        intent="warning"
        label={`Statistik endpoint belum tersedia: ${error}`}
        numberOfLines={2}
        textStyle={styles.badgeTextSm}
      />
    );
  }
  return null;
}

function StatisticsEventList({
  emptyLabel,
  rows,
  showInvoice,
}: {
  emptyLabel: string;
  rows: KolamEnclosureStatisticsEvent[];
  showInvoice?: boolean;
}) {
  if (!rows.length) {
    return <Text style={styles.mutedText}>{emptyLabel}</Text>;
  }
  return (
    <>
      {rows.slice(0, 8).map((row, index) => (
        <View key={row.id || `${row.createdAt}:${index}`} style={styles.detailMiniRow}>
          <KolamCopyStack
            containerStyle={styles.panelRowCopy}
            items={[
              {
                id: 'title',
                text: row.scientificName || row.speciesName || '-',
                style: styles.rowTitle,
              },
              {
                id: 'meta',
                text: [
                  formatDashboardDateTime(row.createdAt),
                  row.variantLabel,
                  showInvoice ? row.invoiceCode : '',
                  row.reason,
                ]
                  .filter(Boolean)
                  .join(' / '),
                style: styles.rowMeta,
              },
            ]}
          />
          <KolamCopyStack
            containerStyle={styles.detailValueStack}
            items={[
              {
                id: 'qty',
                text: `${row.quantity} ekor`,
                style: styles.qtyText,
              },
              {
                id: 'value',
                text: formatKolamCurrency(row.totalValue),
                style: styles.rowMeta,
              },
            ]}
          />
        </View>
      ))}
    </>
  );
}

function ProductionEventList({
  emptyLabel,
  rows,
}: {
  emptyLabel: string;
  rows: KolamEnclosureProductionEvent[];
}) {
  if (!rows.length) {
    return <Text style={styles.mutedText}>{emptyLabel}</Text>;
  }
  return (
    <>
      {rows.map((row, index) => (
        <View key={row.id || `${row.createdAt}:${index}`} style={styles.detailMiniRow}>
          <KolamCopyStack
            containerStyle={styles.panelRowCopy}
            items={[
              {
                id: 'title',
                text: row.categoryLabel || row.category || 'Produksi',
                style: styles.rowTitle,
              },
              {
                id: 'meta',
                text: [
                  formatDashboardDateTime(row.createdAt),
                  row.scientificName || row.speciesName,
                  row.variantLabel,
                  row.reason,
                ]
                  .filter(Boolean)
                  .join(' / '),
                style: styles.rowMeta,
              },
            ]}
          />
          <Text style={styles.qtyText}>{row.quantity} ekor</Text>
        </View>
      ))}
    </>
  );
}

function DetailSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <View style={styles.detailSection}>
      <View style={styles.detailSectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.detailSectionBody}>{children}</View>
    </View>
  );
}

function InlineState({message, title}: {message?: string; title: string}) {
  return (
    <View style={styles.emptyWrap}>
      <KolamEmptyState compact message={message ?? ''} title={title} />
    </View>
  );
}

function SummaryTile({
  accent,
  hint,
  icon,
  label,
  value,
}: {
  accent?: 'primary' | 'warning';
  hint?: string;
  icon: string;
  label: string;
  value: number;
}) {
  return (
    <View
      style={[
        styles.summaryTile,
        accent === 'primary' ? styles.summaryTilePrimary : null,
        accent === 'warning' ? styles.summaryTileWarning : null,
      ]}
    >
      <View style={styles.summaryTileHeader}>
        <View
          style={[
            styles.summaryIcon,
            accent === 'primary' ? styles.summaryIconPrimary : null,
            accent === 'warning' ? styles.summaryIconWarning : null,
          ]}
        >
          <Text style={styles.summaryIconText}>{icon}</Text>
        </View>
        <Text style={styles.summaryValue}>{value}</Text>
      </View>
      <Text numberOfLines={2} style={styles.summaryLabel}>
        {label}
      </Text>
      {hint ? <Text style={styles.summaryHint}>{hint}</Text> : null}
    </View>
  );
}

function getEnclosureDetailPhotoUris(enclosure: KolamEnclosure) {
  const uris: string[] = [];
  for (const path of [enclosure.coverPhotoUrl, ...enclosure.photos]) {
    const uri = getKolamFileUrl(path);
    if (uri && !uris.includes(uri)) {
      uris.push(uri);
    }
  }
  return uris;
}

function getEnclosureDetailTabs(showProductionTab: boolean) {
  return showProductionTab
    ? ENCLOSURE_DETAIL_TABS_WITH_PRODUCTION
    : ENCLOSURE_DETAIL_BASE_TABS;
}

function sumDetailSpeciesQty(enclosure: KolamEnclosure) {
  return enclosure.species.reduce(
    (sum, item) => sum + Math.max(0, Number(item.quantity) || 0),
    0,
  );
}

function sumProductionEggQty(enclosure: KolamEnclosure) {
  return enclosure.productionEggs.reduce(
    (sum, item) => sum + Math.max(0, Number(item.quantity) || 0),
    0,
  );
}

function countProductionBirthQty(enclosure: KolamEnclosure) {
  return enclosure.speciesPopulationHistory
    .filter(item => {
      const eventType = String(item.eventType || '').toLowerCase();
      const reason = String(item.reason || '').toUpperCase();
      return eventType === 'birth' || reason.includes('KELAHIRAN');
    })
    .reduce((sum, item) => sum + Math.max(0, Number(item.delta) || 0), 0);
}

function formatKolamCurrency(value: number) {
  return formatRupiah(Number(value) || 0);
}

function getStatisticsHealthIntent(tone: string) {
  if (tone === 'positive') {
    return 'success';
  }
  if (tone === 'negative') {
    return 'danger';
  }
  return 'muted';
}

function stripHtmlText(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatDashboardDateTime(value: string) {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

function getLivestockPurposeLabel(value: KolamEnclosureLivestockFilter | string) {
  if (value === 'production') {
    return 'Produksi (indukan)';
  }
  if (value === 'saleable') {
    return 'Stok jual';
  }
  return 'Semua livestock';
}

function getAquariumWaterLabel(value: string) {
  if (!value) {
    return '';
  }
  if (value === 'freshwater') {
    return 'Air tawar';
  }
  if (value === 'marine') {
    return 'Air laut';
  }
  return value;
}

function getSaleStatusLabel(value: string) {
  switch (value) {
    case 'for_sale':
      return 'Siap dijual';
    case 'reserved':
      return 'Direservasi invoice';
    case 'sold':
      return 'Terjual';
    default:
      return 'Belum dijual';
  }
}

function getSaleStatusIntent(
  value: string,
): 'success' | 'warning' | 'danger' | 'muted' {
  switch (value) {
    case 'for_sale':
      return 'success';
    case 'reserved':
      return 'warning';
    case 'sold':
      return 'danger';
    default:
      return 'muted';
  }
}

function getEnclosureStatusIntent(
  status: string,
): 'primary' | 'success' | 'warning' | 'danger' | 'muted' {
  switch (status) {
    case 'active':
      return 'success';
    case 'maintenance':
      return 'warning';
    case 'inactive':
    case 'deleted':
      return 'danger';
    default:
      return 'muted';
  }
}

function formatMediaMetaSize(enclosure: KolamEnclosure) {
  const {high, length, width} = enclosure.size;
  const hasSize =
    Number(high.value) > 0 &&
    Number(width.value) > 0 &&
    Number(length.value) > 0;
  if (!hasSize) {
    return '';
  }
  const dim = (value: number, unitLabel: string) =>
    unitLabel ? `${value}${unitLabel}` : String(value);
  return `T ${dim(high.value, high.unitLabel)} · L ${dim(
    width.value,
    width.unitLabel,
  )} · P ${dim(length.value, length.unitLabel)}`;
}


const styles = StyleSheet.create({
  surface: {
    gap: 14,
  },
  errorBadge: {
    alignSelf: 'stretch',
  },
  listRoot: {
    gap: 14,
    overflow: 'visible',
  },
  toolbarWrap: {
    elevation: 1000,
    gap: 10,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
  },
  toolbarButton: {
    flexShrink: 0,
    minHeight: 34,
    paddingHorizontal: 10,
  },
  detailSurface: {
    gap: 14,
  },
  detailToolbarContext: {
    color: V.colors.fg,
    flexShrink: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  detailRoot: {
    flexGrow: 0,
  },
  detailContent: {
    gap: 14,
    paddingBottom: 24,
  },
  stripCard: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  stripRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  stripItem: {
    gap: 4,
    minWidth: 96,
  },
  stripLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
  },
  stripValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  columns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  columnMain: {
    flex: 2,
    flexBasis: 420,
    gap: 14,
    minWidth: 280,
  },
  columnSide: {
    flex: 1,
    flexBasis: 280,
    gap: 14,
    minWidth: 240,
  },
  detailHeader: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 12,
  },
  detailHeaderPhoto: {
    alignItems: 'center',
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 56,
  },
  detailHeaderPhotoImage: {
    height: 56,
    width: 56,
  },
  detailHeaderCopy: {
    flex: 1,
    gap: 5,
    minWidth: 220,
  },
  detailTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '900',
  },
  detailBadgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  detailCode: {
    backgroundColor: V.colors.secondary,
    borderRadius: 6,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  detailActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailTabBar: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 8,
  },
  detailTabButton: {
    minHeight: 34,
  },
  detailOverviewGrid: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  detailMediaPanel: {
    gap: 10,
    maxWidth: 420,
    minWidth: 220,
    width: '100%',
  },
  detailMainPhoto: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  detailMainPhotoImage: {
    height: '100%',
    width: '100%',
  },
  detailThumbRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailThumb: {
    borderRadius: 6,
    height: 58,
    width: 58,
  },
  speciesPhoto: {
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flexShrink: 0,
    height: 40,
    width: 40,
  },
  speciesPhotoPlaceholder: {
    alignItems: 'center',
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flexShrink: 0,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  detailInfoPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 12,
    minWidth: 280,
    padding: 12,
  },
  detailWarningBand: {
    backgroundColor: V.colors.warningSoft,
    borderColor: V.colors.warning,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  detailDangerBand: {
    backgroundColor: V.colors.dangerSoft,
    borderColor: V.colors.danger,
  },
  climateCard: {
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 10,
  },
  detailFieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailField: {
    backgroundColor: V.colors.secondary,
    borderRadius: 6,
    flexGrow: 1,
    minWidth: 150,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  detailFieldLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  detailFieldValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },
  detailSection: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: 280,
  },
  detailSectionHeader: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  detailSectionBody: {
    gap: 8,
    padding: 12,
  },
  detailParagraph: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
  detailTwoColumn: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  detailStatsStack: {
    gap: 14,
  },
  detailSectionIntroRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  detailMiniRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
  },
  detailValueStack: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  detailInlineButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  operationGrid: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  operationInput: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    minHeight: 34,
    minWidth: 180,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  operationInputSmall: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    minHeight: 34,
    minWidth: 110,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  operationInputMultiline: {
    minHeight: 68,
    textAlignVertical: 'top',
  },
  emptyWrap: {
    padding: 16,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  sectionMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionAction: {
    flexShrink: 0,
  },
  summaryTile: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 142,
    padding: 12,
  },
  summaryTilePrimary: {
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.primary,
  },
  summaryTileWarning: {
    backgroundColor: V.colors.warningSoft,
    borderColor: V.colors.warning,
  },
  summaryTileHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  summaryIconPrimary: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.primary,
  },
  summaryIconWarning: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.warning,
  },
  summaryIconText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  summaryValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 24,
    fontWeight: '800',
  },
  summaryLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryHint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    marginTop: 4,
  },
  dashboardTableBlock: {
    gap: 8,
  },
  productionStatsCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  productionStatsHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  productionStatsTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '800',
  },
  productionStatsSubtitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    marginTop: 2,
  },
  rowTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '800',
  },
  rowMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  cellText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  warningText: {
    color: V.colors.warning,
  },
  dangerText: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  mutedText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  badgeTextSm: {
    fontSize: 10,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  panelRowCopy: {
    flex: 1,
    minWidth: 0,
  },
  qtyText: {
    color: V.colors.fg,
    flexShrink: 0,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  mediaMetaCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  mediaMetaLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  mediaMetaValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  commentThread: {
    gap: 10,
  },
  commentComposer: {
    gap: 10,
  },
  commentHtml: {
    marginTop: 2,
  },
  commentCard: {
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 10,
  },
  commentReplyWrap: {
    borderLeftColor: V.colors.border,
    borderLeftWidth: 2,
    gap: 10,
    marginLeft: 12,
    paddingLeft: 10,
  },
  commentEdited: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontStyle: 'italic',
  },
});
