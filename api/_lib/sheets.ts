import { google, sheets_v4 } from "googleapis";
import { randomUUID } from "node:crypto";

// ---------------------------------------------------------------------------
// Resource -> Sheet tab + column definitions.
// Tab names are created automatically on first use. Column order here is the
// order of the header row for a brand-new tab; for existing tabs the header
// row in the sheet is the source of truth (you may reorder columns freely).
// ---------------------------------------------------------------------------
type ColType = "string" | "number" | "boolean" | "json";
interface Col {
  key: string;
  type: ColType;
}

const SYSTEM_COLS: Col[] = [
  { key: "createdAt", type: "string" },
  { key: "updatedAt", type: "string" },
  { key: "createdBy", type: "string" },
  { key: "isActive", type: "boolean" },
];

export const RESOURCES: Record<string, { tab: string; cols: Col[] }> = {
  items: {
    tab: "Items",
    cols: [
      { key: "id", type: "string" },
      { key: "itemCode", type: "string" },
      { key: "description", type: "string" },
      { key: "brand", type: "string" },
      { key: "itemGroup", type: "string" },
      { key: "division", type: "string" },
      { key: "unit", type: "string" },
      { key: "batchControl", type: "boolean" },
      { key: "expiryControl", type: "boolean" },
      { key: "closingStock", type: "number" },
      { key: "reorderLevel", type: "number" },
      { key: "lastPoRate", type: "number" },
      { key: "priceBookRate", type: "number" },
      ...SYSTEM_COLS,
    ],
  },
  purchaseOrdersDomestic: {
    tab: "PurchaseOrders",
    cols: [
      { key: "id", type: "string" },
      { key: "docNo", type: "string" },
      { key: "purchaseType", type: "string" },
      { key: "vendorId", type: "string" },
      { key: "vendorName", type: "string" },
      { key: "location", type: "string" },
      { key: "supplierRefNo", type: "string" },
      { key: "destination", type: "string" },
      { key: "docDate", type: "string" },
      { key: "voucherPrefix", type: "string" },
      { key: "paymentTerms", type: "string" },
      { key: "narration", type: "string" },
      { key: "termsOfDelivery", type: "string" },
      { key: "placeOfSupply", type: "string" },
      { key: "status", type: "string" },
      { key: "netTotal", type: "number" },
      { key: "lines", type: "json" }, // line items stored as JSON in one cell
      ...SYSTEM_COLS,
    ],
  },
};

