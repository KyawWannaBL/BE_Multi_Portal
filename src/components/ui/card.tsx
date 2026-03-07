import React from "react";
export const Card = ({ children, className = "" }: any) => <div className={`border border-white/10 rounded-3xl bg-[#0B101B] ${className}`}>{children}</div>;
export const CardContent = ({ children, className = "" }: any) => <div className={`p-6 ${className}`}>{children}</div>;
export const CardHeader = ({ children, className = "" }: any) => <div className={`p-6 pb-2 ${className}`}>{children}</div>;
export const CardTitle = ({ children, className = "" }: any) => <h3 className={`font-black uppercase tracking-widest ${className}`}>{children}</h3>;
