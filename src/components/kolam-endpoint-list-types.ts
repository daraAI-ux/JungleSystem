export interface KolamEndpointListItem {
  id: string;
  label: string;
  method: string;
  path: string;
  permission: string;
}

export interface KolamEndpointListProps {
  accessibilityLabel?: string;
  endpoints: KolamEndpointListItem[];
}
