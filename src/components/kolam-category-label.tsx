import React from 'react';
import { StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamButton } from './kolam-button';
import { KolamRemoteImage } from './kolam-remote-image';

export interface KolamCategoryLabelProps {
  imageUri?: string | null;
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function KolamCategoryLabel({
  imageUri,
  label,
  onPress,
  style,
  textStyle,
}: KolamCategoryLabelProps) {
  const icon = imageUri ? (
      <KolamRemoteImage
        accessibilityLabel={`Gambar kategori ${label}`}
        resizeMode="cover"
        revision={imageUri}
        scope="category-chip"
        sourceUri={imageUri}
        style={styles.image}
      />
  ) : null;

  return (
    <KolamButton
      icon={icon}
      intent="outline"
      label={label}
      onPress={onPress}
      style={[styles.button, icon ? styles.buttonWithImage : null, style]}
      textStyle={[styles.text, textStyle]}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: V.colors.infoSoft,
    borderColor: V.colors.info,
    minHeight: 32,
  },
  buttonWithImage: {
    paddingHorizontal: 6,
  },
  image: {
    borderRadius: 5,
    height: 20,
    width: 20,
  },
  text: {
    color: V.colors.info,
  },
});
