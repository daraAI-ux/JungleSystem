import React from 'react';
import {KolamAppRoot} from './src/components/kolam-app-root';
import {KolamAppStateProvider} from './src/context/kolam-app-state-provider';

function App() {
  return (
    <KolamAppStateProvider>
      <KolamAppRoot />
    </KolamAppStateProvider>
  );
}

export default App;
