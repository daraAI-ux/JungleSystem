import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamInfoListRow} from '../src/components/kolam-info-list-row';

describe('KolamInfoListRow', () => {
  it('renders command row semantics and text content', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamInfoListRow
          description="Open command"
          metaDetail="kolam"
          metaLabel="module"
          onPress={onPress}
          title="Kolam"
        />,
      );
    });

    const row = renderer!.root.findByProps({accessibilityRole: 'button'});

    row.props.onPress();

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(row.props.accessibilityState).toEqual({selected: false});
    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual(
      ['Kolam', 'Open command', 'module', 'kolam'],
    );
  });

  it('renders selected route rows with detail text', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamInfoListRow
          selected
          detail="settings/activity-log"
          description="Audit activity"
          metaDetail="ready"
          metaLabel="native"
          onPress={jest.fn()}
          title="Activity Log"
          variant="route"
        />,
      );
    });

    const row = renderer!.root.findByProps({accessibilityRole: 'button'});

    expect(row.props.accessibilityState).toEqual({selected: true});
    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual(
      ['Activity Log', 'Audit activity', 'settings/activity-log', 'native', 'ready'],
    );
  });
});
