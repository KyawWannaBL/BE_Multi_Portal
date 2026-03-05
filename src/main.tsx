import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ConfigFault from "@/components/ConfigFault";
import { validateEnv } from "@/lib/env";

const env = validateEnv();
const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      {env.ok ? (
        <AuthProvider>
          <App />
        </AuthProvider>
      ) : (
        <ConfigFault missing={env.missing} />
      )}
    </ErrorBoundary>
  </React.StrictMode>
);