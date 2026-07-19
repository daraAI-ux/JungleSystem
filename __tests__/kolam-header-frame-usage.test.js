const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'src', 'components');
const headerFrameComponents = [
  {
    file: 'kolam-attention-panel-header.tsx',
    legacyShell: '<View style={styles.attentionPanelHeader}>',
  },
  {
    file: 'kolam-checkout-summary-header.tsx',
    legacyShell: '<View style={styles.checkoutHeader}>',
  },
  {
    file: 'kolam-dashboard-pending-orders-header.tsx',
    legacyShell: '<View style={styles.pendingOrdersHeader}>',
  },
  {
    file: 'kolam-dashboard-pending-orders-title-row.tsx',
    legacyShell: '<View style={styles.pendingOrdersTitleRow}>',
  },
  {
    file: 'kolam-dashboard-pending-orders-meta-row.tsx',
    legacyShell: '<View style={styles.pendingOrdersMetaRow}>',
  },
  {
    file: 'kolam-dashboard-rail-header.tsx',
    legacyShell: '<View style={styles.dashboardRailHeader}>',
  },
  {
    file: 'kolam-dashboard-sales-graph-header.tsx',
    legacyShell: '<View style={styles.salesGraphHeader}>',
  },
  {
    file: 'kolam-dashboard-sales-graph-header.tsx',
    legacyShell: '<View style={styles.salesGraphTitleRow}>',
  },
  {
    file: 'kolam-dashboard-stat-card-header.tsx',
    legacyShell: '<View style={styles.metricCardHeader}>',
  },
  {
    file: 'kolam-plugin-summary-card-header.tsx',
    legacyShell: '<View style={styles.pluginSummaryHeader}>',
  },
  {
    file: 'kolam-runtime-action-card-header.tsx',
    legacyShell: '<View style={styles.runtimeActionCardHeader}>',
  },
  {
    file: 'kolam-runtime-identity-header.tsx',
    legacyShell: '<View style={styles.runtimeIdentityHeader}>',
  },
  {
    file: 'kolam-runtime-identity-card-header.tsx',
    legacyShell: '<View style={styles.runtimeIdentityItemTop}>',
  },
  {
    file: 'kolam-sales-panel-header.tsx',
    legacyShell: '<View style={styles.sectionHeader}>',
  },
  {
    file: 'kolam-sellable-catalog-header.tsx',
    legacyShell: '<View style={styles.sectionHeader}>',
  },
  {
    file: 'kolam-settings-role-permission-group-header.tsx',
    legacyShell: '<View style={styles.settingsRolePermissionMatrixGroupHeader}>',
  },
];

describe('KolamHeaderFrame usage', () => {
  it('keeps repeated header shells on the shared header frame', () => {
    const regressions = headerFrameComponents
      .map(({file, legacyShell}) => {
        const source = fs.readFileSync(path.join(componentsDir, file), 'utf8');

        return {
          file,
          hasHeaderFrame: source.includes("from './kolam-header-frame'"),
          legacyShell: source.includes(legacyShell),
        };
      })
      .filter(result => !result.hasHeaderFrame || result.legacyShell);

    expect(regressions).toEqual([]);
  });
});