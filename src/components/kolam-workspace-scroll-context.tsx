import React from 'react';
import type {
  KolamWorkspaceScrollOwner,
  KolamWorkspaceScrollPolicy,
} from '../domain/kolam-workspace-scroll';

type ScrollToOptions = {
  animated?: boolean;
  x?: number;
  y?: number;
};

export type KolamWorkspaceScrollContextValue = {
  scrollOwner: KolamWorkspaceScrollOwner;
  scrollTo?: (options: ScrollToOptions) => void;
};

const defaultWorkspaceScrollContext: KolamWorkspaceScrollContextValue = {
  scrollOwner: 'workspace',
};

const KolamWorkspaceScrollContext =
  React.createContext<KolamWorkspaceScrollContextValue>(
    defaultWorkspaceScrollContext,
  );

export function KolamWorkspaceScrollProvider({
  children,
  policy,
  scrollTo,
}: {
  children: React.ReactNode;
  policy: KolamWorkspaceScrollPolicy;
  scrollTo?: (options: ScrollToOptions) => void;
}) {
  const value = React.useMemo<KolamWorkspaceScrollContextValue>(
    () => ({
      scrollOwner: policy.scrollOwner,
      scrollTo,
    }),
    [policy.scrollOwner, scrollTo],
  );

  return (
    <KolamWorkspaceScrollContext.Provider value={value}>
      {children}
    </KolamWorkspaceScrollContext.Provider>
  );
}

export function useKolamWorkspaceScrollContext() {
  return React.useContext(KolamWorkspaceScrollContext);
}
