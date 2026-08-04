import React from 'react';
import {ScrollView, Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamAttentionPanelList} from '../src/components/kolam-attention-panel-list';
import {KolamAttentionPanelTitleBlock} from '../src/components/kolam-attention-panel-title-block';
import {KolamNotificationBellIcon} from '../src/components/kolam-notification-bell-icon';
import {attentionPanelStyles} from '../src/components/kolam-attention-panel-styles';
import type {AttentionPanelItem} from '../src/domain/attention-panel';

function getTextContent(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .flat()
    .filter(Boolean);
}

function makeItem(index: number): AttentionPanelItem {
  return {
    id: `notification-${index}`,
    label: `Notification ${index}`,
    message: `Message ${index}`,
    meta: `Meta ${index}`,
    tone: index % 2 === 0 ? 'info' : 'warning',
    badgeLabel: index % 2 === 0 ? 'INFO' : 'WARNING',
    isUnread: index % 2 === 0,
    routeHint: `/notifications/${index}`,
  };
}

describe('Kolam notification popup parity chrome', () => {
  it('renders the FE header title without the old operational subtitle', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<KolamAttentionPanelTitleBlock />);
    });

    const textContent = getTextContent(renderer!);

    expect(textContent).toContain('Notifications');
    expect(textContent).not.toContain('Status operasional terbaru');
  });

  it('keeps the popup list scrollable and renders the FE page size', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAttentionPanelList
          items={Array.from({length: 11}, (_, index) => makeItem(index + 1))}
        />,
      );
    });

    expect(renderer!.root.findByType(ScrollView).props.style).toEqual(
      attentionPanelStyles.attentionList,
    );

    const textContent = getTextContent(renderer!);

    expect(textContent).toContain('Notification 10');
    expect(textContent).toContain('WARNING');
    expect(textContent).not.toContain('Notification 11');
  });

  it('renders an FE-style empty state for empty notification results', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAttentionPanelList
          items={[
            {
              id: 'notification-empty',
              label: 'No notifications',
              message: '',
              meta: 'Notifications',
              tone: 'success',
              isUnread: false,
            },
          ]}
        />,
      );
    });

    expect(renderer!.root.findByType(KolamNotificationBellIcon)).toBeTruthy();
    expect(getTextContent(renderer!)).toEqual(['No notifications']);
  });
});
