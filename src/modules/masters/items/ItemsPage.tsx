import { useRef, useState } from "react";
import { Box, Button, Chip, Stack, Typography, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { GridColDef } from "@mui/x-data-grid";
import { DataTable } from "@/components/DataTable";
import { FormModal } from "@/components/FormModal";
import { ItemForm, ItemFormHandle } from "./ItemForm";
import { useCrud } from "@/lib/api/useCrud";
import type { Item } from "@/types";
import type { ItemFormValues } from "@/lib/validation/itemSchema";

export default function ItemsPage() {
  const { list, create, update, remove } = useCrud<Item>("items");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const formRef = useRef<ItemFormHandle>(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: Item) => {
    setEditing(row);
    setModalOpen(true);
  };

  const handleValid = (values: ItemFormValues) => {
    if (editing) {
      update.mutate({ id: editing.id, payload: values }, { onSuccess: () => setModalOpen(false) });
    } else {
      create.mutate(values, { onSuccess: () => setModalOpen(false) });
    }
  };

  const columns: GridColDef[] = [
    { field: "itemCode", headerName: "Item Code", width: 120 },
    { field: "description", headerName: "Description", flex: 1, minWidth: 220 },
    { field: "brand", headerName: "Brand", width: 130 },
    { field: "division", headerName: "Division", width: 110 },
    {
      field: "sterile",
      headerName: "Sterile",
      width: 110,
      renderCell: (params) =>
        params.row.batchControl ? <Chip size="small" color="warning" label="Sterile" /> : <Chip size="small" variant="outlined" label="Non-sterile" />,
    },
    { field: "closingStock", headerName: "Closing Stock", width: 130, type: "number" },
    { field: "reorderLevel", headerName: "Reorder Level", width: 130, type: "number" },
    {
      field: "priceBookRate",
      headerName: "Price Book Rate",
      width: 140,
      type: "number",
      valueFormatter: (value: number) => `₹${value}`,
    },
    {
      field: "actions",
      headerName: "",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEdit(params.row); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Deactivate">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); remove.mutate(params.row.id); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5">Item Master</Typography>
          <Typography variant="body2" color="text.secondary">
            Foundational item data — feeds Purchase Order, GRN, Imprest and Consumption line items.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          New Item
        </Button>
      </Stack>

      <DataTable rows={list.data ?? []} columns={columns} loading={list.isLoading} onRowClick={openEdit} />

      <FormModal
        open={modalOpen}
        title={editing ? `Edit Item — ${editing.itemCode}` : "New Item"}
        subtitle="Master Data · Item Master"
        onClose={() => setModalOpen(false)}
        onSubmit={() => formRef.current?.submit()}
        isSubmitting={create.isPending || update.isPending}
      >
        <ItemForm ref={formRef} defaultValues={editing} onValid={handleValid} />
      </FormModal>
    </Box>
  );
}
