import {inlineFrameStyles as styles} from './kolam-inline-frame-styles';
import type {KolamInlineFrameVariant} from './kolam-inline-frame-types';

export function getInlineFrameStyle(variant: KolamInlineFrameVariant) {
  switch (variant) {
    case 'attentionItemCopy':
      return styles.attentionItemCopy;
    case 'attentionItemTitleRow':
      return styles.attentionItemTitleRow;
    case 'avatarPill':
      return styles.avatarPill;
    case 'cartItemInfo':
      return styles.cartItemInfo;
    case 'descriptionDetails':
      return styles.descriptionDetails;
    case 'detailField':
      return styles.detailField;
    case 'dashboardSalesGraphAreaTrack':
      return styles.dashboardSalesGraphAreaTrack;
    case 'dashboardSalesGraphPoint':
      return styles.dashboardSalesGraphPoint;
    case 'dashboardStatSparkline':
      return styles.dashboardStatSparkline;
    case 'pluginIdentity':
      return styles.pluginIdentity;
    case 'pluginCapabilities':
      return styles.pluginCapabilities;
    case 'pluginRepoRoute':
      return styles.pluginRepoRoute;
    case 'pluginStatusBox':
      return styles.pluginStatusBox;
    case 'navItemBody':
      return styles.navItemBody;
    case 'navItemCopy':
      return styles.navItemCopy;
    case 'navItemHeader':
      return styles.navItemHeader;
    case 'navItemGlyph':
      return styles.navItemGlyph;
    case 'roleInfoCopy':
      return styles.roleInfoCopy;
    case 'roleInfoTitleRow':
      return styles.roleInfoTitleRow;
    case 'settingsActivityPathCell':
      return styles.settingsActivityPathCell;
    case 'settingsActivityTimeCell':
      return styles.settingsActivityTimeCell;
    case 'settingsActivityTimeLine':
      return styles.settingsActivityTimeLine;
    case 'settingsWebLogoRow':
      return styles.settingsWebLogoRow;
    case 'topNavigationAvatar':
      return styles.topNavigationAvatar;
    case 'userMenuAvatar':
      return styles.userMenuAvatar;
    case 'roleMemberPreview':
      return styles.roleMemberPreview;
    case 'roleMemberHeader':
      return styles.roleMemberHeader;
    case 'rolePermissionResource':
      return styles.rolePermissionResource;
    case 'workflowNoticeRow':
      return styles.workflowNoticeRow;
    case 'totalRow':
      return styles.totalRow;
  }
}
