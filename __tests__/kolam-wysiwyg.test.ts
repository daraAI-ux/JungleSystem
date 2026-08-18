import {
  catalogHasWysiwygDue,
  createWysiwygSettingsSavePayload,
  createWysiwygUnitSavePayload,
  isWysiwygDue,
  isWysiwygMongoId,
  normalizeWysiwygUnitConfig,
} from '../src/domain/kolam-wysiwyg';

describe('kolam wysiwyg domain', () => {
  it('treats due only when enabled, not paused, and status is due', () => {
    expect(
      isWysiwygDue({enabled: true, paused: false, status: 'due'}),
    ).toBe(true);
    expect(
      isWysiwygDue({enabled: true, paused: true, status: 'due'}),
    ).toBe(false);
    expect(
      isWysiwygDue({enabled: false, paused: false, status: 'due'}),
    ).toBe(false);
    expect(
      isWysiwygDue({enabled: true, paused: false, status: 'idle'}),
    ).toBe(false);
  });

  it('detects due on root or any variant', () => {
    expect(
      catalogHasWysiwygDue({
        wysiwyg: {enabled: true, paused: false, status: 'due'},
      }),
    ).toBe(true);
    expect(
      catalogHasWysiwygDue({
        wysiwyg: {enabled: true, paused: false, status: 'idle'},
        variants: [{wysiwyg: {enabled: true, paused: false, status: 'due'}}],
      }),
    ).toBe(true);
    expect(
      catalogHasWysiwygDue({
        wysiwyg: {enabled: true, paused: true, status: 'due'},
        variants: [{wysiwyg: {enabled: true, paused: false, status: 'idle'}}],
      }),
    ).toBe(false);
  });

  it('strips cron timestamps from unit save payload', () => {
    const payload = createWysiwygUnitSavePayload({
      enabled: true,
      useDefaults: false,
      intervalValue: 2,
      intervalUnit: 'week',
      priceMode: 'fixed',
      priceAmount: 5000,
      priceCap: 100000,
      paused: true,
      status: 'due',
      nextDueAt: '2026-08-18T00:00:00.000Z',
      lastPhotoAt: '2026-08-01T00:00:00.000Z',
    });

    expect(payload).toEqual({
      enabled: true,
      useDefaults: false,
      intervalValue: 2,
      intervalUnit: 'week',
      priceMode: 'fixed',
      priceAmount: 5000,
      priceCap: 100000,
      paused: true,
    });
    expect(payload).not.toHaveProperty('status');
    expect(payload).not.toHaveProperty('nextDueAt');
    expect(payload).not.toHaveProperty('lastPhotoAt');
  });

  it('keeps settings save payload to form fields only', () => {
    expect(
      createWysiwygSettingsSavePayload({
        enabled: true,
        notifyEnabled: false,
        intervalValue: 0,
        intervalUnit: 'hour' as never,
        priceMode: 'percent',
        priceAmount: -3,
        priceCap: 0,
      }),
    ).toEqual({
      enabled: true,
      notifyEnabled: false,
      intervalValue: 1,
      intervalUnit: 'month',
      priceMode: 'percent',
      priceAmount: 0,
      priceCap: 0,
    });
  });

  it('normalizes unit payload from backend dates', () => {
    const unit = normalizeWysiwygUnitConfig({
      enabled: true,
      useDefaults: true,
      status: 'due',
      nextDueAt: new Date('2026-09-01T08:00:00.000Z'),
    });
    expect(unit.enabled).toBe(true);
    expect(unit.status).toBe('due');
    expect(unit.nextDueAt).toBe('2026-09-01T08:00:00.000Z');
  });

  it('accepts mongo ids for variant skip', () => {
    expect(isWysiwygMongoId('64b1f0c2a1b2c3d4e5f60789')).toBe(true);
    expect(isWysiwygMongoId('draft-1')).toBe(false);
  });
});
