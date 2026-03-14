import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { enterpriseRoutes } from "./enterpriseRoutes";
import { PermissionGuard } from "@/features/auth/PermissionGuard";

function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="rounded-xl border p-6 text-center">
        <div className="text-xl font-semibold">Unauthorized</div>
        <div className="mt-2 text-sm text-muted-foreground">
          You do not have permission to access this page.
        </div>
      </div>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/way-management" replace />} />

        {enterpriseRoutes.map((route) => {
          const Page = route.element;
          return (
            <Route
              key={route.key}
              path={route.path}
              element={
                <PermissionGuard permission={route.permission}>
                  <Page />
                </PermissionGuard>
              }
            />
          );
        })}

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Routes>
    </BrowserRouter>
  );
}