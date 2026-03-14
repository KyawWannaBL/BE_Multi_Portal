import React from 'react';
import InvoiceTemplate from './InvoiceTemplate';

interface BulkPrintProps {
  orders: any[];
  paperSize: '4x6' | 'A4';
  branchCode: string;
}

export default function BulkInvoiceRenderer({ orders, paperSize, branchCode }: BulkPrintProps) {
  return (
    <div id="bulk-print-container" className="bg-white">
      {orders.map((order, index) => (
        <div key={index} className="print-page-break">
          <InvoiceTemplate data={{
            id: `BTM-${Math.floor(1000 + Math.random() * 9000)}`,
            sender: "Merchant Store",
            recipient: order.recipientName || "Customer",
            route: `Branch to ${order.destination || "Destination"}`,
            weight: order.weight || 1,
            total: order.itemPrice || 0,
            date: new Date().toLocaleDateString(),
            branchCode: branchCode,
            paperSize: paperSize
          }} />
          {/* Force a CSS page break between invoices */}
          <div style={{ pageBreakAfter: 'always', height: '0px' }} />
        </div>
      ))}
    </div>
  );
}
