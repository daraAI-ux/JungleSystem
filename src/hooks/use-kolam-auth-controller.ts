import {useEffect, useMemo, useState} from 'react';
import {
  getAccessScope,
  getAuthSource,
  type AuthSource,
} from '../domain/auth';
import {
  getUserDisplayName,
  clearAuthSessionHandlers,
  registerAuthSessionHandlers,
  restoreAuthSessionFromStore,
  getStaffOtpLoginConfig,
  requestStaffLoginOtp,
  signIn,
  signOut,
  signOutRemote,
  verifyStaffLoginOtp,
  type AuthSession,
  type SignedInUser,
  type StaffOtpLoginConfig,
} from '../services/auth-api';

const INITIAL_AUTH_MESSAGE =
  'Mode server existing siap. Seed hanya fallback UI/test.';

export type KolamAuthLoginMode = 'password' | 'otp';
export type KolamAuthOtpStep = 'email' | 'code';

export function useKolamAuthController() {
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authOtpCode, setAuthOtpCode] = useState('');
  const [authLoginMode, setAuthLoginMode] =
    useState<KolamAuthLoginMode>('password');
  const [authOtpStep, setAuthOtpStep] = useState<KolamAuthOtpStep>('email');
  const [authOtpConfig, setAuthOtpConfig] =
    useState<StaffOtpLoginConfig | null>(null);
  const [authSource, setAuthSource] = useState<AuthSource>('kolam');
  const [authUser, setAuthUser] = useState<SignedInUser | null>(null);
  const [authMessage, setAuthMessage] = useState(INITIAL_AUTH_MESSAGE);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);

  const accessScope = useMemo(() => getAccessScope(authUser), [authUser]);
  const displayName = getUserDisplayName(authUser);
  const authSourceHint = getAuthSource(authSource).description;

  useEffect(() => {
    registerAuthSessionHandlers(() => {
      signOut();
      setAuthUser(null);
      setAuthPassword('');
      setAuthMessage(
        'Sesi login berakhir. Silakan login lagi untuk melanjutkan.',
      );
    });

    return clearAuthSessionHandlers;
  }, []);

  useEffect(() => {
    let cancelled = false;

    restoreAuthSessionFromStore()
      .then(session => {
        if (cancelled || !session) {
          return;
        }

        setAuthUser(session.user);
        setAuthSource(session.source);
        setAuthMessage(
          `Sesi ${getAuthSource(session.source).label} dipulihkan: ${getUserDisplayName(session.user)}`,
        );
      })
      .catch(error => {
        if (cancelled) {
          return;
        }

        setAuthMessage(
          error instanceof Error
            ? `Sesi server tidak bisa dipulihkan: ${error.message}`
            : 'Sesi server tidak bisa dipulihkan.',
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    getStaffOtpLoginConfig()
      .then(config => {
        if (!cancelled) {
          setAuthOtpConfig(config);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAuthOtpConfig({enabled: false, otpExpireMinutes: 10, resendCooldownSeconds: 60});
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authSource !== 'kolam' && authLoginMode === 'otp') {
      setAuthLoginMode('password');
      setAuthOtpStep('email');
      setAuthOtpCode('');
    }
  }, [authLoginMode, authSource]);

  const handleSignIn = async (): Promise<AuthSession | null> => {
    if (!authEmail || !authPassword) {
      setAuthMessage('Email dan password wajib diisi.');
      return null;
    }

    setIsSigningIn(true);
    try {
      const session = await signIn({
        email: authEmail,
        password: authPassword,
        source: authSource,
      });
      setAuthUser(session.user);
      setAuthPassword('');
      setAuthMessage(
        `Login ${getAuthSource(session.source).label} berhasil: ${getUserDisplayName(session.user)}`,
      );
      return session;
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : 'Login gagal.');
      return null;
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleRequestOtp = async () => {
    const email = authEmail.trim();
    if (!email) {
      setAuthMessage('Email wajib diisi untuk OTP.');
      return;
    }

    setIsRequestingOtp(true);
    try {
      const result = await requestStaffLoginOtp(email);
      setAuthOtpStep('code');
      setAuthOtpCode('');
      setAuthMessage(result.message || 'Kode OTP telah dikirim.');
    } catch (error) {
      setAuthMessage(
        error instanceof Error ? error.message : 'Gagal mengirim OTP.',
      );
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleVerifyOtp = async (): Promise<AuthSession | null> => {
    const email = authEmail.trim();
    const otpCode = authOtpCode.replace(/\D/g, '').slice(0, 6);
    if (!email) {
      setAuthMessage('Email wajib diisi untuk OTP.');
      return null;
    }
    if (otpCode.length !== 6) {
      setAuthMessage('Masukkan kode OTP 6 digit.');
      return null;
    }

    setIsSigningIn(true);
    try {
      const session = await verifyStaffLoginOtp({
        email,
        otpCode,
        source: 'kolam',
      });
      setAuthUser(session.user);
      setAuthPassword('');
      setAuthOtpCode('');
      setAuthOtpStep('email');
      setAuthLoginMode('password');
      setAuthMessage(
        `Login ${getAuthSource(session.source).label} berhasil: ${getUserDisplayName(session.user)}`,
      );
      return session;
    } catch (error) {
      setAuthMessage(
        error instanceof Error ? error.message : 'Verifikasi OTP gagal.',
      );
      return null;
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOutRemote().catch(() => {
      signOut();
    });
    setAuthUser(null);
    setAuthMessage('Logout. Sesi server dilepas; fallback UI/test tetap tersedia.');
  };

  return {
    accessScope,
    authEmail,
    authLoginMode,
    authMessage,
    authOtpCode,
    authOtpConfig,
    authOtpStep,
    authPassword,
    authSource,
    authSourceHint,
    authUser,
    displayName,
    handleRequestOtp,
    handleSignIn,
    handleSignOut,
    handleVerifyOtp,
    isRequestingOtp,
    isSigningIn,
    setAuthEmail,
    setAuthLoginMode,
    setAuthMessage,
    setAuthOtpCode,
    setAuthOtpStep,
    setAuthPassword,
    setAuthSource,
  };
}
