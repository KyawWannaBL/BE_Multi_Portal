/**
 * EN: Parcel photo capture hook
 * MM: Parcel photo capture hook
 */

import { useState } from "react";
import { exportParcelRowsToExcel, processParcelPhoto } from "../services/parcelPhotoWorkflowService";
import type { ParcelExcelRow, ParcelPhotoWorkflowInput } from "../types";

export function useParcelPhotoCapture() {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [rows, setRows] = useState<ParcelExcelRow[]>([]);

  async function captureAndProcess(input: ParcelPhotoWorkflowInput) {
    setLoading(true);
    try {
      const result = await processParcelPhoto(input);
      setLastResult(result);

      if (result?.ok && result?.excelRow) {
        setRows((prev) => [result.excelRow, ...prev]);
      }

      return result;
    } finally {
      setLoading(false);
    }
  }

  function clearRows() {
    setRows([]);
  }

  function exportExcel(fileName?: string) {
    exportParcelRowsToExcel(rows, fileName || "parcel-photo-extracts.xlsx");
  }

  return {
    loading,
    lastResult,
    rows,
    captureAndProcess,
    clearRows,
    exportExcel,
  };
}
