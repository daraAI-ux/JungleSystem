const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'src', 'components');

const frameTargets = [
  {
    file: 'kolam-app-shell-surface.tsx',
    importText: "from './kolam-shell-frame'",
    legacyShells: ['<View style={styles.shell}>', '<View style={styles.main}>'],
  },
  {
    file: 'kolam-top-navigation.tsx',
    importText: "from './kolam-shell-frame'",
    legacyShells: ['<View style={styles.topNav}>'],
  },
  {
    file: 'kolam-command-palette-overlay.tsx',
    importText: "from './kolam-shell-frame'",
    legacyShells: ['<View style={styles.commandPaletteOverlay}>'],
  },
  {
    file: 'kolam-unified-dashboard-layout-section.tsx',
    importText: "from './kolam-shell-frame'",
    legacyShells: [
      '<View style={styles.dashboardLayout}>',
      '<View style={styles.dashboardMain}>',
    ],
  },
  {
    file: 'kolam-dashboard-header.tsx',
    importText: "from './kolam-header-frame'",
    legacyShells: ['<View style={styles.header}>'],
  },
  {
    file: 'kolam-detail-panel-header.tsx',
    importText: "from './kolam-header-frame'",
    legacyShells: ['<View style={styles.header}>'],
  },
  {
    file: 'kolam-status-panel-header.tsx',
    importText: "from './kolam-header-frame'",
    legacyShells: ['<View style={styles.statusPanelHeader}>'],
  },
  {
    file: 'kolam-status-panel-title-row.tsx',
    importText: "from './kolam-header-frame'",
    legacyShells: ['<View style={styles.statusPanelTitleRow}>'],
  },
  {
    file: 'kolam-surface-panel-header.tsx',
    importText: "from './kolam-header-frame'",
    legacyShells: ['<View style={styles.header}>'],
  },
  {
    file: 'kolam-menu-section.tsx',
    importText: "from './kolam-header-frame'",
    legacyShells: ['<View style={styles.kolamMenuSectionHeader}>'],
  },
  {
    file: 'kolam-menu-title.tsx',
    importText: "from './kolam-header-frame'",
    legacyShells: ['<View style={styles.kolamMenuTitleRow}>'],
  },
  {
    file: 'kolam-sync-activity-item-header.tsx',
    importText: "from './kolam-header-frame'",
    legacyShells: ['<View style={styles.itemHeader}>'],
  },
  {
    file: 'kolam-catalog-card.tsx',
    importText: "from './kolam-header-frame'",
    legacyShells: ['<View style={styles.catalogCardHeader}>'],
  },
  {
    file: 'kolam-runtime-identity-strip.tsx',
    importText: "from './kolam-card-frame'",
    legacyShells: ['<View style={styles.runtimeIdentityStrip}>'],
  },
  {
    file: 'kolam-runtime-identity-card.tsx',
    importText: "from './kolam-card-frame'",
    legacyShells: ['<View style={styles.runtimeIdentityItem}>'],
  },
  {
    file: 'kolam-sync-status-bar.tsx',
    importText: "from './kolam-card-frame'",
    legacyShells: ['<View style={styles.syncBar}>'],
  },
  {
    file: 'kolam-unified-source-panel.tsx',
    importText: "from './kolam-card-frame'",
    legacyShells: ['<View style={styles.sourceBox}>'],
  },
  {
    file: 'kolam-sales-panel.tsx',
    importText: "from './kolam-card-frame'",
    legacyShells: ['<View style={styles.salesPanel}>'],
  },
  {
    file: 'kolam-menu-dock-widgets.tsx',
    importText: "from './kolam-card-frame'",
    legacyShells: ['<View style={styles.kolamMenuDockItem}>'],
  },
];

describe('structural frame usage', () => {
  it('keeps repeated layout/card/header shells on shared frame primitives', () => {
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