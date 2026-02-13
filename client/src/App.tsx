import React, { useEffect } from 'react';
import { useConnectionStore } from './store/connectionStore';
import ConnectionForm from './components/connection/ConnectionForm';
import AppShell from './components/layout/AppShell';

export default function App() {
  const { connected, checkStatus } = useConnectionStore();

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  if (!connected) {
    return <ConnectionForm />;
  }

  return <AppShell />;
}
