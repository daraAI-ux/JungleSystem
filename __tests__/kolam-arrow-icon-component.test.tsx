import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {KolamArrowIcon} from '../src/components/kolam-arrow-icon';
import {KolamChevronIcon} from '../src/components/kolam-chevron-icon';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamArrowIcon', () => {
  it('renders the sidebar-style triangle chevron with muted tint by default', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<KolamArrowIcon />);
    });

    const chevron = renderer!.root.findByType(KolamChevronIcon);

    expect(chevron.props).toEqual(
      expect.objectContaining({
        color: V.colors.mutedFg,
        direction: 'right',
        size: 'dashboard-sm',
      }),
    );
  });

  it('supports a custom arrow tint', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamArrowIcon color={V.colors.info} />,
      );
    });

    const chevron = renderer!.root.findByType(KolamChevronIcon);

    expect(chevron.props.color).toBe(V.colors.info);
  });
});
