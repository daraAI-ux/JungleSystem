const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const root = path.resolve(__dirname, '..');

const checks = [
  checkCommand('Node.js', 'node', ['--version'], version => {
    const major = Number(version.replace(/^v/, '').split('.')[0]);
    return major >= 22
      ? ok(`Node ${version}`)
      : warn(`Node ${version}; expected >= 22`);
  }),
  checkCommand('npm', ['npm.cmd', 'npm'], ['--version'], version =>
    ok(`npm ${version}`),
  ),
  checkCommand(
    'PowerShell 7',
    [
      'pwsh.exe',
      path.join(
        os.homedir(),
        '.nuget',
        'packages',
        'PowerShell',
        '7.6.1',
        'tools',
        'net10.0',
        'any',
        'win',
        'pwsh.exe',
      ),
    ],
    ['--version'],
    version => ok(version),
  ),
  checkCommand(
    'dotnet SDK',
    [
      'dotnet.exe',
      'C:\\Program Files\\dotnet\\dotnet.exe',
      'C:\\Program Files (x86)\\dotnet\\dotnet.exe',
    ],
    ['--list-sdks'],
    output => {
      const sdks = output
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);

      return sdks.length
        ? ok(`SDKs found: ${sdks.join(', ')}`)
        : missing('dotnet exists, but no SDKs were found');
    },
  ),
  checkPath(
    'Visual Studio vswhere',
    path.join(
      process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)',
      'Microsoft Visual Studio',
      'Installer',
      'vswhere.exe',
    ),
  ),
  checkPath('React Native Windows solution', path.join(root, 'windows', 'KolamWindows.sln')),
  checkPath('Windows native project', path.join(root, 'windows', 'KolamWindows', 'KolamWindows.vcxproj')),
];

let hasMissing = false;
let hasWarning = false;

console.log('Azurda toolchain doctor\n');

for (const check of checks) {
  const result = check();
  if (result.status === 'missing') {
    hasMissing = true;
  }
  if (result.status === 'warn') {
    hasWarning = true;
  }
  console.log(`${symbol(result.status)} ${result.name}: ${result.message}`);
}

console.log('\nNext steps:');
if (hasMissing) {
  console.log('- Install the missing Windows build dependencies before running npm run windows.');
  console.log('- React Native Windows can install many dependencies via:');
  console.log('  node_modules\\react-native-windows\\scripts\\rnw-dependencies.ps1');
} else if (hasWarning) {
  console.log('- Review warnings before production builds.');
} else {
  console.log('- Toolchain checks passed. Try: npm run windows');
}

process.exit(hasMissing ? 1 : 0);

function checkCommand(name, commands, args, evaluate) {
  return () => {
    const candidates = Array.isArray(commands) ? commands : [commands];
    const errors = [];

    for (const command of candidates) {
      if (looksLikePath(command) && !fs.existsSync(command)) {
        errors.push(`${command} missing`);
        continue;
      }

      try {
        const output = execFileSync(command, args, {
          encoding: 'utf8',
          shell: process.platform === 'win32' && !looksLikePath(command),
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true,
        }).trim();

        return {name, ...evaluate(output)};
      } catch (error) {
        errors.push(commandNotFoundMessage(command, error));
      }
    }

    return {name, ...missing(errors.join('; '))};
  };
}

function checkPath(name, targetPath) {
  return () =>
    fs.existsSync(targetPath)
      ? {name, ...ok(targetPath)}
      : {name, ...missing(`Missing: ${targetPath}`)};
}

function looksLikePath(command) {
  return command.includes('\\') || command.includes('/');
}

function ok(message) {
  return {status: 'ok', message};
}

function warn(message) {
  return {status: 'warn', message};
}

function missing(message) {
  return {status: 'missing', message};
}

function symbol(status) {
  if (status === 'ok') {
    return '[OK]';
  }
  if (status === 'warn') {
    return '[WARN]';
  }
  return '[MISS]';
}

function commandNotFoundMessage(command, error) {
  const stderr =
    error && error.stderr && typeof error.stderr.toString === 'function'
      ? error.stderr.toString('utf8').trim()
      : '';
  const detail = firstMeaningfulLine(stderr) || error?.code || '';
  return `${command} not available${detail ? ` (${detail})` : ''}`;
}

function firstMeaningfulLine(text) {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .find(Boolean);
}
