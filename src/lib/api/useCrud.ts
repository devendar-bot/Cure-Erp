import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockApi } from "./mockApi";
import { httpApi } from "./httpApi";

// Google Sheets (via /api) by default; set VITE_USE_MOCK=true to use localStorage instead.
const api = import.meta.env.VITE_USE_MOCK === "true" ? mockApi : httpApi;

/**
 * One hook factory reused by every module (masters + transactions).
 * Each module calls `useCrud<Item>("items")` / `useCrud<PurchaseOrderDomestic>("purchaseOrdersDomestic")`
 * and gets list/create/update/remove wired to the same query key + cache invalidation.
 */
export function useCrud<T extends { id: string }>(resource: "items" | "purchaseOrdersDomestic") {
  const queryClient = useQueryClient();
  const queryKey = [resource];

  const list = useQuery({
    queryKey,
    queryFn: () => api.list<T>(resource),
  });

  const create = useMutation({
    mutationFn: (payload: Omit<T, "id" | "createdAt" | "updatedAt" | "createdBy" | "isActive">) =>
      api.create<T>(resource, payload as T),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<T> }) =>
      api.update<T>(resource, id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.remove(resource, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { list, create, update, remove };
}
