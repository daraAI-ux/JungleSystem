import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {
  getMenuItemGroups,
  KolamMenuSectionItems,
} from '../src/components/kolam-menu-section-items';
import type { KolamNavigationItem } from '../src/domain/kolam-navigation';

const labelFieldItems: KolamNavigationItem[] = [
  {
    label: 'Merek',
    route: '/label-dan-field/merek',
    description: 'Merek',
    group: 'Label dan Field',
    requiredAccess: ['kolam'],
  },
  {
    label: 'Kategori',
    route: '/label-dan-field/kategori',
    description: 'Kategori',
    group: 'Label dan Field',
    requiredAccess: ['kolam'],
  },
  {
    label: 'Tag',
    route: '/tags',
    description: 'Tag',
    group: 'Label dan Field',
    requiredAccess: ['kolam'],
  },
  {
    label: 'Field Kustom',
    route: '/custom-fields',
    description: 'Field Kustom',
    group: 'Label dan Field',
    requiredAccess: ['kolam'],
  },
  {
    label: 'Satuan',
    route: '/units',
    description: 'Satuan',
    group: 'Label dan Field',
    requiredAccess: ['kolam'],
  },
];

describe('KolamMenuSectionItems', () => {
  it('keeps unique keys when the same group label appears non-adjacent', () => {
    const items: KolamNavigationItem[] = [
      {
        label: 'Terms',
        route: '/terms-templates',
        description: 'Terms',
        group: 'Custom Project',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Daftar',
        route: '/campaign',
        description: 'Campaign',
        group: 'Kampanye',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Proyek',
        route: '/proyek',
        description: 'Proyek',
        group: 'Custom Project',
        requiredAccess: ['kolam'],
      },
    ];

    const groups = getMenuItemGroups(items);
    const keys = groups.map(group => group.id);

    expect(keys).toEqual([
      'group:Custom Project:/terms-templates',
      'group:Kampanye:/campaign',
      'group:Custom Project:/proyek',
    ]);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('keeps Label dan Field children collapsed until the disclosure is opened', async () => {
    const onSelectItem = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamMenuSectionItems
          items={labelFieldItems}
          onSelectItem={onSelectItem}
        />,
      );
    });

    const labels = renderer!.root
      .findAllByType(Text)
      .map(node => node.props.children);

    expect(labels).toContain('Label dan Field');
    expect(labels).not.toContain('Kategori');
    expect(labels).not.toContain('Tag');

    const disclosure = renderer!.root.findByProps({
      accessibilityRole: 'button',
    });

    await ReactTestRenderer.act(async () => {
      disclosure.props.onPress();
    });

    const openedLabels = renderer!.root
      .findAllByType(Text)
      .map(node => node.props.children);

    expect(openedLabels).toEqual(
      expect.arrayContaining([
        'Label dan Field',
        'Merek',
        'Kategori',
        'Tag',
        'Field Kustom',
        'Satuan',
      ]),
    );
  });

  it('auto-opens Label dan Field when a child route is active', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamMenuSectionItems
          activeRoute="/tags"
          items={labelFieldItems}
          onSelectItem={() => undefined}
        />,
      );
    });

    const labels = renderer!.root
      .findAllByType(Text)
      .map(node => node.props.children);

    expect(labels).toEqual(
      expect.arrayContaining(['Label dan Field', 'Tag', 'Kategori', 'Satuan']),
    );
  });
});
