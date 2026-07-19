const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const runtimeConfigPath = path.join(projectRoot, 'src', 'config', 'app.ts');
const envExamplePath = path.join(projectRoot, '.env.example');

const appConfigKeys = [
  'apiBaseUrl',
  'kolamApiBaseUrl',
  'amApiBaseUrl',
  'fileBaseUrl',
];

const nativeClientKeys = [
  'nativeClientId',
  'nativeClientVersion',
  'nativeOrigin',
  'nativeUserAgent',
  'sourceHeader',
  'kolamSourceHeader',
  'amSourceHeader',
];

const envKeys = [
  'KOLAM_API_BASE_URL',
  'KOLAM_FILE_BASE_URL',
];

const failures = [];
const reports = [];

console.log('Kolam runtime backend verifier\n');

verifyAppConfig();
verifyEnvExample();

for (const report of reports) {
  console.log(`[OK] ${report.source} ${report.key}: ${compactUrl(report.value)}`);
}

if (failures.length) {
  console.log('\n[FAIL] Runtime backend contract violations:');
  failures.forEach(failure => console.log(`- ${failure}`));
  process.exit(1);
}

console.log(
  '\n[OK] Runtime backend config points to existing server endpoints with KolamWindows native client identity.',
);

function verifyAppConfig() {
  const source = fs.readFileSync(runtimeConfigPath, 'utf8');

  for (const key of appConfigKeys) {
    const value = readObjectStringValue(source, key);

    if (!value) {
      failures.push(`src/config/app.ts missing ${key}.`);
      continue;
    }

    verifyRuntimeUrl('appConfig', key, value);
  }

  for (const key of nativeClientKeys) {
    const value = readObjectStringValue(source, key);

    if (!value) {
      failures.push(`src/config/app.ts missing ${key}.`);
      continue;
    }

    verifyNativeClientValue(key, value);
    reports.push({source: 'appConfig', key, value});
  }
}

function verifyEnvExample() {
  if (!fs.existsSync(envExamplePath)) {
    failures.push('.env.example is missing.');
    return;
  }

  const env = readEnvFile(envExamplePath);

  for (const key of envKeys) {
    const value = env[key];

    if (!value) {
      failures.push(`.env.example missing ${key}.`);
      continue;
    }

    verifyRuntimeUrl('.env.example', key, value);
  }
}

function verifyRuntimeUrl(source, key, value) {
  if (isLocalBackendUrl(value)) {
    failures.push(`${source} ${key} points to a local backend: ${value}`);
    return;
  }

  if (!isHttpsUrl(value)) {
    failures.push(`${source} ${key} must use https existing server URL: ${value}`);
    return;
  }

  reports.push({source, key, value});
}

function verifyNativeClientValue(key, value) {
  if (key === 'nativeOrigin' && !value.startsWith('app://')) {
    failures.push(`appConfig ${key} must use app:// native origin: ${value}`);
  }

  if (key === 'nativeClientId' && value !== 'kolam-windows') {
    failures.push(`appConfig ${key} must identify only this Windows app: ${value}`);
  }

  if (key === 'nativeUserAgent' && !value.startsWith('KolamWindows/')) {
    failures.push(`appConfig ${key} must identify KolamWindows: ${value}`);
  }
}

function readObjectStringValue(source, key) {
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z][A-Za-z0-9]*):\s*['"]([^'"]+)['"]/);
    if (match?.[1] === key) {
      return match[2];
    }
  }

  return undefined;
}

function readEnvFile(filePath) {
  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        return env;
      }

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex < 0) {
        return env;
      }

      env[trimmed.slice(0, separatorIndex)] = trimmed.slice(separatorIndex + 1);
      return env;
    }, {});
}

function isLocalBackendUrl(value) {
  try {
    const {hostname} = new URL(value);
    const normalized = hostname.toLowerCase();

    return (
      normalized === 'localhost' ||
      normalized === '0.0.0.0' ||
      normalized === '::1' ||
      normalized.startsWith('127.') ||
      normalized.endsWith('.localhost')
    );
  } catch {
    return false;
  }
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function compactUrl(value) {
  return value.replace(/^https?:\/\//, '').replace(/\/$/, '');
}
