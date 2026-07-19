import {useMemo} from 'react';
import type {KolamAppShellSurfaceProps} from '../components/kolam-app-shell-surface';
import type {AttentionPanelItem} from '../domain/attention-panel';
import type {AccessScope} from '../domain/auth';
import type {CommandEntry} from '../domain/command-index';
import type {TopNavUserMenuItem} from '../domain/top-nav';

type OverlayProps = KolamAppShellSurfaceProps['overlay'];

export function useKolamOverlayController({
  accessScope,
  attentionCount,
  attentionItems,
  commandSearch,
  commands,
  displayInitials,
  displayName,
  email,
  isAttentionOpen,
  isCommandPaletteOpen,
  isUserMenuOpen,
  onAttentionClose,
  onCommandPaletteClose,
  onCommandSearchChange,
  onCommandSelect,
  onSeeAllNotifications,
  onSignOut,
  onUserMenuClose,
  onUserMenuSelect,
  profilePhotoUrl,
  userMenuItems,
}: {
  accessScope: AccessScope;
  attentionCount: number;
  attentionItems: AttentionPanelItem[];
  commandSearch: string;
  commands: CommandEntry[];
  displayInitials: string;
  displayName: string;
  email: string;
  isAttentionOpen: boolean;
  isCommandPaletteOpen: boolean;
  isUserMenuOpen: boolean;
  onAttentionClose: () => void;
  onCommandPaletteClose: () => void;
  onCommandSearchChange: (search: string) => void;
  onCommandSelect: (command: CommandEntry) => Promise<void>;
  onSeeAllNotifications: () => void;
  onSignOut: () => Promise<void>;
  onUserMenuClose: () => void;
  onUserMenuSelect: (
    item: TopNavUserMenuItem,
    onSignOut: () => Promise<void>,
  ) => Promise<void>;
  profilePhotoUrl?: string | null;
  userMenuItems: TopNavUserMenuItem[];
}) {
  const overlay = useMemo<OverlayProps>(
    () => ({
      isUserMenuOpen,
      isAttentionOpen,
      isCommandPaletteOpen,
      userMenu: {
        items: userMenuItems,
        displayName,
        initials: displayInitials,
        email,
        accessScope,
        profilePhotoUrl,
        onClose: onUserMenuClose,
        onSelect: item => onUserMenuSelect(item, onSignOut),
      },
      attention: {
        items: attentionItems,
        unreadCount: attentionCount,
        onClose: onAttentionClose,
        onSeeAll: onSeeAllNotifications,
      },
      commandPalette: {
        commands,
        search: commandSearch,
        onSearchChange: onCommandSearchChange,
        onClose: onCommandPaletteClose,
        onSelect: onCommandSelect,
      },
    }),
    [
      accessScope,
      attentionCount,
      attentionItems,
      commandSearch,
      commands,
      displayInitials,
      displayName,
      email,
      isAttentionOpen,
      isCommandPaletteOpen,
      isUserMenuOpen,
      onAttentionClose,
      onCommandPaletteClose,
      onCommandSearchChange,
      onCommandSelect,
      onSeeAllNotifications,
      onSignOut,
      onUserMenuClose,
      onUserMenuSelect,
      profilePhotoUrl,
      userMenuItems,
    ],
  );

  return {overlay};
}
