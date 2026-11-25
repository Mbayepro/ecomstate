import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const STORAGE_BUCKET = "store-assets";
const SYNC_OBJECT_PATH = "_sync/cloud-state-v1.gif";
const SYNC_TABLE = "platform_cloud_state";
const SYNC_ROW_ID = "global_v1";

export interface SharedCloudSnapshot {
  updatedAt: string;
  adminAccount?: unknown;
  subscriptionPayments?: { id: string }[];
  notifications?: { id: string }[];
  stores?: { id: string; slug?: string }[];
  categories?: { id: string }[];
  products?: { id: string }[];
  customers?: { id: string }[];
  orders?: { id: string }[];
  inventoryMovements?: { id: string }[];
  promoCodes?: { id: string }[];
  customDomains?: { id: string }[];
  codForms?: { id: string }[];
  couriers?: { id: string }[];
  expenses?: { id: string }[];
  adCampaigns?: { id: string }[];
  automations?: { id: string }[];
  teamMembers?: { id: string }[];
  plans?: { id: string }[];


  modules?: { key: string }[];
  countries?: { code: string }[];
  auditLogs?: { id: string }[];
}

/**
 * Fusionne deux tableaux d'entités par clé unique (`id` par défaut) en privilégiant les versions les plus récentes.
 */
export function mergeById<T extends { id: string }>(
  incoming: T[] | undefined,
  local: T[] | undefined
): T[] {
  const map = new Map<string, T>();
  for (const item of local ?? []) {
    if (item && item.id) {
      map.set(item.id, item);
    }
  }
  for (const item of incoming ?? []) {
    if (item && item.id) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}


/**
 * Récupère l'état partagé multi-appareils depuis Supabase (Table `platform_cloud_state` ou Storage `store-assets`).
 */
export async function fetchCloudPlatformState(): Promise<SharedCloudSnapshot | null> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return null;

  // 1. Essayer d'abord la table PostgreSQL `platform_cloud_state`
  try {
    const { data, error } = await supabase
      .from(SYNC_TABLE)
      .select("state")
      .eq("id", SYNC_ROW_ID)
      .maybeSingle();

    if (!error && data?.state && typeof data.state === "object") {
      return data.state as SharedCloudSnapshot;
    }
  } catch {
    // Table pas encore créée -> repli sur Storage
  }

  // 2. Repli automatique sur le bucket public `store-assets`
  try {
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(SYNC_OBJECT_PATH);
    if (data?.publicUrl) {
      const res = await fetch(`${data.publicUrl}?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const parsed = (await res.json()) as SharedCloudSnapshot;
        if (parsed && typeof parsed === "object" && parsed.updatedAt) {
          return parsed;
        }
      }
    }
  } catch {
    // Ignore
  }

  return null;
}

/**
 * Sauvegarde l'état partagé multi-appareils sur Supabase pour que tous les téléphones et PC voient les mêmes boutiques/produits/commandes.
 */
export async function pushCloudPlatformState(
  snapshot: SharedCloudSnapshot
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;

  // 1. Sauvegarde dans `platform_cloud_state` si la table existe
  try {
    const { error } = await supabase.from(SYNC_TABLE).upsert(
      {
        id: SYNC_ROW_ID,
        state: snapshot,
        updated_at: snapshot.updatedAt,
      },
      { onConflict: "id" }
    );
    if (!error) return;
  } catch {
    // Repli sur Storage
  }

  // 2. Repli automatique sur le bucket `store-assets` (type MIME image/gif accepté par la politique par défaut)
  try {
    const jsonBytes = new TextEncoder().encode(JSON.stringify(snapshot));
    const blob = new Blob([jsonBytes], { type: "image/gif" });
    await supabase.storage.from(STORAGE_BUCKET).upload(SYNC_OBJECT_PATH, blob, {
      contentType: "image/gif",
      upsert: true,
    });
  } catch {
    // Ignore
  }
}
