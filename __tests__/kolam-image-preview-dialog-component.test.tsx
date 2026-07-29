import { getKolamImagePreviewSize } from '../src/components/kolam-image-preview-dialog';

describe('KolamImagePreviewDialog sizing', () => {
  it('uses the measured overlay bounds for a large desktop preview', () => {
    expect(getKolamImagePreviewSize({ height: 1000, width: 1270 })).toEqual({
      dialogHeight: 960,
      dialogWidth: 1238,
      imageStageHeight: 886,
      imageStageWidth: 1214,
    });
  });

  it('keeps a usable minimum while waiting for layout measurement', () => {
    expect(getKolamImagePreviewSize({ height: 0, width: 0 })).toEqual({
      dialogHeight: 360,
      dialogWidth: 360,
      imageStageHeight: 286,
      imageStageWidth: 336,
    });
  });
});
