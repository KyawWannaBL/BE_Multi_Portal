import React from "react";

type DeliveryTableProps = {
  data: any[];
  type?: string;
  onRowClick?: (row: any) => void;
};

export function DeliveryTable({ data, onRowClick }: DeliveryTableProps) {
  if (!data?.length) {
    return <div className="py-8 text-sm text-muted-foreground">No records found.</div>;
  }

  const columns = Object.keys(data[0] || {});

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50">
          <tr>
            {columns.map((key) => (
              <th key={key} className="px-4 py-3 font-medium">
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              className="cursor-pointer border-t hover:bg-muted/30"
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((key) => (
                <td key={key} className="px-4 py-3">
                  {String(row[key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DeliveryTable;