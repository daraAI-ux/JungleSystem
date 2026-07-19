const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const repoRoot = path.resolve(__dirname, '..');
const posRoot = process.env.DA_POS_ROOT || 'E:\\Projects\\da-pos';
const amRoot =
  process.env.DA_AUTOMATION_ROOT || 'E:\\Projects\\da-automation-management';
const posAppRoot = path.join(posRoot, 'src', 'app', '(app)');
const amAppRoot = path.join(amRoot, 'am-fe', 'src', 'app');
const appShellPath = path.join(repoRoot, 'src', 'domain', 'app-shell.ts');

let hasFailure = false;

console.log(
  [
    'KolamWindows shell route coverage verifier',
    `POS: ${posRoot}`,
    `AM: ${amRoot}`,
    '',
  ].join('\n'),
);

if (!fs.existsSync(posAppRoot)) {
  fail(`POS app route root tidak ditemukan: ${posAppRoot}`);
}

if (!fs.existsSync(amAppRoot)) {
  fail(`AM app route root tidak ditemukan: ${amAppRoot}`);
}

if (!fs.existsSync(appShellPath)) {
  fail(`Native app shell registry tidak ditemukan: ${appShellPath}`);
}

if (hasFailure) {
  finish();
}

const registry = loadAppShellRegistry(appShellPath);
const posPages = readNextPages(posAppRoot);
const amPages = readNextPages(amAppRoot);
const posShellRoutes = readShellRoutes(registry.shellModules, 'pos');
const amShellRoutes = readShellRoutes(registry.shellModules, 'am');

console.log(`[INFO] POS source app pages: ${posPages.length}`);
console.log(`[INFO] POS native shell routes: ${posShellRoutes.length}`);
console.log(`[INFO] AM source app pages: ${amPages.length}`);
console.log(`[INFO] AM native shell routes: ${amShellRoutes.length}`);

reportMissing('POS', posPages, posShellRoutes);
reportMissing('AM', amPages, amShellRoutes);

finish();

function readNextPages(appRoot) {
  return walkFiles(appRoot)
    .filter(filePath => path.basename(filePath) === 'page.tsx')
    .map(filePath => normalizeNextPageRoute(appRoot, filePath))
    .sort(compareRoutes);
}

function normalizeNextPageRoute(appRoot, filePath) {
  const relativePath = path.relative(appRoot, filePath);
  const routePath = relativePath
    .replace(new RegExp(`${escapeRegExp(path.sep)}?page\\.tsx$`), '')
    .split(path.sep)
    .filter(segment => !isRouteGroup(segment))
    .map(segment => normalizeRouteSegment(segment))
    .join('/');

  return routePath || '/';
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeRouteSegment(segment) {
  return segment
    .replace(/^\[\.\.\.(.+)\]$/, ':$1')
    .replace(/^\[(.+)\]$/, ':$1');
}

function isRouteGroup(segment) {
  return segment.startsWith('(') && segment.endsWith(')');
}

function readShellRoutes(modules, area) {
  return Array.from(
    new Set(
      modules
        .filter(module => module.area === area)
        .flatMap(module => module.routes),
    ),
  ).sort(compareRoutes);
}

function reportMissing(label, sourceRoutes, shellRoutes) {
  const missingRoutes = sourceRoutes.filter(route => !shellRoutes.includes(route));

  if (missingRoutes.length) {
    fail(`${label} source route belum ada di native shell:`);
    missingRoutes.forEach(route => console.log(`  - ${route}`));
    return;
  }

  console.log(`[OK] Semua ${label} source route sudah ada di native shell.`);
}

function loadAppShellRegistry(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;
  const sandbox = {
    exports: {},
    module: {exports: {}},
    require,
  };

  vm.runInNewContext(output, sandbox, {filename: filePath});

  return sandbox.exports || sandbox.module.exports;
}

function walkFiles(root) {
  const entries = fs.readdirSync(root, {withFileTypes: true});

  return entries.flatMap(entry => {
    const entryPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      return walkFiles(entryPath);
    }

    return [entryPath];
  });
}

function compareRoutes(left, right) {
  return left.localeCompare(right);
}

function fail(message) {
  hasFailure = true;
  console.log(`[FAIL] ${message}`);
}

function finish() {
  console.log(
    hasFailure
      ? '\nNative shell route coverage belum mengikuti POS/AM source.'
      : '\nNative shell route coverage mengikuti POS/AM source.',
  );
  process.exit(hasFailure ? 1 : 0);
}
