import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {KolamDaraTrainingVideoStudioBody} from '../src/components/kolam-dara-training-video-studio-body';
import {
  fetchKolamDaraTrainingVideoStudioConfig,
  listKolamDaraTrainingVideoStudioJobs,
} from '../src/services/kolam-dara-training-video-studio-api';

jest.mock('react-native-webview', () => {
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: ReactNative.View,
  };
});

jest.mock('../src/services/native-file-picker', () => ({
  pickNativeVideoFile: jest.fn(),
}));

jest.mock('../src/services/kolam-dara-training-video-studio-api', () => ({
  fetchKolamDaraTrainingVideoStudioConfig: jest.fn(),
  listKolamDaraTrainingVideoStudioJobs: jest.fn(),
  uploadKolamDaraTrainingVideoStudioRaw: jest.fn(),
  createKolamDaraTrainingVideoStudioJob: jest.fn(),
  refreshKolamDaraTrainingVideoStudioJob: jest.fn(),
  pollKolamDaraTrainingVideoStudioJob: jest.fn(),
  cancelKolamDaraTrainingVideoStudioJob: jest.fn(),
  overlayKolamDaraTrainingVideoStudioLogo: jest.fn(),
  buildKolamDaraTrainingVideoStudioDownloadUrl: jest.fn(
    (id: string) => `https://amfibi.dunia-anura.com/api/dara-training/video-studio/jobs/${id}/download`,
  ),
}));

jest.mock('../src/components/kolam-media-preview-dialog', () => ({
  openKolamMediaPreview: jest.fn(),
}));

const configMock = fetchKolamDaraTrainingVideoStudioConfig as jest.MockedFunction<
  typeof fetchKolamDaraTrainingVideoStudioConfig
>;
const jobsMock = listKolamDaraTrainingVideoStudioJobs as jest.MockedFunction<
  typeof listKolamDaraTrainingVideoStudioJobs
>;

describe('KolamDaraTrainingVideoStudioBody', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    configMock.mockResolvedValue({
      apiKeyConfigured: true,
      region: 'ap-southeast',
      defaultModel: 'seedance-1-0-lite',
      models: ['seedance-1-0-lite'],
      maxUploadBytes: 104857600,
      maxSourceDurationSeconds: 30,
      supportedDurations: [5, 10],
      supportedAspectRatios: ['16:9', '9:16'],
      supportedResolutions: ['720p'],
      cancelSupported: true,
      modelCapabilities: {
        'seedance-1-0-lite': {durations: [5, 10], resolutions: ['720p']},
      },
      publicUploadConfigured: true,
      preset: {
        name: 'species-cinematic',
        prompt: 'Buat video sinematik species.',
      },
    });
    jobsMock.mockResolvedValue([
      {
        id: 'job-1',
        status: 'succeeded',
        prompt: 'Buat video sinematik species.',
        presetName: 'species-cinematic',
        model: 'seedance-1-0-lite',
        duration: 5,
        aspectRatio: '16:9',
        resolution: '720p',
        watermark: false,
        sourceFilename: 'raw.mp4',
        sourceMimeType: 'video/mp4',
        sourceSizeBytes: 4096,
        sourceVideoUrl: 'https://cdn.example/raw.mp4',
        sourcePath: '',
        externalTaskId: 'ext-1',
        outputUrl: 'https://cdn.example/out.mp4',
        outputPath: '',
        overlayLogo: false,
        errorMessage: '',
        providerStatus: '',
        submittedAt: '',
        finishedAt: '',
        cancelledAt: '',
        createdAt: '2026-08-01T10:00:00.000Z',
        updatedAt: '2026-08-01T10:05:00.000Z',
      },
    ]);
  });

  it('renders title and loads config/jobs', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraTrainingVideoStudioBody canManage />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Dunia Anura Video Studio');
    expect(text).toContain('Upload RAW');
    expect(text).toContain('Kirim task');
    expect(text).toContain('Histori job');
    expect(text).toContain('raw.mp4');
    expect(text).toContain('Download hasil');
    expect(text).toContain('Putar hasil Video Studio');
    expect(configMock).toHaveBeenCalled();
    expect(jobsMock).toHaveBeenCalledWith(5);

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });
});
