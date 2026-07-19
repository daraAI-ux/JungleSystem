import {
  getShellModulesByArea,
  shellModules,
  type AppArea,
  type AppModule,
  type ShellModule,
} from './app-shell';
import {
  getCommandIndex,
  getCommandIndexStats,
  type CommandEntry,
  type CommandIndexStats,
} from './command-index';
import {
  getKolamNavigationRouteCount,
  getKolamNavigationRouteVariants,
  kolamNavigationSections,
} from './kolam-navigation';
import {
  getRouteWorkbenchIntent,
  getRouteWorkbenchIntentTitle,
  getRouteWorkbenchNextBuildStep,
  type RouteWorkbenchIntent,
} from './route-workbench';
import {
  amSurfaces,
  getPluginIntegrationStats,
  getPluginRouteIndex,
  kolamSurfaces,
  pluginRegistry,
  type PluginDescriptor,
} from './unified';

export type AppLaunchStatus =
  | 'live-runtime'
  | 'native-scaffold'
  | 'plugin-host'
  | 'contract-ready';

export interface AppLaunchArea {
  id: AppArea;
  label: string;
  moduleId: AppModule;
  modules: AppLaunchModule[];
  routeCommands: CommandEntry[];
  routeCount: number;
  runway: AppLaunchRunwayStep[];
  screenPacks: AppLaunchScreenPack[];
  sourceRepo: string;
  status: AppLaunchStatus;
  summary: string;
  testTarget: string;
}

export interface AppLaunchModule {
  id: AppModule;
  label: string;
  routeCount: number;
  summary: string;
}

export interface AppLaunchRunwayStep {
  id: string;
  label: string;
  meta: string;
  tone: 'default' | 'success' | 'warning';
  value: string;
}

export interface AppLaunchScreenPack {
  id: RouteWorkbenchIntent;
  label: string;
  nextBuildStep: string;
  priority: 'build-next' | 'coverage-ready' | 'later';
  routeCount: number;
  routePreview: string;
}

export interface AppLaunchCoverage {
  areas: AppLaunchArea[];
  commandCount: number;
  commandStats: CommandIndexStats;
  moduleCount: number;
  pluginReadyCount: number;
  pluginRouteCount: number;
  routeCount: number;
  serverRule: string;
}

