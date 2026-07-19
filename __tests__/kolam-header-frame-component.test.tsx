import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamHeaderFrame} from '../src/components/kolam-header-frame';
import {getDashboardCustomerVisitConfirmationsVisualContract} from '../src/domain/dashboard-customer-visit-confirmations';
import {getDashboardHeaderVisualContract} from '../src/domain/dashboard-header';
import {getDashboardSalesGraphVisualContract} from '../src/domain/dashboard-sales-graph';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamHeaderFrame', () => {
  it('renders shared attention header chrome and keeps children ordered', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamHeaderFrame variant="attentionPanel">
          <Text>Title</Text>
          <Text>Action</Text>
        </KolamHeaderFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({
        borderBottomColor: V.colors.border,
        flexDirection: 'row',
      }),
    );
    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'Title',
      'Action',
    ]);
  });

  it('keeps section header spacing reusable', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamHeaderFrame variant="sectionHeader">
          <Text>Section</Text>
        </KolamHeaderFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({
        alignItems: 'flex-start',
        marginBottom: 12,
      }),
    );
  });

  it('uses the live Beranda header padding from the dashboard contract', async () => {
    const visual = getDashboardHeaderVisualContract();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamHeaderFrame variant="dashboardHeader">
          <Text>Beranda</Text>
        </KolamHeaderFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({
        paddingTop: visual.layout.paddingTop,
        paddingBottom: visual.layout.paddingBottom,
      }),
    );
  });

  it('uses the live FE Card header spacing for Beranda visit confirmations', async () => {
    const visual = getDashboardCustomerVisitConfirmationsVisualContract();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamHeaderFrame variant="dashboardVisitConfirmations">
          <Text>Konfirmasi kunjungan layanan</Text>
        </KolamHeaderFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({
        paddingHorizontal: visual.header.paddingX,
      }),
    );
  });

  it('uses the live SalesGraph summary column from the dashboard contract', async () => {
    const visual = getDashboardSalesGraphVisualContract();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamHeaderFrame variant="salesGraphSummaryColumn">
          <Text>Ringkasan Penjualan</Text>
        </KolamHeaderFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({
        minWidth: visual.header.summaryColumnMinWidth,
        maxWidth: visual.header.summaryColumnMaxWidth,
        flexBasis: visual.header.summaryColumnBasis,
      }),
    );
  });
});
