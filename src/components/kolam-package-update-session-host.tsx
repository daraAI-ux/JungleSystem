import {useKolamPackageUpdateController} from '../hooks/use-kolam-package-update-controller';

export function KolamPackageUpdateSessionHost() {
  useKolamPackageUpdateController({autoCheck: true});
  return null;
}
