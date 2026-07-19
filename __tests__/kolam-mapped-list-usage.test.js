const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'src', 'components');
const mappedListBatchComponents = [
  'kolam-action-control-set.tsx',
  'kolam-attention-panel-actions.tsx',
  'kolam-auth-source-picker.tsx',
  'kolam-breadcrumb-trail.tsx',
  'kolam-checkout-cart-list.tsx',
  'kolam-choice-segment-group.tsx',
  'kolam-command-index-widgets.tsx',
  'kolam-control-tab-list.tsx',
  'kolam-copy-stack.tsx',
  'kolam-dashboard-count-strip.tsx',
  'kolam-dashboard-header-actions.tsx',
  'kolam-dashboard-metric-sparkline.tsx',
  'kolam-dashboard-pending-orders-badges.tsx',
  'kolam-dashboard-pending-orders-grid.tsx',
  'kolam-dashboard-sales-graph-plot.tsx',
  'kolam-dashboard-stat-channel-rows.tsx',
  'kolam-dashboard-stats-strip.tsx',
  'kolam-data-table-header.tsx',
  'kolam-description-list.tsx',
  'kolam-detail-panel-body.tsx',
  'kolam-detail-panel-warning-box.tsx',
  'kolam-endpoint-list.tsx',
  'kolam-filter-bar.tsx',
  'kolam-menu-dock-widgets.tsx',
  'kolam-menu-section-items.tsx',
  'kolam-pagination-nav.tsx',
  'kolam-plugin-registry-summary-grid.tsx',
  'kolam-runtime-action-grid.tsx',
  'kolam-runtime-identity-grid.tsx',
  'kolam-sales-table.tsx',
  'kolam-sellable-catalog-grid.tsx',
  'kolam-sellable-catalog-type-tabs.tsx',
  'kolam-selector-chip-group.tsx',
  'kolam-settings-activity-table-header.tsx',
  'kolam-settings-detail-rows-surface.tsx',
  'kolam-settings-role-editor-action-list.tsx',
  'kolam-settings-role-flag-badges.tsx',
  'kolam-settings-role-info-badge-list.tsx',
  'kolam-settings-role-permission-group.tsx',
  'kolam-settings-role-permission-matrix.tsx',
  'kolam-settings-route-list.tsx',
  'kolam-settings-web-form-fields.tsx',
  'kolam-settings-web-form-sections.tsx',
  'kolam-sidebar-menu-widgets.tsx',
  'kolam-sidebar-module-groups.tsx',
  'kolam-sidebar-nav-group.tsx',
  'kolam-stats-card-strip.tsx',
  'kolam-summary-card-badges.tsx',
  'kolam-summary-lines.tsx',
  'kolam-surface-panel-tabs.tsx',
  'kolam-top-navigation-right.tsx',
  'kolam-workflow-notice.tsx',
];

describe('KolamMappedList usage', () => {
  it('keeps repeated render collections on the shared mapped-list primitive', () => {
    const regressions = mappedListBatchComponents
      .map(file => {
        const source = fs.readFileSync(path.join(componentsDir, file), 'utf8');

        return {
          file,
          hasMappedList: source.includes("from './kolam-mapped-list'"),
          directMapRender: source.includes('.map('),
        };
      })
      .filter(result => !result.hasMappedList || result.directMapRender);

    expect(regressions).toEqual([]);
  });
});
