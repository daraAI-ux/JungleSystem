import type {KolamButtonProps} from './kolam-button';

export interface KolamRefreshButtonProps
  extends Omit<KolamButtonProps, 'icon' | 'label'> {
  label?: string;
  loading?: boolean;
  loadingLabel?: string;
}

export function KolamRefreshButton({
  accessibilityLabel: _accessibilityLabel,
  label: _label = 'Refresh',
  loading: _loading = false,
  loadingLabel: _loadingLabel,
  muted: _muted,
  size: _size = 'sm',
  style: _style,
  textStyle: _textStyle,
  ..._buttonProps
}: KolamRefreshButtonProps) {
  return null;
}
