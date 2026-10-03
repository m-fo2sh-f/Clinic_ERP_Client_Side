import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BranchProvider } from './context/BranchContext';
import ErrorBoundary from './components/ErrorBoundary';
import GlobalErrorToast from './components/ui/GlobalErrorToast';
import AppRoutes from './routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes default freshness
      gcTime: 1000 * 60 * 10, // 10 minutes cache garbage collection
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BranchProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <AppRoutes />
            <GlobalErrorToast />
          </ErrorBoundary>
        </BrowserRouter>
      </BranchProvider>
    </QueryClientProvider>
  );
}

export default App;
