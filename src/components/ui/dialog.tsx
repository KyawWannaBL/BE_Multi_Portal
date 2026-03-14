import React from "react";
export const Dialog = ({ children, open }: any) => open ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">{children}</div> : null;
export const DialogContent = ({ children, className = "" }: any) => <div className={`bg-[#0B101B] border border-white/10 rounded-3xl p-6 w-full max-w-lg ${className}`}>{children}</div>;
export const DialogHeader = ({ children }: any) => <div className="mb-4">{children}</div>;
export const DialogTitle = ({ children }: any) => <h2 className="text-lg font-black uppercase tracking-widest text-white">{children}</h2>;
export const DialogFooter = ({ children }: any) => <div className="mt-6 flex justify-end gap-2">{children}</div>;
