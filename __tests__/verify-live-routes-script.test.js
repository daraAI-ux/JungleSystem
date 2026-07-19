const {spawnSync} = require('node:child_process');
const path = require('node:path');

describe('verify-live-routes script', () => {
  it('passes when native Kolam routes cover the live FE app routes', () => {
    const result = spawnSync(
      process.execPath,
      [path.join(__dirname, '..', 'scripts', 'verify-live-routes.js')],
      {encoding: 'utf8'},
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      '[OK] Semua live FE app route sudah punya native route entry.',
    );
    expect(result.stdout).toContain('Live FE app routes: 257');
    expect(result.stdout).toContain('Native Kolam routes: 268');
  });
});
