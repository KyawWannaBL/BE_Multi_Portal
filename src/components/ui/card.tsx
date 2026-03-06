import React from "react";
export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={`rounded-2xl border border-white/10 bg-[#0B101B] ${className}`} {...props} />; }
export function CardHeader({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={`p-6 pb-2 ${className}`} {...props} />; }
export function CardTitle({ className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) { return <h3 className={`text-lg font-black tracking-widest uppercase ${className}`} {...props} />; }
export function CardContent({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={`p-6 pt-2 ${className}`} {...props} />; }
