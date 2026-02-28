import { browser } from "$app/environment";

let tauri: boolean | null = null;

export async function isTauriApp(): Promise<boolean> {
  if (!browser) return false;
  if (tauri !== null) return tauri;

  try {
    const mod = await import("@tauri-apps/api/core");
    tauri = mod.isTauri();
  } catch {
    tauri = false;
  }

  return tauri;
}