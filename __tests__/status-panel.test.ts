import {getStatusPanelDescriptor} from '../src/domain/status-panel';

describe('getStatusPanelDescriptor', () => {
  it('defines live-style status panel headers for native operational panels', () => {
    const sourceComponent =
      'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\card.tsx';

    expect(getStatusPanelDescriptor('sync-activity')).toMatchObject({
      title: 'Aktivitas Sinkronisasi',
      description: 'Status data Kolam, POS, dan AM dari server yang sedang dipakai.',
      iconKind: 'activity',
      sourceComponent,
    });
    expect(getStatusPanelDescriptor('readiness')).toMatchObject({
      title: 'Kesiapan Operasional',
      description: 'Ringkasan kesiapan akses, plugin, dan perangkat Windows.',
      iconKind: 'checklist',
      sourceComponent,
    });
    expect(getStatusPanelDescriptor('runtime-actions')).toMatchObject({
      title: 'Aksi Operasional',
      description: 'Aksi cepat untuk Kolam, POS, AM, dan plugin terkait.',
      iconKind: 'actions',
      sourceComponent,
    });
    expect(getStatusPanelDescriptor('command-index')).toMatchObject({
      title: 'Pencarian Menu',
      description: 'Pencarian cepat untuk menu, aksi, dan route plugin.',
      iconKind: 'search',
      sourceComponent,
    });
    expect(getStatusPanelDescriptor('sync-activity').cardChrome).toEqual({
      spacing: 24,
      headerAction: true,
      contentBorderTop: true,
      titleWeight: 'semibold',
    });
  });

  it('returns cloned descriptors so render code cannot mutate panel copy', () => {
    const first = getStatusPanelDescriptor('readiness');
    first.title = 'Changed';
    first.cardChrome.spacing = 0;

    expect(getStatusPanelDescriptor('readiness').title).toBe(
      'Kesiapan Operasional',
    );
    expect(getStatusPanelDescriptor('readiness').cardChrome.spacing).toBe(24);
  });
});
