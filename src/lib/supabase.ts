import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env");
}

// Use localStorage on web, chrome.storage in extension context
const storage =
  typeof chrome !== "undefined" && chrome.storage
    ? {
        getItem: (key: string): Promise<string | null> =>
          new Promise((resolve) =>
            chrome.storage.local.get(key, (result: Record<string, string>) =>
              resolve(result[key] ?? null)
            )
          ),
        setItem: (key: string, value: string): Promise<void> =>
          new Promise((resolve) =>
            chrome.storage.local.set({ [key]: value }, resolve)
          ),
        removeItem: (key: string): Promise<void> =>
          new Promise((resolve) =>
            chrome.storage.local.remove(key, resolve)
          ),
      }
    : localStorage;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Types
export type Collection = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  is_private: boolean;
};

export type Bookmark = {
  id: string;
  title: string;
  url: string;
  tag: string | null;
  collection_id: string;
  user_id: string;
  created_at: string;
  updated_at: string | null;
};
