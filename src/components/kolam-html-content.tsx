import React from 'react';
import {
  Linking,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import RenderHtml, { defaultSystemFonts } from 'react-native-render-html';
import { kolamVisualTokens as V } from '../domain/kolam-visual';

const htmlSystemFonts = [...defaultSystemFonts, V.fontFamily];
const htmlBaseStyle = {
  color: V.colors.fg,
  fontFamily: V.fontFamily,
  fontSize: 13,
  fontWeight: '700' as const,
  lineHeight: 20,
};
const htmlTagsStyles = {
  a: {
    color: V.colors.success,
    fontWeight: '900' as const,
    textDecorationLine: 'underline' as const,
  },
  blockquote: {
    backgroundColor: '#f0fdf4',
    borderLeftColor: V.colors.success,
    borderLeftWidth: 3,
    marginVertical: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  body: {
    margin: 0,
    padding: 0,
  },
  h1: {
    color: V.colors.fg,
    fontSize: 22,
    fontWeight: '900' as const,
    lineHeight: 28,
    marginBottom: 10,
    marginTop: 0,
  },
  h2: {
    color: V.colors.fg,
    fontSize: 19,
    fontWeight: '900' as const,
    lineHeight: 25,
    marginBottom: 9,
    marginTop: 0,
  },
  h3: {
    color: V.colors.fg,
    fontSize: 16,
    fontWeight: '900' as const,
    lineHeight: 22,
    marginBottom: 8,
    marginTop: 0,
  },
  h4: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '900' as const,
    lineHeight: 20,
    marginBottom: 7,
    marginTop: 0,
  },
  li: {
    marginBottom: 6,
  },
  ol: {
    marginBottom: 10,
    marginTop: 0,
  },
  p: {
    marginBottom: 10,
    marginTop: 0,
  },
  strong: {
    fontWeight: '900' as const,
  },
  table: {
    marginVertical: 8,
  },
  td: {
    borderColor: V.colors.border,
    borderWidth: 1,
    padding: 6,
  },
  th: {
    borderColor: V.colors.border,
    borderWidth: 1,
    fontWeight: '900' as const,
    padding: 6,
  },
  ul: {
    marginBottom: 10,
    marginTop: 0,
  },
};
const htmlClassesStyles = {
  'locale-empty': {
    color: V.colors.mutedFg,
    fontWeight: '800' as const,
  },
  'locale-field-body': {
    color: V.colors.fg,
  },
  'locale-field-card': {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
  },
  'locale-field-grid': {
    width: '100%' as const,
  },
  'locale-field-label': {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '900' as const,
    lineHeight: 16,
    marginBottom: 8,
    textTransform: 'uppercase' as const,
  },
};
const htmlRenderersProps = {
  a: {
    onPress: (_event: unknown, href: string) => {
      if (href) {
        void Linking.openURL(href);
      }
    },
  },
  img: {
    enableExperimentalPercentWidth: true,
    initialDimensions: {
      height: 180,
      width: 320,
    },
  },
};

export function KolamHtmlContent({
  html,
  style,
}: {
  html: string | null | undefined;
  style?: StyleProp<ViewStyle>;
}) {
  const { width } = useWindowDimensions();
  const safeHtml = html?.trim() ?? '';
  const contentWidth = Math.max(1, Math.min(width - 80, 820));
  const source = React.useMemo(() => ({ html: safeHtml }), [safeHtml]);

  if (!safeHtml) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <RenderHtml
        baseStyle={htmlBaseStyle}
        classesStyles={htmlClassesStyles}
        contentWidth={contentWidth}
        ignoredDomTags={['script', 'style', 'iframe']}
        renderersProps={htmlRenderersProps}
        source={source}
        systemFonts={htmlSystemFonts}
        tagsStyles={htmlTagsStyles}
      />
    </View>
  );
}

export function containsHtmlMarkup(value: string | null | undefined) {
  return /<\/?[a-z][\s\S]*>/i.test(value ?? '');
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    width: '100%',
  },
});
