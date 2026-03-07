import React from "react";
export const Button = ({ children, className = "", ...props }: any) => (
  <button className={`inline-flex items-center justify-center rounded-xl font-bold p-2 bg-emerald-600 text-white ${className}`} {...props}>{children}</button>
);
