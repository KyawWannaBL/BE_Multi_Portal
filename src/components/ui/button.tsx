import React from "react";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost"; size?: "default" | "lg" | "sm"; };
export const Button = React.forwardRef<HTMLButtonElement, Props>(({ className = "", variant = "default", size = "default", ...props }, ref) => {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-black uppercase tracking-widest transition-colors disabled:opacity-50 disabled:pointer-events-none";
  const variants: Record<string, string> = { default: "bg-emerald-600 hover:bg-emerald-500 text-white", outline: "border border-white/10 bg-black/40 hover:bg-white/5 text-slate-200", ghost: "bg-transparent hover:bg-white/5 text-slate-200" };
  const sizes: Record<string, string> = { default: "h-11 px-4 text-xs", lg: "h-14 px-8 text-sm", sm: "h-9 px-3 text-[11px]" };
  return <button ref={ref} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />;
});
Button.displayName = "Button";
