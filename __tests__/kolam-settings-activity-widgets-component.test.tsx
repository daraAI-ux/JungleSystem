import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamSettingsActivityLogTable} from '../src/components/kolam-settings-activity-widgets';
import {
  getSettingsActivityLogPagination,
  getSettingsActivityLogRows,
  getSettingsActivityLogTableColumns,
} from '../src/domain/settings-surface';
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

describe('settings activity widgets', () => {
  it('renders the activity log table directly', async () => {
    const entries = getSyncActivityEntries(seedUnifiedDataset, '10:00');
    const pagination = getSettingsActivityLogPagination(entries.length, 1);
    const rows = getSettingsActivityLogRows(
      entries,
      pagination.pageSize,
      pagination.page,
    );
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamSettingsActivityLogTable
            columns={getSettingsActivityLogTableColumns()}
            rows={rows}
            selectedRowId=""
            onSelectRow={() => undefined}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Waktu', 'User', 'Source']),
    );
  });
});
