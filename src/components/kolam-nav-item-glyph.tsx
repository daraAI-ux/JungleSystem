import React from 'react';
import type {ShellModule} from '../domain/app-shell';
import {KolamInlineFrame} from './kolam-inline-frame';
import {KolamModuleIcon} from './kolam-module-icon';
import {ModuleNavIcon} from './kolam-module-nav-icon';

export function KolamNavItemGlyph({
  active,
  module,
}: {
  active: boolean;
  module: ShellModule;
}) {
  return (
    <KolamInlineFrame variant="navItemGlyph">
      {module.moduleIcon ? (
        <KolamModuleIcon kind={module.moduleIcon} />
      ) : (
        <ModuleNavIcon kind={module.iconKind} active={active} />
      )}
    </KolamInlineFrame>
  );
}
