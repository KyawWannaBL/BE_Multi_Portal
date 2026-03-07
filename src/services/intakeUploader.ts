// @ts-nocheck
export const uploadParcelsFromIntake = async (rows: any[], defaults: any) => rows.map(r => ({ ok: true, awb: r.awb, status: "CREATED", shipmentId: "MOCK" }));
