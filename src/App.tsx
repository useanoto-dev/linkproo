import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PageTransition } from "./components/PageTransition";
import { Loader2 } from "lucide-react";

// Lazy-loaded pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const LinksPage = lazy(() => import("./pages/LinksPage"));
const LinkEditor = lazy(() => import("./pages/LinkEditor"));
const PublicLinkPage = lazy(() => import("./pages/PublicLinkPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const PlansPage = lazy(() => import("./pages/PlansPage"));
const VideoaulasPage = lazy(() => import("./pages/VideoaulasPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin pages
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalyticsPage"));
const AdminVideoaulasPage = lazy(() => import("./pages/admin/AdminVideoaulasPage"));
const AdminSupportPage = lazy(() => import("./pages/admin/AdminSupportPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

function HomeContent() {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

function HomeRoute() {
  const { loading } = useAuth();
  if (loading) return <PageLoader />;
  return <HomeContent />;
}

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomeRoute />} />

        {/* Public routes */}
        <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPasswordPage /></PageTransition>} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/links" element={<ProtectedRoute><PageTransition><LinksPage /></PageTransition></ProtectedRoute>} />
        <Route path="/links/new" element={<ProtectedRoute><PageTransition><LinkEditor /></PageTransition></ProtectedRoute>} />
        <Route path="/links/:id/edit" element={<ProtectedRoute><PageTransition><LinkEditor /></PageTransition></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><PageTransition><SettingsPage /></PageTransition></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><PageTransition><AnalyticsPage /></PageTransition></ProtectedRoute>} />
        <Route path="/plans" element={<ProtectedRoute><PageTransition><PlansPage /></PageTransition></ProtectedRoute>} />
        <Route path="/videoaulas" element={<ProtectedRoute><PageTransition><VideoaulasPage /></PageTransition></ProtectedRoute>} />
        <Route path="/suporte" element={<ProtectedRoute><PageTransition><SupportPage /></PageTransition></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><PageTransition><AdminDashboardPage /></PageTransition></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><PageTransition><AdminUsersPage /></PageTransition></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute><PageTransition><AdminAnalyticsPage /></PageTransition></AdminRoute>} />
        <Route path="/admin/videoaulas" element={<AdminRoute><PageTransition><AdminVideoaulasPage /></PageTransition></AdminRoute>} />
        <Route path="/admin/suporte" element={<AdminRoute><PageTransition><AdminSupportPage /></PageTransition></AdminRoute>} />

        {/* Public link pages — must be last so app routes take priority */}
        {/* No PageTransition here — these use getEntryVariants stagger per D-03 */}
        <Route path="/:slug/:pageSlug" element={<PublicLinkPage />} />
        <Route path="/:slug" element={<PublicLinkPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <HelmetProvider>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <AppRoutes />
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </HelmetProvider>
);

export default App;
