import { createClient, SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_URL = (import.meta.env.VITE_SUPABASE_URL as string) || "";
const DEFAULT_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "";

export const sanitizeSupabaseUrl = (inputUrl: string) => {
  let trimmed = String(inputUrl || "").trim().replace(/^"+|"+$/g, "");
  if (!trimmed) return "";
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
};

export const getStoredSupabaseConfig = () => {
  if (typeof window === "undefined") {
    return { url: sanitizeSupabaseUrl(DEFAULT_URL), anonKey: DEFAULT_ANON_KEY.trim() };
  }
  
  let rawUrl = DEFAULT_URL;
  let rawKey = DEFAULT_ANON_KEY;

  try {
    const itemUrl = localStorage.getItem("supabase-url");
    if (itemUrl) rawUrl = JSON.parse(itemUrl);
  } catch {
    rawUrl = localStorage.getItem("supabase-url") || DEFAULT_URL;
  }

  try {
    const itemKey = localStorage.getItem("supabase-anon-key");
    if (itemKey) rawKey = JSON.parse(itemKey);
  } catch {
    rawKey = localStorage.getItem("supabase-anon-key") || DEFAULT_ANON_KEY;
  }

  const url = sanitizeSupabaseUrl(String(rawUrl || ""));
  const anonKey = String(rawKey || "").trim().replace(/^"+|"+$/g, "");

  return { url, anonKey };
};

let supabaseInstance: SupabaseClient | null = null;
let currentConfig = { url: "", anonKey: "" };

export const getSupabase = (): SupabaseClient | null => {
  const { url, anonKey } = getStoredSupabaseConfig();
  if (!url || !anonKey) return null;

  if (!supabaseInstance || currentConfig.url !== url || currentConfig.anonKey !== anonKey) {
    currentConfig = { url, anonKey };
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
};
