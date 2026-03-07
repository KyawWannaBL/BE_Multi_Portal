import React from "react";
export const Badge = ({ children, className = "" }: any) => <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${className}`}>{children}</span>;
