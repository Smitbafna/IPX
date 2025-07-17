'use client'

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import Plug wallet integration here if needed
import { AuthProvider } from '@/components/AuthProvider';



// Create QueryClient for React Query
const queryClient = new QueryClient();

// Combined Providers Component
interface ProvidersProps {
  children: ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  // Plug wallet connection logic
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.ic && window.ic.plug) {
      window.ic.plug.requestConnect().then((connected: boolean) => {
        if (connected) {
          // You can now use window.ic.plug.sessionManager.sessionData.principalId
          console.log('Plug wallet connected:', window.ic.plug.sessionManager.sessionData.principalId);
        }
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default Providers;