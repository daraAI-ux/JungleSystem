import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamLoginScreen} from '../src/components/kolam-login-screen';
import {authSources} from '../src/domain/auth';

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

describe('KolamLoginScreen', () => {
  it('renders a dedicated server login page using the shared auth panel', async () => {
    const onLogin = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamLoginScreen
            auth={{
              accessScope: {am: false, kolam: false, pos: false},
              amApiBaseUrl: 'https://frogs.dunia-anura.com/api',
              authEmail: '',
              authMessage: 'Mode server existing siap.',
              authPassword: '',
              authSource: 'kolam',
              authSourceHint: 'Inventory/Kolam access_inventory.',
              authSources,
              displayName: 'Belum login',
              isSigningIn: false,
              onAmApiBaseUrlChange: () => undefined,
              onAuthEmailChange: () => undefined,
              onAuthPasswordChange: () => undefined,
              onAuthSourceChange: () => undefined,
              onLogin,
              onLogout: () => undefined,
              onSync: () => undefined,
            }}
            deviceIdentityStatus="mac-only"
            syncStatus={{
              loading: false,
              message: 'Sync: POS seed, Kolam seed, AM disabled.',
            }}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'JungleSystem',
        'Backend',
        'Native Client',
        'Source Login',
        'Device Signature',
        'MAC attached',
        'Belum login',
        'Login',
      ]),
    );

    await ReactTestRenderer.act(async () => {
      renderer!.root
        .findByProps({accessibilityLabel: 'Login'})
        .props.onPress();
    });

    expect(onLogin).toHaveBeenCalled();
  });
});
