import {useEffect, useState} from 'react';
import {
  checkKolamPackageUpdate,
  getKolamPackageUpdateState,
  hydrateKolamPackageUpdateInfo,
  installKolamPackageUpdate,
  startKolamPackageUpdateAutoCheck,
  subscribeKolamPackageUpdate,
  type KolamPackageUpdateState,
} from '../domain/kolam-package-update-store';

export type KolamPackageUpdateController = KolamPackageUpdateState & {
  canInstall: boolean;
  check: () => Promise<void>;
  install: () => Promise<void>;
};

export function useKolamPackageUpdateController({
  autoCheck = false,
}: {
  autoCheck?: boolean;
} = {}): KolamPackageUpdateController {
  const [state, setState] = useState(getKolamPackageUpdateState);

  useEffect(() => subscribeKolamPackageUpdate(() => setState(getKolamPackageUpdateState())), []);

  useEffect(() => {
    void (async () => {
      await hydrateKolamPackageUpdateInfo();
      if (autoCheck) {
        await startKolamPackageUpdateAutoCheck();
      }
    })();
  }, [autoCheck]);

  const busy = state.phase === 'checking' || state.phase === 'downloading' ||
    state.phase === 'installing';

  return {
    ...state,
    canInstall:
      state.packaged &&
      state.phase === 'available' &&
      Boolean(state.release) &&
      !busy,
    check: () => checkKolamPackageUpdate({silent: false}),
    install: () => installKolamPackageUpdate(),
  };
}
