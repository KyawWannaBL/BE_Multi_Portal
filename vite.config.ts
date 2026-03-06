import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// EN: This alias allows imports like "@/pages/Login"
// MY: "@/" import များကို src ထဲသို့ တိုက်ရိုက်ချိတ်ဆက်ရန်
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
