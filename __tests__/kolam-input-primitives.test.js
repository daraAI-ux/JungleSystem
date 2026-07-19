const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'src', 'components');
const textInputEntryPoints = ['kolam-text-field.tsx'];

describe('input Kolam primitives', () => {
  it('routes component text inputs through KolamTextField', () => {
    const directTextInputImports = fs
      .readdirSync(componentsDir)
      .filter(file => file.endsWith('.tsx') && !textInputEntryPoints.includes(file))
      .filter(file => {
        const source = fs.readFileSync(path.join(componentsDir, file), 'utf8');

        return (
          source.includes('import {TextInput') ||
          source.includes('import {\n  TextInput') ||
          source.includes('TextInput,')
        );
      });

    expect(directTextInputImports).toEqual([]);
  });
});
