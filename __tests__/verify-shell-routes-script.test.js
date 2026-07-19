const {spawnSync} = require('node:child_process');
const path = require('node:path');

describe('verify-shell-routes script', () => {
  it('passes when native shell routes cover POS and AM source app pages', () => {
    const result = spawnSync(
      process.execPath,
      [path.join(__dirname, '..', 'scripts', 'verify-shell-routes.js')],
      {encoding: 'utf8'},
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      '[OK] Semua POS source route sudah ada di native shell.',
    );
    expect(result.stdout).toContain(
      '[OK] Semua AM source route sudah ada di native shell.',
    );
    expect(result.stdout).toContain('POS source app pages: 9');
    expect(result.stdout).toContain('AM source app pages: 17');
  });
});
