import type {
  TopNavBreadcrumbItem,
  TopNavRightControl,
} from '../domain/top-nav';
import type {KolamChatUnreadCounts} from '../hooks/use-kolam-chat-notification-host';

export interface KolamTopNavigationProps {
  attentionCount: number;
  breadcrumbItems: TopNavBreadcrumbItem[];
  chatUnreadCounts?: KolamChatUnreadCounts;
  displayInitials: string;
  onAvatarPress: () => void;
  onBreadcrumbPress?: (item: TopNavBreadcrumbItem) => void;
  onBreadcrumbDashboardPress: () => void;
  onCashflowNavigate?: (route: string) => void;
  onChatControlPress?: (control: TopNavRightControl) => void;
  onNotificationPress: () => void;
  onToggleSidebar: () => void;
  profilePhotoUrl?: string | null;
  rightControls: TopNavRightControl[];
}
