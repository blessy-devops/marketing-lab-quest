import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { UserProvider } from "@/contexts/UserContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LazyWrapper } from "@/components/ui/lazy-wrapper";
import { AppLayout } from "@/components/layout/AppLayout";

// Lazy load pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const ExperimentsList = lazy(() => import("@/pages/ExperimentsList"));
const ExperimentDetails = lazy(() => import("@/pages/ExperimentDetails"));
const NewExperiment = lazy(() => import("@/pages/NewExperiment"));
const EditExperiment = lazy(() => import("@/pages/EditExperiment"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Reports = lazy(() => import("@/pages/Reports"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const TiposExperimento = lazy(() => import("@/pages/admin/TiposExperimento"));
const Profile = lazy(() => import("@/pages/Profile"));
const Settings = lazy(() => import("@/pages/Settings"));

// Auth pages
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));

// Protected Layout Component
const ProtectedLayout = () => (
  <ProtectedRoute>
    <AppLayout>
      <Outlet />
    </AppLayout>
  </ProtectedRoute>
);

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="marketing-lab-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <UserProvider>
              <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route
                  path="/login"
                  element={
                    <LazyWrapper>
                      <Login />
                    </LazyWrapper>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <LazyWrapper>
                      <Signup />
                    </LazyWrapper>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <LazyWrapper>
                      <ForgotPassword />
                    </LazyWrapper>
                  }
                />

                {/* Protected Routes */}
                <Route path="/" element={<ProtectedLayout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route
                    path="dashboard"
                    element={
                      <LazyWrapper>
                        <Dashboard />
                      </LazyWrapper>
                    }
                  />
                  <Route
                    path="experimentos"
                    element={
                      <LazyWrapper>
                        <ExperimentsList />
                      </LazyWrapper>
                    }
                  />
                  <Route
                    path="experimentos/:id"
                    element={
                      <LazyWrapper>
                        <ExperimentDetails />
                      </LazyWrapper>
                    }
                  />
                  <Route
                    path="experimentos/:id/editar"
                    element={
                      <LazyWrapper>
                        <EditExperiment />
                      </LazyWrapper>
                    }
                  />
                  <Route
                    path="experimentos/novo"
                    element={
                      <LazyWrapper>
                        <NewExperiment />
                      </LazyWrapper>
                    }
                  />
                  <Route
                    path="analytics"
                    element={
                      <LazyWrapper>
                        <Analytics />
                      </LazyWrapper>
                    }
                  />
                  <Route
                    path="relatorios"
                    element={
                      <LazyWrapper>
                        <Reports />
                      </LazyWrapper>
                    }
                  />
                  <Route
                    path="galeria"
                    element={
                      <LazyWrapper>
                        <Gallery />
                      </LazyWrapper>
                    }
                  />
                  <Route
                    path="admin/tipos-experimento"
                    element={
                      <LazyWrapper>
                        <TiposExperimento />
                      </LazyWrapper>
                    }
                  />
                  <Route
                    path="perfil"
                    element={
                      <LazyWrapper>
                        <Profile />
                      </LazyWrapper>
                    }
                  />
                  <Route
                    path="configuracoes"
                    element={
                      <LazyWrapper>
                        <Settings />
                      </LazyWrapper>
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <LazyWrapper>
                        <NotFound />
                      </LazyWrapper>
                    }
                  />
                </Route>
              </Routes>
            </BrowserRouter>
            </UserProvider>
          </AuthProvider>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
