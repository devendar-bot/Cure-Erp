// Mock data layer.
//
// This exists ONLY so the React modules are fully wired end-to-end today.
// Every function here has the exact shape the real API (see
// Cure-ERP-Architecture-Spec.md §5) will have — swap the body of these
// four functions for `fetch("/api/v1/...")` calls and nothing in the
// module components needs to change.

import { v4 as uuid } from "uuid";
import type { Item, PurchaseOrderDomestic } from "@/types";

type Resource = "items" | "purchaseOrdersDomestic";

const STORAGE_KEY = "cure-erp-mock-db-v1";

interface Db {
  items: Item[];
  purchaseOrdersDomestic: PurchaseOrderDomestic[];
}

function seed(): Db {
  const now = new Date().toISOString();
  const items: Item[] = [
    {
      id: uuid(),
      itemCode: "ITM-0001",
      description: "Spinal Fusion Cage 10mm",
      brand: "CureOrtho",
      itemGroup: "Implants",
      division: "Spine",
      unit: "Nos",
      batchControl: true,
      expiryControl: true,
      closingStock: 42,
      reorderLevel: 10,
      lastPoRate: 4200,
      priceBookRate: 4500,
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
      isActive: true,
    },
    {
      id: uuid(),
      itemCode: "ITM-0002",
      description: "Surgical Drape (Non-Sterile Pack)",
      brand: "CureSurgicals",
      itemGroup: "Consumables",
      division: "General",
      unit: "Nos",
      batchControl: false,
      expiryControl: false,
      closingStock: 310,
      reorderLevel: 50,
      lastPoRate: 85,
      priceBookRate: 95,
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
      isActive: true,
    },
  ];

  return { items, purchaseOrdersDomestic: [] };
}

function readDb(): Db {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = seed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(raw) as Db;
}

function writeDb(db: Db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// Simulated network latency so loading states are visible/testable.
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export const mockApi = {
  async list<T>(resource: Resource): Promise<T[]> {
    await delay();
    return readDb()[resource] as unknown as T[];
  },

  async create<T extends { id?: string }>(resource: Resource, payload: T): Promise<T> {
    await delay();
    const db = readDb();
    const now = new Date().toISOString();
    const record = {
      ...payload,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
      createdBy: "current.user",
      isActive: true,
    } as unknown as T;
    (db[resource] as unknown as T[]).push(record);
    writeDb(db);
    return record;
  },

  async update<T extends { id: string }>(resource: Resource, id: string, payload: Partial<T>): Promise<T> {
    await delay();
    const db = readDb();
    const list = db[resource] as unknown as T[];
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`${resource} record ${id} not found`);
    const updated = { ...list[idx], ...payload, updatedAt: new Date().toISOString() } as T;
    list[idx] = updated;
    writeDb(db);
    return updated;
  },

  async remove(resource: Resource, id: string): Promise<void> {
    await delay();
    const db = readDb();
    const list = db[resource] as unknown as { id: string }[];
    (db as any)[resource] = list.filter((r) => r.id !== id);
    writeDb(db);
  },
};
