export interface KolamFilterBarControl {
  control: 'search' | 'select';
  id: string;
  label: string;
  options?: Array<{id: string; label: string}>;
  placeholder?: string;
  triggerWidth: 'min-w-32' | 'min-w-40' | 'min-w-64';
}

export interface KolamFilterBarProps {
  accessibilityLabel?: string;
  controls: KolamFilterBarControl[];
  refreshLabel?: string;
}