export function getAppLaunchCoverage({
  modules = shellModules,
  plugins = pluginRegistry,
}: {
  modules?: ShellModule[];
  plugins?: PluginDescriptor[];
} = {}): AppLaunchCoverage {
  const pluginStats = getPluginIntegrationStats(plugins);
  const pluginRoutes = getPluginRouteIndex(plugins);
  const commandIndex = getCommandIndex({modules, pluginRoutes});
  const kolamRouteCommands = getLaunchRouteCommands('kolam', commandIndex);
  const posRouteCommands = getLaunchRouteCommands('pos', commandIndex);
  const amRouteCommands = getLaunchRouteCommands('am', commandIndex);
  const pluginRouteCommands = getLaunchRouteCommands('plugins', commandIndex);
  const areas: AppLaunchArea[] = [
    {
      id: 'kolam',
      label: 'Kolam',
      moduleId: 'kolam',
      modules: getLaunchModules('kolam', modules),
      routeCommands: kolamRouteCommands,
      routeCount:
        getKolamNavigationRouteCount() +
        getKolamNavigationRouteVariants(kolamNavigationSections).length +
        kolamSurfaces.length,
      runway: [
        {
          id: 'test-flow',
          label: 'User Test Flow',
          value: 'Beranda -> Route Atlas -> Inventory/Finance/Service',
          meta: 'User bisa membuka surface besar dulu dari dashboard native.',
          tone: 'success',
        },
        {
          id: 'runtime',
          label: 'Runtime',
          value: 'https://amfibi.dunia-anura.com/api',
          meta: 'Kolam runtime tetap ke server existing dengan native client identity.',
          tone: 'success',
        },
        {
          id: 'next-pack',
          label: 'Next Screen Pack',
          value: 'Inventory, Finance, Service, People',
          meta: 'Bangun screen pack berdasarkan intent route, bukan tombol per modul.',
          tone: 'warning',
        },
        {
          id: 'evidence',
          label: 'Evidence',
          value: 'npm run verify:live-routes',
          meta: 'Menjaga route FE live tetap terdaftar di native shell.',
          tone: 'success',
        },
      ],
      screenPacks: getLaunchScreenPacks('kolam', kolamRouteCommands),
      sourceRepo: 'E:\\Projects\\_latest-da\\da-inventory-frontend',
      status: 'live-runtime',
      summary:
        'Menu live, route detail/create/edit, inventory, finance, service, user, dan settings masuk ke native shell.',
      testTarget: 'Sidebar Kolam + Quick Search route Kolam',
    },
    {
      id: 'pos',
      label: 'POS',
      moduleId: 'checkout',
      modules: getLaunchModules('pos', modules),
      routeCommands: posRouteCommands,
      routeCount: getAreaRouteCount('pos', modules),
      runway: [
        {
          id: 'test-flow',
          label: 'User Test Flow',
          value: 'Checkout -> Katalog -> Sales -> Cashflow -> Customer',
          meta: 'User bisa mencoba satu alur POS penuh tanpa backend lokal.',
          tone: 'success',
        },
        {
          id: 'runtime',
          label: 'Runtime',
          value: 'https://amfibi.dunia-anura.com/api',
          meta: 'POS memakai server existing dengan x-source POS/native client.',
          tone: 'success',
        },
        {
          id: 'next-pack',
          label: 'Next Screen Pack',
          value: 'Transaction table, payment form, customer lookup',
          meta: 'Perluas alur kasir memakai table/form primitive yang sama.',
          tone: 'warning',
        },
        {
          id: 'evidence',
          label: 'Evidence',
          value: 'npm run verify:shell-routes',
          meta: 'Menjaga route POS source tetap masuk shell native.',
          tone: 'success',
        },
      ],
      screenPacks: getLaunchScreenPacks('pos', posRouteCommands),
      sourceRepo: 'E:\\Projects\\da-pos',
      status: 'contract-ready',
      summary:
        'Checkout, katalog sellable, sales, cashflow session, dan customer POS sudah punya surface native awal.',
      testTarget: 'Checkout, Katalog, Sales, Cashflow, Customer',
    },
    {
      id: 'am',
      label: 'AM',
      moduleId: 'am',
      modules: getLaunchModules('am', modules),
      routeCommands: amRouteCommands,
      routeCount: getAreaRouteCount('am', modules) + amSurfaces.length,
      runway: [
        {
          id: 'test-flow',
          label: 'User Test Flow',
          value: 'AM -> Tasks -> Hardware -> Operations',
          meta: 'User bisa membuka runtime AM dan melihat guard server existing.',
          tone: 'success',
        },
        {
          id: 'runtime',
          label: 'Runtime',
          value: 'https://frogs.dunia-anura.com/api',
          meta: 'AM tidak memakai backend lokal; snapshot hanya referensi kontrak.',
          tone: 'success',
        },
        {
          id: 'next-pack',
          label: 'Next Screen Pack',
          value: 'Task board, hardware tree, transaction detail',
          meta: 'Buka screen AM berdasarkan FE/BE route yang sudah terindeks.',
          tone: 'warning',
        },
        {
          id: 'evidence',
          label: 'Evidence',
          value: 'npm run verify:shell-routes',
          meta: 'Menjaga route FE/BE AM tetap masuk shell native.',
          tone: 'success',
        },
      ],
      screenPacks: getLaunchScreenPacks('am', amRouteCommands),
      sourceRepo: 'E:\\Projects\\da-automation-management',
      status: 'native-scaffold',
      summary:
        'Dashboard, tasks, hardware, marketplace, operations, dan route BE/FE AM terbaca sebagai kontrak runtime server.',
      testTarget: 'Automation Management module',
    },
    {
      id: 'plugins',
      label: 'Plugin Hub',
      moduleId: 'plugins',
      modules: [
        {
          id: 'plugins',
          label: 'Plugin Hub',
          routeCount: pluginRoutes.length,
          summary: 'Plugin registry, route manifest, dan host capability.',
        },
      ],
      routeCommands: pluginRouteCommands,
      routeCount: pluginRoutes.length,
      runway: [
        {
          id: 'test-flow',
          label: 'User Test Flow',
          value: 'Plugin Hub -> Chat/Dara/Layanan/Task Manager route',
          meta: 'User bisa membuka route plugin dari registry host native.',
          tone: 'success',
        },
        {
          id: 'runtime',
          label: 'Runtime',
          value: 'Plugin host via Kolam server',
          meta: 'Plugin tetap berjalan sebagai host contract, bukan WebView shell umum.',
          tone: 'success',
        },
        {
          id: 'next-pack',
          label: 'Next Screen Pack',
          value: 'Plugin route adapter + capability guard',
          meta: 'Adapter diprioritaskan dari manifest dan capabilities plugin live.',
          tone: 'warning',
        },
        {
          id: 'evidence',
          label: 'Evidence',
          value: 'npm run verify:registry',
          meta: 'Menjaga package.json dan manifest plugin tetap sinkron.',
          tone: 'success',
        },
      ],
      screenPacks: getLaunchScreenPacks('plugins', pluginRouteCommands),
      sourceRepo: 'E:\\Projects\\DA-*-Plugin',
      status: 'plugin-host',
      summary:
        'Bantuan, Chat, Dara, Enclosure, Freyer, KPI, Layanan, Proyek, dan Task Manager masuk registry host.',
      testTarget: 'Plugin search + plugin route',
    },
  ];

  return {
    areas,
    commandCount: commandIndex.length,
    commandStats: getCommandIndexStats(commandIndex),
    moduleCount: modules.length,
    pluginReadyCount: pluginStats.ready,
    pluginRouteCount: pluginStats.routeCount,
    routeCount: areas.reduce((total, area) => total + area.routeCount, 0),
    serverRule:
      'Development runtime tetap ke backend server berjalan; backend lokal hanya referensi read-only.',
  };
}

