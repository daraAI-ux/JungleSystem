import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
} from '../src/components/kolam-dropdown-select';

function getRenderedText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .flat()
    .filter(Boolean);
}

function findPressableByLabel(
  renderer: ReactTestRenderer.ReactTestRenderer,
  accessibilityLabel: string,
) {
  return renderer.root
    .findAllByProps({accessibilityLabel})
    .find(node => typeof node.props.onPress === 'function');
}

describe('KolamDropdownSelect', () => {
  it('closes an open overlay dropdown when another overlay dropdown opens', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <>
          <KolamDropdownSelect
            label="Status"
            onChange={jest.fn()}
            options={[
              {label: 'Status A', value: 'a'},
              {label: 'Status B', value: 'b'},
            ]}
            value="a"
          />
          <KolamDropdownSelect
            label="Tipe"
            onChange={jest.fn()}
            options={[
              {label: 'Tipe A', value: 'a'},
              {label: 'Tipe B', value: 'b'},
            ]}
            value="a"
          />
        </>,
      );
    });

    const statusTrigger = renderer!.root.findByProps({accessibilityLabel: 'Status'});
    const tipeTrigger = renderer!.root.findByProps({accessibilityLabel: 'Tipe'});

    await ReactTestRenderer.act(async () => {
      statusTrigger.props.onPress();
    });

    expect(getRenderedText(renderer!)).toContain('Status B');

    await ReactTestRenderer.act(async () => {
      tipeTrigger.props.onPress();
    });

    const labels = getRenderedText(renderer!);
    expect(labels).not.toContain('Status B');
    expect(labels).toContain('Tipe B');
  });
});

describe('KolamOverflowMenuButton', () => {
  it('closes an open overflow menu when another overflow menu opens', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    const requestAnimationFrameHost = globalThis as typeof globalThis & {
      requestAnimationFrame: (callback: (time: number) => void) => number;
    };
    const requestAnimationFrameSpy = jest
      .spyOn(requestAnimationFrameHost, 'requestAnimationFrame')
      .mockImplementation(callback => {
        callback(0);
        return 0;
      });

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <>
          <KolamOverflowMenuButton
            accessibilityLabel="Menu pertama"
            actions={[{label: 'Edit pertama', onPress: jest.fn()}]}
          />
          <KolamOverflowMenuButton
            accessibilityLabel="Menu kedua"
            actions={[{label: 'Edit kedua', onPress: jest.fn()}]}
          />
        </>,
      );
    });

    const firstTrigger = findPressableByLabel(renderer!, 'Menu pertama');
    const secondTrigger = findPressableByLabel(renderer!, 'Menu kedua');

    await ReactTestRenderer.act(async () => {
      firstTrigger!.props.onPress();
    });

    expect(getRenderedText(renderer!)).toContain('Edit pertama');

    await ReactTestRenderer.act(async () => {
      secondTrigger!.props.onPress();
    });

    const labels = getRenderedText(renderer!);
    expect(labels).not.toContain('Edit pertama');
    expect(labels).toContain('Edit kedua');

    requestAnimationFrameSpy.mockRestore();
  });
});
