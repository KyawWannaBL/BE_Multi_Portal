function escapeCsv(value) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function downloadBlob(blob, fileName) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToCsv(fileName, columns, rows) {
  const header = columns.map((c) => escapeCsv(c.header)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escapeCsv(row[c.key])).join(","))
    .join("\n");

  const blob = new Blob([header + "\n" + body], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, fileName.endsWith(".csv") ? fileName : `${fileName}.csv`);
}

export function exportToExcel(fileName, columns, rows) {
  const header = columns.map((c) => `<Cell><Data ss:Type="String">${String(c.header)}</Data></Cell>`).join("");
  const body = rows
    .map((row) => {
      const cells = columns
        .map((c) => `<Cell><Data ss:Type="String">${String(row[c.key] ?? "")}</Data></Cell>`)
        .join("");
      return `<Row>${cells}</Row>`;
    })
    .join("");

  const xml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Report">
  <Table>
   <Row>${header}</Row>
   ${body}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
  downloadBlob(blob, fileName.endsWith(".xls") ? fileName : `${fileName}.xls`);
}

export function printReport(title) {
  const previous = document.title;
  document.title = title;
  window.print();
  setTimeout(() => {
    document.title = previous;
  }, 300);
}
