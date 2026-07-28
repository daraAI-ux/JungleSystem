import React from 'react';
import { kolamNavigationSections } from '../domain/kolam-navigation';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamListFrame } from './kolam-list-frame';
import { KolamMappedList } from './kolam-mapped-list';
import { KolamMenuSectionIcon } from './kolam-menu-section-icon';

export function KolamMenuDock({
  sections,
}: {
  sections: typeof kolamNavigationSections;
}) {
  return (
    <KolamListFrame variant="menuDockGroup">
      <KolamMappedList
        items={sections}
        getKey={section => section.id}
        renderItem={section => <KolamMenuDockItem sectionId={section.id} />}
      />
    </KolamListFrame>
  );
}

export function KolamMenuDockItem({ sectionId }: { sectionId: string }) {
  return (
    <KolamCardFrame variant="menuDockItem">
      <KolamMenuSectionIcon sectionId={sectionId} />
    </KolamCardFrame>
  );
}
