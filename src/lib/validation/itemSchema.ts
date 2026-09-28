import { z } from "zod";

export const itemSchema = z.object({
  itemCode: z.string().min(1, "Item code is required"),
  description: z.string().min(1, "Description is required"),
  brand: z.string().min(1, "Brand is required"),
  itemGroup: z.string().min(1, "Item group is required"),
  division: z.string().min(1, "Division is required"),
  unit: z.string().min(1, "Unit is required"),
  batchControl: z.boolean(),
  expiryControl: z.boolean(),
  closingStock: z.coerce.number().min(0, "Cannot be negative"),
  reorderLevel: z.coerce.number().min(0, "Cannot be negative"),
  lastPoRate: z.coerce.number().min(0, "Cannot be negative"),
  priceBookRate: z.coerce.number().min(0, "Cannot be negative"),
});

export type ItemFormValues = z.infer<typeof itemSchema>;
