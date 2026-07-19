import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamSettingsPanel} from '../src/components/kolam-settings-panel';
import {getSyncActivityEntries} from '../src/domain/sync-activity';
import {seedUnifiedDataset} from '../src/services/unified-data';

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

describe('KolamSettingsPanel', () => {
  it('renders the settings summary from the direct panel module', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSettingsPanel
          activityEntries={getSyncActivityEntries(seedUnifiedDataset, '10:00')}
        />,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Settings', 'Routes', 'Web Settings form']),
    );
  });
});
