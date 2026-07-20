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
const webViewComponent = path.join(
  root,
  'node_modules',
  'react-native-webview',
  'windows',
  'ReactNativeWebView',
  'RCTWebView2ComponentView.cpp',
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

const webViewComponentText = read(webViewComponent);
const whiteBackgroundInclude = '#include <winrt/Windows.UI.h>';
const whiteBackgroundPatch =
  '    m_webView.DefaultBackgroundColor(winrt::Windows::UI::Color{255, 255, 255, 255});';
if (
  webViewComponentText &&
  !webViewComponentText.includes(whiteBackgroundPatch)
) {
  let patchedComponentText = webViewComponentText;
  if (!patchedComponentText.includes(whiteBackgroundInclude)) {
    patchedComponentText = patchedComponentText.replace(
      '#include <winrt/Windows.System.h>',
      `#include <winrt/Windows.System.h>\n${whiteBackgroundInclude}`,
    );
  }
  patchedComponentText = patchedComponentText.replace(
    '    m_webView.VerticalAlignment(winrt::Microsoft::UI::Xaml::VerticalAlignment::Stretch);',
    `    m_webView.VerticalAlignment(winrt::Microsoft::UI::Xaml::VerticalAlignment::Stretch);\n${whiteBackgroundPatch}`,
  );
  fs.writeFileSync(webViewComponent, patchedComponentText);
  console.log('Patched react-native-webview Windows default background to white.');
}
