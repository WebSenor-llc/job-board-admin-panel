import { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/layout/AuthLayout";
import { AppLayout } from "@/layout/AppLayout";
import { LoadingSpinner } from "@/components/lib/LoadingSpinner";
import { useAuthStore } from "@/stores/authStore";
import allRoutes from "@/routes/routes";
import routePath from "@/routes/routePath";

const queryClient = new QueryClient();

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={routePath.AUTH.LOGIN} state={{ from: location }} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

// Auth Route Wrapper (redirects to dashboard if already authenticated)
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={routePath.DASHBOARD} replace />;
  }

  return <AuthLayout>{children}</AuthLayout>;
};

// Route Renderer
const RouteRenderer = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size={40} text="Loading..." />
        </div>
      }
    >
      <Routes>
        {allRoutes.map((route) => {
          const element = route.isAuthRoute ? (
            <AuthRoute>{route.element}</AuthRoute>
          ) : (
            <ProtectedRoute>{route.element}</ProtectedRoute>
          );

          return <Route key={route.path} path={route.path} element={element} />;
        })}
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteRenderer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
