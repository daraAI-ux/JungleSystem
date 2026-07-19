export interface DashboardLayoutVisualContract {
  sourceCss: string;
  page: {
    maxWidthRem: number;
    maxWidthPx: number;
    paddingX: number;
    paddingTop: number;
    paddingBottom: number;
    gapY: number;
  };
  layout: {
    gapY: number;
    columns: 'single';
    alignItems: 'start';
  };
  main: {
    gapY: number;
    minWidth: 0;
  };
  inventoryRail: {
    gridGap: number;
    desktopColumns: number;
    tabletColumns: number;
    mobileColumns: number;
  };
}

const dashboardLayoutVisualContract: DashboardLayoutVisualContract = {
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
};

export function getDashboardLayoutVisualContract(): DashboardLayoutVisualContract {
  return {
    ...dashboardLayoutVisualContract,
    page: {...dashboardLayoutVisualContract.page},
    layout: {...dashboardLayoutVisualContract.layout},
    main: {...dashboardLayoutVisualContract.main},
    inventoryRail: {...dashboardLayoutVisualContract.inventoryRail},
  };
}
