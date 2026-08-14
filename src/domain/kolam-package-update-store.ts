import {
  isKolamPackageUpdateNewer,
  kolamPackageUpdateErrorMessage,
  type KolamPackageInfo,
  type KolamPackageReleaseManifest,
  type KolamPackageUpdatePhase,
} from './kolam-package-update';
import {fetchKolamPackageLatestRelease} from '../services/kolam-package-update-api';
import {
  downloadKolamWindowsMsix,
  getKolamWindowsPackageInfo,
  installKolamWindowsMsix,
  restartKolamWindowsApp,
  subscribeKolamWindowsPackageUpdateProgress,
} from '../services/kolam-windows-package-update';

export type KolamPackageUpdateState = {
  currentVersion: string;
  errorMessage: string;
  packaged: boolean;
  percent: number;
  phase: KolamPackageUpdatePhase;
  release: KolamPackageReleaseManifest | null;
};

type Listener = () => void;

const listeners = new Set<Listener>();

let state: KolamPackageUpdateState = createIdleState();
let autoCheckStarted = false;
let inFlight: Promise<void> | null = null;
let progressUnsubscribe: (() => void) | null = null;

export function getKolamPackageUpdateState(): KolamPackageUpdateState {
  return state;
}

export function subscribeKolamPackageUpdate(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resetKolamPackageUpdateStoreForTests() {
  autoCheckStarted = false;
  inFlight = null;
  progressUnsubscribe?.();
  progressUnsubscribe = null;
  state = createIdleState();
  listeners.clear();
}

export function hydrateKolamPackageUpdateInfo() {
  try {
    const info = getKolamWindowsPackageInfo();
    patchState(packageInfoPatch(info));
    return info;
  } catch {
    const info = {
      familyName: '',
      name: 'JungleSystem',
      packaged: false,
      publicVersion: '',
      publisher: '',
      version: '',
    };
    patchState(packageInfoPatch(info));
    return info;
  }
}

export async function startKolamPackageUpdateAutoCheck() {
  if (autoCheckStarted) {
    return;
  }

  autoCheckStarted = true;
  hydrateKolamPackageUpdateInfo();
  await checkKolamPackageUpdate({silent: true});
}

export async function checkKolamPackageUpdate({
  silent = false,
}: {silent?: boolean} = {}) {
  if (inFlight) {
    return inFlight;
  }

  inFlight = runCheck(silent).finally(() => {
    inFlight = null;
  });
  await inFlight;
}

export async function installKolamPackageUpdate() {
  if (inFlight || state.phase === 'downloading' || state.phase === 'installing') {
    return;
  }
  if (!state.release || !state.packaged) {
    return;
  }
  if (!isKolamPackageUpdateNewer(state.currentVersion, state.release.version)) {
    return;
  }

  inFlight = runInstall(state.release).finally(() => {
    inFlight = null;
  });
  await inFlight;
}

async function runCheck(silent: boolean) {
  const info = hydrateKolamPackageUpdateInfo();
  patchState({
    phase: 'checking',
    errorMessage: silent ? state.errorMessage : '',
  });

  if (!info.packaged) {
    patchState({
      ...packageInfoPatch(info),
      phase: silent ? 'idle' : 'error',
      release: null,
      percent: 0,
      errorMessage: silent ? '' : 'Paket tidak terdeteksi',
    });
    return;
  }

  try {
    const release = await fetchKolamPackageLatestRelease();
    const available = isKolamPackageUpdateNewer(info.publicVersion, release.version);
    patchState({
      ...packageInfoPatch(info),
      phase: available ? 'available' : 'idle',
      release: available ? release : null,
      percent: 0,
      errorMessage: available || silent ? '' : 'Terbaru',
    });
  } catch (error) {
    if (silent) {
      patchState({
        ...packageInfoPatch(info),
        phase: 'idle',
        release: null,
        percent: 0,
      });
      return;
    }

    patchState({
      ...packageInfoPatch(info),
      phase: 'error',
      release: null,
      percent: 0,
      errorMessage: kolamPackageUpdateErrorMessage(error, 'Gagal cek'),
    });
  }
}

async function runInstall(release: KolamPackageReleaseManifest) {
  ensureProgressSubscription();
  patchState({
    phase: 'downloading',
    percent: 0,
    errorMessage: '',
  });

  try {
    const downloaded = await downloadKolamWindowsMsix({
      url: release.url,
      sha512: release.sha512,
      sha256: release.sha256,
      size: release.size,
      fileName: release.artifact,
    });

    patchState({
      phase: 'installing',
      percent: 0,
    });
    const installed = await installKolamWindowsMsix(downloaded.path);
    if (installed.fallback) {
      patchState({
        phase: 'idle',
        percent: 0,
        errorMessage: 'Lanjut di App Installer',
      });
      return;
    }
    await restartKolamWindowsApp();
  } catch (error) {
    patchState({
      phase: 'error',
      percent: 0,
      errorMessage: kolamPackageUpdateErrorMessage(error, 'Gagal pasang'),
    });
  }
}

function ensureProgressSubscription() {
  if (progressUnsubscribe) {
    return;
  }

  progressUnsubscribe = subscribeKolamWindowsPackageUpdateProgress({
    onDownload: progress => {
      if (state.phase === 'downloading') {
        patchState({percent: clampPercent(progress.percent)});
      }
    },
    onInstall: progress => {
      if (state.phase === 'installing') {
        patchState({percent: clampPercent(progress.percent)});
      }
    },
  });
}

function packageInfoPatch(info: KolamPackageInfo): Partial<KolamPackageUpdateState> {
  return {
    currentVersion: info.publicVersion,
    packaged: info.packaged,
  };
}

function patchState(patch: Partial<KolamPackageUpdateState>) {
  state = {
    ...state,
    ...patch,
  };
  listeners.forEach(listener => listener());
}

function createIdleState(): KolamPackageUpdateState {
  return {
    currentVersion: '',
    errorMessage: '',
    packaged: false,
    percent: 0,
    phase: 'idle',
    release: null,
  };
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}
