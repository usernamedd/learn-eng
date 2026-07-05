import React, { createContext, useContext, useMemo } from 'react';
import { LocalConfigRepository } from './adapters/LocalConfigRepository';
import { WebTtsAdapter } from './adapters/WebTtsAdapter';
import { ConfigDomainService } from './services/ConfigDomainService';

interface AppServices {
  configService: ConfigDomainService;
  ttsAdapter: WebTtsAdapter;
}

const AppContext = createContext<AppServices | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const services = useMemo(() => {
    const configRepo = new LocalConfigRepository();
    const configService = new ConfigDomainService(configRepo);
    const ttsAdapter = new WebTtsAdapter();
    return { configService, ttsAdapter };
  }, []);

  return <AppContext.Provider value={services}>{children}</AppContext.Provider>;
}

export function useAppServices(): AppServices {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppServices must be used within AppProvider');
  return ctx;
}
