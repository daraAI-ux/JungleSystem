import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamGlobalChatRail} from '../src/components/kolam-global-chat-rail';

function renderText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAllByType(Text)
    .flatMap(node => flattenText(node.props.children));
}

function flattenText(value: React.ReactNode): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(flattenText);
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }

  return [];
}

describe('KolamGlobalChatRail', () => {
  it('renders the inbox skeleton without loading chat data', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="inbox" onClose={() => undefined} />,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Chat',
        'Pesan masuk',
        'Inbox siap dipasang',
        'Fase ini hanya membuka area panel kanan global. Conversation list, unread, dan detail pesan masuk di fase berikutnya.',
      ]),
    );
  });

  it('renders the team chat skeleton without loading chat data', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamGlobalChatRail mode="team-chat" onClose={() => undefined} />,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Chat',
        'Team chat',
        'Team chat siap dipasang',
        'Fase ini hanya membuka area panel kanan global. Data room, unread, dan stream realtime masuk di fase berikutnya.',
      ]),
    );
  });
});
