import { createContext, useContext, type ReactNode } from 'react';

type AppNavigationContextValue = {
  openTerms: () => void;
  closeTerms: () => void;
};

const AppNavigationContext = createContext<AppNavigationContextValue | null>(null);

type AppNavigationProviderProps = {
  children: ReactNode;
  openTerms: () => void;
  closeTerms: () => void;
};

export function AppNavigationProvider({ children, openTerms, closeTerms }: AppNavigationProviderProps) {
  return (
    <AppNavigationContext.Provider value={{ openTerms, closeTerms }}>
      {children}
    </AppNavigationContext.Provider>
  );
}

export function useAppNavigation() {
  const context = useContext(AppNavigationContext);
  if (!context) {
    throw new Error('useAppNavigation must be used within AppNavigationProvider');
  }
  return context;
}
