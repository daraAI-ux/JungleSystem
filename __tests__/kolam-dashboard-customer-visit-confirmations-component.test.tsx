import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamCardFrame} from '../src/components/kolam-card-frame';
import {KolamHeaderFrame} from '../src/components/kolam-header-frame';
import {KolamDashboardCustomerVisitConfirmations} from '../src/components/kolam-dashboard-widgets';
import {KolamListFrame} from '../src/components/kolam-list-frame';
import {
  getDashboardCustomerVisitConfirmations,
  getDashboardCustomerVisitConfirmationsDescriptor,
  getDashboardCustomerVisitConfirmationsVisualContract,
} from '../src/domain/dashboard-customer-visit-confirmations';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';
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

describe('KolamDashboardCustomerVisitConfirmations', () => {
  it('renders the live FE customer visit confirmation card from domain rows', async () => {
    const rows = getDashboardCustomerVisitConfirmations(seedUnifiedDataset);
    const descriptor = getDashboardCustomerVisitConfirmationsDescriptor();
    const onConfirm = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamDashboardCustomerVisitConfirmations
            descriptor={descriptor}
            onConfirm={onConfirm}
            rows={rows}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Konfirmasi kunjungan layanan',
        'Kunjungan layanan',
        'Konfirmasi',
      ]),
    );
    expect(
      renderer!.root.findByProps({
        accessibilityLabel: rows[0].actionAccessibilityLabel,
      }),
    ).toBeTruthy();

    const visual = getDashboardCustomerVisitConfirmationsVisualContract();
    const cardFrame = renderer!.root.findByType(KolamCardFrame);
    const headerFrame = renderer!.root.findByType(KolamHeaderFrame);
    const listFramePrimitive = renderer!.root.findByType(KolamListFrame);
    const headerTitle = renderer!.root
      .findAllByType(Text)
      .find(node => flattenText(node.props.children).includes(descriptor.title));
    const headerDescription = renderer!.root.findAllByType(Text).find(node =>
      flattenText(node.props.children).includes(descriptor.description),
    );
    const listFrame = renderer!.root.findAllByType(View).find(node => {
      const style = StyleSheet.flatten(node.props.style);

      return (
        style?.paddingHorizontal === visual.list.paddingX &&
        style?.gap === visual.list.gapY
      );
    });
    const rowFrame = renderer!.root.findAll(node => {
      const style = StyleSheet.flatten(node.props.style);

      return (
        style?.borderRadius === visual.row.radius &&
        style?.paddingHorizontal === visual.row.paddingX
      );
    })[0];
    const actionText = renderer!.root
      .findAllByType(Text)
      .find(node =>
        flattenText(node.props.children).includes(rows[0].actionLabel),
      );
    const actionStyle = StyleSheet.flatten(actionText?.props.style);

    expect(cardFrame.props.variant).toBe('dashboardVisitConfirmations');
    expect(headerFrame.props.variant).toBe('dashboardVisitConfirmations');
    expect(listFramePrimitive.props.variant).toBe(
      'dashboardVisitConfirmationsList',
    );
    expect(StyleSheet.flatten(headerTitle?.props.style)).toEqual(
      expect.objectContaining({
        fontSize: visual.header.titleFontSize,
        fontWeight: '600',
      }),
    );
    expect(StyleSheet.flatten(headerDescription?.props.style)).toEqual(
      expect.objectContaining({
        fontSize: visual.header.descriptionFontSize,
      }),
    );
    expect(StyleSheet.flatten(listFrame?.props.style)).toEqual(
      expect.objectContaining({
        borderTopWidth: visual.list.borderTopWidth,
        paddingVertical: visual.list.paddingY,
      }),
    );
    expect(rowFrame).toBeTruthy();
    expect(StyleSheet.flatten(rowFrame?.props.style)).toEqual(
      expect.objectContaining({
        flexWrap: 'wrap',
      }),
    );
    expect(actionStyle).toEqual(
      expect.objectContaining({
        color: V.colors.primary,
        textDecorationLine: 'underline',
      }),
    );

    renderer!.root
      .findByProps({accessibilityLabel: rows[0].actionAccessibilityLabel})
      .props.onPress();

    expect(onConfirm).toHaveBeenCalledWith(rows[0]);
  });

  it('hides the card when the live endpoint returns no pending confirmations', async () => {
    const descriptor = getDashboardCustomerVisitConfirmationsDescriptor();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamDashboardCustomerVisitConfirmations
            descriptor={descriptor}
            rows={[]}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual([]);
  });
});
