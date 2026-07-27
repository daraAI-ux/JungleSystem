import type {
  TopNavBreadcrumbItem,
  TopNavRightControl,
} from '../domain/top-nav';

export interface KolamTopNavigationProps {
  attentionCount: number;
  breadcrumbItems: TopNavBreadcrumbItem[];
  displayInitials: string;
  onAvatarPress: () => void;
  onBreadcrumbPress?: (item: TopNavBreadcrumbItem) => void;
  onBreadcrumbDashboardPress: () => void;
  onChatControlPress?: (control: TopNavRightControl) => void;
  onNotificationPress: () => void;
  onToggleSidebar: () => void;
  profilePhotoUrl?: string | null;
  rightControls: TopNavRightControl[];
}
