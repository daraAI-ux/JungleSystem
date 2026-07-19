import React from 'react';
import {Text, View} from 'react-native';
import {KolamMappedList} from './kolam-mapped-list';
import type {KolamCopyStackProps} from './kolam-copy-stack-types';

export type {
  KolamCopyStackItem,
  KolamCopyStackProps,
} from './kolam-copy-stack-types';

export function KolamCopyStack({
  containerStyle,
  items,
}: KolamCopyStackProps) {
  const content = (
    <KolamMappedList
      items={items}
      getKey={(item, index) => item.id ?? index}
      renderItem={item => (
        <Text {...item.textProps} style={item.style}>
          {item.text}
        </Text>
      )}
    />
  );

  if (!containerStyle) {
    return content;
  }

  return <View style={containerStyle}>{content}</View>;
}
