import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamDataTableHeader} from '../src/components/kolam-data-table-header';
import {KolamInfoBlock} from '../src/components/kolam-info-block';
import {KolamNativeFormSection} from '../src/components/kolam-native-form-section';
import {KolamOperationalEmpty} from '../src/components/kolam-operational-empty';
import {KolamSummaryBlock} from '../src/components/kolam-summary-block';
import {KolamSurfaceRow} from '../src/components/kolam-surface-row';
import {KolamTotalRow} from '../src/components/kolam-total-row';
import {KolamWorkflowNotice} from '../src/components/kolam-workflow-notice';
import {getKolamFormSection} from '../src/domain/kolam-form';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';
import {getKolamTableColumns} from '../src/domain/kolam-table';

function renderText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAllByType(Text).map(node => node.props.children);
}

describe('presentational Kolam primitives', () => {
  it('renders summary, info, total, empty, and workflow primitives', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamSummaryBlock
            title="Finance"
            rows={[{label: 'Saldo', value: 'Rp 1', tone: 'warning'}]}
          />
          <KolamInfoBlock
            label="Shift"
            primary="Pagi"
            secondary="Kasir utama"
          />
          <KolamTotalRow label="Final total" value="Rp 1" strong />
          <KolamOperationalEmpty title="Kosong" message="Belum ada data." />
          <KolamWorkflowNotice
            steps={[
              {label: 'Login', done: true},
              {label: 'Cart', done: false},
            ]}
          />
        </View>,
      );
    });

    const text = renderText(renderer!);
    const styles = JSON.stringify(
      renderer!.root.findAllByType(Text).map(node => node.props.style),
    );

    expect(text).toEqual(
      expect.arrayContaining([
        'Finance',
        'Saldo',
        'Rp 1',
        'Shift',
        'Pagi',
        'Final total',
        'Kosong',
        'Login',
        'Cart',
      ]),
    );
    expect(styles).toContain(V.colors.warning);
    expect(styles).toContain(V.colors.success);
  });

  it('renders table header, form section, and surface row primitives', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamDataTableHeader columns={getKolamTableColumns('catalog')} />
          <KolamNativeFormSection section={getKolamFormSection('cashflow-open')}>
            <Text>Control</Text>
          </KolamNativeFormSection>
          <KolamSurfaceRow
            surface={{
              id: 'kolam',
              label: 'Kolam',
              description: 'Dashboard Kolam',
              route: '/kolam',
              sourceRepo: 'da-inventory-frontend',
            }}
          />
        </View>,
      );
    });

    const text = renderText(renderer!);

    expect(text).toEqual(
      expect.arrayContaining([
        'Catalog',
        'Control',
        'Kolam',
        'Dashboard Kolam',
        '/kolam',
      ]),
    );
  });
});
