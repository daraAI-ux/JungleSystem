const fs = require('node:fs');
const path = require('node:path');

const projectsRoot = process.env.DA_PROJECTS_ROOT || 'E:\\Projects';

const requiredRepos = [
  'da-ai-service',
  'da-automation-management',
  'DA-Bantuan-Plugin',
  'DA-Chat-Plugin',
  'DA-Dara-Plugin',
  'da-desktop-apps',
  'DA-Enclosure-Plugin',
  'DA-Freyer-Plugin',
  'DA-KPI-Plugin',
  'DA-Layanan-Plugin',
  'da-marketplace',
  'da-pos',
  'DA-Proyek-Plugin',
  'dara-ai',
  'DA-Task-Manager-Plugin',
  'docs',
  'kolam-ops',
  'da-inventory-backend',
  'da-inventory-frontend',
];

const requiredSnapshotRepos = [
  path.join('_latest-da', 'da-inventory-backend'),
  path.join('_latest-da', 'da-inventory-frontend'),
];

const pluginPackages = {
  'DA-Bantuan-Plugin': {
    packageName: '@dara-ai/da-bantuan-plugin',
    manifestId: 'bantuan',
  },
  'DA-Chat-Plugin': {
    packageName: '@dara-ai/da-chat-plugin',
    manifestId: 'chat',
  },
  'DA-Dara-Plugin': {
    packageName: '@dara-ai/da-dara-plugin',
    manifestId: 'dara',
  },
  'DA-Enclosure-Plugin': {
    packageName: '@dara-ai/da-enclosure-plugin',
    manifestId: 'enclosure',
  },
  'DA-Freyer-Plugin': {
    packageName: '@dara-ai/da-freyer-plugin',
    manifestId: 'freyer',
  },
  'DA-KPI-Plugin': {
    packageName: '@dara-ai/da-kpi-plugin',
    manifestId: 'kpi',
  },
  'DA-Layanan-Plugin': {
    packageName: '@dara-ai/da-layanan-plugin',
    manifestId: 'layanan',
  },
  'DA-Proyek-Plugin': {
    packageName: '@dara-ai/da-proyek-plugin',
    manifestId: 'proyek',
  },
  'DA-Task-Manager-Plugin': {
    packageName: '@dara-ai/da-task-manager-plugin',
    manifestId: 'task-manager',
  },
};

let hasFailure = false;

console.log(`Dunia Anura source verifier\nRoot: ${projectsRoot}\n`);

for (const repo of requiredRepos) {
  const repoPath = path.join(projectsRoot, repo);
  const gitPath = path.join(repoPath, '.git');

  if (!fs.existsSync(repoPath) || !fs.existsSync(gitPath)) {
    hasFailure = true;
    console.log(`[MISS] ${repo}: repo atau .git tidak ditemukan`);
    continue;
  }

  const expectedPlugin = pluginPackages[repo];
  if (expectedPlugin) {
    const packagePath = path.join(repoPath, 'package.json');
    if (!fs.existsSync(packagePath)) {
      hasFailure = true;
      console.log(`[MISS] ${repo}: package.json tidak ditemukan`);
      continue;
    }

    const manifest = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    if (manifest.name !== expectedPlugin.packageName) {
      hasFailure = true;
      console.log(
        `[FAIL] ${repo}: package ${manifest.name || '-'}; expected ${expectedPlugin.packageName}`,
      );
      continue;
    }

    const pluginManifestPath = path.join(repoPath, 'src', 'manifest.ts');
    if (!fs.existsSync(pluginManifestPath)) {
      hasFailure = true;
      console.log(`[MISS] ${repo}: src/manifest.ts tidak ditemukan`);
      continue;
    }

    const pluginManifest = readPluginManifest(pluginManifestPath);
    if (pluginManifest.id !== expectedPlugin.manifestId) {
      hasFailure = true;
      console.log(
        `[FAIL] ${repo}: manifest id ${pluginManifest.id || '-'}; expected ${expectedPlugin.manifestId}`,
      );
      continue;
    }

    if (!pluginManifest.requiresHost || pluginManifest.routeCount < 1) {
      hasFailure = true;
      console.log(`[FAIL] ${repo}: manifest requiresHost/routes tidak valid`);
      continue;
    }

    const versionNote =
      pluginManifest.version === manifest.version
        ? ''
        : ` [WARN manifest version ${pluginManifest.version || '-'} != package ${manifest.version || '-'}]`;

    console.log(
      `[OK] ${repo}: ${manifest.name}@${manifest.version || 'unknown'}; manifest ${pluginManifest.id}; routes ${pluginManifest.routeCount}${versionNote}`,
    );
    continue;
  }

  console.log(`[OK] ${repo}`);
}

for (const repo of requiredSnapshotRepos) {
  const repoPath = path.join(projectsRoot, repo);
  const gitPath = path.join(repoPath, '.git');

  if (!fs.existsSync(repoPath) || !fs.existsSync(gitPath)) {
    hasFailure = true;
    console.log(`[MISS] ${repo}: snapshot terbaru atau .git tidak ditemukan`);
    continue;
  }

  console.log(`[OK] ${repo}`);
}

console.log(
  hasFailure
    ? '\nSource tree belum lengkap. Pull/clone repo yang dilaporkan MISS atau FAIL.'
    : '\nSemua source repo utama, snapshot terbaru, dan package plugin tersedia di E:\\Projects.',
);

process.exit(hasFailure ? 1 : 0);

function readPluginManifest(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');

  return {
    id: readStringField(source, 'id'),
    version: readStringField(source, 'version'),
    requiresHost: /requiresHost:\s*true/.test(source),
    routeCount: countRoutes(source),
  };
}

function readStringField(source, field) {
  const match = source.match(new RegExp(`${field}:\\s*["']([^"']+)["']`));
  return match ? match[1] : undefined;
}

function countRoutes(source) {
  const match = source.match(/routes:\s*\[([\s\S]*?)\]/m);
  if (!match) {
    return 0;
  }

  return Array.from(match[1].matchAll(/["']([^"']+)["']/g)).length;
}
