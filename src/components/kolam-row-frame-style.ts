import {rowFrameStyles as styles} from './kolam-row-frame-styles';
import type {KolamRowFrameVariant} from './kolam-row-frame-types';

export function getRowFrameStyle(variant: KolamRowFrameVariant) {
  switch (variant) {
    case 'dataTableHeader':
      return styles.dataTableHeader;
    case 'dataTable':
      return styles.dataTable;
    case 'endpoint':
      return styles.endpoint;
    case 'surface':
      return styles.surface;
    case 'selectable':
      return styles.selectable;
    case 'cart':
      return styles.cart;
    case 'pluginRegistry':
      return styles.pluginRegistry;
    case 'sales':
      return styles.sales;
    case 'settingsActivityHeader':
      return styles.settingsActivityHeader;
    case 'settingsActivity':
      return styles.settingsActivity;
    case 'settingsPermission':
      return styles.settingsPermission;
    case 'form':
    default:
      return styles.form;
  }
}