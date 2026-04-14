import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
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

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const Dashboard          = lazy(() => import("./pages/Dashboard"));
const LinksPage          = lazy(() => import("./pages/LinksPage"));
const LinkEditor         = lazy(() => import("./pages/LinkEditor"));
const PublicLinkPage     = lazy(() => import("./pages/PublicLinkPage"));
const SettingsPage       = lazy(() => import("./pages/SettingsPage"));
const AuthPage           = lazy(() => import("./pages/AuthPage"));
const ResetPasswordPage  = lazy(() => import("./pages/ResetPasswordPage"));
const LandingPage        = lazy(() => import("./pages/LandingPage"));
const AnalyticsPage      = lazy(() => import("./pages/AnalyticsPage"));
const VideoaulasPage     = lazy(() => import("./pages/VideoaulasPage"));
const SupportPage        = lazy(() => import("./pages/SupportPage"));
const NotFound           = lazy(() => import("./pages/NotFound"));

// Admin pages
const AdminDashboardPage  = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminUsersPage      = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminAnalyticsPage  = lazy(() => import("./pages/admin/AdminAnalyticsPage"));
const AdminVideoaulasPage = lazy(() => import("./pages/admin/AdminVideoaulasPage"));
const AdminSupportPage    = lazy(() => import("./pages/admin/AdminSupportPage"));

// ─── Shared QueryClient ───────────────────────────────────────────────────────
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

// ─── Loaders ─────────────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

// ─── Home route helpers (need AuthProvider, live inside AppLayout) ────────────
function HomeContent() {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

function HomeRoute() {
  const { loading } = useAuth();
  if (loading) return <PageLoader />;
  return <HomeContent />;
}

// ─── PublicLayout — minimal, no auth / theme / toaster ───────────────────────
// QueryClientProvider and HelmetProvider are hoisted above RouterProvider in App.

/** Tiny inline spinner for public-page lazy-load — avoids the full PageLoader weight. */
function PublicFallback() {
  return (
    <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#7c3aed" }} />
    </div>
  );
}

function PublicLayout() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PublicFallback />}>
        <Outlet />
      </Suspense>
    </ErrorBoundary>
  );
}

// ─── AppLayout — full provider stack for dashboard / admin / landing ─────────
function AppLayout() {
  const location = useLocation();
  return (
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              {/*
               * Outlet is keyed by pathname so AnimatePresence can track
               * unmount/mount and run PageTransition exit animations.
               */}
              <AnimatePresence mode="wait">
                <Outlet key={location.pathname} />
              </AnimatePresence>
            </Suspense>
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────
// React Router v6 scores routes by specificity: static segments beat dynamic
// ones, so /auth, /dashboard, etc. always win over /:slug. Public routes are
// declared first but only match paths that the AppLayout routes don't claim.
const router = createBrowserRouter([
  // ── PUBLIC — lightweight layout (no AuthProvider, ThemeProvider, etc.) ──
  {
    element: <PublicLayout />,
    children: [
      { path: "/:slug/:pageSlug", element: <PublicLinkPage /> },
      { path: "/:slug",           element: <PublicLinkPage /> },
    ],
  },

  // ── APP — full provider stack ────────────────────────────────────────────
  {
    element: <AppLayout />,
    children: [
      { path: "/",               element: <HomeRoute /> },

      // Public auth routes
      { path: "/auth",           element: <PageTransition><AuthPage /></PageTransition> },
      { path: "/reset-password", element: <PageTransition><ResetPasswordPage /></PageTransition> },

      // Protected routes
      { path: "/dashboard",      element: <ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute> },
      { path: "/links",          element: <ProtectedRoute><PageTransition><LinksPage /></PageTransition></ProtectedRoute> },
      { path: "/links/new",      element: <ProtectedRoute><PageTransition><LinkEditor /></PageTransition></ProtectedRoute> },
      { path: "/links/:id/edit", element: <ProtectedRoute><PageTransition><LinkEditor /></PageTransition></ProtectedRoute> },
      { path: "/settings",       element: <ProtectedRoute><PageTransition><SettingsPage /></PageTransition></ProtectedRoute> },
      { path: "/analytics",      element: <ProtectedRoute><PageTransition><AnalyticsPage /></PageTransition></ProtectedRoute> },
      { path: "/plans",          element: <Navigate to="/" replace /> },
      { path: "/videoaulas",     element: <ProtectedRoute><PageTransition><VideoaulasPage /></PageTransition></ProtectedRoute> },
      { path: "/suporte",        element: <ProtectedRoute><PageTransition><SupportPage /></PageTransition></ProtectedRoute> },

      // Admin routes
      { path: "/admin",               element: <AdminRoute><PageTransition><AdminDashboardPage /></PageTransition></AdminRoute> },
      { path: "/admin/users",         element: <AdminRoute><PageTransition><AdminUsersPage /></PageTransition></AdminRoute> },
      { path: "/admin/analytics",     element: <AdminRoute><PageTransition><AdminAnalyticsPage /></PageTransition></AdminRoute> },
      { path: "/admin/videoaulas",    element: <AdminRoute><PageTransition><AdminVideoaulasPage /></PageTransition></AdminRoute> },
      { path: "/admin/suporte",       element: <AdminRoute><PageTransition><AdminSupportPage /></PageTransition></AdminRoute> },

      { path: "*",               element: <NotFound /> },
    ],
  },
]);

// ─── Root ─────────────────────────────────────────────────────────────────────
// HelmetProvider and QueryClientProvider are above the router so both layouts
// share the same query cache and Helmet context.
const App = () => (
  <HelmetProvider>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  </HelmetProvider>
);

export default App;
