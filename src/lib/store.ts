import { create } from "zustand";
import { supabase, Bookmark, Collection } from "./supabase";

type Store = {
	user: { id: string; email?: string } | null;
	collections: Collection[];
	bookmarks: Bookmark[];

	loadSession: () => Promise<void>;
	login: (email: string, password: string) => Promise<string | null>;
	register: (email: string, password: string) => Promise<string | null>;
	logout: () => Promise<void>;
	fetchCollections: () => Promise<void>;
	fetchBookmarks: () => Promise<void>;
	fetchCollectionBookmarks: (collectionId: string) => Promise<void>;
	evictCollectionBookmarks: (collectionId: string) => void;
	addCollection: (name: string, isPrivate?: boolean) => Promise<void>;
	addBookmark: (
		title: string,
		url: string,
		collectionId: string,
		tag?: string,
	) => Promise<void>;
	deleteBookmark: (id: string) => Promise<void>;
	deleteCollection: (id: string) => Promise<void>;
};

export const useStore = create<Store>((set, get) => ({
	user: null,
	collections: [],
	bookmarks: [],

	loadSession: async () => {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		set({ user: session?.user ?? null });
	},

	login: async (email, password) => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) return error.message;
		set({ user: data.user });
		return null;
	},

	register: async (email, password) => {
		const { data, error } = await supabase.auth.signUp({ email, password });
		if (error) return error.message;
		if (data.user) set({ user: data.user });
		return null;
	},

	logout: async () => {
		await supabase.auth.signOut();
		set({ user: null, collections: [], bookmarks: [] });
	},

	fetchCollections: async () => {
		const { data } = await supabase
			.from("bookmarks_collection")
			.select("*")
			.order("name", { ascending: true });
		set({ collections: data ?? [] });
	},

	// Only fetches bookmarks from non-private collections.
	// Private collection bookmarks never leave the server until explicitly unlocked.
	fetchBookmarks: async () => {
		const { data: publicCols } = await supabase
			.from("bookmarks_collection")
			.select("id")
			.eq("is_private", false);

		const publicIds = publicCols?.map((c) => c.id) ?? [];

		if (publicIds.length === 0) {
			set({
				bookmarks: get().bookmarks.filter(
					(b) => !publicIds.includes(b.collection_id),
				),
			});
			return;
		}

		const { data } = await supabase
			.from("bookmarks")
			.select("*")
			.in("collection_id", publicIds)
			.order("created_at", { ascending: true });

		// Preserve already-unlocked private bookmarks in state
		const privateAlreadyLoaded = get().bookmarks.filter(
			(b) => !publicIds.includes(b.collection_id),
		);
		set({ bookmarks: [...(data ?? []), ...privateAlreadyLoaded] });
	},

	// Fetches bookmarks for a single unlocked private collection and merges them in.
	fetchCollectionBookmarks: async (collectionId) => {
		const { data } = await supabase
			.from("bookmarks")
			.select("*")
			.eq("collection_id", collectionId)
			.order("created_at", { ascending: true });

		const rest = get().bookmarks.filter(
			(b) => b.collection_id !== collectionId,
		);
		set({ bookmarks: [...rest, ...(data ?? [])] });
	},

	// Removes a collection's bookmarks from local state (e.g. when set to private).
	evictCollectionBookmarks: (collectionId) => {
		set({
			bookmarks: get().bookmarks.filter(
				(b) => b.collection_id !== collectionId,
			),
		});
	},

	addCollection: async (name, isPrivate = false) => {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		await supabase
			.from("bookmarks_collection")
			.insert({ name, user_id: user!.id, is_private: isPrivate });
		await get().fetchCollections();
	},

	addBookmark: async (title, url, collectionId, tag) => {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		await supabase
			.from("bookmarks")
			.insert({
				title,
				url,
				collection_id: collectionId,
				user_id: user!.id,
				tag: tag || null,
			});
		await get().fetchCollectionBookmarks(collectionId);
	},

	deleteBookmark: async (id) => {
		const bookmark = get().bookmarks.find((b) => b.id === id);
		await supabase.from("bookmarks").delete().eq("id", id);
		if (bookmark) await get().fetchCollectionBookmarks(bookmark.collection_id);
		else await get().fetchBookmarks();
	},

	deleteCollection: async (id) => {
		await supabase.from("bookmarks_collection").delete().eq("id", id);
		get().evictCollectionBookmarks(id);
		await get().fetchCollections();
	},
}));
