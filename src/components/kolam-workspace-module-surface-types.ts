import type {CashflowSalesPreview, CatalogItem, Customer} from '../domain/pos';
import type {SyncActivityEntry} from '../domain/sync-activity';
import type {PluginDescriptor} from '../domain/unified';
import type {CreateCustomerBody} from '../services/pos-api';
import type {UnifiedDataset} from '../services/unified-data';
import type {KolamSalesPanelProps} from './kolam-pos-widgets';
import type {KolamCheckoutWorkspaceProps} from './kolam-pos-workspace-widgets';

export interface KolamCatalogSurfaceProps {
  catalogSearch: string;
  filteredCatalog: CatalogItem[];
  onCatalogSearchChange: (query: string) => void;
}

export interface KolamSalesSurfaceProps extends KolamSalesPanelProps {}

export interface KolamCashflowSurfaceProps {
  cashflowPreview: CashflowSalesPreview | null;
  cashflowShiftName: string;
  canClose: boolean;
  canOpen: boolean;
  isClosingCashflow: boolean;
  isLoadingCashflowPreview: boolean;
  isOpeningCashflow: boolean;
  onCashflowShiftNameChange: (value: string) => void;
  onCloseCashflow: () => void;
  onOpenCashflow: () => void;
}

export interface KolamCustomerSurfaceProps {
  customerForm: CreateCustomerBody;
  isCreatingCustomer: boolean;
  onCreateCustomer: () => void;
  onCustomerFormChange: (nextForm: CreateCustomerBody) => void;
}

export interface KolamPluginSurfaceProps {
  filteredPlugins: PluginDescriptor[];
  onPluginSearchChange: (query: string) => void;
  pluginSearch: string;
}

export type KolamCheckoutSurfaceProps = KolamCheckoutWorkspaceProps;
export type KolamOverviewDataset = UnifiedDataset;
export type KolamSettingsActivityEntries = SyncActivityEntry[];
export type KolamCustomerList = Customer[];
