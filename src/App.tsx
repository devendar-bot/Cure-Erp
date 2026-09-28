import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { ThemeProvider, CssBaseline, Snackbar, Alert } from "@mui/material";
import { theme } from "./theme";
import { AppShell } from "@/components/layout/AppShell";
import DashboardPage from "@/modules/dashboard/DashboardPage";
import ItemsPage from "@/modules/masters/items/ItemsPage";
import PurchaseOrdersPage from "@/modules/purchase/orders-domestic/PurchaseOrdersPage";

// Any failed request (e.g. Sheet not shared with the service account) surfaces as a toast.
let notifyError: (msg: string) => void = () => {};
const onError = (e: unknown) => notifyError(e instanceof Error ? e.message : "Something went wrong");

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError }),
  mutationCache: new MutationCache({ onError }),
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 5_000, retry: 1 } },
});

export default function App() {
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    notifyError = setError;
    return () => {
      notifyError = () => {};
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/masters/items" element={<ItemsPage />} />
              <Route path="/purchase/orders-domestic" element={<PurchaseOrdersPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
        <Snackbar open={!!error} autoHideDuration={8000} onClose={() => setError(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert severity="error" variant="filled" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
