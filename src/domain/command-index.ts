import {
  getShellModule,
  getShellModuleRouteIndex,
  shellModules,
  type AppArea,
  type AppModule,
  type ShellModule,
  type ShellModuleRouteEntry,
} from './app-shell';
import {
  getKolamNavigationRouteVariants,
  getKolamNavigationRouteTarget,
  kolamNavigationSections,
  type KolamNavigationItem,
  type KolamNavigationSection,
} from './kolam-navigation';
import {
  amSurfaces,
  kolamSurfaces,
  getPluginRouteIndex,
  type PluginRouteEntry,
  type UnifiedSurface,
} from './unified';
import {
  runtimeActions,
  type RuntimeAccessRequirement,
  type RuntimeAction,
} from './runtime-actions';

export type CommandKind =
  | 'module'
  | 'module-route'
  | 'kolam-surface'
  | 'navigation-route'
  | 'am-route'
  | 'runtime-action'
  | 'plugin-route';

export interface CommandEntry {
  id: string;
  kind: CommandKind;
  area: AppArea;
  moduleId: AppModule;
  label: string;
  description: string;
  source: string;
  route?: string;
  actionId?: string;
  amSurfaceId?: string;
  kolamSurfaceId?: string;
  moduleRouteId?: string;
  pluginId?: string;
  requiredAccess?: RuntimeAccessRequirement;
}

export interface CommandIndexStats {
  total: number;
  modules: number;
  moduleRoutes: number;
  kolamSurfaces: number;
  navigationRoutes: number;
  amRoutes: number;
  actions: number;
  pluginRoutes: number;
}

export interface CommandPaletteSection {
  id: CommandKind;
  title: string;
  commands: CommandEntry[];
}

export function getCommandIndex({
  modules = shellModules,
  moduleRoutes = getShellModuleRouteIndex({modules}),
  kolamRouteSurfaces = kolamSurfaces,
  navigationSections = kolamNavigationSections,
  navigationRouteVariants = getKolamNavigationRouteVariants(
    navigationSections,
  ),
  amRouteSurfaces = amSurfaces,
  actions = runtimeActions,
  pluginRoutes = getPluginRouteIndex(),
}: {
  modules?: ShellModule[];
  moduleRoutes?: ShellModuleRouteEntry[];
  kolamRouteSurfaces?: UnifiedSurface[];
  navigationSections?: KolamNavigationSection[];
  navigationRouteVariants?: KolamNavigationItem[];
  amRouteSurfaces?: UnifiedSurface[];
  actions?: RuntimeAction[];
  pluginRoutes?: PluginRouteEntry[];
} = {}): CommandEntry[] {
  return [
    ...modules.map(module => ({
      id: `module:${module.id}`,
      kind: 'module' as const,
      area: module.area,
      moduleId: module.id,
      label: module.label,
      description: module.summary,
      source: module.sourceRepo,
      route: module.routes.join(' / '),
    })),
    ...moduleRoutes.map(route => ({
      id: `module-route:${route.id}`,
      kind: 'module-route' as const,
      area: route.area,
      moduleId: route.moduleId,
      label: `${route.moduleLabel} ${route.route}`,
      description: route.description,
      source: route.sourceRepo,
      route: route.route,
      moduleRouteId: route.id,
    })),
    ...kolamRouteSurfaces.map(surface => ({
      id: `kolam-surface:${surface.id}`,
      kind: 'kolam-surface' as const,
      area: 'kolam' as const,
      moduleId: 'kolam' as const,
      label: `Kolam ${surface.label}`,
      description: surface.description,
      source: surface.sourceRepo,
      route: surface.route,
      kolamSurfaceId: surface.id,
    })),
    ...navigationSections.flatMap(section =>
      section.items.map(item => {
        const target = getKolamNavigationRouteTarget(item);
        const targetModule = getShellModule(target.moduleId);

        return {
          id: `navigation-route:${item.route}`,
          kind: 'navigation-route' as const,
          area: targetModule.area,
          moduleId: target.moduleId,
          label: item.label,
          description: [section.title, item.group, item.description]
            .filter(Boolean)
            .join(' - '),
          source:
            'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\components\\app-sidebar.tsx',
          route: item.route,
        };
      }),
    ),
    ...navigationRouteVariants.map(item => {
      const target = getKolamNavigationRouteTarget(item);
      const targetModule = getShellModule(target.moduleId);

      return {
        id: `navigation-route:${item.route}`,
        kind: 'navigation-route' as const,
        area: targetModule.area,
        moduleId: target.moduleId,
        label: item.label,
        description: [item.group, item.description].filter(Boolean).join(' - '),
        source:
          'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)',
        route: item.route,
      };
    }),
    ...amRouteSurfaces.map(surface => ({
      id: `am-route:${surface.id}`,
      kind: 'am-route' as const,
      area: 'am' as const,
      moduleId: 'am' as const,
      label: `AM ${surface.label}`,
      description: surface.description,
      source: surface.sourceRepo,
      route: surface.route,
      amSurfaceId: surface.id,
    })),
    ...actions.map(action => ({
      id: `action:${action.id}`,
      kind: 'runtime-action' as const,
      area: action.area,
      moduleId: action.moduleId,
      label: action.label,
      description: action.description,
      source: action.sourceContract,
      actionId: action.id,
      requiredAccess: action.requiredAccess,
    })),
    ...pluginRoutes.map(route => ({
      id: `plugin-route:${route.pluginId}:${route.route}`,
      kind: 'plugin-route' as const,
      area: 'plugins' as const,
      moduleId: 'plugins' as const,
      label: `${route.pluginLabel} ${route.route}`,
      description: `${route.manifestName} host route`,
      source: route.sourceRepo,
      route: route.route,
      pluginId: route.pluginId,
    })),
  ];
}

