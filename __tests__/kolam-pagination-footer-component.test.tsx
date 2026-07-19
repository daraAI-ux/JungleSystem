import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamPaginationFooter} from '../src/components/kolam-pagination-footer';
import {KolamPaginationItem} from '../src/components/kolam-pagination-item';

describe('KolamPaginationFooter', () => {
  it('renders pagination summary and delegates page changes', async () => {
    const onPageChange = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamPaginationFooter
          accessibilityLabel="pagination footer"
          onPageChange={onPageChange}
          pagination={{
            from: 7,
            to: 12,
            total: 17,
            page: 2,
            pages: [1, 2, 3],
            hasPrevious: true,
            hasNext: true,
          }}
        />,
      );
    });

    expect(renderer!.root.findByProps({accessibilityLabel: 'pagination footer'})).toBeTruthy();
    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      [7, '-', 12, ' of ', 17],
      1,
      2,
      3,
    ]);

    const items = renderer!.root.findAllByType(KolamPaginationItem);

    items[0].props.onPress();
    items[4].props.onPress();

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
  });
});
