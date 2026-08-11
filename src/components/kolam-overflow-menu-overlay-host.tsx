import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type KolamOverflowMenuOverlayRequest = {
  anchorHeight: number;
  anchorTop: number;
  content: React.ReactNode;
  estimatedHeight: number;
  id: string;
  left: number;
  onClose?: () => void;
  top: number;
  width: number;
};

type KolamOverflowMenuOverlayListener = (
  menu: KolamOverflowMenuOverlayRequest | null,
) => void;

const overflowMenuOverlayListeners =
  new Set<KolamOverflowMenuOverlayListener>();
let activeOverflowMenuOverlay: KolamOverflowMenuOverlayRequest | null = null;

function notifyOverflowMenuOverlay() {
  overflowMenuOverlayListeners.forEach(listener =>
    listener(activeOverflowMenuOverlay),
  );
}

export function showKolamOverflowMenuOverlay(
  menu: KolamOverflowMenuOverlayRequest,
) {
  activeOverflowMenuOverlay = menu;
  notifyOverflowMenuOverlay();
}

export function hideKolamOverflowMenuOverlay(id?: string) {
  if (id && activeOverflowMenuOverlay?.id !== id) {
    return;
  }
  const onClose = activeOverflowMenuOverlay?.onClose;
  activeOverflowMenuOverlay = null;
  notifyOverflowMenuOverlay();
  onClose?.();
}

export function KolamOverflowMenuOverlayHost({
  style,
}: {
  style?: StyleProp<ViewStyle>;
}) {
  const hostRef = React.useRef<View>(null);
  const [menu, setMenu] = React.useState(activeOverflowMenuOverlay);
  const [localPosition, setLocalPosition] = React.useState<{
    left: number;
    top: number;
  } | null>(null);

  React.useEffect(() => {
    overflowMenuOverlayListeners.add(setMenu);
    return () => {
      overflowMenuOverlayListeners.delete(setMenu);
    };
  }, []);

  React.useEffect(() => {
    if (!menu) {
      setLocalPosition(null);
      return;
    }

    setLocalPosition(null);

    const host = hostRef.current;
    if (!host || typeof host.measureInWindow !== 'function') {
      setLocalPosition({ left: menu.left, top: menu.top });
      return;
    }

    host.measureInWindow((x, y, _width, height) => {
      const localLeft = menu.left - x;
      const requestedTop = menu.top - y;
      const bottomLimit = Math.max(8, height - menu.estimatedHeight - 8);
      const shouldOpenUp = requestedTop > bottomLimit;
      const localTop = shouldOpenUp
        ? Math.max(8, menu.anchorTop - y - menu.estimatedHeight - 4)
        : Math.min(requestedTop, bottomLimit);

      setLocalPosition({
        left: localLeft,
        top: localTop,
      });
    });
  }, [menu]);

  if (!menu) {
    return null;
  }

  return (
    <View ref={hostRef} pointerEvents="box-none" style={[styles.host, style]}>
      <Pressable
        accessibilityLabel="Tutup menu aksi"
        accessibilityRole="button"
        onPress={() => hideKolamOverflowMenuOverlay(menu.id)}
        style={styles.dismissLayer}
      />
      {localPosition ? (
        <View
          style={[
            styles.menuLayer,
            {
              left: localPosition.left,
              top: localPosition.top,
              width: menu.width,
            },
          ]}
        >
          {menu.content}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2500000,
    elevation: 2500000,
  },
  dismissLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  menuLayer: {
    position: 'absolute',
    zIndex: 2,
    elevation: 2500001,
  },
});
