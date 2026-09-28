import { useRef, useState } from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { GridColDef } from "@mui/x-data-grid";
import { DataTable } from "@/components/DataTable";
import { FormModal } from "@/components/FormModal";
import { PurchaseOrderForm, PurchaseOrderFormHandle } from "./PurchaseOrderForm";
import { useCrud } from "@/lib/api/useCrud";
import type { Item, PurchaseOrderDomestic, DocStatus } from "@/types";
import type { PoFormValues } from "@/lib/validation/poSchema";

const STATUS_COLOR: Record<DocStatus, "default" | "warning" | "success" | "error"> = {
  draft: "default",
  pending_approval: "warning",
  approved: "success",
  rejected: "error",
  cancelled: "error",
};

export default function PurchaseOrdersPage() {
  const { list: poList, create, update } = useCrud<PurchaseOrderDomestic>("purchaseOrdersDomestic");
  const { list: itemList } = useCrud<Item>("items");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PurchaseOrderDomestic | null>(null);
  const formRef = useRef<PurchaseOrderFormHandle>(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (row: PurchaseOrderDomestic) => {
    setEditing(row);
    setModalOpen(true);
  };

  // §4.1 of the architecture spec: Draft -> Pending Approval -> Approved.
  // The "Submit for Approval" checkbox in the PDF form maps to this status
  // transition, which the backend will re-validate (never trust the client).
  const handleValid = (values: PoFormValues, submitForApproval: boolean) => {
    const docNo = editing?.docNo ?? `PO/26-27/${String((poList.data?.length ?? 0) + 1).padStart(4, "0")}`;
    const status: DocStatus = submitForApproval ? "pending_approval" : "draft";
    const payload = { ...values, docNo, status };

    if (editing) {
      update.mutate({ id: editing.id, payload }, { onSuccess: () => setModalOpen(false) });
    } else {
      create.mutate(payload, { onSuccess: () => setModalOpen(false) });
    }
  };

  const columns: GridColDef[] = [
    { field: "docNo", headerName: "Document No.", width: 150 },
    { field: "docDate", headerName: "Date", width: 110 },
    { field: "vendorName", headerName: "Vendor", flex: 1, minWidth: 180 },
    { field: "location", headerName: "Location", width: 100 },
    {
      field: "netTotal",
      headerName: "Net Total",
      width: 130,
      type: "number",
      valueFormatter: (value: number) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`,
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => <Chip size="small" color={STATUS_COLOR[params.value as DocStatus]} label={String(params.value).replace("_", " ")} />,
    },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5">Purchase Order — Domestic</Typography>
          <Typography variant="body2" color="text.secondary">
            Formal order placed with a local vendor · linked to Purchase Indent
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          New Purchase Order
        </Button>
      </Stack>

      <DataTable rows={poList.data ?? []} columns={columns} loading={poList.isLoading} onRowClick={openEdit} />

      <FormModal
        open={modalOpen}
        title={editing ? `Purchase Order — ${editing.docNo}` : "New Purchase Order — Domestic"}
        subtitle="Purchase Management · linked to Purchase Indent"
        maxWidth="lg"
        onClose={() => setModalOpen(false)}
        onSubmit={() => formRef.current?.submit()}
        submitLabel={editing?.status && editing.status !== "draft" ? "Save Changes" : "Save as Draft"}
        isSubmitting={create.isPending || update.isPending}
      >
        <PurchaseOrderForm ref={formRef} defaultValues={editing} items={itemList.data ?? []} onValid={(v) => handleValid(v, false)} />
      </FormModal>
    </Box>
  );
}
