/**
 * Local courier logos (FE `/public/couriers/*.png`).
 * Keys from `resolveKolamCourierLogoKey`. Returns null until PNG assets
 * exist under `src/assets/couriers/`.
 */

export type KolamCourierLogoKey =
  | 'jne'
  | 'jnt'
  | 'sicepat'
  | 'tiki'
  | 'lion'
  | 'anteraja'
  | 'grab'
  | 'gojek'
  | 'ninja'
  | 'pos'
  | string;

type ImageSource = number;

/**
 * Wire `require('../assets/couriers/<key>.png')` here when assets are added.
 * Metro needs static requires — do not use dynamic paths.
 */
const COURIER_LOGO_SOURCES: Partial<Record<string, ImageSource>> = {
  anteraja: require('../assets/couriers/anteraja.png'),
  gojek: require('../assets/couriers/gojek.png'),
  grab: require('../assets/couriers/grab.png'),
  jne: require('../assets/couriers/jne.png'),
  jnt: require('../assets/couriers/jnt.png'),
  lion: require('../assets/couriers/lion.png'),
  sicepat: require('../assets/couriers/sicepat.png'),
  tiki: require('../assets/couriers/tiki.png'),
};

export function getKolamCourierLogoSource(
  logoKey: string | null | undefined,
): ImageSource | null {
  if (!logoKey) {
    return null;
  }
  return COURIER_LOGO_SOURCES[logoKey] ?? null;
}
