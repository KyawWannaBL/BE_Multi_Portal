import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/lib/index";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Simple loading component
const LoadingSpinner = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

// Lazy load components to identify which one might be causing issues
const Login = lazy(() => import("@/pages/Login"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const Dashboard = lazy(() => import("@/pages/DashboardNew"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LanguageProvider>
            <BrowserRouter>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path={ROUTE_PATHS.LOGIN} element={<Login />} />
                  <Route path={ROUTE_PATHS.SIGNUP} element={<SignUp />} />
                  
                  {/* Dashboard Route */}
                  <Route path={ROUTE_PATHS.DASHBOARD} element={<Dashboard />} />
                  
                  {/* Fallback */}
                  <Route path="*" element={<Navigate to={ROUTE_PATHS.LOGIN} replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </LanguageProvider>
          <Toaster />
          <Sonner position="top-right" expand={false} richColors />
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
}