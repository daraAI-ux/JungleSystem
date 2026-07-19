const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const defaultMaxLines = 5000;
const extensions = new Set(['.js', '.jsx', '.md', '.ts', '.tsx']);
const scanRoots = [
  'App.tsx',
  'README.md',
  '__tests__',
  'docs',
  'scripts',
  'src',
];

const legacyLargeFiles = {
  'App.tsx': {
    maxLines: 698,
    reason: 'legacy shell file; split down gradually instead of growing',
  },
};

const failures = [];
const legacyReports = [];
let checked = 0;

for (const root of scanRoots) {
  collectFiles(path.join(projectRoot, root)).forEach(filePath => {
    const relativePath = toProjectPath(filePath);
    const lineCount = countLines(filePath);
    const legacy = legacyLargeFiles[relativePath];

    checked += 1;

    if (legacy) {
      legacyReports.push({path: relativePath, lineCount, ...legacy});
      if (lineCount > legacy.maxLines) {
        failures.push(
          `${relativePath}: ${lineCount} lines exceeds legacy cap ${legacy.maxLines}. ${legacy.reason}.`,
        );
      }
      return;
    }

    if (lineCount > defaultMaxLines) {
      failures.push(
        `${relativePath}: ${lineCount} lines exceeds ${defaultMaxLines}. Split by domain/component/hook/service/helper/test.`,
      );
    }
  });
}

console.log(`Kolam file-size verifier\nChecked: ${checked} files\nMax: ${defaultMaxLines} lines\n`);

for (const report of legacyReports) {
  console.log(
    `[LEGACY] ${report.path}: ${report.lineCount}/${report.maxLines} lines - ${report.reason}`,
  );
}

if (failures.length) {
  console.log('\n[FAIL] File-size policy violations:');
  failures.forEach(failure => console.log(`- ${failure}`));
  process.exit(1);
}

console.log('\n[OK] File-size policy satisfied.');

function collectFiles(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return [];
  }

  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    return shouldScan(targetPath) ? [targetPath] : [];
  }

  const files = [];
  for (const entry of fs.readdirSync(targetPath, {withFileTypes: true})) {
    if (entry.name === 'node_modules' || entry.name === '.git') {
      continue;
    }

    const entryPath = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(entryPath));
      continue;
    }

    if (entry.isFile() && shouldScan(entryPath)) {
      files.push(entryPath);
    }
  }

  return files;
}

function shouldScan(filePath) {
  return extensions.has(path.extname(filePath));
}

function countLines(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  if (source.length === 0) {
    return 0;
  }

  const lines = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  return lines[lines.length - 1] === '' ? lines.length - 1 : lines.length;
}

function toProjectPath(filePath) {
  return path.relative(projectRoot, filePath).replace(/\\/g, '/');
}
