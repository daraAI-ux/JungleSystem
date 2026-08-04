import fs from 'fs';
import path from 'path';

const AM_FE_SERVICES_ROOT =
  'E:\\Projects\\da-automation-management\\am-fe\\src\\services';
const AM_BE_ROUTES_ROOT =
  'E:\\Projects\\da-automation-management\\am-be\\routes';
const NATIVE_AM_API = path.join(__dirname, '..', 'src', 'services', 'am-api.ts');

const SSO_ONLY_FE_SERVICES = new Set([
  'auth.service.ts',
]);

describe('AM service endpoint parity', () => {
  it('keeps native AM API helpers aligned with current AM FE service endpoints', () => {
    const feEndpoints = Array.from(
      new Set(
        fs.readdirSync(AM_FE_SERVICES_ROOT)
          .filter(file => file.endsWith('.ts') && !SSO_ONLY_FE_SERVICES.has(file))
          .flatMap(file => extractEndpointPatterns(
            fs.readFileSync(path.join(AM_FE_SERVICES_ROOT, file), 'utf8'),
          )),
      ),
    ).sort();
    const nativeEndpoints = new Set(
      extractEndpointPatterns(fs.readFileSync(NATIVE_AM_API, 'utf8')),
    );

    expect(feEndpoints).toEqual([
      '/activity-log',
      '/activity-log/bulk-delete',
      '/activity-log/stats',
      '/box',
      '/box/:param',
      '/boxes',
      '/chat/contact',
      '/chat/contact/:param',
      '/chat/message',
      '/chat/message/:param',
      '/chat/message/send',
      '/dashboard',
      '/device',
      '/device/:param',
      '/device/:param/service/input',
      '/device/:param/service/logs',
      '/device/:param/service/start',
      '/device/:param/service/stop',
      '/device/:param/services',
      '/devices',
      '/mutasi',
      '/mutasi/:param',
      '/mutasi/summary',
      '/rack',
      '/rack/:param',
      '/racks',
      '/roles',
      '/service-account',
      '/service-account/:param',
      '/service-account/:param/session',
      '/service-account/:param/tokopedia-session',
      '/service-account/:param/tokopedia-session/api-monitor',
      '/service-account/:param/tokopedia-session/captcha',
      '/service-account/:param/tokopedia-session/login-method',
      '/service-account/:param/tokopedia-session/qr-start',
      '/service-account/:param/tokopedia-session/restart',
      '/service-account/:param/tokopedia-session/verify',
      '/task',
      '/task/:param',
      '/task/:param/cancel',
      '/task/:param/force-fail',
      '/task/:param/retry',
      '/transfer',
      '/transfer/:param',
      '/transfer/:param/cancel',
      '/transfer/:param/force-fail',
      '/transfer/:param/retry',
      '/users',
      '/users/:param',
      '/webhook/config',
      '/webhook/config/:param',
      '/webhook/events',
      '/webhook/logs',
      '/webhook/test-ping',
    ]);
    expect(feEndpoints.filter(endpoint => !nativeEndpoints.has(endpoint))).toEqual([]);
  });

  it('keeps native AM API helpers aligned with protected AM BE live routes', () => {
    const beEndpoints = Array.from(
      new Set(
        getRouteFiles(AM_BE_ROUTES_ROOT).flatMap(file =>
          extractExpressRoutePatterns(fs.readFileSync(file, 'utf8')),
        ),
      ),
    )
      .filter(endpoint => !isExcludedBeRoute(endpoint))
      .sort();
    const nativeEndpoints = new Set([
      ...extractEndpointPatterns(fs.readFileSync(NATIVE_AM_API, 'utf8')),
      ...NATIVE_MEDIA_ENDPOINT_PATTERNS,
    ]);

    expect(beEndpoints.filter(endpoint => !nativeEndpoints.has(endpoint))).toEqual([]);
  });
});

const NATIVE_MEDIA_ENDPOINT_PATTERNS = [
  '/device/:param/service/shopee-qr',
  '/device/:param/service/whatsapp-qr',
  '/mutasi/:param/receipt',
];

function getRouteFiles(root: string): string[] {
  return fs.readdirSync(root, {withFileTypes: true}).flatMap(entry => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) return getRouteFiles(fullPath);
    return entry.isFile() && entry.name.endsWith('.js') ? [fullPath] : [];
  });
}

function extractExpressRoutePatterns(source: string) {
  return Array.from(
    source.matchAll(/router\.(?:get|post|put|delete|patch)\("([^"]+)"/g),
  )
    .map(match => normalizeEndpointPattern(match[1]))
    .filter((endpoint): endpoint is string => Boolean(endpoint));
}

function isExcludedBeRoute(endpoint: string) {
  return (
    endpoint === '/auth/register' ||
    endpoint.startsWith('/external/') ||
    endpoint.startsWith('/internal/')
  );
}

function extractEndpointPatterns(source: string) {
  const endpoints: string[] = [];
  const stringPattern = /[`'"]([^\r\n`'"]*[/?][^\r\n`'"]*)[`'"]/g;
  let match: RegExpExecArray | null;

  while ((match = stringPattern.exec(source))) {
    const endpoint = normalizeEndpointPattern(match[1]);
    if (endpoint) {
      endpoints.push(endpoint);
    }
  }

  return endpoints;
}

function normalizeEndpointPattern(value: string) {
  let endpoint = value.trim();
  if (!endpoint.startsWith('/')) {
    return null;
  }

  endpoint = endpoint
    .replace(/\$\{qs\}/g, '')
    .replace(/\$\{[^}]+\}/g, ':param')
    .replace(/:[A-Za-z_][A-Za-z0-9_]*/g, ':param')
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '');

  if (
    !endpoint ||
    endpoint === '/api' ||
    endpoint === '/login' ||
    endpoint.startsWith('/api/')
  ) {
    return null;
  }

  return endpoint || '/';
}
