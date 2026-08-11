import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { KOLAM_AI_MODULE_ICON_SVG } from '../assets/icons/ai-module-icon-svg';
import { KOLAM_COMPLAINT_MODULE_ICON_SVG } from '../assets/icons/complaint-module-icon-svg';
import { KOLAM_DARA_TRAINING_MODULE_ICON_SVG } from '../assets/icons/dara-training-module-icon-svg';
import { KOLAM_MEDIA_CAMERA_TOPBAR_ICON_SVG } from '../assets/icons/media-camera-topbar-icon-svg';
import { KOLAM_NOTES_ICON_SVG } from '../assets/icons/notes-icon-svg';
import { KOLAM_PRODUCT_MODULE_ICON_SVG } from '../assets/icons/product-module-icon-svg';
import { KOLAM_SHIPPING_METHOD_MODULE_ICON_SVG } from '../assets/icons/shipping-method-module-icon-svg';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  buildKolamDaraTrainingRoute,
  buildKolamDaraTrainingStatsCards,
  getKolamDaraTrainingTab,
  KOLAM_DARA_TRAINING_TABS,
  resolveKolamDaraTrainingAccess,
  type KolamDaraTrainingTabId,
} from '../domain/kolam-dara-training';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { useKolamDaraTrainingController } from '../hooks/use-kolam-dara-training-controller';
import { KolamButton } from './kolam-button';
import { KolamDaraTrainingFineTuneBody } from './kolam-dara-training-fine-tune-body';
import { KolamDaraTrainingFulfillmentBody } from './kolam-dara-training-fulfillment-body';
import { KolamDaraTrainingPhrasesBody } from './kolam-dara-training-phrases-body';
import { KolamDaraTrainingProductsBody } from './kolam-dara-training-products-body';
import { KolamDaraTrainingReviewsBody } from './kolam-dara-training-reviews-body';
import { KolamDaraTrainingVideoStudioBody } from './kolam-dara-training-video-studio-body';
import { KolamDaraTrainingVisionBody } from './kolam-dara-training-vision-body';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamStatsCardStrip } from './kolam-stats-card-strip';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

const KOLAM_ACTION_BUTTON_BG = '#374151';

const KOLAM_DARA_TRAINING_TAB_ICONS: Record<KolamDaraTrainingTabId, string> = {
  phrases: KOLAM_NOTES_ICON_SVG,
  fulfillment: KOLAM_SHIPPING_METHOD_MODULE_ICON_SVG,
  products: KOLAM_PRODUCT_MODULE_ICON_SVG,
  vision: KOLAM_MEDIA_CAMERA_TOPBAR_ICON_SVG,
  videoStudio: KOLAM_DARA_TRAINING_MODULE_ICON_SVG,
  reviews: KOLAM_COMPLAINT_MODULE_ICON_SVG,
  fineTune: KOLAM_AI_MODULE_ICON_SVG,
};

function getToolbarIconXml(xml: string) {
  return xml.replace(/#[0-9a-fA-F]{6}/g, V.colors.primaryFg);
}

/** FE `DaraTrainingPage` shell. */
export function KolamDaraTrainingSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const { authUser } = useKolamAuthContext();
  const access = resolveKolamDaraTrainingAccess({
    roleKey: authUser?.roleKey,
    permissions: authUser?.permissions,
    isOwner: (authUser as { isOwner?: boolean } | null | undefined)?.isOwner,
  });
  const controller = useKolamDaraTrainingController(route, {
    enabled: access.canSee,
  });
  const phrasesRefreshKey = 0;
  const fulfillmentRefreshKey = 0;
  const productsRefreshKey = 0;
  const reviewsRefreshKey = 0;
  const fineTuneRefreshKey = 0;
  const visionRefreshKey = 0;
  const videoStudioRefreshKey = 0;

  const selectedTab = getKolamDaraTrainingTab(route);
  const selectedTabLabel =
    KOLAM_DARA_TRAINING_TABS.find(tab => tab.id === selectedTab)?.label ??
    'Frasa respons cepat';

  const statsCards = useMemo(
    () =>
      controller.stats
        ? buildKolamDaraTrainingStatsCards(controller.stats)
        : [],
    [controller.stats],
  );

  if (!access.canSee) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState message="dara-training" title="Akses ditolak" />
      </View>
    );
  }

  return (
    <View style={styles.surface}>
      <View style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              {KOLAM_DARA_TRAINING_TABS.map(tab => (
                <KolamButton
                  key={tab.id}
                  accessibilityLabel={tab.label}
                  icon={
                    <SvgXml
                      height="100%"
                      width="100%"
                      xml={getToolbarIconXml(
                        KOLAM_DARA_TRAINING_TAB_ICONS[tab.id],
                      )}
                    />
                  }
                  label={tab.label}
                  onPress={() => {
                    onRouteChange?.(buildKolamDaraTrainingRoute(tab.id));
                  }}
                  size="sm"
                  style={[
                    styles.toolbarTabButton,
                    selectedTab === tab.id && styles.toolbarTabButtonActive,
                  ]}
                  textStyle={styles.toolbarTabButtonText}
                />
              ))}
            </View>
          </View>
        </View>
      </View>

      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
        />
      ) : null}

      {statsCards.length > 0 ? (
        <KolamStatsCardStrip cards={statsCards} />
      ) : null}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
        style={styles.scroll}
      >
        {selectedTab === 'phrases' ? (
          <KolamDaraTrainingPhrasesBody
            canManage={access.canManage}
            refreshKey={phrasesRefreshKey}
          />
        ) : selectedTab === 'fulfillment' ? (
          <KolamDaraTrainingFulfillmentBody
            canManage={access.canManage}
            refreshKey={fulfillmentRefreshKey}
          />
        ) : selectedTab === 'products' ? (
          <KolamDaraTrainingProductsBody
            canManage={access.canManage}
            onStatsRefresh={controller.onRefresh}
            refreshKey={productsRefreshKey}
            stats={controller.stats}
          />
        ) : selectedTab === 'reviews' ? (
          <KolamDaraTrainingReviewsBody refreshKey={reviewsRefreshKey} />
        ) : selectedTab === 'fineTune' ? (
          <KolamDaraTrainingFineTuneBody
            canManage={access.canManage}
            refreshKey={fineTuneRefreshKey}
          />
        ) : selectedTab === 'vision' ? (
          <KolamDaraTrainingVisionBody
            canManage={access.canManage}
            refreshKey={visionRefreshKey}
          />
        ) : selectedTab === 'videoStudio' ? (
          <KolamDaraTrainingVideoStudioBody
            canManage={access.canManage}
            refreshKey={videoStudioRefreshKey}
          />
        ) : controller.loading && !controller.stats ? (
          <Text style={styles.meta}>Memuat…</Text>
        ) : (
          <View style={styles.stubCard}>
            <Text style={styles.stubTitle}>{selectedTabLabel}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 10,
    minHeight: 0,
  },
  toolbarWrap: {
    elevation: 1000,
    flexShrink: 0,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
  },
  toolbarTabButton: {
    backgroundColor: KOLAM_ACTION_BUTTON_BG,
    borderColor: KOLAM_ACTION_BUTTON_BG,
    opacity: 0.9,
  },
  toolbarTabButtonActive: {
    opacity: 1,
  },
  toolbarTabButtonText: {
    color: V.colors.primaryFg,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 24,
  },
  stubCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 12,
  },
  stubTitle: {
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
});
