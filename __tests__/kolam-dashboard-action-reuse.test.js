const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'src', 'components');

const dashboardActionSurfaces = [
  {
    file: 'kolam-dashboard-header-action.tsx',
    required: [
      "from './kolam-action-control-button'",
      '<KolamActionControlButton',
    ],
  },
  {
    file: 'kolam-dashboard-customer-visit-confirmations.tsx',
    required: ["from './kolam-text-action'", '<KolamTextAction'],
  },
  {
    file: 'kolam-dashboard-rail-header.tsx',
    required: [
      "from './kolam-dashboard-rail-action'",
      '<KolamDashboardRailAction',
    ],
  },
  {
    file: 'kolam-unified-dashboard-count-section.tsx',
    required: [
      "from './kolam-dashboard-rail-action'",
      '<KolamDashboardRailAction',
    ],
  },
];

const forbiddenDirectControls = [
  'Pressable',
  'TouchableOpacity',
  'TouchableHighlight',
  "from './kolam-button'",
  '<KolamButton',
  "from './kolam-icon-button'",
  '<KolamIconButton',
];

describe('Kolam dashboard action reuse', () => {
  it('keeps dashboard commands routed through shared action primitives', () => {
    const regressions = dashboardActionSurfaces.flatMap(({file, required}) => {
      const source = fs.readFileSync(path.join(componentsDir, file), 'utf8');
      const missing = required.filter(fragment => !source.includes(fragment));

      return missing.map(fragment => ({file, missing: fragment}));
    });

    expect(regressions).toEqual([]);
  });

  it('keeps dashboard sections from creating local button controls', () => {
    const regressions = dashboardActionSurfaces.flatMap(({file}) => {
      const source = fs.readFileSync(path.join(componentsDir, file), 'utf8');

      return forbiddenDirectControls
        .filter(fragment => source.includes(fragment))
        .map(fragment => ({file, forbidden: fragment}));
    });

    expect(regressions).toEqual([]);
  });
});
