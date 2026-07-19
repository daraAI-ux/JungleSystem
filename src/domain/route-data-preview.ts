import type {AppArea} from './app-shell';
import type {RouteWorkbenchIntent} from './route-workbench';
import type {UnifiedDataset} from '../services/unified-data';

export interface RouteDataPreviewInput {
  area: AppArea;
  dataset: UnifiedDataset;
  intent: RouteWorkbenchIntent;
}

export interface RouteDataPreviewCard {
  badges?: string[];
  id: string;
  meta: string;
  title: string;
}

export function getRouteDataPreviewCards({
  area,
  dataset,
  intent,
}: RouteDataPreviewInput): RouteDataPreviewCard[] {
  if (area === 'am' || intent === 'automation') {
    return getAutomationPreviewCards(dataset);
  }

  if (area === 'plugins') {
    return getPluginPreviewCards(dataset);
  }

  switch (intent) {
    case 'inventory':
      return getInventoryPreviewCards(dataset);
    case 'transaction':
    case 'detail':
      return getTransactionPreviewCards(dataset);
    case 'form':
      return getFormPreviewCards(dataset);
    case 'finance':
      return getFinancePreviewCards(dataset);
    case 'people':
      return getPeoplePreviewCards(dataset);
    case 'service':
      return getServicePreviewCards(dataset);
    case 'governance':
      return getGovernancePreviewCards(dataset);
    case 'workspace':
    default:
      return getWorkspacePreviewCards(dataset);
  }
}

function getInventoryPreviewCards(
  dataset: UnifiedDataset,
): RouteDataPreviewCard[] {
  const cards = dataset.catalog.slice(0, 3).map(item => ({
    id: `catalog:${item.id}`,
    title: item.name,
    meta: `${item.code} - ${item.category} - stok ${item.stock}`,
    badges: [item.type, item.stock <= item.lowStockThreshold ? 'low stock' : 'ready'],
  }));

  return cards.length ? cards : [getFallbackCard('Inventory', dataset.sync.pos)];
}

function getTransactionPreviewCards(
  dataset: UnifiedDataset,
): RouteDataPreviewCard[] {
  const cards = dataset.recentSales.slice(0, 3).map(sale => ({
    id: `sale:${sale.id}`,
    title: sale.invoiceCode,
    meta: `${sale.customerName} - ${sale.status} - ${formatNumber(sale.total)}`,
    badges: [sale.status, sale.paidAmount >= sale.total ? 'paid' : 'open'],
  }));

  return cards.length ? cards : [getFallbackCard('Transaction', dataset.sync.pos)];
}

function getFormPreviewCards(dataset: UnifiedDataset): RouteDataPreviewCard[] {
  return [
    {
      id: 'form:catalog',
      title: `${dataset.catalog.length} item sellable`,
      meta: 'Sumber item untuk form checkout/draft native.',
      badges: ['catalog', dataset.sync.pos],
    },
    {
      id: 'form:customer',
      title: `${dataset.customers.length} customer`,
      meta: 'Customer lookup dipakai oleh checkout dan form transaksi.',
      badges: ['people', dataset.sync.pos],
    },
    {
      id: 'form:payment',
      title: `${dataset.paymentMethods.length} payment method`,
      meta: 'Metode pembayaran aktif dari runtime POS.',
      badges: ['payment', dataset.sync.pos],
    },
  ];
}

function getFinancePreviewCards(dataset: UnifiedDataset): RouteDataPreviewCard[] {
  const session = dataset.activeSession;

  if (!session) {
    return [getFallbackCard('Finance', dataset.sync.pos)];
  }

  return [
    {
      id: `cashflow:${session.id}`,
      title: session.name,
      meta: `${session.cashier} - saldo awal ${formatNumber(session.openingBalance)}`,
      badges: ['cashflow', dataset.sync.pos],
    },
    {
      id: 'cashflow:snapshot',
      title: session.snapshot
        ? `${session.snapshot.totalSalesCount} sales`
        : 'Snapshot belum tersedia',
      meta: session.snapshot
        ? `Total ${formatNumber(session.snapshot.totalSalesAmount)} / tunai ${formatNumber(session.snapshot.cashSalesTotal)}`
        : 'Menunggu snapshot cashflow dari server existing.',
      badges: ['session', session.snapshot ? 'ready' : 'pending'],
    },
  ];
}

