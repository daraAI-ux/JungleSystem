const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'src', 'components');
const listFrameComponents = [
  {
    file: 'kolam-checkout-metrics-row.tsx',
    legacyShell: '<View style={styles.metricsRow}>',
  },
  {
    file: 'kolam-dashboard-count-strip.tsx',
    legacyShell: '<View style={styles.dashboardCountGrid}>',
  },
  {
    file: 'kolam-dashboard-customer-visit-confirmations.tsx',
    legacyShell: '<View style={styles.list}>',
  },
  {
    file: 'kolam-dashboard-pending-orders-grid.tsx',
    legacyShell: '<View style={styles.pendingOrdersGrid}>',
  },
  {
    file: 'kolam-dashboard-right-rail.tsx',
    legacyShell: '<View style={styles.dashboardRail}>',
  },
  {
    file: 'kolam-dashboard-stats-strip.tsx',
    legacyShell: '<View style={styles.metricGrid}>',
  },
  {
    file: 'kolam-dashboard-stat-channel-rows.tsx',
    legacyShell: '<View style={styles.metricChannelRows}>',
  },
  {
    file: 'kolam-plugin-registry-list.tsx',
    legacyShell: '<View style={styles.pluginList}>',
  },
  {
    file: 'kolam-plugin-registry-summary-grid.tsx',
    legacyShell: '<View style={styles.pluginSummaryGrid}>',
  },
  {
    file: 'kolam-runtime-action-grid.tsx',
    legacyShell: '<View style={styles.runtimeActionGrid}>',
  },
  {
    file: 'kolam-runtime-identity-grid.tsx',
    legacyShell: '<View style={styles.runtimeIdentityStrip}>',
  },
  {
    file: 'kolam-sellable-catalog-grid.tsx',
    legacyShell: '<View style={styles.catalogGrid}>',
  },
  {
    file: 'kolam-stats-card-strip.tsx',
    legacyShell: '<View style={styles.statsCardStrip}>',
  },
  {
    file: 'kolam-unified-metrics-section.tsx',
    legacyShell: '<View style={styles.metricsGrid}>',
  },
  {
    file: 'kolam-auth-controls.tsx',
    legacyShell: '<View style={styles.authControls}>',
  },
  {
    file: 'kolam-auth-source-picker.tsx',
    legacyShell: '<View style={styles.authSourcePicker}>',
  },
  {
    file: 'kolam-attention-panel-list.tsx',
    legacyShell: '<View style={styles.attentionList}>',
  },
  {
    file: 'kolam-attention-panel-actions.tsx',
    legacyShell: '<View style={styles.attentionPanelActions}>',
  },
  {
    file: 'kolam-cashflow-open-form.tsx',
    legacyShell: '<View style={styles.formGrid}>',
  },
  {
    file: 'kolam-customer-form-grid.tsx',
    legacyShell: '<View style={styles.formGrid}>',
  },
  {
    file: 'kolam-operational-panel.tsx',
    legacyShell: '<View style={styles.operationalStack}>',
  },
  {
    file: 'kolam-operational-panel.tsx',
    legacyShell: '<View style={styles.operationalGrid}>',
  },
  {
    file: 'kolam-am-operational-panel.tsx',
    legacyShell: '<View style={styles.operationalGrid}>',
  },
  {
    file: 'kolam-command-index-widgets.tsx',
    legacyShell: '<View style={styles.commandList}>',
  },
  {
    file: 'kolam-description-list.tsx',
    legacyShell: '<View style={styles.list} accessibilityLabel={accessibilityLabel}>',
  },
  {
    file: 'kolam-endpoint-list.tsx',
    legacyShell: '<View style={styles.list} accessibilityLabel={accessibilityLabel}>',
  },
  {
    file: 'kolam-menu-dock-widgets.tsx',
    legacyShell: '<View style={styles.kolamMenuDockGroup}>',
  },
  {
    file: 'kolam-cart-row-actions.tsx',
    legacyShell: '<View style={styles.cartActionRow}>',
  },
  {
    file: 'kolam-cart-row-discount-controls.tsx',
    legacyShell: '<View style={styles.lineDiscountRow}>',
  },
  {
    file: 'kolam-checkout-discount-row.tsx',
    legacyShell: '<View style={styles.adjustmentRow}>',
  },
  {
    file: 'kolam-sale-actions.tsx',
    legacyShell: '<View style={styles.saleActions}>',
  },
  {
    file: 'kolam-dashboard-header-actions.tsx',
    legacyShell: '<View style={styles.headerActions}>',
  },
  {
    file: 'kolam-top-navigation-left.tsx',
    legacyShell: '<View style={styles.topNavLeft}>',
  },
  {
    file: 'kolam-top-navigation-right.tsx',
    legacyShell: '<View style={styles.topNavRight}>',
  },
  {
    file: 'kolam-menu-section-actions.tsx',
    legacyShell: '<View style={styles.kolamMenuSectionActions}>',
  },
  {
    file: 'kolam-settings-role-editor-action-list.tsx',
    legacyShell: '<View style={styles.settingsRoleEditorActions}>',
  },
  {
    file: 'kolam-settings-role-editor-toolbar.tsx',
    legacyShell: '<View style={styles.settingsRoleEditorToolbar}>',
  },
  {
    file: 'kolam-settings-role-info-actions.tsx',
    legacyShell: '<View style={styles.settingsRoleInfoActions}>',
  },
  {
    file: 'kolam-command-palette-search-row.tsx',
    legacyShell: '<View style={styles.commandPaletteSearchRow}>',
  },
];

describe('KolamListFrame usage', () => {
  it('keeps repeated list and grid wrappers on the shared list frame', () => {
    const regressions = listFrameComponents
      .map(({file, legacyShell}) => {
        const source = fs.readFileSync(path.join(componentsDir, file), 'utf8');

        return {
          file,
          hasListFrame: source.includes("from './kolam-list-frame'"),
          legacyShell: source.includes(legacyShell),
        };
      })
      .filter(result => !result.hasListFrame || result.legacyShell);

    expect(regressions).toEqual([]);
  });
});
