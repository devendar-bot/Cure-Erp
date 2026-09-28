import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Paper } from "@mui/material";

interface DataTableProps<T> {
  rows: T[];
  columns: GridColDef[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id: string }>({ rows, columns, loading, onRowClick }: DataTableProps<T>) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2 }}>
      <Box sx={{ height: 560, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          onRowClick={(params) => onRowClick?.(params.row as T)}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={{ border: "none", "& .MuiDataGrid-row": { cursor: onRowClick ? "pointer" : "default" } }}
        />
      </Box>
    </Paper>
  );
}