function getPeoplePreviewCards(dataset: UnifiedDataset): RouteDataPreviewCard[] {
  const cards = dataset.customers.slice(0, 3).map(customer => ({
    id: `customer:${customer.id}`,
    title: customer.name,
    meta: `${customer.phone} - ${customer.email}`,
    badges: ['customer', dataset.sync.pos],
  }));

  return cards.length ? cards : [getFallbackCard('People', dataset.sync.pos)];
}

function getServicePreviewCards(dataset: UnifiedDataset): RouteDataPreviewCard[] {
  const cards = dataset.kolam.pendingCustomerVerifications
    .slice(0, 3)
    .map(row => ({
      id: `service:${row.pendingServiceId}`,
      title: row.visitTitle ?? row.serviceSerial ?? 'Service preview',
      meta: `${row.serviceSerial} - ${row.status} - ${row.packageTaskCode}`,
      badges: [row.taskKind, dataset.sync.kolam],
    }));

  return cards.length ? cards : getWorkspacePreviewCards(dataset);
}

function getGovernancePreviewCards(
  dataset: UnifiedDataset,
): RouteDataPreviewCard[] {
  return [
    {
      id: 'governance:sync',
      title: 'Runtime Access Guard',
      meta: `POS ${dataset.sync.pos} / Kolam ${dataset.sync.kolam} / AM ${dataset.sync.am}`,
      badges: ['server-only', 'native-client'],
    },
    {
      id: 'governance:backend',
      title: 'Backend existing',
      meta: 'Konfigurasi runtime dijaga oleh verify:runtime-backend.',
      badges: ['no-local-backend'],
    },
  ];
}

function getAutomationPreviewCards(
  dataset: UnifiedDataset,
): RouteDataPreviewCard[] {
  const dashboard = dataset.am.dashboard;

  if (!dashboard) {
    return [
      {
        id: 'am:status',
        title: 'AM dashboard belum live',
        meta: dataset.am.errorMessage ?? 'Menunggu akses AM dari server existing.',
        badges: ['am', dataset.sync.am],
      },
    ];
  }

  const devices = dashboard.devices.slice(0, 2).map(device => ({
    id: `am-device:${device._id}`,
    title: device.name,
    meta: `${device.brand} ${device.model} - ${device.activeAccountCount}/${device.accountCount} account aktif`,
    badges: ['device', dataset.sync.am],
  }));

  return [
    {
      id: 'am:summary',
      title: `${dashboard.summary.totalAccounts} account / ${dashboard.summary.activeDevices} device aktif`,
      meta: `Transfer pending ${dashboard.transfers.pending}, success ${dashboard.transfers.success}.`,
      badges: ['automation', dataset.sync.am],
    },
    ...devices,
  ];
}

function getPluginPreviewCards(dataset: UnifiedDataset): RouteDataPreviewCard[] {
  return [
    {
      id: 'plugin:host',
      title: 'Plugin Host Runtime',
      meta: `Kolam ${dataset.sync.kolam} / POS ${dataset.sync.pos} / AM ${dataset.sync.am}`,
      badges: ['plugin-host', 'server-only'],
    },
    {
      id: 'plugin:guard',
      title: 'Capability Guard',
      meta: 'Route plugin dibuka melalui registry native dan manifest plugin live.',
      badges: ['manifest', 'native'],
    },
  ];
}

function getWorkspacePreviewCards(
  dataset: UnifiedDataset,
): RouteDataPreviewCard[] {
  return [
    {
      id: 'workspace:catalog',
      title: `${dataset.catalog.length} catalog item`,
      meta: `${dataset.recentSales.length} sales / ${dataset.customers.length} customer`,
      badges: ['workspace', dataset.sync.kolam],
    },
    {
      id: 'workspace:sync',
      title: 'Runtime snapshot',
      meta: `POS ${dataset.sync.pos} / Kolam ${dataset.sync.kolam} / AM ${dataset.sync.am}`,
      badges: ['server-existing'],
    },
  ];
}

function getFallbackCard(
  label: string,
  sourceState: string,
): RouteDataPreviewCard {
  return {
    id: `${label.toLowerCase()}:fallback`,
    title: `${label} preview menunggu data`,
    meta: `Source saat ini ${sourceState}; runtime tetap diarahkan ke server existing.`,
    badges: ['pending', sourceState],
  };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID').format(value);
}
