import {useEffect, useMemo, useState} from 'react';
import {
  getAccessScope,
  getAuthSource,
  type AuthSource,
} from '../domain/auth';
import {
  getUserDisplayName,
  restoreAuthSessionFromStore,
  signIn,
  signOut,
  signOutRemote,
  type AuthSession,
  type SignedInUser,
} from '../services/auth-api';

const INITIAL_AUTH_MESSAGE =
  'Mode server existing siap. Seed hanya fallback UI/test.';

export function useKolamAuthController() {
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authSource, setAuthSource] = useState<AuthSource>('kolam');
  const [authUser, setAuthUser] = useState<SignedInUser | null>(null);
  const [authMessage, setAuthMessage] = useState(INITIAL_AUTH_MESSAGE);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const accessScope = useMemo(() => getAccessScope(authUser), [authUser]);
  const displayName = getUserDisplayName(authUser);
  const authSourceHint = getAuthSource(authSource).description;

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
    authMessage,
    authPassword,
    authSource,
    authSourceHint,
    authUser,
    displayName,
    handleSignIn,
    handleSignOut,
    isSigningIn,
    setAuthEmail,
    setAuthMessage,
    setAuthPassword,
    setAuthSource,
  };
}
