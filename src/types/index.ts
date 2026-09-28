// Domain types — field names mirror the DB columns in the architecture spec
// (Cure-ERP-Architecture-Spec.md, section 3) so the API layer can be swapped
// from the mock store to the real Express/Prisma backend without renaming.

export type DocStatus = "draft" | "pending_approval" | "approved" | "rejected" | "cancelled";

export interface BaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isActive: boolean;
}

// ---- Master: Item ----
export interface Item extends BaseRecord {
  itemCode: string;
  description: string;
  brand: string;
  itemGroup: string;
  division: string;
  unit: string;
  batchControl: boolean; // sterile-item rule, see spec §4.5
  expiryControl: boolean;
  closingStock: number;
  reorderLevel: number;
  lastPoRate: number;
  priceBookRate: number;
}

// ---- Purchase Order — Domestic ----
export interface PoLine {
  id: string;
  warehouseId: string;
  itemId: string;
  itemCode: string;
  description: string;
  unit: string;
  closingStock: number;
  reorderLevel: number;
  qty: number;
  rate: number;
  otherDiscount: number;
  gross: number; // calculated: qty * rate
  taxableValue: number; // calculated: gross - discount
  cgst: number;
  igst: number;
  brand: string;
  itemGroup: string;
  division: string;
}

export interface PurchaseOrderDomestic extends BaseRecord {
  docNo: string;
  purchaseType: string;
  vendorId: string;
  vendorName: string;
  location: string;
  supplierRefNo: string;
  destination: string;
  docDate: string;
  voucherPrefix: string;
  paymentTerms: string;
  narration: string;
  termsOfDelivery: string;
  placeOfSupply: string;
  status: DocStatus;
  lines: PoLine[];
  netTotal: number;
}
