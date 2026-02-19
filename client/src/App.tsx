import React, { useEffect, useState } from 'react';
import { useConnectionStore } from './store/connectionStore';
import { isAuthenticated } from './api/client';
import LoginScreen from './components/auth/LoginScreen';
import ConnectionForm from './components/connection/ConnectionForm';
import AppShell from './components/layout/AppShell';

export default function App() {
  const { connected, checkStatus } = useConnectionStore();
  const [appAuthenticated, setAppAuthenticated] = useState(() => isAuthenticated());

  useEffect(() => {
    if (appAuthenticated) {
      checkStatus();
    }
  }, [appAuthenticated, checkStatus]);

  useEffect(() => {
    const handleExpiry = () => setAppAuthenticated(false);
    window.addEventListener('auth:expired', handleExpiry);
    return () => window.removeEventListener('auth:expired', handleExpiry);
  }, []);

  if (!appAuthenticated) {
    return <LoginScreen onSuccess={() => setAppAuthenticated(true)} />;
  }

  if (!connected) {
    return <ConnectionForm />;
  }

  return <AppShell />;
}
