import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {KolamMenuSection} from '../src/components/kolam-menu-section';
import {
  getKolamNavigationSectionPrimaryItem,
  kolamSidebarNavigationSections,
} from '../src/domain/kolam-navigation';

describe('KolamMenuSection primary hub', () => {
  it('resolves Pusat AI and Keuangan primary items without nested group', () => {
    const pusatAi = kolamSidebarNavigationSections.find(
      section => section.id === 'pusatAi',
    )!;
    const finance = kolamSidebarNavigationSections.find(
      section => section.id === 'finance',
    )!;
    const inventory = kolamSidebarNavigationSections.find(
      section => section.id === 'inventory',
    )!;

    const primary = getKolamNavigationSectionPrimaryItem(pusatAi);
    expect(primary?.route).toBe('/pusat-ai');
    expect(primary?.group).toBeUndefined();
    expect(getKolamNavigationSectionPrimaryItem(finance)?.route).toBe(
      '/finance',
    );
    expect(getKolamNavigationSectionPrimaryItem(inventory)).toBeNull();
  });

  it('opens Pusat AI hub when the section title is pressed', async () => {
    const onSelectItem = jest.fn();
    const onToggle = jest.fn();
    const pusatAi = kolamSidebarNavigationSections.find(
      section => section.id === 'pusatAi',
    )!;

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamMenuSection
          expanded={false}
          onMove={() => undefined}
          onSelectItem={onSelectItem}
          onToggle={onToggle}
          section={pusatAi}
        />,
      );
    });

    const pressables = renderer!.root.findAll(
      node => typeof node.props.onPress === 'function',
    );

    await ReactTestRenderer.act(async () => {
      pressables[0].props.onPress();
    });

    expect(onSelectItem).toHaveBeenCalledWith(
      expect.objectContaining({route: '/pusat-ai', label: 'Pusat AI'}),
    );
    expect(onToggle).toHaveBeenCalledWith('pusatAi');
  });
});
