import { Box, Grid, Paper, Typography } from "@mui/material";
import { useCrud } from "@/lib/api/useCrud";
import type { Item, PurchaseOrderDomestic } from "@/types";

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 700 }}>
        {value}
      </Typography>
    </Paper>
  );
}

export default function DashboardPage() {
  const { list: items } = useCrud<Item>("items");
  const { list: pos } = useCrud<PurchaseOrderDomestic>("purchaseOrdersDomestic");

  const pending = (pos.data ?? []).filter((p) => p.status === "pending_approval").length;
  const approved = (pos.data ?? []).filter((p) => p.status === "approved").length;
  const lowStock = (items.data ?? []).filter((i) => i.closingStock <= i.reorderLevel).length;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Dashboard
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard label="Total Purchase Orders" value={pos.data?.length ?? 0} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard label="Pending PO Approval" value={pending} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard label="Approved PO" value={approved} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard label="Low Stock Items" value={lowStock} />
        </Grid>
      </Grid>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
        Values are computed live from the connected Google Sheet.
      </Typography>
    </Box>
  );
}