export function filterCommandIndex(
  commands: CommandEntry[],
  query: string,
): CommandEntry[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return commands;
  }

  return commands.filter(command =>
    [
      command.kind,
      command.area,
      command.moduleId,
      command.label,
      command.description,
      command.source,
      command.route,
      command.actionId,
      command.pluginId,
      command.kolamSurfaceId,
      command.moduleRouteId,
      command.requiredAccess,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery),
  );
}

export function getCommandIndexStats(
  commands: CommandEntry[],
): CommandIndexStats {
  return {
    total: commands.length,
    modules: commands.filter(command => command.kind === 'module').length,
    moduleRoutes: commands.filter(command => command.kind === 'module-route')
      .length,
    kolamSurfaces: commands.filter(command => command.kind === 'kolam-surface')
      .length,
    navigationRoutes: commands.filter(
      command => command.kind === 'navigation-route',
    ).length,
    amRoutes: commands.filter(command => command.kind === 'am-route').length,
    actions: commands.filter(command => command.kind === 'runtime-action')
      .length,
    pluginRoutes: commands.filter(command => command.kind === 'plugin-route')
      .length,
  };
}

export function getCommandPaletteSections(
  commands: CommandEntry[],
  limitPerSection = 5,
): CommandPaletteSection[] {
  return [
    {
      id: 'module' as const,
      title: 'Modules',
      commands: commands
        .filter(command => command.kind === 'module')
        .slice(0, limitPerSection),
    },
    {
      id: 'module-route' as const,
      title: 'Module Routes',
      commands: commands
        .filter(command => command.kind === 'module-route')
        .slice(0, limitPerSection),
    },
    {
      id: 'kolam-surface' as const,
      title: 'Kolam Surfaces',
      commands: commands
        .filter(command => command.kind === 'kolam-surface')
        .slice(0, limitPerSection),
    },
    {
      id: 'navigation-route' as const,
      title: 'Navigation Routes',
      commands: commands
        .filter(command => command.kind === 'navigation-route')
        .slice(0, limitPerSection),
    },
    {
      id: 'am-route' as const,
      title: 'AM Routes',
      commands: commands
        .filter(command => command.kind === 'am-route')
        .slice(0, limitPerSection),
    },
    {
      id: 'runtime-action' as const,
      title: 'Runtime Actions',
      commands: commands
        .filter(command => command.kind === 'runtime-action')
        .slice(0, limitPerSection),
    },
    {
      id: 'plugin-route' as const,
      title: 'Plugin Routes',
      commands: commands
        .filter(command => command.kind === 'plugin-route')
        .slice(0, limitPerSection),
    },
  ].filter(section => section.commands.length > 0);
}
