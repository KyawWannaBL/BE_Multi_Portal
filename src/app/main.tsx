import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "../index.css";
import "@/i18n";
import ErrorBoundary from "@/components/ErrorBoundary";
import { RbacProvider } from "@/app/providers/RbacProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RbacProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </RbacProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
