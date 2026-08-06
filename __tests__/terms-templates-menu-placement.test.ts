/**
 * Focused checks for terms-templates menu placement (no Custom Project slug).
 */
import {
  getKolamNavigationItemByRoute,
  getKolamNavigationRouteVariants,
  kolamNavigationSections,
  kolamSidebarNavigationSections,
} from '../src/domain/kolam-navigation';
import { getShellModule } from '../src/domain/app-shell';

describe('terms-templates menu placement', () => {
  it('places Syarat & Ketentuan under Penjualan without custom-project slugs', () => {
    const salesRoutes = kolamNavigationSections
      .find(section => section.id === 'sales')!
      .items.map(item => item.route);

    expect(salesRoutes).toContain('/terms-templates');
    expect(salesRoutes).toContain('/proyek');
    expect(salesRoutes).not.toContain('/custom-project');
    expect(salesRoutes).not.toContain('/custom-project/instances');
    expect(salesRoutes).not.toContain('/custom-project/instances/new');

    expect(getKolamNavigationItemByRoute('/terms-templates')).toEqual(
      expect.objectContaining({
        label: 'Syarat & Ketentuan',
        group: 'Penjualan',
      }),
    );
    expect(getKolamNavigationItemByRoute('/custom-project')).toBeNull();

    const sidebarSales = kolamSidebarNavigationSections.find(
      section => section.id === 'sales',
    )!;
    expect(
      sidebarSales.items.find(item => item.route === '/terms-templates'),
    ).toEqual(
      expect.objectContaining({
        label: 'Syarat & Ketentuan',
        group: 'Penjualan',
      }),
    );
    expect(
      kolamSidebarNavigationSections
        .flatMap(section => section.items)
        .some(
          item =>
            /custom project/i.test(item.label) ||
            /custom project/i.test(item.group ?? ''),
        ),
    ).toBe(false);

    expect(
      getKolamNavigationRouteVariants().some(item =>
        item.route.includes('custom-project'),
      ),
    ).toBe(false);

    expect(getShellModule('kolam').routes).not.toContain('custom-project');
    expect(getShellModule('kolam').routes).not.toContain(
      'custom-project/instances',
    );
    expect(getShellModule('kolam').routes).not.toContain(
      'custom-project/instances/new',
    );
    expect(getShellModule('kolam').routes).toContain('terms-templates');
  });
});
