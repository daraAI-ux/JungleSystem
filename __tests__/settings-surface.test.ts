import {
  getSettingsActivityLogPagination,
  getSettingsActivityLogFilterControls,
  getSettingsActivityLogFilterVisualContract,
  getSettingsActivityLogDetailFields,
  getSettingsActivityLogRows,
  getSettingsActivityLogStatsCards,
  getSettingsActivityLogTableColumns,
  getSettingsDescriptionListVisualContract,
  getSettingsDetailRows,
  getSettingsLiveEndpoints,
  getSettingsPaginationVisualContract,
  getSettingsRoleEditorActions,
  getSettingsRoleInfoPanel,
  getSettingsRoleMemberPreview,
  getSettingsRolePermissionMatrixGroups,
  getSettingsRolePermissionPreviewRows,
  getSettingsRoleResourceGroups,
  getSettingsRoleTabItems,
  getSettingsRoleAccessRows,
  getSettingsSurfaceItemByRoute,
  getSettingsSurfaceStats,
  getSettingsSwitchVisualContract,
  getSettingsWebConfigFields,
  getSettingsWebFormSections,
  settingsSurfaceItems,
} from '../src/domain/settings-surface';

describe('settingsSurfaceItems', () => {
  it('maps live Kolam settings routes into a native summary surface', () => {
    expect(settingsSurfaceItems.map(item => item.route)).toEqual([
      '/settings/websetting',
      '/settings/roles',
      '/settings/activity-log',
    ]);
    expect(settingsSurfaceItems.map(item => item.badge)).toEqual([
      'Config',
      'Access',
      'Audit',
    ]);
    expect(getSettingsSurfaceStats()).toEqual({
      total: 3,
      nativeSummary: 1,
      sourceAudit: 2,
      planned: 0,
    });
  });

  it('resolves native settings surface items from live routes', () => {
    expect(getSettingsSurfaceItemByRoute('/settings/roles')).toEqual(
      expect.objectContaining({
        id: 'role-management',
        title: 'Role Management',
      }),
    );
    expect(getSettingsSurfaceItemByRoute('/settings/sitemap')).toBeNull();
  });

  it('provides native detail rows for each settings tab', () => {
    expect(getSettingsDetailRows('web-settings').map(row => row.label)).toEqual([
      'Storefront display',
      'Kolam header and navigation',
      'Runtime API config',
    ]);
    expect(getSettingsDetailRows('web-settings')[0]).toEqual(
      expect.objectContaining({
        value: 'Live contract',
        tone: 'success',
      }),
    );
    expect(getSettingsDetailRows('role-management').map(row => row.value)).toEqual([
      'access_inventory',
      'access_pos / role POS',
      'access_am',
    ]);
    expect(getSettingsDetailRows('activity-log')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'sync-audit',
          value: 'Native log',
          tone: 'success',
        }),
        expect.objectContaining({
          id: 'backend-audit',
          value: 'Live contract',
          tone: 'success',
        }),
      ]),
    );
  });

  it('tracks the live description-list visual contract for Settings detail rows', () => {
    expect(getSettingsDescriptionListVisualContract()).toEqual({
      sourceComponent: 'components/ui/description-list.tsx',
      layout: 'term-detail-grid',
      desktopColumns: 'min(50%, calc(var(--spacing)*80)) auto',
      termTone: 'muted',
      rowBorder: 'top-except-first',
      textScale: 'text-sm/6',
    });
  });

  it('tracks the live switch visual contract for Web Settings toggles', () => {
    expect(getSettingsSwitchVisualContract()).toEqual({
      sourceComponent: 'components/ui/switch.tsx',
      role: 'switch',
      trackShape: 'rounded-pill',
      trackSize: 'w-8 h-5 sm',
      trackWidth: 32,
      trackHeight: 20,
      trackPadding: 3,
      knobShape: 'rounded-full',
      knobSize: 14,
      selectedMotion: 'translate-x-3',
      selectedTranslateX: 12,
      offTone: 'secondary with fg/5 inset ring',
      selectedTone: 'primary',
      focusTreatment: 'primary/10 bg with ring/20',
      knobTreatment: 'white shadow-sm fg/5 ring',
      disabledOpacity: 0.5,
    });
  });

  it('maps live Web Settings page into native form sections', () => {
    const sections = getSettingsWebFormSections();

    expect(sections.map(section => section.title)).toEqual([
      'Version',
      'Logo',
      'Company Info',
      'Contact Info',
      'Address',
      'Shipping Origin',
      'Social Media',
      'Maintenance Mode',
    ]);
    expect(sections[0]).toEqual(
      expect.objectContaining({
        id: 'version',
        layout: 'grid-2',
        sourceComponent: 'settings/websetting/websetting-page.tsx',
      }),
    );
    expect(sections[0].fields.map(field => field.label)).toEqual([
      'Kolam',
      'Enclonura',
      'POS',
      'Marketplace',
    ]);
    expect(
      sections.find(section => section.id === 'shipping-origin')?.fields,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'origin-postal-code',
          label: 'Postal Code',
          required: true,
        }),
      ]),
    );
    expect(
      sections.find(section => section.id === 'maintenance-mode')?.fields,
    ).toEqual([
      expect.objectContaining({id: 'maintenance-pos', control: 'switch'}),
      expect.objectContaining({
        id: 'maintenance-marketplace',
        control: 'switch',
      }),
    ]);
  });

  it('tracks the live pagination visual contract for Activity Log rows', () => {
    expect(getSettingsPaginationVisualContract()).toEqual({
      sourceComponent: 'components/ui/pagination.tsx',
      ariaLabel: 'pagination',
      layout: 'centered-horizontal-list',
      itemSize: 'h-9 min-w-10',
      itemHeight: 36,
      itemMinWidth: 40,
      gap: '5px',
      gapPx: 5,
      itemIntent: 'outline',
      defaultIntent: 'plain',
      currentState: 'aria-current-page-disabled',
      currentOpacity: 1,
      textTreatment: 'font-normal tabular-nums',
      focusTreatment: 'primary border primary/10 bg ring/20',
      iconSegments: ['previous', 'next'],
    });
  });

  it('projects sync activity into native activity log rows', () => {
    expect(
      getSettingsActivityLogRows([
        {
          id: 'seed:pos:seed',
          area: 'pos',
          label: 'POS',
          status: 'seed',
          tone: 'muted',
          statusIconKind: 'seed',
          detail: 'POS seed: 4 item katalog, 2 sale.',
          timestamp: 'seed',
        },
        {
          id: 'next:kolam:live',
          area: 'kolam',
          label: 'Kolam',
          status: 'live',
          tone: 'success',
          statusIconKind: 'check',
          detail: 'Kolam live: 12 titik sales graph.',
          timestamp: 'next',
        },
      ]),
    ).toEqual([
      expect.objectContaining({
        id: 'seed:pos:seed',
        user: 'native-shell',
        source: 'pos',
        type: 'api',
        method: 'GET',
        path: '/products?sellable=true',
        event: 'POS seed: 4 item katalog, 2 sale.',
        status: 'seed',
        statusCode: 'seed',
        ip: '-',
        duration: '-',
        suspicious: [],
        timestamp: 'seed',
        tone: 'muted',
      }),
      expect.objectContaining({
        id: 'next:kolam:live',
        source: 'Kolam',
        method: 'GET',
        path: '/dashboard/sales-graph',
        event: 'Kolam live: 12 titik sales graph.',
        status: 'live',
        statusCode: '200',
        duration: '< 1s',
        timestamp: 'next',
        tone: 'success',
      }),
    ]);
  });

  it('tracks live Activity Log table columns for native rows', () => {
    const columns = getSettingsActivityLogTableColumns();

    expect(columns.map(column => column.label)).toEqual([
      'Waktu',
      'User',
      'Source',
      'Tipe',
      'Method',
      'Path',
      'IP',
      'Status',
      'Durasi',
      '',
    ]);
    expect(columns.find(column => column.id === 'path')).toEqual(
      expect.objectContaining({
        width: 'flex',
        isRowHeader: true,
        sourceComponent: 'settings/activity-log/activity-log-list.tsx',
      }),
    );
  });

  it('maps Activity Log row into live-style detail fields', () => {
    const row = getSettingsActivityLogRows([
      {
        id: 'fallback:kolam',
        area: 'kolam',
        label: 'Kolam',
        status: 'fallback',
        tone: 'warning',
        statusIconKind: 'activity',
        detail: 'Kolam fallback: timeout',
        timestamp: '10:15',
      },
    ])[0];

    expect(getSettingsActivityLogDetailFields(row)).toEqual([
      expect.objectContaining({label: 'Timestamp', value: '10:15'}),
      expect.objectContaining({label: 'User', value: 'native-shell'}),
      expect.objectContaining({label: 'Source', value: 'Kolam'}),
      expect.objectContaining({label: 'Type', value: 'api'}),
      expect.objectContaining({label: 'Method', value: 'GET'}),
      expect.objectContaining({
        label: 'Path',
        value: '/dashboard/sales-graph',
        mono: true,
      }),
      expect.objectContaining({label: 'IP', value: '-', mono: true}),
      expect.objectContaining({
        label: 'User Agent',
        value: 'React Native Windows shell',
      }),
      expect.objectContaining({label: 'Status', value: '503 (fallback)'}),
      expect.objectContaining({label: 'Duration', value: '-'}),
      expect.objectContaining({
        label: 'Action',
        value: 'sync_activity_preview',
        mono: true,
      }),
    ]);
  });

  it('paginates activity log rows with a clamped live-style footer model', () => {
    const entries = Array.from({length: 8}, (_, index) => ({
      id: `entry-${index + 1}`,
      area: 'pos' as const,
      label: 'POS',
      status: 'live' as const,
      tone: 'success' as const,
      statusIconKind: 'check' as const,
      detail: `POS live: event ${index + 1}`,
      timestamp: `time-${index + 1}`,
    }));

    expect(getSettingsActivityLogRows(entries, 3, 2).map(row => row.id)).toEqual([
      'entry-4',
      'entry-5',
      'entry-6',
    ]);
    expect(getSettingsActivityLogPagination(entries.length, 4, 3)).toEqual({
      total: 8,
      page: 3,
      pageSize: 3,
      pageCount: 3,
      from: 7,
      to: 8,
      hasPrevious: true,
      hasNext: false,
      pages: [1, 2, 3],
    });
  });

  it('maps Activity Log stats endpoint into native summary cards', () => {
    const entries = [
      {
        id: 'live:pos',
        area: 'pos' as const,
        label: 'POS',
        status: 'live' as const,
        tone: 'success' as const,
        statusIconKind: 'check' as const,
        detail: 'POS live',
        timestamp: 'now',
      },
      {
        id: 'fallback:kolam',
        area: 'kolam' as const,
        label: 'Kolam',
        status: 'fallback' as const,
        tone: 'warning' as const,
        statusIconKind: 'activity' as const,
        detail: 'Kolam fallback',
        timestamp: 'now',
      },
    ];

    expect(getSettingsActivityLogStatsCards(entries, 14)).toEqual([
      expect.objectContaining({
        id: 'window',
        value: '14d',
        sourceEndpoint: '/activity-log/stats',
        backendField: 'days',
      }),
      expect.objectContaining({
        id: 'events',
        value: '2',
        backendField: 'byType',
      }),
      expect.objectContaining({
        id: 'success',
        value: '1',
        tone: 'success',
        backendField: 'byStatus',
      }),
      expect.objectContaining({
        id: 'attention',
        value: '1',
        tone: 'warning',
        backendField: 'topPaths',
      }),
    ]);
  });

  it('tracks live Activity Log filter controls for the native filter bar', () => {
    const controls = getSettingsActivityLogFilterControls();

    expect(controls.map(control => control.id)).toEqual([
      'search',
      'type',
      'status',
      'method',
      'source',
      'suspicious',
    ]);
    expect(controls[0]).toEqual(
      expect.objectContaining({
        label: 'Cari',
        control: 'search',
        placeholder: 'Cari path atau IP...',
        triggerWidth: 'min-w-64',
        sourceComponent: 'settings/activity-log/activity-log-list.tsx',
      }),
    );
    expect(controls.find(control => control.id === 'method')?.options).toEqual([
      {id: '', label: 'Semua method'},
      {id: 'GET', label: 'GET'},
      {id: 'POST', label: 'POST'},
      {id: 'PUT', label: 'PUT'},
      {id: 'PATCH', label: 'PATCH'},
      {id: 'DELETE', label: 'DELETE'},
    ]);
    expect(
      controls.find(control => control.id === 'suspicious')?.options,
    ).toEqual(
      expect.arrayContaining([
        {id: 'automation_tool_ua', label: 'UA: automation tool'},
        {id: 'source_origin_mismatch', label: 'Source/origin mismatch'},
      ]),
    );
  });

  it('tracks the live Activity Log filter bar visual contract', () => {
    expect(getSettingsActivityLogFilterVisualContract()).toEqual({
      sourceComponent: 'settings/activity-log/activity-log-list.tsx',
      searchComponent: 'components/ui/search-field.tsx',
      selectComponent: 'components/ui/select.tsx',
      refreshComponent: 'components/ui/button.tsx',
      layoutClass: 'mt-4 flex flex-wrap items-center gap-2',
      layout: 'wrapped-row',
      gapPx: 8,
      marginTopPx: 16,
      controlHeight: 36,
      searchMinWidth: 256,
      selectMinWidth: 128,
      selectWideMinWidth: 160,
      triggerShape: 'rounded-lg',
      triggerTone: 'bg with input inset ring',
      focusTreatment: 'ring/10 bg with ring-3 ring/20',
      textTreatment: 'sm:text-sm/6 normal-weight',
      searchIcon: 'IconSearch',
      selectChevron: 'IconChevronsY',
      refreshButton: 'outline sm with IconRefresh',
      visibleSelectLabel: false,
    });
  });

  it('defines role access matrix rows for native Role Management', () => {
    expect(getSettingsRoleAccessRows()).toEqual([
      expect.objectContaining({
        id: 'super-admin',
        kolam: true,
        pos: true,
        am: true,
      }),
      expect.objectContaining({
        id: 'inventory-staff',
        kolam: true,
        pos: false,
        am: false,
      }),
      expect.objectContaining({
        id: 'pos-cashier',
        kolam: false,
        pos: true,
        am: false,
      }),
      expect.objectContaining({
        id: 'am-operator',
        kolam: false,
        pos: false,
        am: true,
      }),
    ]);
  });

  it('maps live Role Management CRUD actions into native toolbar actions', () => {
    expect(getSettingsRoleEditorActions('inventory-staff')).toEqual([
      {
        id: 'create-role',
        label: 'New role',
        method: 'POST',
        path: '/roles',
        intent: 'outline',
        disabled: false,
        sourceComponent: 'settings/roles/create-roles.tsx',
      },
      {
        id: 'update-role',
        label: 'Edit role',
        method: 'PUT',
        path: '/roles/inventory-staff',
        intent: 'outline',
        disabled: false,
        sourceComponent: 'settings/roles/list.tsx',
      },
      {
        id: 'delete-role',
        label: 'Delete role',
        method: 'DELETE',
        path: '/roles/inventory-staff',
        intent: 'danger',
        disabled: false,
        disabledReason: undefined,
        sourceComponent: 'settings/roles/list.tsx',
      },
    ]);
  });

  it('disables delete for live default roles in the native toolbar model', () => {
    expect(getSettingsRoleAccessRows()[0]).toEqual(
      expect.objectContaining({
        id: 'super-admin',
        key: 'super-admin',
        defaultRole: true,
      }),
    );
    expect(getSettingsRoleEditorActions('super-admin', true)[2]).toEqual(
      expect.objectContaining({
        id: 'delete-role',
        disabled: true,
        disabledReason: 'Default role cannot be deleted',
      }),
    );
  });

  it('previews live resource-action rows used by Role Management', () => {
    expect(getSettingsRolePermissionPreviewRows()).toEqual([
      {
        id: 'role-crud',
        resource: 'role',
        label: 'Role Management',
        actions: ['view', 'create', 'update', 'delete'],
        source: 'lib/permissions/resource-actions.ts',
      },
      {
        id: 'websetting-admin',
        resource: 'websetting',
        label: 'Web Settings',
        actions: ['view', 'update'],
        source: 'lib/permissions/resource-actions.ts',
      },
      {
        id: 'activity-log-view',
        resource: 'activity-log',
        label: 'Activity Log',
        actions: ['view'],
        source: 'lib/permissions/resource-actions.ts',
      },
    ]);
  });

  it('maps live Role Management permissions into native toggle matrix groups', () => {
    const [group] = getSettingsRolePermissionMatrixGroups(
      'inventory-staff',
      false,
    );

    expect(group).toEqual(
      expect.objectContaining({
        id: 'settings-configuration-preview',
        label: 'Settings & Configuration',
        resourceCount: 3,
        activeCount: 2,
        totalPossible: 7,
        expanded: true,
        sourceComponent: 'settings/roles/list.tsx',
      }),
    );
    expect(group.rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          resource: 'role',
          activeCount: 1,
          totalCount: 4,
          tone: 'warning',
          source: 'lib/permissions/resource-actions.ts',
        }),
        expect.objectContaining({
          resource: 'activity-log',
          activeCount: 1,
          totalCount: 1,
          tone: 'success',
        }),
      ]),
    );
    expect(group.rows[0].actions.map(action => action.label)).toEqual([
      'View',
      'Create',
      'Update',
      'Delete',
    ]);
  });

  it('maps live Role Management roles into native tab items', () => {
    expect(getSettingsRoleTabItems()).toEqual([
      expect.objectContaining({
        id: 'super-admin',
        label: 'Super Administrator',
        key: 'super-admin',
        permissionCount: 7,
        defaultRole: true,
        fullAccess: true,
        sourceComponent: 'settings/roles/list.tsx',
      }),
      expect.objectContaining({
        id: 'inventory-staff',
        label: 'Inventory Staff',
        permissionCount: 2,
        defaultRole: false,
        fullAccess: false,
      }),
      expect.objectContaining({
        id: 'pos-cashier',
        label: 'POS Cashier',
        permissionCount: 1,
      }),
      expect.objectContaining({
        id: 'am-operator',
        label: 'AM Operator',
        permissionCount: 1,
      }),
    ]);
  });

  it('maps selected role into live-style Role Info panel', () => {
    expect(getSettingsRoleInfoPanel('super-admin')).toEqual({
      id: 'super-admin',
      name: 'Super Administrator',
      description: 'Full shell access through super administrator role.',
      key: 'super-admin',
      badges: [
        {id: 'full-access', label: 'Full Access', tone: 'warning'},
        {id: 'default', label: 'Default', tone: 'secondary'},
      ],
      canDelete: false,
      deleteLabel: 'Delete',
      notice:
        'Super Admin has full access to all resources. Permissions cannot be modified.',
      sourceComponent: 'settings/roles/list.tsx',
    });
    expect(getSettingsRoleInfoPanel('inventory-staff')).toEqual(
      expect.objectContaining({
        id: 'inventory-staff',
        key: 'inventory-staff',
        badges: [],
        canDelete: true,
        notice: undefined,
      }),
    );
  });

  it('locks native permission matrix actions for live super admin/default roles', () => {
    const [group] = getSettingsRolePermissionMatrixGroups('super-admin', true);

    expect(group.activeCount).toBe(group.totalPossible);
    expect(group.rows.every(row => row.tone === 'success')).toBe(true);
    expect(
      group.rows.flatMap(row => row.actions).every(action => action.disabled),
    ).toBe(true);
  });

  it('maps live Role Management resource groups into native summaries', () => {
    const groups = getSettingsRoleResourceGroups();

    expect(groups.map(group => group.label)).toEqual([
      'Inventory',
      'Sales & Customers',
      'Content',
      'Purchasing & Production',
      'Finance',
      'Stock Management',
      'Enclonura',
      'Settings & Configuration',
      'System (Wildcard)',
    ]);
    expect(groups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'settings-configuration',
          resources: ['user', 'role', 'websetting', 'custom-field'],
          sourceComponent: 'settings/roles/list.tsx',
        }),
        expect.objectContaining({
          id: 'system',
          resources: ['*'],
        }),
      ]),
    );
  });

  it('maps live RoleMembers preview into selected-role member pills', () => {
    expect(getSettingsRoleMemberPreview('inventory-staff')).toEqual({
      roleId: 'inventory-staff',
      label: 'Members',
      count: 2,
      members: [
        {id: 'inventory-lead', name: 'Inventory Lead', initials: 'IL'},
        {id: 'stock-staff', name: 'Stock Staff', initials: 'SS'},
      ],
      sourceComponent: 'settings/roles/list.tsx',
    });
    expect(getSettingsRoleMemberPreview('am-operator')).toEqual(
      expect.objectContaining({
        count: 0,
        members: [],
      }),
    );
  });

  it('defines native Web Settings config fields', () => {
    expect(getSettingsWebConfigFields()).toEqual([
      expect.objectContaining({
        id: 'storefront-title',
        label: 'Storefront title',
        control: 'text',
      }),
      expect.objectContaining({
        id: 'storefront-status',
        value: 'Enabled',
        control: 'toggle',
      }),
      expect.objectContaining({
        id: 'maintenance-mode',
        value: 'Off',
        control: 'toggle',
      }),
    ]);
  });

  it('tracks live backend endpoints used by the native Settings service', () => {
    expect(getSettingsLiveEndpoints()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'websetting-read',
        method: 'GET',
        path: '/websetting',
        status: 'wired',
      }),
      expect.objectContaining({
        id: 'websetting-update',
        method: 'PUT',
        path: '/websetting',
        permission: 'websetting:update',
      }),
      expect.objectContaining({
        id: 'version-read',
        path: '/websetting/version',
        permission: 'public',
      }),
      expect.objectContaining({
        id: 'roles-read',
        path: '/roles',
        permission: 'role:view',
      }),
      expect.objectContaining({
        id: 'activity-read',
        path: '/activity-log',
        permission: 'activity-log:view',
      }),
      expect.objectContaining({
        id: 'activity-stats',
        path: '/activity-log/stats',
      }),
    ]));
    expect(getSettingsLiveEndpoints()).toHaveLength(6);
  });
});
