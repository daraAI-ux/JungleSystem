import { useMemo } from 'react';
import type { KolamAppShellSurfaceProps } from '../components/kolam-app-shell-surface';
import type { AppModule } from '../domain/app-shell';
import type { AccessScope } from '../domain/auth';
import type { KolamNavigationItem } from '../domain/kolam-navigation';

type SidebarProps = KolamAppShellSurfaceProps['sidebar'];

export function useKolamSidebarController({
  accessScope,
  activeModule,
  activeNavigationItem,
  collapsed,
  expandedSections,
  filterMenuByAccess,
  onMoveMenuSection,
  onQuickSearch,
  onSelectMenuItem,
  onSelectModule,
  onToggleMenuSection,
  sectionOrder,
}: {
  accessScope: AccessScope;
  activeModule: AppModule;
  activeNavigationItem?: KolamNavigationItem | null;
  collapsed: boolean;
  expandedSections: Record<string, boolean>;
  filterMenuByAccess: boolean;
  onMoveMenuSection: (sectionId: string, direction: 'up' | 'down') => void;
  onQuickSearch: () => void;
  onSelectMenuItem: (item: KolamNavigationItem) => void;
  onSelectModule: (module: AppModule) => void;
  onToggleMenuSection: (sectionId: string) => void;
  sectionOrder: string[];
}) {
  const sidebar = useMemo<SidebarProps>(
    () => ({
      accessScope,
      activeModule,
      activeRoute: activeNavigationItem?.route ?? null,
      collapsed,
      expandedSections,
      filterMenuByAccess,
      onMoveMenuSection,
      onQuickSearch,
      onSelectMenuItem,
      onSelectModule,
      onToggleMenuSection,
      sectionOrder,
    }),
    [
      accessScope,
      activeModule,
      activeNavigationItem,
      collapsed,
      expandedSections,
      filterMenuByAccess,
      onMoveMenuSection,
      onQuickSearch,
      onSelectMenuItem,
      onSelectModule,
      onToggleMenuSection,
      sectionOrder,
    ],
  );

  return { sidebar };
}
