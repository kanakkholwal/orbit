import type { CreatorDoc } from "./model/types";

const DB = "orbit-create-pdf";
const STORE = "drafts";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = action(db.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

/** Drafts saved on this device, newest first. */
export async function listDrafts(): Promise<CreatorDoc[]> {
  const drafts = await run<CreatorDoc[]>("readonly", (store) => store.getAll());
  return drafts.sort((a, b) => b.updatedAt - a.updatedAt);
}

export const saveDraft = (doc: CreatorDoc) => run("readwrite", (store) => store.put(doc));

export const deleteDraft = (id: string) => run("readwrite", (store) => store.delete(id));

/** Checks an imported JSON value looks like a creator document. */
export function isCreatorDoc(value: unknown): value is CreatorDoc {
  const doc = value as CreatorDoc;
  return !!doc && doc.version === 1 && typeof doc.name === "string" && Array.isArray(doc.blocks) && typeof doc.settings === "object";
}
