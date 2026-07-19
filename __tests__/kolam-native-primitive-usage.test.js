const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const sourceRoots = [
  path.join(repoRoot, 'App.tsx'),
  path.join(repoRoot, 'src'),
];

const allowedRuntimePrimitiveImports = {
  Pressable: ['src/components/kolam-pressable.tsx'],
  TextInput: ['src/components/kolam-text-field.tsx'],
  Text: [
    'src/components/kolam-copy-stack.tsx',
  ],
};

function listSourceFiles(target) {
  const stat = fs.statSync(target);

  if (stat.isFile()) {
    return target.endsWith('.tsx') ? [target] : [];
  }

  return fs.readdirSync(target, {withFileTypes: true}).flatMap(entry => {
    const fullPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      return listSourceFiles(fullPath);
    }

    return entry.isFile() && entry.name.endsWith('.tsx') ? [fullPath] : [];
  });
}

function getRuntimeReactNativeImports(source) {
  const imports = [];
  const importPattern =
    /import\s+\{([^}]*)\}\s+from ['"]react-native['"];?/g;
  let match;

  while ((match = importPattern.exec(source)) !== null) {
    for (const rawPart of match[1].split(',')) {
      const part = rawPart.trim();

      if (!part || part.startsWith('type ')) {
        continue;
      }

      imports.push(part.split(/\s+as\s+/)[0].trim());
    }
  }

  return imports;
}

function findUnexpectedPrimitiveImports() {
  return sourceRoots.flatMap(listSourceFiles).flatMap(filePath => {
    const file = path.relative(repoRoot, filePath).replace(/\\/g, '/');
    const source = fs.readFileSync(filePath, 'utf8');
    const runtimeImports = getRuntimeReactNativeImports(source);

    return Object.entries(allowedRuntimePrimitiveImports).flatMap(
      ([primitive, allowedFiles]) => {
        if (!runtimeImports.includes(primitive)) {
          return [];
        }

        return allowedFiles.includes(file) ? [] : [{file, primitive}];
      },
    );
  });
}

describe('native primitive usage', () => {
  it('keeps direct React Native primitives behind Kolam primitives', () => {
    expect(findUnexpectedPrimitiveImports()).toEqual([]);
  });
});