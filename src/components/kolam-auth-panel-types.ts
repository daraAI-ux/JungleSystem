import type {
  AccessScope,
  AuthSource,
  AuthSourceDescriptor,
} from '../domain/auth';
import type {
  KolamAuthLoginMode,
  KolamAuthOtpStep,
} from '../hooks/use-kolam-auth-controller';
import type {StaffOtpLoginConfig} from '../services/auth-api';

export interface KolamAuthPanelProps {
  accessScope: AccessScope;
  amApiBaseUrl: string;
  authEmail: string;
  authLoginMode?: KolamAuthLoginMode;
  authMessage: string;
  authOtpCode?: string;
  authOtpConfig?: StaffOtpLoginConfig | null;
  authOtpStep?: KolamAuthOtpStep;
  authPassword: string;
  authSource: AuthSource;
  authSourceHint: string;
  authSources: AuthSourceDescriptor[];
  displayName: string;
  isRequestingOtp?: boolean;
  isSigningIn: boolean;
  onAmApiBaseUrlChange: (value: string) => void;
  onAuthEmailChange: (value: string) => void;
  onAuthLoginModeChange?: (value: KolamAuthLoginMode) => void;
  onAuthOtpCodeChange?: (value: string) => void;
  onAuthOtpStepChange?: (value: KolamAuthOtpStep) => void;
  onAuthPasswordChange: (value: string) => void;
  onAuthSourceChange: (source: AuthSource) => void;
  onLogin: () => void;
  onLogout: () => void;
  onRequestOtp?: () => void;
  onSync: () => void;
  onVerifyOtp?: () => void;
}
