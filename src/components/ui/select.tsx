import React from "react";
export const Select = ({ children, value, onValueChange }: any) => (
  <div className="relative group w-full">
    <select 
      value={value} 
      onChange={(e) => onValueChange(e.target.value)}
      className="w-full h-11 px-4 rounded-xl border border-white/10 bg-black/40 text-sm text-white appearance-none outline-none focus:border-emerald-500/50"
    >
      {children}
    </select>
  </div>
);
export const SelectTrigger = ({ children }: any) => <>{children}</>;
export const SelectValue = ({ placeholder }: any) => null;
export const SelectContent = ({ children }: any) => <>{children}</>;
export const SelectItem = ({ children, value }: any) => <option value={value} className="bg-[#0B101B] text-white">{children}</option>;
