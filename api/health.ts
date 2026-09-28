import type { VercelRequest, VercelResponse } from "@vercel/node";
import { spreadsheetTitle } from "./_lib/sheets.js";

// Open /api/health after deploying to confirm the Sheet connection works.
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const envPresent = {
    GOOGLE_SHEET_ID: !!process.env.GOOGLE_SHEET_ID,
    GOOGLE_SERVICE_ACCOUNT_EMAIL: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
  };
  try {
    const title = await spreadsheetTitle();
    res.status(200).json({ ok: true, spreadsheet: title, envPresent });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message ?? "Failed", envPresent });
  }
}
