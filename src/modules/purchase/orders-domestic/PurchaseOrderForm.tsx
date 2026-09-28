import { forwardRef, useEffect, useImperativeHandle } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Grid, TextField, MenuItem, Divider, Typography, Box } from "@mui/material";
import { poSchema, PoFormValues } from "@/lib/validation/poSchema";
import { PoLineItemsTable } from "./PoLineItemsTable";
import type { Item, PurchaseOrderDomestic } from "@/types";

export interface PurchaseOrderFormHandle {
  submit: () => void;
}

interface Props {
  defaultValues?: PurchaseOrderDomestic | null;
  items: Item[];
  onValid: (values: PoFormValues) => void;
}

const emptyDefaults: PoFormValues = {
  purchaseType: "Domestic",
  vendorId: "",
  vendorName: "",
  location: "DWN",
  supplierRefNo: "",
  destination: "MWN",
  docDate: new Date().toISOString().slice(0, 10),
  voucherPrefix: "PO",
  paymentTerms: "",
  narration: "",
  termsOfDelivery: "",
  placeOfSupply: "Delhi",
  status: "draft",
  lines: [],
  netTotal: 0,
};

// Demo vendor list — will come from the Vendor Master API in the real backend.
const VENDORS = [
  { id: "v1", name: "MedSupply Traders" },
  { id: "v2", name: "OrthoTech Industries" },
];

export const PurchaseOrderForm = forwardRef<PurchaseOrderFormHandle, Props>(({ defaultValues, items, onValid }, ref) => {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PoFormValues>({
    resolver: zodResolver(poSchema),
    defaultValues: defaultValues ?? emptyDefaults,
  });

  useEffect(() => {
    reset(defaultValues ?? emptyDefaults);
  }, [defaultValues, reset]);

  useImperativeHandle(ref, () => ({
    submit: () => handleSubmit(onValid, (errs) => console.warn("PO validation failed", errs))(),
  }));

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Controller
            name="vendorId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Vendor Account"
                fullWidth
                size="small"
                error={!!errors.vendorId}
                helperText={errors.vendorId?.message}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  setValue("vendorName", VENDORS.find((v) => v.id === e.target.value)?.name ?? "");
                }}
              >
                {VENDORS.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid item xs={4}>
          <Controller
            name="docDate"
            control={control}
            render={({ field }) => (
              <TextField {...field} type="date" label="Date" fullWidth size="small" InputLabelProps={{ shrink: true }} error={!!errors.docDate} helperText={errors.docDate?.message} />
            )}
          />
        </Grid>
        <Grid item xs={4}>
          <Controller
            name="voucherPrefix"
            control={control}
            render={({ field }) => <TextField {...field} label="Voucher Prefix" fullWidth size="small" error={!!errors.voucherPrefix} helperText={errors.voucherPrefix?.message} />}
          />
        </Grid>

        <Grid item xs={4}>
          <Controller name="location" control={control} render={({ field }) => <TextField {...field} label="Location" fullWidth size="small" disabled />} />
        </Grid>
        <Grid item xs={4}>
          <Controller name="destination" control={control} render={({ field }) => <TextField {...field} label="Destination" fullWidth size="small" disabled />} />
        </Grid>
        <Grid item xs={4}>
          <Controller name="supplierRefNo" control={control} render={({ field }) => <TextField {...field} label="Supplier Ref No" fullWidth size="small" />} />
        </Grid>

        <Grid item xs={4}>
          <Controller name="placeOfSupply" control={control} render={({ field }) => <TextField {...field} label="Place of Supply" fullWidth size="small" />} />
        </Grid>
        <Grid item xs={8}>
          <Controller name="paymentTerms" control={control} render={({ field }) => <TextField {...field} label="Payment Terms" fullWidth size="small" />} />
        </Grid>

        <Grid item xs={12}>
          <Controller name="narration" control={control} render={({ field }) => <TextField {...field} label="Narration / Notes" fullWidth size="small" multiline minRows={2} />} />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2.5 }} />
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Line Items
      </Typography>
      <PoLineItemsTable control={control} items={items} setValue={setValue} watch={watch} />
      {errors.lines && (
        <Typography variant="caption" color="error">
          {errors.lines.message as string}
        </Typography>
      )}
    </Box>
  );
});

PurchaseOrderForm.displayName = "PurchaseOrderForm";
