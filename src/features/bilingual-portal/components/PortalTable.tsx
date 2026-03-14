import { useLanguage } from "@/contexts/LanguageContext";
import type { ColumnConfig } from "../types";

type Props = {
  columns: ColumnConfig[];
  rows: Record<string, unknown>[];
};

export default function PortalTable({ columns, rows }: Props) {
  const { language, bi } = useLanguage();

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-gold-500/20 bg-navy-900/50 p-6 text-sm text-gray-300">
        {bi("No records found.", "ဒေတာမရှိပါ")}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gold-500/20 bg-navy-900/50">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-navy-950/70">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 text-gold-400 font-semibold whitespace-nowrap">
                {column.label[language]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)} className="border-t border-gold-500/10">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-gray-200 whitespace-nowrap">
                  {String(row[column.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
