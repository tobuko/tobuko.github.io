/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
	throw new Error(
		"Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env",
	);
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
	auth: {
		storage: localStorage,
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
