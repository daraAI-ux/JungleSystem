const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'src', 'components');
const pressableEntryPoints = [
  'kolam-pressable.tsx',
  'kolam-interaction-frame.tsx',
];

describe('interactive Kolam primitives', () => {
  it('routes component press targets through KolamInteractionFrame', () => {
    const directPressableImports = fs
      .readdirSync(componentsDir)
      .filter(
        file => file.endsWith('.tsx') && !pressableEntryPoints.includes(file),
      )
      .filter(file => {
        const source = fs.readFileSync(path.join(componentsDir, file), 'utf8');
        return (
          source.includes('import {Pressable') ||
          source.includes('import {\n  Pressable') ||
          source.includes('Pressable,') ||
          source.includes("from './kolam-pressable'")
        );
      });

    expect(directPressableImports).toEqual([]);
  });
});
