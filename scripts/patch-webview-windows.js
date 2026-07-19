const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const appProject = path.join(
  root,
  'windows',
  'KolamWindows',
  'KolamWindows.vcxproj',
);
const webViewProject = path.join(
  root,
  'node_modules',
  'react-native-webview',
  'windows',
  'ReactNativeWebView',
  'ReactNativeWebView.vcxproj',
);

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

const appProjectText = read(appProject);
const toolset = appProjectText.match(/<PlatformToolset>([^<]+)<\/PlatformToolset>/)?.[1];

if (!toolset || !fs.existsSync(webViewProject)) {
  process.exit(0);
}

const webViewProjectText = read(webViewProject);
const next = webViewProjectText.replace(
  /<PlatformToolset>[^<]+<\/PlatformToolset>/g,
  `<PlatformToolset>${toolset}</PlatformToolset>`,
);

if (next !== webViewProjectText) {
  fs.writeFileSync(webViewProject, next);
  console.log(`Patched react-native-webview Windows PlatformToolset to ${toolset}.`);
}
