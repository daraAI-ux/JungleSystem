export interface KolamAvatarPillItem {
  id: string;
  initials: string;
  name: string;
}

export interface KolamAvatarPillListProps {
  accessibilityLabel?: string;
  emptyLabel?: string;
  items: KolamAvatarPillItem[];
}
