const {spawnSync} = require('node:child_process');
const path = require('node:path');

describe('verify-runtime-backend script', () => {
  it('passes the checked-in runtime server configuration', () => {
    const result = spawnSync(
      process.execPath,
      [path.join(__dirname, '..', 'scripts', 'verify-runtime-backend.js')],
      {encoding: 'utf8'},
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      '[OK] Runtime backend config points to existing server endpoints with KolamWindows native client identity.',
    );
    expect(result.stdout).toContain('appConfig apiBaseUrl: amfibi.dunia-anura.com/api');
    expect(result.stdout).toContain('appConfig amApiBaseUrl: frogs.dunia-anura.com/api');
    expect(result.stdout).toContain('appConfig nativeClientId: kolam-windows');
    expect(result.stdout).toContain('appConfig nativeOrigin: app://kolamwindows');
    expect(result.stdout).toContain('appConfig nativeUserAgent: KolamWindows/0.0.1');
  });
});
