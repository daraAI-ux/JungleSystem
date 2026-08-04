import {
  formatKolamDaraTrainingVideoStudioBytes,
  formatKolamDaraTrainingVideoStudioDate,
  isKolamDaraTrainingVideoStudioTerminalStatus,
  normalizeKolamDaraTrainingVideoStudioConfig,
  normalizeKolamDaraTrainingVideoStudioJob,
  normalizeKolamDaraTrainingVideoStudioJobList,
  normalizeKolamDaraTrainingVideoStudioUpload,
  resolveKolamDaraTrainingVideoStudioStatusIntent,
  resolveKolamDaraTrainingVideoStudioStatusLabel,
} from '../src/domain/kolam-dara-training-video-studio';

describe('kolam-dara-training-video-studio domain', () => {
  it('normalizes video studio config with preset and capabilities', () => {
    const config = normalizeKolamDaraTrainingVideoStudioConfig({
      data: {
        apiKeyConfigured: true,
        region: 'ap-southeast',
        defaultModel: 'seedance-1-0-lite',
        models: ['seedance-1-0-lite'],
        maxUploadBytes: 104857600,
        supportedDurations: [5, 10],
        supportedAspectRatios: ['16:9', '9:16'],
        supportedResolutions: ['720p'],
        cancelSupported: true,
        modelCapabilities: {
          'seedance-1-0-lite': {durations: [5], resolutions: ['720p']},
        },
        preset: {name: 'species-cinematic', prompt: 'Preset prompt'},
      },
    });
    expect(config).toMatchObject({
      apiKeyConfigured: true,
      region: 'ap-southeast',
      defaultModel: 'seedance-1-0-lite',
      models: ['seedance-1-0-lite'],
      cancelSupported: true,
      preset: {name: 'species-cinematic', prompt: 'Preset prompt'},
    });
    expect(config.modelCapabilities['seedance-1-0-lite']).toEqual({
      durations: [5],
      resolutions: ['720p'],
    });
  });

  it('normalizes upload payload', () => {
    const upload = normalizeKolamDaraTrainingVideoStudioUpload({
      data: {
        sourceFilename: 'raw.mp4',
        sourceMimeType: 'video/mp4',
        sourceSizeBytes: 2048,
        uploadToken: 'tok-1',
        sourceVideoUrl: 'https://cdn.example/raw.mp4',
        requiresPublicUrl: false,
      },
    });
    expect(upload).toMatchObject({
      sourceFilename: 'raw.mp4',
      sourceMimeType: 'video/mp4',
      sourceSizeBytes: 2048,
      uploadToken: 'tok-1',
      sourceVideoUrl: 'https://cdn.example/raw.mp4',
      requiresPublicUrl: false,
    });
  });

  it('normalizes job list and maps _id to id', () => {
    const jobs = normalizeKolamDaraTrainingVideoStudioJobList({
      data: [
        {
          _id: 'job-1',
          status: 'processing',
          prompt: 'Cinematic frog',
          model: 'seedance-1-0-lite',
          createdAt: '2026-08-01T10:00:00.000Z',
          updatedAt: '2026-08-01T10:05:00.000Z',
        },
      ],
    });
    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({
      id: 'job-1',
      status: 'processing',
      prompt: 'Cinematic frog',
      model: 'seedance-1-0-lite',
    });
  });

  it('formats bytes, dates, status labels, and terminal detection', () => {
    expect(formatKolamDaraTrainingVideoStudioBytes(512)).toBe('1 KB');
    expect(formatKolamDaraTrainingVideoStudioBytes(2 * 1024 * 1024)).toBe(
      '2.0 MB',
    );
    expect(
      formatKolamDaraTrainingVideoStudioDate('2026-08-01T10:00:00.000Z'),
    ).not.toBe('—');
    expect(resolveKolamDaraTrainingVideoStudioStatusLabel('succeeded')).toBe(
      'Selesai',
    );
    expect(resolveKolamDaraTrainingVideoStudioStatusIntent('failed')).toBe(
      'danger',
    );
    expect(isKolamDaraTrainingVideoStudioTerminalStatus('succeeded')).toBe(true);
    expect(isKolamDaraTrainingVideoStudioTerminalStatus('processing')).toBe(
      false,
    );
  });

  it('returns null for invalid job payload', () => {
    expect(normalizeKolamDaraTrainingVideoStudioJob({status: 'queued'})).toBe(
      null,
    );
  });
});
