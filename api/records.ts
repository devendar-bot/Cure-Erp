import type { VercelRequest, VercelResponse } from "@vercel/node";
import { RESOURCES, listRecords, createRecord, updateRecord, deactivateRecord } from "./_lib/sheets.js";

// One endpoint for every module:
//   GET    /api/records?resource=items
//   POST   /api/records?resource=items                (JSON body)
//   PUT    /api/records?resource=items&id=<uuid>      (JSON body)
//   DELETE /api/records?resource=items&id=<uuid>      (soft delete)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  try {
    const resource = String(req.query.resource ?? "");
    if (!RESOURCES[resource]) return res.status(400).json({ error: `Unknown resource "${resource}"` });
    const id = req.query.id ? String(req.query.id) : "";
    const body = (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body) ?? {};

    switch (req.method) {
      case "GET":
        return res.status(200).json(await listRecords(resource));
      case "POST":
        return res.status(201).json(await createRecord(resource, body));
      case "PUT": {
        if (!id) return res.status(400).json({ error: "id is required" });
        const rec = await updateRecord(resource, id, body);
        return rec ? res.status(200).json(rec) : res.status(404).json({ error: "Record not found" });
      }
      case "DELETE": {
        if (!id) return res.status(400).json({ error: "id is required" });
        const rec = await deactivateRecord(resource, id);
        return rec ? res.status(200).json({ ok: true }) : res.status(404).json({ error: "Record not found" });
      }
      default:
        res.setHeader("Allow", "GET, POST, PUT, DELETE");
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message ?? "Server error" });
  }
}
