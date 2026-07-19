const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const repoRoot = path.resolve(__dirname, '..');
const liveFrontendRoot =
  process.env.DA_LIVE_FRONTEND_ROOT ||
  'E:\\Projects\\_latest-da\\da-inventory-frontend';
const liveAppRoot = path.join(liveFrontendRoot, 'src', 'app', '(app)');
const kolamNavigationPath = path.join(
  repoRoot,
  'src',
  'domain',
  'kolam-navigation.ts',
);

let hasFailure = false;

console.log(`Kolam live route coverage verifier\nFE: ${liveFrontendRoot}\n`);

if (!fs.existsSync(liveAppRoot)) {
  fail(`FE app route root tidak ditemukan: ${liveAppRoot}`);
  finish();
}

if (!fs.existsSync(kolamNavigationPath)) {
  fail(`Native navigation registry tidak ditemukan: ${kolamNavigationPath}`);
  finish();
}

const liveRoutes = readLiveAppRoutes(liveAppRoot);
const nativeRoutes = readNativeRoutes(kolamNavigationPath);
const missingRoutes = liveRoutes.filter(route => !nativeRoutes.includes(route));
const extraRoutes = nativeRoutes.filter(route => !liveRoutes.includes(route));

console.log(`[INFO] Live FE app routes: ${liveRoutes.length}`);
console.log(`[INFO] Native Kolam routes: ${nativeRoutes.length}`);

if (missingRoutes.length) {
  fail(`Native registry belum mencakup ${missingRoutes.length} live route:`);
  missingRoutes.forEach(route => console.log(`  - ${route}`));
} else {
  console.log('[OK] Semua live FE app route sudah punya native route entry.');
}

if (extraRoutes.length) {
  console.log(
    `[INFO] Native registry punya ${extraRoutes.length} route tambahan untuk dashboard/runtime/plugin/surface context.`,
  );
}

finish();

function readLiveAppRoutes(appRoot) {
  return walkFiles(appRoot)
    .filter(filePath => path.basename(filePath) === 'page.tsx')
    .map(filePath => normalizeLiveRoute(appRoot, filePath))
    .filter(route => !route.startsWith('/@breadcrumb'))
    .sort(compareRoutes);
}

function normalizeLiveRoute(appRoot, filePath) {
  const relativePath = path.relative(appRoot, filePath);
  const routePath = relativePath
    .replace(/\\page\.tsx$/, '')
    .split(path.sep)
    .filter(segment => !isRouteGroup(segment))
    .map(segment => normalizeRouteSegment(segment))
    .join('/');

  return routePath ? `/${routePath}` : '/';
}

function normalizeRouteSegment(segment) {
  return segment
    .replace(/^\[\.\.\.(.+)\]$/, ':$1')
    .replace(/^\[(.+)\]$/, ':$1');
}

function isRouteGroup(segment) {
  return segment.startsWith('(') && segment.endsWith(')');
}

function readNativeRoutes(filePath) {
  const registry = loadKolamNavigationRegistry(filePath);
  const baseRoutes = registry.kolamNavigationSections.flatMap(section =>
    section.items.map(item => item.route),
  );
  const variants = registry
    .getKolamNavigationRouteVariants(registry.kolamNavigationSections)
    .map(item => item.route);

  return Array.from(new Set([...baseRoutes, ...variants])).sort(compareRoutes);
}

function loadKolamNavigationRegistry(filePath) {
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
      ? '\nNative route coverage belum mengikuti FE live.'
      : '\nNative route coverage mengikuti FE live.',
  );
  process.exit(hasFailure ? 1 : 0);
}
