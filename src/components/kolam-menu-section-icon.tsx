import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { kolamVisualTokens as V } from '../domain/kolam-visual';

type SectionIconKind = 'bot' | 'cart' | 'package' | 'users' | 'wallet';

const SECTION_ICON_KIND: Record<string, SectionIconKind> = {
  finance: 'wallet',
  inventory: 'package',
  pusatAi: 'bot',
  sales: 'cart',
  user: 'users',
};

export function KolamMenuSectionIcon({
  active = false,
  sectionId,
}: {
  active?: boolean;
  sectionId: string;
}) {
  const color = active ? V.colors.primary : V.colors.sidebarFg;

  return (
    <View
      testID={`kolam-menu-section-icon:${sectionId}`}
      style={{ flexShrink: 0 }}
    >
      <Svg
        fill="none"
        height={18}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
        width={18}
      >
        {renderSectionIcon(SECTION_ICON_KIND[sectionId] ?? 'package')}
      </Svg>
    </View>
  );
}

function renderSectionIcon(iconKind: SectionIconKind) {
  switch (iconKind) {
    case 'bot':
      return (
        <>
          <Rect height={10} rx={3} width={14} x={5} y={9} />
          <Path d="M12 5v4" />
          <Circle cx={9} cy={14} r={1} />
          <Circle cx={15} cy={14} r={1} />
          <Path d="M9 18h6" />
        </>
      );
    case 'cart':
      return (
        <>
          <Path d="M4 5h2l2 10h9l2-7H7" />
          <Circle cx={10} cy={19} r={1.5} />
          <Circle cx={17} cy={19} r={1.5} />
        </>
      );
    case 'users':
      return (
        <>
          <Circle cx={9} cy={8} r={3} />
          <Path d="M3.5 20a6 6 0 0 1 11 0" />
          <Path d="M16 11a3 3 0 1 0-1-5.8" />
          <Path d="M15 17a5 5 0 0 1 5.5 3" />
        </>
      );
    case 'wallet':
      return (
        <>
          <Path d="M4 7h15a2 2 0 0 1 2 2v9H5a2 2 0 0 1-2-2V7a3 3 0 0 1 3-3h11" />
          <Path d="M16 13h5" />
          <Circle cx={17.5} cy={13} r={0.8} />
        </>
      );
    case 'package':
    default:
      return (
        <>
          <Path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
          <Path d="M4 7.5 12 12l8-4.5M12 12v9" />
        </>
      );
  }
}