// ---------------------------------------------------------------------------
// Auth / client
// ---------------------------------------------------------------------------
function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable ${name}`);
  return v;
}

export function getSheetId(): string {
  return env("GOOGLE_SHEET_ID");
}

let cached: sheets_v4.Sheets | null = null;
function client(): sheets_v4.Sheets {
  if (cached) return cached;
  // Vercel stores the key with literal "\n" sequences; turn them back into newlines.
  const privateKey = env("GOOGLE_PRIVATE_KEY").replace(/^"|"$/g, "").replace(/\\n/g, "\n");
  const auth = new google.auth.JWT({
    email: env("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  cached = google.sheets({ version: "v4", auth });
  return cached;
}

export async function spreadsheetTitle(): Promise<string> {
  const res = await client().spreadsheets.get({ spreadsheetId: getSheetId(), fields: "properties.title" });
  return res.data.properties?.title ?? "";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function colLetter(index: number): string {
  let n = index + 1;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function serialize(value: unknown, type: ColType): string | number | boolean {
  if (value === undefined || value === null) return "";
  if (type === "json") return JSON.stringify(value);
  if (type === "boolean") return Boolean(value);
  if (type === "number") return typeof value === "number" ? value : Number(value);
  return String(value);
}

function parse(value: unknown, type: ColType): unknown {
  if (type === "json") {
    if (value === "" || value == null) return [];
    try {
      return JSON.parse(String(value));
    } catch {
      return [];
    }
  }
  if (type === "boolean") return value === true || String(value).toUpperCase() === "TRUE";
  if (type === "number") return value === "" || value == null ? 0 : Number(value);
  return value == null ? "" : String(value);
}

const ready = new Set<string>();

/** Makes sure the tab exists and its header row contains every expected column. Returns the header. */
async function ensureTab(resource: string): Promise<string[]> {
  const def = RESOURCES[resource];
  const sheets = client();
  const spreadsheetId = getSheetId();

  if (!ready.has(resource)) {
    const meta = await sheets.spreadsheets.get({ spreadsheetId, fields: "sheets.properties.title" });
    const exists = meta.data.sheets?.some((s) => s.properties?.title === def.tab);
    if (!exists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: [{ addSheet: { properties: { title: def.tab, gridProperties: { frozenRowCount: 1 } } } }] },
      });
    }
  }

  const headerRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${def.tab}!1:1` });
  let header = (headerRes.data.values?.[0] ?? []).map(String);
  const missing = def.cols.map((c) => c.key).filter((k) => !header.includes(k));
  if (missing.length) {
    header = [...header, ...missing];
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${def.tab}!A1:${colLetter(header.length - 1)}1`,
      valueInputOption: "RAW",
      requestBody: { values: [header] },
    });
  }
  ready.add(resource);
  return header;
}

function rowToRecord(resource: string, header: string[], row: unknown[]): Record<string, unknown> {
  const types = new Map(RESOURCES[resource].cols.map((c) => [c.key, c.type]));
  const rec: Record<string, unknown> = {};
  header.forEach((key, i) => {
    if (types.has(key)) rec[key] = parse(row[i], types.get(key)!);
  });
  return rec;
}

function recordToRow(resource: string, header: string[], rec: Record<string, unknown>) {
  const types = new Map(RESOURCES[resource].cols.map((c) => [c.key, c.type]));
  return header.map((key) => (types.has(key) ? serialize(rec[key], types.get(key)!) : ""));
}

async function readAll(resource: string) {
  const def = RESOURCES[resource];
  const header = await ensureTab(resource);
  const res = await client().spreadsheets.values.get({
    spreadsheetId: getSheetId(),
    range: `${def.tab}!A:${colLetter(Math.max(header.length - 1, 0))}`,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const rows = res.data.values ?? [];
  const records = rows
    .slice(1)
    .map((row, i) => ({ sheetRow: i + 2, rec: rowToRecord(resource, header, row) }))
    .filter((r) => r.rec.id);
  return { header, records };
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------
export async function listRecords(resource: string) {
  const { records } = await readAll(resource);
  return records.map((r) => r.rec).filter((r) => r.isActive !== false);
}

export async function createRecord(resource: string, payload: Record<string, unknown>) {
  const header = await ensureTab(resource);
  const now = new Date().toISOString();
  const rec = { ...payload, id: randomUUID(), createdAt: now, updatedAt: now, createdBy: "current.user", isActive: true };
  await client().spreadsheets.values.append({
    spreadsheetId: getSheetId(),
    range: `${RESOURCES[resource].tab}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [recordToRow(resource, header, rec)] },
  });
  return rec;
}

export async function updateRecord(resource: string, id: string, payload: Record<string, unknown>) {
  const { header, records } = await readAll(resource);
  const found = records.find((r) => r.rec.id === id);
  if (!found) return null;
  const { id: _i, createdAt: _c, createdBy: _b, ...safe } = payload; // never let the client overwrite these
  const rec = { ...found.rec, ...safe, updatedAt: new Date().toISOString() };
  await client().spreadsheets.values.update({
    spreadsheetId: getSheetId(),
    range: `${RESOURCES[resource].tab}!A${found.sheetRow}:${colLetter(header.length - 1)}${found.sheetRow}`,
    valueInputOption: "RAW",
    requestBody: { values: [recordToRow(resource, header, rec)] },
  });
  return rec;
}

/** Soft delete: sets isActive=FALSE (matches the "Deactivate" button in the UI and keeps ERP history). */
export async function deactivateRecord(resource: string, id: string) {
  return updateRecord(resource, id, { isActive: false });
}
