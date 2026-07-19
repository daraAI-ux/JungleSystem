import type {
  TopNavBreadcrumbItem,
  TopNavRightControl,
} from '../domain/top-nav';
import type { KolamServerMetricsStripProps } from './kolam-server-metrics-strip-types';

export interface KolamTopNavigationProps {
  attentionCount: number;
  breadcrumbItems: TopNavBreadcrumbItem[];
  displayInitials: string;
  onAvatarPress: () => void;
  onBreadcrumbPress?: (item: TopNavBreadcrumbItem) => void;
  onBreadcrumbDashboardPress: () => void;
  onNotificationPress: () => void;
  onToggleSidebar: () => void;
  profilePhotoUrl?: string | null;
  rightControls: TopNavRightControl[];
  serverMetrics?: KolamServerMetricsStripProps;
}
