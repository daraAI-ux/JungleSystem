import {getKolamNavigationChromeContract} from '../domain/kolam-navigation';

export const KOLAM_NAVIGATION_CHROME = getKolamNavigationChromeContract();

export function getKolamChevronDirection(
  kind: 'chevron-right' | 'chevron-down' | 'chevron-up',
) {
  if (kind === 'chevron-down') {
    return 'down';
  }

  if (kind === 'chevron-up') {
    return 'up';
  }

  return 'right';
}
