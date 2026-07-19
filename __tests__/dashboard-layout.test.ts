import {getDashboardLayoutVisualContract} from '../src/domain/dashboard-layout';

describe('getDashboardLayoutVisualContract', () => {
  it('tracks the live Beranda page layout spacing contract', () => {
    expect(getDashboardLayoutVisualContract()).toEqual({
      sourceCss:
        'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)\\(dashboard)\\(partials)\\dashboard-exact.module.css',
      page: {
        maxWidthRem: 72,
        maxWidthPx: 1152,
        paddingX: 16,
        paddingTop: 16,
        paddingBottom: 32,
        gapY: 16,
      },
      layout: {
        gapY: 16,
        columns: 'single',
        alignItems: 'start',
      },
      main: {
        gapY: 14,
        minWidth: 0,
      },
      inventoryRail: {
        gridGap: 10,
        desktopColumns: 3,
        tabletColumns: 2,
        mobileColumns: 1,
      },
    });
  });

  it('returns cloned layout values so render code cannot mutate the contract', () => {
    const first = getDashboardLayoutVisualContract();
    first.page.maxWidthPx = 99;
    first.page.gapY = 99;
    first.layout.gapY = 99;
    first.main.gapY = 99;
    first.inventoryRail.gridGap = 99;

    const next = getDashboardLayoutVisualContract();

    expect(next.page.maxWidthPx).toBe(1152);
    expect(next.page.gapY).toBe(16);
    expect(next.layout.gapY).toBe(16);
    expect(next.main.gapY).toBe(14);
    expect(next.inventoryRail.gridGap).toBe(10);
  });
});
