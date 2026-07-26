import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamSettingsActivityLogTable} from '../src/components/kolam-settings-activity-widgets';
import {
  getSettingsActivityLogPagination,
  getSettingsActivityLogDetailFieldsFromLive,
  getSettingsActivityLogRows,
  getSettingsActivityLogRowsFromLive,
  getSettingsActivityLogStatsCardsFromLive,
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

  it('maps live backend activity logs into rows, detail fields, and stats cards', () => {
    const liveLog = {
      _id: 'log-1',
      timestamp: '2026-07-26T08:00:00.000Z',
      userId: {
        _id: 'user-1',
        first_name: 'Admin',
        last_name: 'Kolam',
        email: 'admin@example.test',
      },
      source: 'Kolam' as const,
      type: 'api' as const,
      action: 'role.update',
      method: 'PUT',
      path: '/roles/role-1',
      ip: '127.0.0.1',
      userAgent: 'native-shell',
      status: 'success' as const,
      statusCode: 200,
      duration: 42,
      metadata: {},
      error: '',
      suspicious: ['automation_tool_ua'],
    };

    const [row] = getSettingsActivityLogRowsFromLive([liveLog]);
    const detail = getSettingsActivityLogDetailFieldsFromLive(liveLog);
    const cards = getSettingsActivityLogStatsCardsFromLive(
      {
        success: true,
        data: {
          since: '2026-07-19T08:00:00.000Z',
          days: 7,
          byType: [{_id: 'api', count: 1}],
          byStatus: [{_id: 'success', count: 1}],
          topUsers: [],
          topPaths: [{_id: '/roles/role-1', count: 1}],
        },
      },
      1,
    );

    expect(row).toEqual(
      expect.objectContaining({
        id: 'log-1',
        user: 'Admin Kolam',
        method: 'PUT',
        path: '/roles/role-1',
        suspicious: ['automation_tool_ua'],
        tone: 'warning',
      }),
    );
    expect(detail).toEqual(
      expect.arrayContaining([
        expect.objectContaining({id: 'user-agent', value: 'native-shell'}),
        expect.objectContaining({id: 'action', value: 'role.update'}),
      ]),
    );
    expect(cards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({id: 'events', value: '1'}),
        expect.objectContaining({id: 'success', value: '1'}),
      ]),
    );
  });
});
