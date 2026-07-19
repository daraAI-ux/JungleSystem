import type {ShellModule} from '../domain/app-shell';

export interface KolamNavItemProps {
  active?: boolean;
  collapsed?: boolean;
  module: ShellModule;
  onPress: () => void;
}
