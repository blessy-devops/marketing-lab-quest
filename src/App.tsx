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
import { 
  DashboardShellSkeleton,
  ExperimentsListShellSkeleton,
  ExperimentDetailsShellSkeleton,
  NewExperimentShellSkeleton,
  ReportsShellSkeleton,
  GalleryShellSkeleton
} from "@/components/ui/page-shell-skeleton";

// Lazy load pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const ExperimentsList = lazy(() => import("@/pages/ExperimentsList"));
const ExperimentDetails = lazy(() => import("@/pages/ExperimentDetails"));
const NewExperiment = lazy(() => import("@/pages/NewExperiment"));
const EditExperiment = lazy(() => import("@/pages/EditExperiment"));

const Reports = lazy(() => import("@/pages/Reports"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const Oraculo = lazy(() => import("@/pages/Oraculo"));
const OraculoRedirect = lazy(() => import("@/pages/OraculoRedirect"));
const Playbooks = lazy(() => import("@/pages/Playbooks"));
const Ferramentas = lazy(() => import("@/pages/Ferramentas"));
const CalculadoraEmail = lazy(() => import("@/pages/ferramentas/CalculadoraEmail"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const TiposExperimento = lazy(() => import("@/pages/admin/TiposExperimento"));
const GestaoCanais = lazy(() => import("@/pages/admin/GestaoCanais"));
const Profile = lazy(() => import("@/pages/Profile"));
const Settings = lazy(() => import("@/pages/Settings"));

// Auth pages
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const AcceptInvite = lazy(() => import("@/pages/AcceptInvite"));
const PublicExperiment = lazy(() => import("@/pages/PublicExperiment"));

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
                <Route
                  path="/convite"
                  element={
                    <LazyWrapper>
                      <AcceptInvite />
                    </LazyWrapper>
                  }
                />
                <Route
                  path="/share/:token"
                  element={
                    <LazyWrapper>
                      <PublicExperiment />
                    </LazyWrapper>
                  }
                />

                {/* Protected Routes */}
                <Route path="/" element={<ProtectedLayout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route
                    path="dashboard"
                    element={
                      <LazyWrapper fallback={<DashboardShellSkeleton />}>
                        <Dashboard />
                      </LazyWrapper>
                    }
                  />
                  <Route
                    path="experimentos"
                    element={
                      <LazyWrapper fallback={<ExperimentsListShellSkeleton />}>
                        <ExperimentsList />
                      </LazyWrapper>
                    }
                  />
                  <Route
                    path="experimentos/:id"
                    element={
                      <LazyWrapper fallback={<ExperimentDetailsShellSkeleton />}>
                        <ExperimentDetails />
                      </LazyWrapper>
                    }
                  />
                  <Route
                    path="experimentos/:id/editar"
                    element={
                      <LazyWrapper fallback={<NewExperimentShellSkeleton />}>
                        <EditExperiment />
                      </LazyWrapper>
                    }
                  />
                  <Route
                    path="experimentos/novo"
                    element={
                      <LazyWrapper fallback={<NewExperimentShellSkeleton />}>
                        <NewExperiment />
                      </LazyWrapper>
                    }
                  />
                  <Route
                    path="relatorios"
                    element={
                      <LazyWrapper fallback={<ReportsShellSkeleton />}>
                        <Reports />
                      </LazyWrapper>
                    }
                  />
                  <Route
                    path="galeria"
                    element={
                      <LazyWrapper fallback={<GalleryShellSkeleton />}>
                        <Gallery />
                      </LazyWrapper>
                    }
                  />
                  <Route
                    path="oraculo"
                    element={
                      <LazyWrapper>
                        <OraculoRedirect />
                      </LazyWrapper>
                    }
                  />
                  <Route
                    path="oraculo/:conversationId"
                    element={
                      <LazyWrapper>
                        <Oraculo />
                      </LazyWrapper>
                    }
                  />
                  <Route
                    path="playbooks"
                    element={
                      <LazyWrapper>
                        <Playbooks />
                      </LazyWrapper>
                    }
                  />
                  <Route
                    path="ferramentas"
                    element={
                      <LazyWrapper>
                        <Ferramentas />
                      </LazyWrapper>
                    }
                  />
                  <Route
                    path="ferramentas/calculadora-email"
                    element={
                      <LazyWrapper>
                        <CalculadoraEmail />
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
                    path="admin/canais"
                    element={
                      <LazyWrapper>
                        <GestaoCanais />
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
