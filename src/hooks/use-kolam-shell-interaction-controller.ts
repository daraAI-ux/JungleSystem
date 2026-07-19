import type {Dispatch, SetStateAction} from 'react';
import type {CommandEntry} from '../domain/command-index';
import type {RuntimeAction} from '../domain/runtime-actions';

export function useKolamShellInteractionController({
  onCommand,
  onRuntimeAction,
  setIsAttentionPanelOpen,
  setIsCommandPaletteOpen,
  setIsUserMenuOpen,
}: {
  onCommand: (
    command: CommandEntry,
    onRuntimeAction: (action: RuntimeAction) => Promise<void>,
  ) => Promise<void>;
  onRuntimeAction: (action: RuntimeAction) => Promise<void>;
  setIsAttentionPanelOpen: Dispatch<SetStateAction<boolean>>;
  setIsCommandPaletteOpen: Dispatch<SetStateAction<boolean>>;
  setIsUserMenuOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const handleAttentionClose = () => {
    setIsAttentionPanelOpen(false);
  };

  const handleCommandPaletteClose = () => {
    setIsCommandPaletteOpen(false);
  };

  const handleCommandSelect = async (command: CommandEntry) => {
    await onCommand(command, onRuntimeAction);
  };

  const handleUserMenuClose = () => {
    setIsUserMenuOpen(false);
  };

  return {
    handleAttentionClose,
    handleCommandPaletteClose,
    handleCommandSelect,
    handleUserMenuClose,
  };
}
