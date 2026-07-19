const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const repoRoot = path.resolve(__dirname, '..');
const projectsRoot = process.env.DA_PROJECTS_ROOT || 'E:\\Projects';
const unifiedPath = path.join(repoRoot, 'src', 'domain', 'unified.ts');

const pluginRepos = {
  bantuan: 'DA-Bantuan-Plugin',
  chat: 'DA-Chat-Plugin',
  dara: 'DA-Dara-Plugin',
  enclosure: 'DA-Enclosure-Plugin',
  freyer: 'DA-Freyer-Plugin',
  kpi: 'DA-KPI-Plugin',
  layanan: 'DA-Layanan-Plugin',
  proyek: 'DA-Proyek-Plugin',
  'task-manager': 'DA-Task-Manager-Plugin',
};

let hasFailure = false;

console.log(`Kolam native registry verifier\nRoot: ${projectsRoot}\n`);

const registry = loadPluginRegistry(unifiedPath);
const registryById = new Map(registry.map(plugin => [plugin.id, plugin]));

for (const [pluginId, repoName] of Object.entries(pluginRepos)) {
  const plugin = registryById.get(pluginId);
  if (!plugin) {
    fail(`${pluginId}: registry entry tidak ditemukan`);
    continue;
  }

  const repoPath = path.join(projectsRoot, repoName);
  const packagePath = path.join(repoPath, 'package.json');
  const manifestPath = path.join(repoPath, 'src', 'manifest.ts');

  if (!fs.existsSync(packagePath) || !fs.existsSync(manifestPath)) {
    fail(`${pluginId}: package.json atau src/manifest.ts tidak ditemukan`);
    continue;
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const manifest = readPluginManifest(manifestPath);
  const expectedStatus =
    packageJson.version === manifest.version ? 'ready' : 'version-mismatch';

  assertEqual(plugin.packageName, packageJson.name, pluginId, 'packageName');
  assertEqual(plugin.packageVersion, packageJson.version, pluginId, 'packageVersion');
  assertEqual(plugin.manifestName, manifest.name, pluginId, 'manifestName');
  assertEqual(plugin.manifestVersion, manifest.version, pluginId, 'manifestVersion');
  assertEqual(plugin.hostMinVersion, manifest.hostMinVersion, pluginId, 'hostMinVersion');
  assertEqual(plugin.hostSdkVersion, manifest.hostSdkVersion, pluginId, 'hostSdkVersion');
  assertEqual(plugin.requiresHost, manifest.requiresHost, pluginId, 'requiresHost');
  assertEqual(plugin.integrationStatus, expectedStatus, pluginId, 'integrationStatus');
  assertArrayEqual(plugin.routes, manifest.routes, pluginId, 'routes');

  const registryRepo = path.normalize(plugin.sourceRepo);
  const expectedRepo = path.normalize(repoPath);
  assertEqual(registryRepo, expectedRepo, pluginId, 'sourceRepo');

  const statusNote =
    expectedStatus === 'version-mismatch'
      ? ` [WARN package ${packageJson.version} != manifest ${manifest.version}]`
      : '';

  console.log(
    `[OK] ${pluginId}: ${packageJson.name}@${packageJson.version}; manifest ${manifest.version}; routes ${manifest.routes.length}${statusNote}`,
  );
}

if (registry.length !== Object.keys(pluginRepos).length) {
  fail(
    `registry plugin berisi ${registry.length}; expected ${Object.keys(pluginRepos).length}`,
  );
}

console.log(
  hasFailure
    ? '\nRegistry native tidak sinkron dengan source plugin live.'
    : '\nRegistry native sinkron dengan package.json dan manifest plugin live.',
);

process.exit(hasFailure ? 1 : 0);

function loadPluginRegistry(filePath) {
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

  return sandbox.exports.pluginRegistry || sandbox.module.exports.pluginRegistry;
}

function readPluginManifest(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');

  return {
    id: readStringField(source, 'id'),
    name: readStringField(source, 'name'),
    version: readStringField(source, 'version'),
    hostMinVersion: readStringField(source, 'hostMinVersion'),
    hostSdkVersion: readStringField(source, 'hostSdkVersion'),
    requiresHost: /requiresHost:\s*true/.test(source),
    routes: readRoutes(source),
  };
}

function readStringField(source, field) {
  const match = source.match(new RegExp(`${field}:\\s*["']([^"']+)["']`));
  return match ? match[1] : undefined;
}

function readRoutes(source) {
  const match = source.match(/routes:\s*\[([\s\S]*?)\]/m);
  if (!match) {
    return [];
  }

  return Array.from(match[1].matchAll(/["']([^"']+)["']/g)).map(
    route => route[1],
  );
}

function assertEqual(actual, expected, pluginId, field) {
  if (actual !== expected) {
    fail(`${pluginId}: ${field} ${format(actual)}; expected ${format(expected)}`);
  }
}

function assertArrayEqual(actual, expected, pluginId, field) {
  if (
    !Array.isArray(actual) ||
    actual.length !== expected.length ||
    actual.some((value, index) => value !== expected[index])
  ) {
    fail(
      `${pluginId}: ${field} tidak sama; actual ${format(actual)}; expected ${format(expected)}`,
    );
  }
}

function fail(message) {
  hasFailure = true;
  console.log(`[FAIL] ${message}`);
}

function format(value) {
  return JSON.stringify(value);
}
