const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'src', 'components');
const rowFrameComponents = [
  {
    file: 'kolam-cart-row.tsx',
    legacyShell: '<View style={styles.cartRow}>',
  },
  {
    file: 'kolam-plugin-registry-row.tsx',
    legacyShell: '<View style={styles.pluginRow}>',
  },
  {
    file: 'kolam-sale-row.tsx',
    legacyShell: '<View style={styles.saleRow}>',
  },
  {
    file: 'kolam-settings-activity-table-header.tsx',
    legacyShell: '<View style={styles.settingsActivityTableHeader}>',
  },
  {
    file: 'kolam-settings-activity-table-row.tsx',
    legacyShell: 'styles.settingsActivityTableRow,',
  },
  {
    file: 'kolam-settings-role-permission-row.tsx',
    legacyShell: '<View style={styles.settingsRolePermissionMatrixRow}>',
  },
];

describe('KolamRowFrame usage', () => {
  it('keeps repeated table and list rows on the shared row frame', () => {
    const regressions = rowFrameComponents
      .map(({file, legacyShell}) => {
        const source = fs.readFileSync(path.join(componentsDir, file), 'utf8');

        return {
          file,
          hasRowFrame: source.includes("from './kolam-row-frame'"),
          legacyShell: source.includes(legacyShell),
        };
      })
      .filter(result => !result.hasRowFrame || result.legacyShell);

    expect(regressions).toEqual([]);
  });
});