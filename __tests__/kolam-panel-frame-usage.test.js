const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'src', 'components');
const panelFrameComponents = [
  {
    file: 'kolam-auth-panel.tsx',
    legacyShell: '<View style={styles.authPanel}>',
  },
  {
    file: 'kolam-attention-panel.tsx',
    legacyShell: '<View style={styles.attentionPanel}>',
  },
  {
    file: 'kolam-command-palette-panel.tsx',
    legacyShell: '<View style={styles.commandPalettePanel}>',
  },
  {
    file: 'kolam-detail-panel.tsx',
    legacyShell: '<View style={styles.panel}>',
  },
  {
    file: 'kolam-module-panel.tsx',
    legacyShell: '<View style={styles.modulePanel}>',
  },
  {
    file: 'kolam-status-panel-frame.tsx',
    legacyShell: '<View style={styles.statusPanelFrame}>',
  },
  {
    file: 'kolam-surface-panel.tsx',
    legacyShell: '<View style={styles.panel}>',
  },
  {
    file: 'kolam-user-menu-panel.tsx',
    legacyShell: '<View style={styles.userMenuPanel}>',
  },
];

describe('KolamPanelFrame usage', () => {
  it('keeps repeated panel shells on the shared panel frame', () => {
    const regressions = panelFrameComponents
      .map(({file, legacyShell}) => {
        const source = fs.readFileSync(path.join(componentsDir, file), 'utf8');

        return {
          file,
          hasPanelFrame: source.includes("from './kolam-panel-frame'"),
          legacyShell: source.includes(legacyShell),
        };
      })
      .filter(result => !result.hasPanelFrame || result.legacyShell);

    expect(regressions).toEqual([]);
  });
});