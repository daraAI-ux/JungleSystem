const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'src', 'components');
const cardFrameComponents = [
  {
    file: 'kolam-checkout-adjustment-box.tsx',
    legacyShell: '<View style={styles.adjustmentBox}>',
  },
  {
    file: 'kolam-dashboard-count-card.tsx',
    legacyShell: '<View style={styles.dashboardCountCard}>',
  },
  {
    file: 'kolam-dashboard-pending-orders.tsx',
    legacyShell: '<View style={styles.pendingOrdersCard}>',
  },
  {
    file: 'kolam-dashboard-rail-card.tsx',
    legacyShell: '<View style={styles.dashboardRailCard}>',
  },
  {
    file: 'kolam-dashboard-sales-graph-card.tsx',
    legacyShell: '<View style={styles.salesGraphCard}>',
  },
  {
    file: 'kolam-plugin-registry-summary.tsx',
    legacyShell: '<View style={styles.pluginHubSummary}>',
  },
  {
    file: 'kolam-plugin-registry-table.tsx',
    legacyShell: '<View style={styles.pluginTable}>',
  },
  {
    file: 'kolam-catalog-table.tsx',
    legacyShell: '<View style={styles.dataTable}>',
  },
  {
    file: 'kolam-customer-table.tsx',
    legacyShell: '<View style={styles.dataTable}>',
  },
  {
    file: 'kolam-sales-table.tsx',
    legacyShell: '<View style={styles.dataTable}>',
  },
  {
    file: 'kolam-settings-activity-table.tsx',
    legacyShell: 'style={styles.settingsActivityTable}',
  },
  {
    file: 'kolam-settings-role-permission-matrix.tsx',
    legacyShell: '<View style={styles.settingsRolePermissionMatrix}>',
  },
  {
    file: 'kolam-settings-route-list.tsx',
    legacyShell: '<View style={styles.settingsRouteList}>',
  },
  {
    file: 'kolam-surface-contract-list.tsx',
    legacyShell: '<View style={styles.surfaceList}>',
  },
];

describe('KolamCardFrame usage', () => {
  it('keeps repeated card and table shells on the shared card frame', () => {
    const regressions = cardFrameComponents
      .map(({file, legacyShell}) => {
        const source = fs.readFileSync(path.join(componentsDir, file), 'utf8');

        return {
          file,
          hasCardFrame: source.includes("from './kolam-card-frame'"),
          legacyShell: source.includes(legacyShell),
        };
      })
      .filter(result => !result.hasCardFrame || result.legacyShell);

    expect(regressions).toEqual([]);
  });

  it('keeps PendingOrders shell chrome out of the local text style sheet', () => {
    const source = fs.readFileSync(
      path.join(componentsDir, 'kolam-dashboard-pending-orders-styles.ts'),
      'utf8',
    );

    expect(source).not.toMatch(
      /pendingOrders(Card|Header|TitleRow|Link|Grid|Range|MetaRow):/,
    );
  });
});
