import { useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// Minimal interface for tracking data to remain self-contained
interface TrackingData {
  id: string;
  awb_number?: string;
  trackingNumber?: string;
  [key: string]: unknown;
}

// Supabase client initialization using standard Vite environment variables
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

/**
 * Custom hook for QR code lifecycle management and Supabase integration.
 * Handles payload generation, usage tracking (auditing), and browser interactions (download/print).
 * 
 * @returns {Object} Methods and state for QR code operations
 */
export function useQRCode() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Formats shipment data into a standardized JSON string payload for the QR code.
   */
  const getShipmentPayload = useCallback((shipment: TrackingData) => {
    return JSON.stringify({
      v: '1.0',
      type: 'SHIPMENT',
      id: shipment.id,
      awb: shipment.awb_number || shipment.trackingNumber,
      ts: new Date().toISOString(),
      sys: 'FLEET_OS_2026'
    });
  }, []);

  /**
   * Logs QR code activity to Supabase for auditing, security, and operational analytics.
   * Assumes existence of 'shipment_qr_activity' table.
   */
  const trackActivity = useCallback(async (
    shipmentId: string, 
    action: 'GENERATE' | 'PRINT' | 'DOWNLOAD' | 'SCAN',
    metadata?: Record<string, unknown>
  ) => {
    setIsProcessing(true);
    setError(null);
    try {
      const { error: supabaseError } = await supabase
        .from('shipment_qr_activity')
        .insert([{
          shipment_id: shipmentId,
          action,
          metadata: metadata || {},
          created_at: new Date().toISOString(),
          client_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform
          }
        }]);

      if (supabaseError) throw supabaseError;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to log QR activity';
      setError(message);
      console.error(`[useQRCode] ${action} tracking failed:`, err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Triggers a browser download of a QR code rendered in a canvas element.
   */
  const downloadQRCode = useCallback((canvasId: string, fileName: string) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      setError('QR Canvas element not found');
      return;
    }

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to process QR image for download');
      console.error('[useQRCode] Download error:', err);
    }
  }, []);

  /**
   * Generates a print-optimized document for the QR code and opens the system print dialog.
   */
  const printQRCode = useCallback((canvasId: string, label: string) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      setError('QR Canvas element not found');
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      setError('Print window blocked by browser pop-up settings');
      return;
    }

    // Create a high-contrast, professional print layout
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shipment Label - ${label}</title>
          <style>
            @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&family=JetBrains+Mono&display=swap");
            @page { size: auto; margin: 20mm; }
            body { 
              margin: 0; 
              padding: 0;
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              font-family: "Inter", sans-serif;
              color: #000;
              background: #fff;
            }
            .container {
              border: 4px solid #000;
              padding: 40px;
              text-align: center;
              border-radius: 12px;
            }
            img {
              width: 320px;
              height: 320px;
              margin-bottom: 24px;
            }
            .tracking-number {
              font-family: "JetBrains Mono", monospace;
              font-size: 32px;
              font-weight: 800;
              letter-spacing: 0.1em;
              margin-bottom: 8px;
            }
            .sub-label {
              font-size: 14px;
              color: #555;
              text-transform: uppercase;
              font-weight: 600;
              letter-spacing: 0.05em;
            }
            .footer {
              margin-top: 40px;
              font-size: 10px;
              color: #999;
              border-top: 1px solid #eee;
              padding-top: 10px;
              width: 100%;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${dataUrl}" alt="Shipment QR" />
            <div class="tracking-number">${label}</div>
            <div class="sub-label">Official Shipment Tracking Code</div>
            <div class="footer">Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} © 2026 Logistics Platform OS</div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, []);

  return {
    isProcessing,
    error,
    getShipmentPayload,
    trackActivity,
    downloadQRCode,
    printQRCode
  };
}
