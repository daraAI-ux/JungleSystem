import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {ModuleNavIcon} from '../src/components/kolam-module-nav-icon';
import {shellModules} from '../src/domain/app-shell';

describe('ModuleNavIcon', () => {
  it('renders every shell module icon kind directly', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          {shellModules.map(module => (
            <ModuleNavIcon
              key={module.id}
              kind={module.iconKind}
              active={module.id === 'kolam'}
            />
          ))}
        </View>,
      );
    });

    expect(renderer!.root.findAllByType(View).length).toBeGreaterThan(
      shellModules.length,
    );
  });
});