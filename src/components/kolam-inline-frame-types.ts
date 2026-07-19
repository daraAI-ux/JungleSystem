import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

export type KolamInlineFrameVariant =
  | 'attentionItemCopy'
  | 'attentionItemTitleRow'
  | 'avatarPill'
  | 'cartItemInfo'
  | 'descriptionDetails'
  | 'detailField'
  | 'dashboardSalesGraphAreaTrack'
  | 'dashboardSalesGraphPoint'
  | 'dashboardStatSparkline'
  | 'pluginIdentity'
  | 'pluginCapabilities'
  | 'pluginRepoRoute'
  | 'pluginStatusBox'
  | 'navItemBody'
  | 'navItemCopy'
  | 'navItemHeader'
  | 'navItemGlyph'
  | 'roleInfoCopy'
  | 'roleInfoTitleRow'
  | 'settingsActivityPathCell'
  | 'settingsActivityTimeCell'
  | 'settingsActivityTimeLine'
  | 'settingsWebLogoRow'
  | 'topNavigationAvatar'
  | 'userMenuAvatar'
  | 'roleMemberPreview'
  | 'roleMemberHeader'
  | 'rolePermissionResource'
  | 'workflowNoticeRow'
  | 'totalRow';

export interface KolamInlineFrameProps {
  accessibilityLabel?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant: KolamInlineFrameVariant;
}
