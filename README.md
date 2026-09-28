# Cure ERP — Frontend + Google Sheets backend

React + TypeScript + Vite + MUI, deployed on Vercel. Data is read/written to a Google Sheet through
serverless functions in `/api` (service-account auth; credentials never reach the browser).

## Google Sheets setup (one time)

1. Google Cloud Console -> create/select a project -> **enable "Google Sheets API"**.
2. IAM & Admin -> Service Accounts -> create one -> Keys -> **Add key -> JSON** (downloads a file).
3. Open the Sheet and click **Share**; add the service account's `client_email` as **Editor**.
4. Set the three env vars (see `.env.example`): `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`.

Tabs `Items` and `PurchaseOrders` (with header rows) are created automatically on first use.
Line items of a PO are stored as JSON in the `lines` column. "Delete/Deactivate" sets `isActive=FALSE` (row is kept).

## Deploy on Vercel

Import the repo in Vercel (Framework preset: Vite is auto-detected; if the project lives in a subfolder set
*Root Directory* to it). Add the 3 env vars under Settings -> Environment Variables, then deploy.
Verify at `https://<your-app>.vercel.app/api/health`.

## Local development

```bash
npm install
npm run dev                     # UI only; add VITE_USE_MOCK=true in .env.local to use localStorage mock
# or, to run UI + /api functions with the real Sheet:
cp .env.example .env.local      # fill in real values
npx vercel dev
```

---


React + TypeScript + Vite + MUI + react-hook-form + zod + TanStack Query.

## Original notes

## Run it

```bash
npm install
npm run dev
```
Opens at http://localhost:5173. Data is stored in `localStorage` via `src/lib/api/mockApi.ts` — no backend needed yet.

## What's here

Two fully wired modules, built to be the template for every other module in the architecture spec:

- **Item Master** (`src/modules/masters/items`) — simple master CRUD.
- **Purchase Order — Domestic** (`src/modules/purchase/orders-domestic`) — header form + dynamic line-items subform with live Gross/Taxable Value/CGST/IGST calculation and a Net Total.

## The modal-window form pattern

Every module opens its create/edit form inside the same **`<FormModal>`** component (`src/components/FormModal.tsx`) instead of navigating to a separate page:

```
ListPage (DataTable)
   └─ "New" button / row click → opens <FormModal>
        └─ <XyzForm ref={formRef} .../>   ← react-hook-form + zod, imperative submit()
   FormModal's Save button calls formRef.current.submit()
   On valid submit → useCrud().create()/update() → modal closes, table refreshes
```

To add a new module (e.g. GRN, Imprest Out):
1. Add the type to `src/types/index.ts` (field names should match the DB columns in `Cure-ERP-Architecture-Spec.md` §3).
2. Add a zod schema in `src/lib/validation/`.
3. Build `<XyzForm>` following `ItemForm.tsx` (simple) or `PurchaseOrderForm.tsx` (header + line-items subform) as the template.
4. Build `<XyzPage>` following `ItemsPage.tsx` / `PurchaseOrdersPage.tsx` — DataTable + FormModal + `useCrud<Xyz>("resourceName")`.
5. Register the resource name in `mockApi.ts`'s `Resource` union and `Db` interface, and add the route in `App.tsx` + nav entry in `AppShell.tsx`.

## Swapping the mock API for the real backend

Every module calls `useCrud<T>(resource)` (`src/lib/api/useCrud.ts`), which calls the four functions in `mockApi.ts` (`list/create/update/remove`). Once the Express/Prisma backend (Phase 1 of the dev plan) exists, replace the bodies of those four functions with `fetch("/api/v1/...")` calls matching the endpoints in the architecture spec §5 — no component code changes required.

## Known placeholders (see architecture spec §12 for the full list)

- Vendor list in the PO form is hardcoded (`VENDORS` const) pending the Vendor Master module.
- CGST/IGST use a flat 6%/12% placeholder rate, not the real HSN-based tax table.
- Approval-matrix routing, document-number sequencing, and RBAC are not yet wired — this phase is UI + client-side workflow shape only.
