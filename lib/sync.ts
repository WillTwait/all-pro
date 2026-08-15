import { createClient } from "./supabase/client";
import type { Json } from "./supabase/database.types";
import { migrateStore } from "./storage";
import type { Store } from "./types";

export function stampStore(store: Store, at = new Date().toISOString()): Store {
  return { ...store, updatedAt: at };
}

export function pickCloudStore(
  local: Store,
  remote: Store,
  remoteRowUpdatedAt: string,
): { store: Store; pushLocal: boolean } {
  if (local.setupComplete && !remote.setupComplete) {
    return { store: local, pushLocal: true };
  }
  if (!local.setupComplete && remote.setupComplete) {
    return { store: remote, pushLocal: false };
  }

  const localTs = Date.parse(local.updatedAt ?? "") || 0;
  const remoteTs = Math.max(
    Date.parse(remote.updatedAt ?? "") || 0,
    Date.parse(remoteRowUpdatedAt) || 0,
  );

  if (localTs > remoteTs) return { store: local, pushLocal: true };
  return { store: remote, pushLocal: false };
}

export async function pullCloudStore(local: Store): Promise<Store> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("app_state")
    .select("store, updated_at")
    .eq("id", 1)
    .maybeSingle();

  if (error) throw error;

  if (!data?.store || Object.keys(data.store as object).length === 0) {
    await pushCloudStore(local);
    return local;
  }

  const remote = migrateStore(data.store as Store);
  const picked = pickCloudStore(local, remote, data.updated_at);
  if (picked.pushLocal) await pushCloudStore(picked.store);
  return picked.store;
}

export async function pushCloudStore(store: Store): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("app_state").upsert({
    id: 1,
    store: store as unknown as Json,
  });
  if (error) throw error;
}
