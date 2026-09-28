import { useFieldArray, Control, Controller } from "react-hook-form";
import { v4 as uuid } from "uuid";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  IconButton,
  Button,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { PoFormValues } from "@/lib/validation/poSchema";
import type { Item } from "@/types";

interface Props {
  control: Control<PoFormValues>;
  items: Item[];
  setValue: (name: any, value: any) => void;
  watch: (name: any) => any;
}

// Recompute the calculated columns for one line: Gross = qty * rate,
// Taxable Value = Gross - discount, CGST/IGST = 6% each of taxable value
// (flat placeholder rate — the real HSN-based tax table is a Phase 3 item,
// see architecture spec §12 "Open Items").
function computeLine(qty: number, rate: number, discount: number) {
  const gross = round2(qty * rate);
  const taxableValue = round2(gross - discount);
  const cgst = round2(taxableValue * 0.06);
  const igst = round2(taxableValue * 0.12);
  return { gross, taxableValue, cgst, igst };
}
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function PoLineItemsTable({ control, items, setValue, watch }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const lines: any[] = watch("lines") ?? [];

  const addLine = () => {
    append({
      id: uuid(),
      warehouseId: "",
      itemId: "",
      itemCode: "",
      description: "",
      unit: "",
      closingStock: 0,
      reorderLevel: 0,
      qty: 1,
      rate: 0,
      otherDiscount: 0,
      gross: 0,
      taxableValue: 0,
      cgst: 0,
      igst: 0,
      brand: "",
      itemGroup: "",
      division: "",
    });
  };

  const onItemPick = (index: number, itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    setValue(`lines.${index}.itemId`, item.id);
    setValue(`lines.${index}.itemCode`, item.itemCode);
    setValue(`lines.${index}.description`, item.description);
    setValue(`lines.${index}.unit`, item.unit);
    setValue(`lines.${index}.closingStock`, item.closingStock);
    setValue(`lines.${index}.reorderLevel`, item.reorderLevel);
    setValue(`lines.${index}.rate`, item.priceBookRate);
    setValue(`lines.${index}.brand`, item.brand);
    setValue(`lines.${index}.itemGroup`, item.itemGroup);
    setValue(`lines.${index}.division`, item.division);
    recalc(index, lines[index]?.qty ?? 1, item.priceBookRate, lines[index]?.otherDiscount ?? 0);
  };

  const recalc = (index: number, qty: number, rate: number, discount: number) => {
    const { gross, taxableValue, cgst, igst } = computeLine(qty || 0, rate || 0, discount || 0);
    setValue(`lines.${index}.gross`, gross);
    setValue(`lines.${index}.taxableValue`, taxableValue);
    setValue(`lines.${index}.cgst`, cgst);
    setValue(`lines.${index}.igst`, igst);
  };

  const netTotal = round2(lines.reduce((sum, l) => sum + (l.taxableValue ?? 0) + (l.cgst ?? 0) + (l.igst ?? 0), 0));
  // keep the header-level net total field in sync for the list page / print
  if (watch("netTotal") !== netTotal) setValue("netTotal", netTotal);

  return (
    <Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell width={220}>Item</TableCell>
            <TableCell width={90}>Unit</TableCell>
            <TableCell width={90}>Qty</TableCell>
            <TableCell width={110}>Rate</TableCell>
            <TableCell width={110}>Discount</TableCell>
            <TableCell width={110}>Gross</TableCell>
            <TableCell width={120}>Taxable Value</TableCell>
            <TableCell width={40} />
          </TableRow>
        </TableHead>
        <TableBody>
          {fields.map((field, index) => (
            <TableRow key={field.id}>
              <TableCell>
                <Controller
                  name={`lines.${index}.itemId`}
                  control={control}
                  render={({ field: f }) => (
                    <Select
                      {...f}
                      size="small"
                      fullWidth
                      displayEmpty
                      onChange={(e) => {
                        f.onChange(e.target.value);
                        onItemPick(index, e.target.value as string);
                      }}
                    >
                      <MenuItem value="" disabled>
                        Select item…
                      </MenuItem>
                      {items.map((it) => (
                        <MenuItem key={it.id} value={it.id}>
                          {it.itemCode} — {it.description}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">{lines[index]?.unit || "—"}</Typography>
              </TableCell>
              <TableCell>
                <Controller
                  name={`lines.${index}.qty`}
                  control={control}
                  render={({ field: f }) => (
                    <TextField
                      {...f}
                      type="number"
                      size="small"
                      onChange={(e) => {
                        f.onChange(e.target.value);
                        recalc(index, Number(e.target.value), lines[index]?.rate ?? 0, lines[index]?.otherDiscount ?? 0);
                      }}
                    />
                  )}
                />
              </TableCell>
              <TableCell>
                <Controller
                  name={`lines.${index}.rate`}
                  control={control}
                  render={({ field: f }) => (
                    <TextField
                      {...f}
                      type="number"
                      size="small"
                      onChange={(e) => {
                        f.onChange(e.target.value);
                        recalc(index, lines[index]?.qty ?? 0, Number(e.target.value), lines[index]?.otherDiscount ?? 0);
                      }}
                    />
                  )}
                />
              </TableCell>
              <TableCell>
                <Controller
                  name={`lines.${index}.otherDiscount`}
                  control={control}
                  render={({ field: f }) => (
                    <TextField
                      {...f}
                      type="number"
                      size="small"
                      onChange={(e) => {
                        f.onChange(e.target.value);
                        recalc(index, lines[index]?.qty ?? 0, lines[index]?.rate ?? 0, Number(e.target.value));
                      }}
                    />
                  )}
                />
              </TableCell>
              <TableCell>₹{lines[index]?.gross ?? 0}</TableCell>
              <TableCell>₹{lines[index]?.taxableValue ?? 0}</TableCell>
              <TableCell>
                <IconButton size="small" onClick={() => remove(index)}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {fields.length === 0 && (
        <Alert severity="info" sx={{ mt: 1 }}>
          No line items yet — add at least one before submitting.
        </Alert>
      )}

      <Button startIcon={<AddIcon />} onClick={addLine} size="small" sx={{ mt: 1.5 }}>
        Add Line
      </Button>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, pr: 1 }}>
        <Typography variant="subtitle1">Net Total: ₹{netTotal.toLocaleString("en-IN")}</Typography>
      </Box>
    </Box>
  );
}
