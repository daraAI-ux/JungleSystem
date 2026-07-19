const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'src', 'components');
const inlineFrameComponents = [
  {
    file: 'kolam-attention-item-copy.tsx',
    legacyShell: '<View style={styles.attentionItemCopy}>',
  },
  {
    file: 'kolam-attention-item-title-row.tsx',
    legacyShell: '<View style={styles.attentionItemTitleRow}>',
  },
  {
    file: 'kolam-cart-row-item-info.tsx',
    legacyShell: '<View style={styles.cartItemInfo}>',
  },
  {
    file: 'kolam-description-list-details.tsx',
    legacyShell: '<View style={styles.details}>',
  },
  {
    file: 'kolam-detail-panel-field-row.tsx',
    legacyShell: '<View style={styles.field}>',
  },
  {
    file: 'kolam-dashboard-sales-graph-point.tsx',
    legacyShell: '<View style={styles.salesGraphPoint}>',
  },
  {
    file: 'kolam-dashboard-sales-graph-point.tsx',
    legacyShell: '<View style={styles.salesGraphAreaTrack}>',
  },
  {
    file: 'kolam-dashboard-metric-sparkline.tsx',
    legacyShell: '<View style={styles.metricSparkline}>',
  },
  {
    file: 'kolam-plugin-registry-row-identity.tsx',
    legacyShell: '<View style={styles.pluginIdentity}>',
  },
  {
    file: 'kolam-plugin-registry-row-capabilities.tsx',
    legacyShell: '<View style={styles.pluginCapabilities}>',
  },
  {
    file: 'kolam-plugin-registry-row-repo-route.tsx',
    legacyShell: '<View style={styles.pluginRepoRoute}>',
  },
  {
    file: 'kolam-plugin-registry-row-status.tsx',
    legacyShell: '<View style={styles.pluginStatusBox}>',
  },
  {
    file: 'kolam-settings-role-info-copy.tsx',
    legacyShell: '<View style={styles.settingsRoleInfoCopy}>',
  },
  {
    file: 'kolam-settings-role-info-copy.tsx',
    legacyShell: '<View style={styles.settingsRoleInfoTitleRow}>',
  },
  {
    file: 'kolam-settings-role-member-preview.tsx',
    legacyShell: '<View style={styles.settingsRoleMemberPreview}>',
  },
  {
    file: 'kolam-settings-role-member-preview.tsx',
    legacyShell: '<View style={styles.settingsRoleMemberHeader}>',
  },
  {
    file: 'kolam-settings-role-permission-resource.tsx',
    legacyShell: '<View style={styles.settingsRolePermissionMatrixResource}>',
  },
  {
    file: 'kolam-workflow-notice-row.tsx',
    legacyShell: '<View style={styles.row}>',
  },
  {
    file: 'kolam-total-row.tsx',
    legacyShell: '<View style={styles.row}>',
  },
];

describe('KolamInlineFrame usage', () => {
  it('keeps repeated micro-layout shells on the shared inline frame', () => {
    const regressions = inlineFrameComponents
      .map(({file, legacyShell}) => {
        const source = fs.readFileSync(path.join(componentsDir, file), 'utf8');

        return {
          file,
          hasInlineFrame: source.includes("from './kolam-inline-frame'"),
          legacyShell: source.includes(legacyShell),
        };
      })
      .filter(result => !result.hasInlineFrame || result.legacyShell);

    expect(regressions).toEqual([]);
  });
});
