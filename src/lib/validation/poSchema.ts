import { z } from "zod";

export const poLineSchema = z.object({
  id: z.string(),
  warehouseId: z.string().min(1, "Warehouse is required"),
  itemId: z.string().min(1, "Item is required"),
  itemCode: z.string(),
  description: z.string(),
  unit: z.string(),
  closingStock: z.number(),
  reorderLevel: z.number(),
  qty: z.coerce.number().positive("Quantity must be greater than 0"),
  rate: z.coerce.number().positive("Rate must be greater than 0"),
  otherDiscount: z.coerce.number().min(0).default(0),
  gross: z.number(),
  taxableValue: z.number(),
  cgst: z.number(),
  igst: z.number(),
  brand: z.string(),
  itemGroup: z.string(),
  division: z.string(),
});

export const poSchema = z.object({
  purchaseType: z.string().min(1, "Type of Purchase is required"),
  vendorId: z.string().min(1, "Vendor is required"),
  vendorName: z.string(),
  location: z.string().min(1),
  supplierRefNo: z.string().optional().default(""),
  destination: z.string().min(1),
  docDate: z.string().min(1, "Date is required"),
  voucherPrefix: z.string().min(1, "Voucher prefix is required"),
  paymentTerms: z.string().optional().default(""),
  narration: z.string().optional().default(""),
  termsOfDelivery: z.string().optional().default(""),
  placeOfSupply: z.string().min(1),
  status: z.enum(["draft", "pending_approval", "approved", "rejected", "cancelled"]),
  lines: z.array(poLineSchema).min(1, "Add at least one line item"),
  netTotal: z.number(),
});

export type PoFormValues = z.infer<typeof poSchema>;
