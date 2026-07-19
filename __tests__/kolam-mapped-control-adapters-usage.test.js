const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'src', 'components');

const mappedControlAdapterContracts = [
  {
    file: 'kolam-customer-selector.tsx',
    importPath: './kolam-mapped-selector-chip-group',
  },
  {
    file: 'kolam-payment-selector.tsx',
    importPath: './kolam-mapped-selector-chip-group',
  },
  {
    file: 'kolam-settings-role-tab-list.tsx',
    importPath: './kolam-mapped-control-tab-list',
  },
  {
    file: 'kolam-settings-surface-frame.tsx',
    importPath: './kolam-mapped-surface-panel',
  },
  {
    file: 'kolam-settings-role-editor-resource-summary-list.tsx',
    importPath: './kolam-mapped-summary-card-list',
  },
  {
    file: 'kolam-settings-role-editor-permission-preview-list.tsx',
    importPath: './kolam-mapped-summary-card-list',
  },
];

describe('mapped control adapter usage', () => {
  it('keeps domain-to-control option mapping in shared adapters', () => {
    const regressions = mappedControlAdapterContracts
      .map(({file, importPath}) => {
        const source = fs.readFileSync(path.join(componentsDir, file), 'utf8');

        return {
          file,
          hasAdapter: source.includes(`from '${importPath}'`),
          directMap: source.includes('.map('),
        };
      })
      .filter(result => !result.hasAdapter || result.directMap);

    expect(regressions).toEqual([]);
  });
});
