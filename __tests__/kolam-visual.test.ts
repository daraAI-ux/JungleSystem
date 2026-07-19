import {kolamVisualTokens} from '../src/domain/kolam-visual';

describe('kolamVisualTokens', () => {
  it('tracks the live Kolam shell contract', () => {
    expect(kolamVisualTokens.fontFamily).toBe('Inter');
    expect(kolamVisualTokens.colors.bg).toBe('#ffffff');
    expect(kolamVisualTokens.colors.fg).toBe('#111827');
    expect(kolamVisualTokens.colors.primary).toBe('#16a34a');
    expect(kolamVisualTokens.colors.primarySoft).toBe('#e8f6ed');
    expect(kolamVisualTokens.colors.mutedSoft).toBe('#fdfdfe');
    expect(kolamVisualTokens.colors.mainSurface).toBe(
      kolamVisualTokens.colors.bg,
    );
    expect(kolamVisualTokens.colors.sidebar).toBe('#fbfbfc');
    expect(kolamVisualTokens.colors.tableHeader).toBe('#f2f3f5');
    expect(kolamVisualTokens.colors.border).toBe('#e5e7eb');
    expect(kolamVisualTokens.radius.lg).toBe(8);
    expect(kolamVisualTokens.control.inputHeight).toBe(36);
    expect(kolamVisualTokens.control.buttonSmHeight).toBe(34);
    expect(kolamVisualTokens.control.badgeRadius).toBe(999);
    expect(kolamVisualTokens.surface.cardChrome).toEqual({
      sourceSlot: 'card',
      radius: 8,
      background: 'bg',
      border: 'border',
      borderWidth: 1,
      shadow: 'shadow-xs',
      defaultSpacing: 24,
      compactSpacing: 16,
    });
    expect(kolamVisualTokens.surface.cardSlots).toEqual({
      sourceComponent:
        'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\card.tsx',
      card: {
        layout: 'flex-col',
        defaultSpacing: 24,
        compactSpacing: 16,
        paddingYUsesSpacing: true,
        hasTableOverflowHidden: true,
      },
      header: {
        layout: 'grid',
        rowGap: 4,
        paddingXUsesSpacing: true,
        actionPlacement: 'top-right',
      },
      title: {
        fontSize: 18,
        lineHeight: 24,
        compactFontSize: 16,
        fontWeight: 'semibold',
      },
      description: {
        fontSize: 14,
        color: 'mutedFg',
      },
      content: {
        paddingXUsesSpacing: true,
        tableBorderTop: true,
      },
      footer: {
        paddingXUsesSpacing: true,
        tablePaddingTopUsesSpacing: true,
      },
    });
    expect(kolamVisualTokens.surface.cardShadow).toEqual({
      sourceClass: 'shadow-xs',
      offsetY: 1,
      radius: 1,
      opacity: 0.04,
      elevation: 1,
    });
    expect(kolamVisualTokens.layout.sidebarWidth).toBe(272);
    expect(kolamVisualTokens.layout.sidebarDockWidth).toBe(52);
    expect(kolamVisualTokens.layout.topNavHeight).toBe(52);
    expect(kolamVisualTokens.layout.quickSearchHeight).toBe(36);
    expect(kolamVisualTokens.layout.contentPadding).toBe(16);
    expect(kolamVisualTokens.layout.cardSpacing).toBe(24);
    expect(kolamVisualTokens.layout.cardCompactSpacing).toBe(16);
    expect(kolamVisualTokens.layout.tableCellPaddingX).toBe(20);
    expect(kolamVisualTokens.layout.tableCellPaddingY).toBe(12);
    expect(kolamVisualTokens.layout.tableRowMinHeight).toBe(52);
    expect(kolamVisualTokens.layout.navItemHeight).toBe(36);
    expect(kolamVisualTokens.layout.navSectionGap).toBe(24);
    expect(kolamVisualTokens.layout.navItemPaddingX).toBe(8);
    expect(kolamVisualTokens.layout.dashboardRightRailWidth).toBe(300);
    expect(kolamVisualTokens.layout.dashboardSectionGap).toBe(24);
  });
});
