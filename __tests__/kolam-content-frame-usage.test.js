const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'src', 'components');
const contentFrameComponents = [
  {
    file: 'kolam-checkout-summary-panel.tsx',
    legacyShell: '<View style={styles.checkoutPane}>',
  },
  {
    file: 'kolam-checkout-catalog-pane.tsx',
    legacyShell: '<View style={styles.catalogPane}>',
  },
  {
    file: 'kolam-checkout-cart-list.tsx',
    legacyShell: '<View style={styles.cartList}>',
  },
  {
    file: 'kolam-checkout-workspace-body.tsx',
    legacyShell: '<View style={styles.workspace}>',
  },
  {
    file: 'kolam-status-panel-body.tsx',
    legacyShell: '<View style={styles.statusPanelBody}>',
  },
  {
    file: 'kolam-user-menu-list.tsx',
    legacyShell: '<View style={styles.userMenuList}>',
  },
  {
    file: 'kolam-command-palette-section-block.tsx',
    legacyShell: '<View style={styles.commandPaletteSection}>',
  },
  {
    file: 'kolam-command-palette-empty-state.tsx',
    legacyShell: '<View style={styles.commandPaletteEmpty}>',
  },
  {
    file: 'kolam-dashboard-sales-graph-empty-state.tsx',
    legacyShell: '<View style={styles.salesGraphEmpty}>',
  },
  {
    file: 'kolam-dashboard-sales-graph-plot.tsx',
    legacyShell: '<View style={styles.salesGraphPlot}>',
  },
  {
    file: 'kolam-detail-panel-body.tsx',
    legacyShell: '<View style={styles.body}>',
  },
  {
    file: 'kolam-detail-panel-warning-box.tsx',
    legacyShell: '<View style={styles.warningBox}>',
  },
  {
    file: 'kolam-cashflow-close-preview.tsx',
    legacyShell: '<View style={styles.cashflowPreview}>',
  },
  {
    file: 'kolam-native-form-section.tsx',
    legacyShell: '<View style={styles.nativeFormSection}>',
  },
  {
    file: 'kolam-native-form-section.tsx',
    legacyShell: '<View style={styles.nativeFormControls}>',
  },
  {
    file: 'kolam-settings-web-config-surface.tsx',
    legacyShell: '<View style={styles.settingsWebConfig}>',
  },
  {
    file: 'kolam-settings-web-form-sections.tsx',
    legacyShell: '<View style={styles.settingsWebFormSections}>',
  },
  {
    file: 'kolam-settings-web-form-section.tsx',
    legacyShell: '<View style={styles.settingsWebFormSection}>',
  },
];

describe('KolamContentFrame usage', () => {
  it('keeps repeated content shells on the shared content frame', () => {
    const regressions = contentFrameComponents
      .map(({file, legacyShell}) => {
        const source = fs.readFileSync(path.join(componentsDir, file), 'utf8');

        return {
          file,
          hasContentFrame: source.includes("from './kolam-content-frame'"),
          legacyShell: source.includes(legacyShell),
        };
      })
      .filter(result => !result.hasContentFrame || result.legacyShell);

    expect(regressions).toEqual([]);
  });
});
