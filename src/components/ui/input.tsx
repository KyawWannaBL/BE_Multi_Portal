import React from "react";
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className = "", ...props }, ref) => {
  return <input ref={ref} className={`w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-emerald-500/40 ${className}`} {...props} />;
});
Input.displayName = "Input";
