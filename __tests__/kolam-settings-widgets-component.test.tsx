import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamSettingsPanel} from '../src/components/kolam-settings-widgets';
import {getSyncActivityEntries} from '../src/domain/sync-activity';
import {seedUnifiedDataset} from '../src/services/unified-data';

function renderText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAllByType(Text).map(node => node.props.children);
}

describe('settings Kolam widgets', () => {
  it('renders settings surface summary and web settings controls', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSettingsPanel
          activityEntries={getSyncActivityEntries(seedUnifiedDataset, '10:00')}
        />,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Settings',
        'Routes',
        'Native Summary',
        'Web Settings form',
        'Save',
      ]),
    );
  });
});
