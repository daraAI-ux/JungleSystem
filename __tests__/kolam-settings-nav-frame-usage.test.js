const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'src', 'components');

const frameTargets = [
  {
    file: 'kolam-settings-activity-path-cell.tsx',
    importText: "from './kolam-inline-frame'",
    legacyShells: ['<View style={styles.settingsActivityTablePathCell}>'],
  },
  {
    file: 'kolam-settings-activity-time-cell.tsx',
    importText: "from './kolam-inline-frame'",
    legacyShells: [
      '<View style={styles.settingsActivityTableTimeCell}>',
      '<View style={styles.settingsActivityTimeLine}>',
    ],
  },
  {
    file: 'kolam-nav-item-copy.tsx',
    importText: "from './kolam-inline-frame'",
    legacyShells: ['<View style={styles.copy}>', '<View style={styles.header}>'],
  },
  {
    file: 'kolam-nav-item-body.tsx',
    importText: "from './kolam-inline-frame'",
    legacyShells: ['<View style={[styles.body, collapsed && styles.bodyCollapsed]}>'],
  },
  {
    file: 'kolam-nav-item-glyph.tsx',
    importText: "from './kolam-inline-frame'",
    legacyShells: ['<View style={styles.glyph}>'],
  },
  {
    file: 'kolam-avatar-pill.tsx',
    importText: "from './kolam-inline-frame'",
    legacyShells: ['<View style={styles.pill}>'],
  },
  {
    file: 'kolam-user-menu-avatar.tsx',
    importText: "from './kolam-inline-frame'",
    legacyShells: ['<View style={styles.userMenuAvatar}>'],
  },
  {
    file: 'kolam-top-navigation-avatar.tsx',
    importText: "from './kolam-inline-frame'",
    legacyShells: ['<View style={styles.avatar}>'],
  },
  {
    file: 'kolam-settings-role-editor-header.tsx',
    importText: "from './kolam-header-frame'",
    legacyShells: ['<View style={styles.settingsRoleEditorHeader}>'],
  },
  {
    file: 'kolam-settings-role-info-panel.tsx',
    importText: "from './kolam-header-frame'",
    legacyShells: ['<View style={styles.settingsRoleInfoPanel}>'],
  },
  {
    file: 'kolam-settings-web-form-header.tsx',
    importText: "from './kolam-header-frame'",
    legacyShells: ['<View style={styles.settingsWebFormHeader}>'],
  },
  {
    file: 'kolam-user-menu-header.tsx',
    importText: "from './kolam-header-frame'",
    legacyShells: ['<View style={styles.userMenuHeader}>'],
  },
  {
    file: 'kolam-settings-role-info-notice.tsx',
    importText: "from './kolam-card-frame'",
    legacyShells: ['<View style={styles.settingsRoleInfoNotice}>'],
  },
  {
    file: 'kolam-settings-role-management-surface.tsx',
    importText: "from './kolam-card-frame'",
    legacyShells: ['<View style={styles.settingsRoleMatrix}>'],
  },
  {
    file: 'kolam-settings-role-permission-group.tsx',
    importText: "from './kolam-card-frame'",
    legacyShells: ['<View style={styles.settingsRolePermissionMatrixGroup}>'],
  },
  {
    file: 'kolam-settings-web-file-field.tsx',
    importText: "from './kolam-inline-frame'",
    legacyShells: ['<View style={styles.settingsWebLogoRow}>'],
  },
  {
    file: 'kolam-settings-web-switch-field.tsx',
    importText: "from './kolam-card-frame'",
    legacyShells: ['<View style={styles.settingsWebFormSwitchRow}>'],
  },
  {
    file: 'kolam-data-table-header.tsx',
    importText: "from './kolam-row-frame'",
    legacyShells: ['<View style={styles.row}>'],
  },
  {
    file: 'kolam-data-table-row-frame.tsx',
    importText: "from './kolam-row-frame'",
    legacyShells: ['return <View style={styles.row}>{children}</View>;'],
  },
];

describe('settings/nav/table frame usage', () => {
  it('keeps repeated settings, nav, and table shells on shared frames', () => {
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