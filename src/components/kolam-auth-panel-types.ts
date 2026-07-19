import type {
  AccessScope,
  AuthSource,
  AuthSourceDescriptor,
} from '../domain/auth';

export interface KolamAuthPanelProps {
  accessScope: AccessScope;
  amApiBaseUrl: string;
  authEmail: string;
  authMessage: string;
  authPassword: string;
  authSource: AuthSource;
  authSourceHint: string;
  authSources: AuthSourceDescriptor[];
  displayName: string;
  isSigningIn: boolean;
  onAmApiBaseUrlChange: (value: string) => void;
  onAuthEmailChange: (value: string) => void;
  onAuthPasswordChange: (value: string) => void;
  onAuthSourceChange: (source: AuthSource) => void;
  onLogin: () => void;
  onLogout: () => void;
  onSync: () => void;
}
