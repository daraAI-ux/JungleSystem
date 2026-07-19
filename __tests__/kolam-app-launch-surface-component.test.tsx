import React from 'react';
import {Text, TextInput, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamAppLaunchSurface} from '../src/components/kolam-app-launch-surface';

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

describe('KolamAppLaunchSurface', () => {
  it('renders breadth-first route atlas for every app area', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamAppLaunchSurface />
        </View>,
      );
    });

    const text = renderText(renderer!);

    expect(text).toEqual(
      expect.arrayContaining([
        'JungleSystem Launch Map',
        'User Test Flow',
        'Next Screen Pack',
        'Screen Pack Prioritas',
        'build next',
        'npm run verify:registry',
        'Route Atlas',
        'products / species',
        'checkout',
        'tasks',
        '/team-chat',
      ]),
    );
    expect(text.some(item => item.startsWith('Transaction Flow ('))).toBe(true);
  });

  it('forwards module and route atlas selections through reusable callbacks', async () => {
    const onCommandSelect = jest.fn();
    const onSelectModule = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamAppLaunchSurface
            onCommandSelect={onCommandSelect}
            onSelectModule={onSelectModule}
          />
        </View>,
      );
    });

    await ReactTestRenderer.act(async () => {
      renderer!.root.findByProps({
        accessibilityLabel: 'Buka Checkout module',
      }).props.onPress();
    });

    expect(onSelectModule).toHaveBeenCalledWith('checkout');

    await ReactTestRenderer.act(async () => {
      renderer!.root.findByProps({
        accessibilityLabel: 'Buka Team Chat route atlas',
      }).props.onPress();
    });

    expect(onCommandSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'navigation-route',
        route: '/team-chat',
      }),
    );
  });

  it('searches the full route atlas beyond the preview routes', async () => {
    const onCommandSelect = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamAppLaunchSurface onCommandSelect={onCommandSelect} />
        </View>,
      );
    });

    expect(renderText(renderer!)).not.toContain('/finance/tax');

    await ReactTestRenderer.act(async () => {
      renderer!.root.findByType(TextInput).props.onChangeText('finance/tax');
    });

    expect(renderText(renderer!)).toContain('/finance/tax');

    await ReactTestRenderer.act(async () => {
      renderer!.root.findByProps({
        accessibilityLabel: 'Buka Finance Tax route atlas',
      }).props.onPress();
    });

    expect(onCommandSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'navigation-route',
        route: '/finance/tax',
      }),
    );
  });
});
