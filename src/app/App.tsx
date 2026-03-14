import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "@/components/Layout";
import ProtectedRoute from "@/routes/ProtectedRoute";
import { protectedRoutes, publicRoutes } from "@/routes/routeRegistry";
import { useRbac } from "@/app/providers/RbacProvider";

function Loading() {
  return <div className="p-6 text-sm text-slate-600">Loading…</div>;
}

function HomeRedirect() {
  const { loading, profile } = useRbac();

  if (loading) return <Loading />;

  // not logged in -> go login
  if (!profile) return <Navigate to="/login" replace />;

  // logged in -> go role home (from Supabase view v_my_session_home)
  return <Navigate to={profile.home_path || "/dashboard"} replace />;
}

function NotFound() {
  return (
    <div className="p-6">
      <div className="text-xl font-semibold">404</div>
      <div className="text-sm text-slate-600 mt-1">Page not found.</div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Root */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Public routes */}
          {publicRoutes.map((r) => {
            const Component = r.element;
            return <Route key={r.path} path={r.path} element={<Component />} />;
          })}

          {/* Protected routes (Warehouse + Operations + Merchant + others) */}
          {protectedRoutes.map((r) => {
            const Component = r.element;
            return (
              <Route
                key={r.path}
                path={r.path}
                element={
                  <ProtectedRoute requiredPermissions={r.requiredPermissions}>
                    <Layout>
                      <Component />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            );
          })}

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
