const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'src', 'components');

const frameTargets = [
  {
    file: 'kolam-breadcrumb-trail.tsx',
    importText: "from './kolam-list-frame'",
    legacyShells: ['<View style={styles.breadcrumbTrail}>'],
  },
  {
    file: 'kolam-filter-bar.tsx',
    importText: "from './kolam-list-frame'",
    legacyShells: ['<View style={styles.bar}'],
  },
  {
    file: 'kolam-control-tab-list.tsx',
    importText: "from './kolam-list-frame'",
    legacyShells: ['<View style={styles.shell}'],
  },
  {
    file: 'kolam-sellable-catalog-type-tabs.tsx',
    importText: "from './kolam-list-frame'",
    legacyShells: ['<View style={styles.segmented}>'],
  },
  {
    file: 'kolam-surface-panel-tabs.tsx',
    importText: "from './kolam-list-frame'",
    legacyShells: ['<View style={styles.segmentRow}>'],
  },
  {
    file: 'kolam-dashboard-pending-orders-badges.tsx',
    importText: "from './kolam-list-frame'",
    legacyShells: ['<View style={styles.pendingOrdersBadges}>'],
  },
  {
    file: 'kolam-dashboard-pending-orders-action-link.tsx',
    importText: "from './kolam-list-frame'",
    legacyShells: ['<View style={styles.pendingOrdersLink}>'],
  },
  {
    file: 'kolam-summary-card-badges.tsx',
    importText: "from './kolam-list-frame'",
    legacyShells: ['<View style={styles.badges}>'],
  },
  {
    file: 'kolam-dashboard-stat-channel-rows.tsx',
    importText: "from './kolam-list-frame'",
    legacyShells: ['<View style={styles.metricChannelRows}>'],
  },
  {
    file: 'kolam-dashboard-rail-action.tsx',
    importText: "from './kolam-list-frame'",
    legacyShells: ['<View style={styles.dashboardRailAction}>'],
  },
  {
    file: 'kolam-pagination-footer.tsx',
    importText: "from './kolam-header-frame'",
    legacyShells: ['<View style={styles.footer}'],
  },
  {
    file: 'kolam-metric-card-header.tsx',
    importText: "from './kolam-header-frame'",
    legacyShells: ['<View style={styles.header}>'],
  },
  {
    file: 'kolam-module-panel.tsx',
    importText: "from './kolam-header-frame'",
    legacyShells: ['<View style={styles.sectionHeader}>'],
  },
  {
    file: 'kolam-dashboard-pending-orders-range-card.tsx',
    importText: "from './kolam-card-frame'",
    legacyShells: ['<View style={styles.pendingOrdersRange}>'],
  },
  {
    file: 'kolam-dashboard-rail-row.tsx',
    importText: "from './kolam-card-frame'",
    legacyShells: ['<View style={styles.dashboardRailRow}>'],
  },
  {
    file: 'kolam-dashboard-rail-empty-state.tsx',
    importText: "from './kolam-card-frame'",
    legacyShells: ['<View style={styles.dashboardRailEmpty}>'],
  },
  {
    file: 'kolam-unified-runtime-footer.tsx',
    importText: "from './kolam-card-frame'",
    legacyShells: ['<View style={styles.unifiedFooter}>'],
  },
  {
    file: 'kolam-workflow-notice.tsx',
    importText: "from './kolam-card-frame'",
    legacyShells: ['<View style={styles.notice}>'],
  },
  {
    file: 'kolam-checkout-total-box.tsx',
    importText: "from './kolam-card-frame'",
    legacyShells: ['<View style={styles.totalBox}>'],
  },
];

describe('bar/list/card frame usage', () => {
  it('keeps repeated bars, lists, and small cards on shared frames', () => {
    const regressions = frameTargets
      .map(({file, importText, legacyShells}) => {
        const source = fs.readFileSync(path.join(componentsDir, file), 'utf8');

        return {
          file,
          hasFrameImport: source.includes(importText),
          legacyShells: legacyShells.filter(legacy => source.includes(legacy)),
        };
      })
      .filter(result => !result.hasFrameImport || result.legacyShells.length);

    expect(regressions).toEqual([]);
  });
});