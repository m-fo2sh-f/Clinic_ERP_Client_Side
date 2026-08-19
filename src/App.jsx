import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BranchProvider } from './context/BranchContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppRoutes from './routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10, // 👈 جعل البيانات طازجة لمدة 10 ثواني (تمنع عاصفة الريكويستات)
      gcTime: 1000 * 60 * 5, // الاحتفاظ بالتايم في الكاش لمدة 5 دقائق
      refetchOnWindowFocus: false,
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
          </ErrorBoundary>
        </BrowserRouter>
      </BranchProvider>
    </QueryClientProvider>
  );
}

export default App;
