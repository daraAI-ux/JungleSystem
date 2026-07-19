import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {KolamMappedList} from '../src/components/kolam-mapped-list';

describe('KolamMappedList', () => {
  it('renders visible items through one shared map primitive', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamMappedList
          items={[
            {id: 'a', label: 'A'},
            {id: 'b', label: 'B'},
            {id: 'c', label: 'C'},
          ]}
          limit={2}
          getKey={item => item.id}
          renderItem={(item, index, visibleItems) => (
            <Text>
              {item.label}:{index}/{visibleItems.length}
            </Text>
          )}
        />,
      );
    });

    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      ['A', ':', 0, '/', 2],
      ['B', ':', 1, '/', 2],
    ]);
  });
});
