import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Grid, TextField, FormControlLabel, Switch, InputAdornment } from "@mui/material";
import { forwardRef, useImperativeHandle, useEffect } from "react";
import { itemSchema, ItemFormValues } from "@/lib/validation/itemSchema";
import type { Item } from "@/types";

export interface ItemFormHandle {
  submit: () => void;
}

interface ItemFormProps {
  defaultValues?: Item | null;
  onValid: (values: ItemFormValues) => void;
  onDirtyChange?: (isSubmitting: boolean) => void;
}

const emptyDefaults: ItemFormValues = {
  itemCode: "",
  description: "",
  brand: "",
  itemGroup: "",
  division: "",
  unit: "Nos",
  batchControl: false,
  expiryControl: false,
  closingStock: 0,
  reorderLevel: 0,
  lastPoRate: 0,
  priceBookRate: 0,
};

export const ItemForm = forwardRef<ItemFormHandle, ItemFormProps>(({ defaultValues, onValid }, ref) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: defaultValues ?? emptyDefaults,
  });

  useEffect(() => {
    reset(defaultValues ?? emptyDefaults);
  }, [defaultValues, reset]);

  useImperativeHandle(ref, () => ({
    submit: () => handleSubmit(onValid)(),
  }));

  // Sterile-item rule (architecture spec §4.5): batch and expiry control travel
  // together. Toggling one nudges the other so the pair stays consistent.
  const batchControl = watch("batchControl");

  return (
    <Grid container spacing={2} sx={{ mt: 0.5 }}>
      <Grid item xs={6}>
        <Controller
          name="itemCode"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Item Code" fullWidth size="small" error={!!errors.itemCode} helperText={errors.itemCode?.message} />
          )}
        />
      </Grid>
      <Grid item xs={6}>
        <Controller
          name="unit"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Unit" fullWidth size="small" error={!!errors.unit} helperText={errors.unit?.message} />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Description" fullWidth size="small" error={!!errors.description} helperText={errors.description?.message} />
          )}
        />
      </Grid>

      <Grid item xs={4}>
        <Controller
          name="brand"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Brand" fullWidth size="small" error={!!errors.brand} helperText={errors.brand?.message} />
          )}
        />
      </Grid>
      <Grid item xs={4}>
        <Controller
          name="itemGroup"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Item Group" fullWidth size="small" error={!!errors.itemGroup} helperText={errors.itemGroup?.message} />
          )}
        />
      </Grid>
      <Grid item xs={4}>
        <Controller
          name="division"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Division" fullWidth size="small" error={!!errors.division} helperText={errors.division?.message} />
          )}
        />
      </Grid>

      <Grid item xs={4}>
        <Controller
          name="closingStock"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Closing Stock" type="number" fullWidth size="small" error={!!errors.closingStock} helperText={errors.closingStock?.message} />
          )}
        />
      </Grid>
      <Grid item xs={4}>
        <Controller
          name="reorderLevel"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Reorder Level" type="number" fullWidth size="small" error={!!errors.reorderLevel} helperText={errors.reorderLevel?.message} />
          )}
        />
      </Grid>
      <Grid item xs={4}>
        <Controller
          name="priceBookRate"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Price Book Rate"
              type="number"
              fullWidth
              size="small"
              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              error={!!errors.priceBookRate}
              helperText={errors.priceBookRate?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={6}>
        <Controller
          name="batchControl"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  checked={field.value}
                  onChange={(e) => {
                    field.onChange(e.target.checked);
                    // Sterile items require both batch and expiry tracking.
                    if (e.target.checked) setValue("expiryControl", true);
                  }}
                />
              }
              label="Batch Control (Sterile Item)"
            />
          )}
        />
      </Grid>
      <Grid item xs={6}>
        <Controller
          name="expiryControl"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} disabled={batchControl} />}
              label="Expiry Control"
            />
          )}
        />
      </Grid>
    </Grid>
  );
});

ItemForm.displayName = "ItemForm";
