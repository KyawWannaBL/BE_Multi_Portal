import React from 'react';

export default function DataTable({ data = [], columns = [] }: any) {
  return (
    <div className="overflow-x-auto bg-[#05080F]/80 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-white/5 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-white/5">
          <tr>
            {columns.map((col: any, i: number) => (
              <th key={i} className="px-6 py-4">{col.header || col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length || 1} className="px-6 py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                No data available in this view.
              </td>
            </tr>
          ) : (
            data.map((row: any, rowIndex: number) => (
              <tr key={rowIndex} className="border-b border-white/5 hover:bg-emerald-500/5 transition-colors group">
                {columns.map((col: any, colIndex: number) => (
                  <td key={colIndex} className="px-6 py-4 font-medium group-hover:text-white transition-colors">
                    {row[col.accessor || col] || '-'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
