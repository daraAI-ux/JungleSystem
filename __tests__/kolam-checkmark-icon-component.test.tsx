import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamCheckmarkIcon} from '../src/components/kolam-checkmark-icon';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamCheckmarkIcon', () => {
  it('renders a shared two-line checkmark with a configurable color', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamCheckmarkIcon color={V.colors.warning} size="md" />,
      );
    });

    const views = renderer!.root.findAllByType(View);

    expect(views).toHaveLength(3);
    expect(JSON.stringify(views[1].props.style)).toContain(V.colors.warning);
    expect(JSON.stringify(views[2].props.style)).toContain(V.colors.warning);
  });

  it('keeps the checklist variant reusable for status panels', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamCheckmarkIcon color={V.colors.info} size="checklist" />,
      );
    });

    expect(renderer!.root.findAllByType(View)).toHaveLength(4);
  });
});
