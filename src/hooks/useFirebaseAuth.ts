import { useState } from "react";

export function useAuth() {
  const [user] = useState(null);
  const [loading] = useState(false);

  return {
    user,
    loading,
    login: async () => {},
    logout: async () => {},
    register: async () => {},
  };
}