function getLaunchRouteCommands(
  area: AppArea,
  commands: CommandEntry[],
) {
  const routeKinds = new Set<CommandEntry['kind']>([
    'am-route',
    'kolam-surface',
    'module-route',
    'navigation-route',
    'plugin-route',
  ]);

  return commands
    .filter(command => command.area === area && routeKinds.has(command.kind));
}

function getLaunchScreenPacks(
  area: AppArea,
  commands: CommandEntry[],
): AppLaunchScreenPack[] {
  const grouped = new Map<RouteWorkbenchIntent, CommandEntry[]>();

  commands.forEach(command => {
    if (!command.route) {
      return;
    }

    const intent = getRouteWorkbenchIntent(command.route);
    const current = grouped.get(intent) ?? [];
    grouped.set(intent, [...current, command]);
  });

  const preferredOrder = getAreaIntentOrder(area);

  return Array.from(grouped.entries())
    .sort(([leftIntent, leftCommands], [rightIntent, rightCommands]) => {
      const leftScore = getIntentScore(preferredOrder, leftIntent);
      const rightScore = getIntentScore(preferredOrder, rightIntent);

      if (leftScore !== rightScore) {
        return leftScore - rightScore;
      }

      return rightCommands.length - leftCommands.length;
    })
    .slice(0, 4)
    .map(([intent, intentCommands], index) => ({
      id: intent,
      label: getRouteWorkbenchIntentTitle(intent),
      nextBuildStep: getRouteWorkbenchNextBuildStep(intent),
      priority: getScreenPackPriority(index),
      routeCount: intentCommands.length,
      routePreview: intentCommands
        .slice(0, 3)
        .map(command => command.route ?? command.label)
        .join(' / '),
    }));
}

function getAreaIntentOrder(area: AppArea): RouteWorkbenchIntent[] {
  switch (area) {
    case 'pos':
      return ['transaction', 'form', 'finance', 'people', 'inventory'];
    case 'am':
      return ['automation', 'detail', 'transaction', 'governance', 'people'];
    case 'plugins':
      return ['workspace', 'service', 'automation', 'people', 'finance'];
    case 'kolam':
    default:
      return ['inventory', 'finance', 'service', 'people', 'governance'];
  }
}

function getIntentScore(
  preferredOrder: RouteWorkbenchIntent[],
  intent: RouteWorkbenchIntent,
) {
  const index = preferredOrder.indexOf(intent);

  return index === -1 ? preferredOrder.length : index;
}

function getScreenPackPriority(index: number): AppLaunchScreenPack['priority'] {
  if (index === 0) {
    return 'build-next';
  }

  if (index === 1) {
    return 'coverage-ready';
  }

  return 'later';
}

function getAreaRouteCount(area: AppArea, modules: ShellModule[]) {
  return getAreaModules(area, modules)
    .reduce((total, module) => total + module.routes.length, 0);
}

function getLaunchModules(
  area: AppArea,
  modules: ShellModule[],
): AppLaunchModule[] {
  return getAreaModules(area, modules).map(module => ({
    id: module.id,
    label: module.label,
    routeCount: module.routes.length,
    summary: module.summary,
  }));
}

function getAreaModules(area: AppArea, modules: ShellModule[]) {
  const areaModuleIds = new Set(
    getShellModulesByArea(area).map(module => module.id),
  );

  return modules.filter(
    module => module.area === area && areaModuleIds.has(module.id),
  );
}
