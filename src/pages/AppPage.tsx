import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { supabase, Bookmark, Collection } from "../lib/supabase";
import { useTheme } from "../components/ThemeProvider";
import {
	ConfirmDialog,
	PasswordDialog,
	Modal,
	Field,
	inputStyle,
} from "../components/Dialogs";
import { CollectionOptionsModal } from "../components/CollectionOptionsModal";
import { TagFilterSheet } from "../components/TagFilterSheet";
import { BookmarkCard } from "../components/BookmarkCard";

type MenuState = { type: "collection" | "bookmark"; id: string } | null;
const EMPTY_BOOKMARK_FORM = { title: "", url: "", collection: "", tag: "" };
const EMPTY_COLL_FORM = { name: "", isPrivate: false };

export default function AppPage() {
	const {
		user,
		loadSession,
		logout,
		collections,
		bookmarks,
		fetchCollections,
		fetchBookmarks,
		fetchCollectionBookmarks,
		evictCollectionBookmarks,
		addCollection,
		addBookmark,
		deleteBookmark,
		deleteCollection,
	} = useStore();
	const navigate = useNavigate();
	const { theme, toggle } = useTheme();

	const [loading, setLoading] = useState(true);
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
	const [activeCollection, setActiveCollection] = useState<string | null>(null);
	const [search, setSearch] = useState("");
	const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
	const [tagFilterOpen, setTagFilterOpen] = useState(false);
	const [menu, setMenu] = useState<MenuState>(null);
	const [collectionMenu, setCollectionMenu] = useState<string | null>(null);
	const [collectionMenuPos, setCollectionMenuPos] = useState<{
		x: number;
		y: number;
	}>({ x: 0, y: 0 });
	const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [mobileLongPressCollection, setMobileLongPressCollection] =
		useState<Collection | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingName, setEditingName] = useState("");
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const [movingId, setMovingId] = useState<string | null>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	const [unlockedPrivate, setUnlockedPrivate] = useState<Set<string>>(
		new Set(),
	);
	const [unlocking, setUnlocking] = useState<Collection | null>(null);
	const [privacyAction, setPrivacyAction] = useState<{
		collection: Collection;
		action: "set" | "unset";
	} | null>(null);
	const [renameGate, setRenameGate] = useState<Collection | null>(null);
	const [deleteCollGate, setDeleteCollGate] = useState<Collection | null>(null);
	const [clearGate, setClearGate] = useState<Collection | null>(null);
	const [confirmDelete, setConfirmDelete] = useState<{
		type: "bookmark" | "collection";
		id: string;
		name: string;
	} | null>(null);
	const [confirmClear, setConfirmClear] = useState<Collection | null>(null);

	const [showBookmarkForm, setShowBookmarkForm] = useState(false);
	const [bookmarkForm, setBookmarkForm] = useState(EMPTY_BOOKMARK_FORM);
	const [bookmarkFormSaving, setBookmarkFormSaving] = useState(false);
	const [bookmarkFormError, setBookmarkFormError] = useState("");
	const [showCollForm, setShowCollForm] = useState(false);
	const [collForm, setCollForm] = useState(EMPTY_COLL_FORM);
	const [collFormSaving, setCollFormSaving] = useState(false);
	const [collFormError, setCollFormError] = useState("");

	useEffect(() => {
		loadSession().then(async () => {
			const u = useStore.getState().user;
			if (!u) {
				navigate("/auth");
				return;
			}
			await Promise.all([fetchCollections(), fetchBookmarks()]);
			setLoading(false);
		});
	}, []);

	useEffect(() => {
		if (!loading && !user) navigate("/auth");
	}, [user, loading]);

	useEffect(() => {
		if (!user) return;
		const ch = supabase
			.channel("tobuko-web")
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "bookmarks" },
				async () => {
					await fetchBookmarks();
					// Re-fetch any unlocked private collections too
					const unlocked = Array.from(unlockedPrivate);
					await Promise.all(unlocked.map((id) => fetchCollectionBookmarks(id)));
				},
			)
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "bookmarks_collection" },
				() => fetchCollections(),
			)
			.subscribe();
		return () => {
			supabase.removeChannel(ch);
		};
	}, [user, unlockedPrivate]);

	useEffect(() => {
		const h = (e: MouseEvent) => {
			if (!document.querySelector("[data-menu]")?.contains(e.target as Node)) {
				setMenu(null);
				setCollectionMenu(null);
			}
		};
		document.addEventListener("mousedown", h);
		return () => document.removeEventListener("mousedown", h);
	}, []);

	const selectCollection = (id: string | null) => {
		if (id) {
			const col = collections.find((c) => c.id === id);
			if (col?.is_private && !unlockedPrivate.has(id)) {
				setUnlocking(col);
				return;
			}
		}
		setActiveCollection(id);
		setMobileSidebarOpen(false);
	};

	const verifyPassword = async (pw: string): Promise<string | null> => {
		if (!user?.email) return "No user.";
		const { error } = await supabase.auth.signInWithPassword({
			email: user.email,
			password: pw,
		});
		return error ? "Incorrect password." : null;
	};

	const getFavicon = (url: string) => {
		try {
			return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;
		} catch {
			return "";
		}
	};

	// Tags from non-locked private collections only
	const allTags = Array.from(
		new Set(
			bookmarks
				.filter((b) => {
					const col = collections.find((c) => c.id === b.collection_id);
					if (col?.is_private && !unlockedPrivate.has(col.id)) return false;
					return true;
				})
				.map((b) => b.tag)
				.filter((t): t is string => !!t?.trim()),
		),
	).sort();

	const visibleBookmarks = bookmarks.filter((b) => {
		const col = collections.find((c) => c.id === b.collection_id);
		if (col?.is_private && !unlockedPrivate.has(col.id)) return false;
		if (activeCollection && b.collection_id !== activeCollection) return false;
		if (activeTags.size > 0 && !activeTags.has(b.tag ?? "")) return false;
		const q = search.trim().toLowerCase();
		if (!q) return true;
		return (
			b.title.toLowerCase().includes(q) ||
			b.url.toLowerCase().includes(q) ||
			(b.tag ?? "").toLowerCase().includes(q)
		);
	});

	const handleEdit = async (type: "collection" | "bookmark", id: string) => {
		if (!editingName.trim()) {
			setEditingId(null);
			return;
		}
		if (type === "collection") {
			await supabase
				.from("bookmarks_collection")
				.update({ name: editingName.trim() })
				.eq("id", id);
			fetchCollections();
		} else {
			await supabase
				.from("bookmarks")
				.update({ title: editingName.trim() })
				.eq("id", id);
			fetchBookmarks();
		}
		setEditingId(null);
	};

	const handleMove = async (bookmark: Bookmark, collectionId: string) => {
		if (!collectionId || collectionId === bookmark.collection_id) {
			setMovingId(null);
			return;
		}
		await supabase
			.from("bookmarks")
			.update({ collection_id: collectionId })
			.eq("id", bookmark.id);
		await fetchBookmarks();
		setMovingId(null);
	};

	const handleAddBookmark = async () => {
		setBookmarkFormError("");
		if (!bookmarkForm.title.trim())
			return setBookmarkFormError("Title is required.");
		if (!bookmarkForm.url.trim())
			return setBookmarkFormError("URL is required.");
		try {
			new URL(bookmarkForm.url);
		} catch {
			return setBookmarkFormError("Enter a valid URL.");
		}
		let collectionId = bookmarkForm.collection;
		if (!collectionId) {
			let unc = collections.find((c) => c.name === "Uncategorized");
			if (!unc) {
				await addCollection("Uncategorized");
				await fetchCollections();
				unc = useStore
					.getState()
					.collections.find((c) => c.name === "Uncategorized");
			}
			collectionId = unc?.id ?? "";
		}
		setBookmarkFormSaving(true);
		try {
			await addBookmark(
				bookmarkForm.title.trim(),
				bookmarkForm.url.trim(),
				collectionId,
				bookmarkForm.tag.trim(),
			);
			setShowBookmarkForm(false);
			setBookmarkForm(EMPTY_BOOKMARK_FORM);
		} catch {
			setBookmarkFormError("Failed to save.");
		}
		setBookmarkFormSaving(false);
	};

	const handleAddCollection = async () => {
		setCollFormError("");
		if (!collForm.name.trim()) return setCollFormError("Name is required.");
		setCollFormSaving(true);
		try {
			await addCollection(collForm.name.trim(), collForm.isPrivate);
			setShowCollForm(false);
			setCollForm(EMPTY_COLL_FORM);
		} catch {
			setCollFormError("Failed to create collection.");
		}
		setCollFormSaving(false);
	};

	if (loading) {
		return (
			<div
				className="min-h-screen flex items-center justify-center"
				style={{ background: "var(--bg)" }}
			>
				<svg
					className="w-6 h-6 animate-spin"
					style={{ color: "var(--text-faint)" }}
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					/>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
					/>
				</svg>
			</div>
		);
	}

	const SidebarContent = () => (
		<div className="flex flex-col h-full min-h-0">
			<div className="px-3 pt-4 pb-3">
				<button
					onClick={() => {
						setShowCollForm(true);
						setMobileSidebarOpen(false);
					}}
					className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
					style={{
						background: "var(--bg-subtle)",
						border: "1px dashed var(--border-strong)",
						color: "var(--text-muted)",
					}}
				>
					<svg
						className="w-3.5 h-3.5 shrink-0"
						fill="none"
						viewBox="0 0 14 14"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
					>
						<path d="M7 1v12M1 7h12" />
					</svg>
					New collection
				</button>
			</div>

			<div className="px-3 pb-1">
				<button
					className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between"
					style={{
						background: !activeCollection ? "var(--bg-subtle)" : "transparent",
						color: !activeCollection ? "var(--text)" : "var(--text-muted)",
					}}
					onClick={() => selectCollection(null)}
				>
					<span className="flex items-center gap-2">
						<svg
							className="w-3.5 h-3.5 shrink-0"
							style={{ color: "var(--text-faint)" }}
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth="1.5"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
							/>
						</svg>
						All bookmarks
					</span>
					<span className="text-xs" style={{ color: "var(--text-faint)" }}>
						{bookmarks.length}
					</span>
				</button>
			</div>

			<div className="px-6 pb-1.5 pt-2">
				<p
					className="text-[10px] font-semibold tracking-widest uppercase"
					style={{ color: "var(--text-faint)" }}
				>
					Collections
				</p>
			</div>

			<div className="flex-1 overflow-y-auto min-h-0 px-3 pb-4">
				{collections.length === 0 && (
					<p
						className="px-3 py-2 text-xs"
						style={{ color: "var(--text-faint)" }}
					>
						No collections yet
					</p>
				)}
				{collections.map((c) => {
					const count = bookmarks.filter(
						(b) => b.collection_id === c.id,
					).length;
					const isPrivate = c.is_private;
					const isUnlocked = unlockedPrivate.has(c.id);
					const active = activeCollection === c.id;
					const menuOpen = collectionMenu === c.id;

					const openMenu = (e: React.MouseEvent | React.TouchEvent) => {
						e.stopPropagation();
						e.preventDefault();
						if (window.innerWidth < 768) {
							setMobileLongPressCollection(c);
							return;
						}
						const target = (e.currentTarget as HTMLElement).closest(
							"[data-collection-row]",
						) as HTMLElement;
						if (target) {
							const rect = target.getBoundingClientRect();
							setCollectionMenuPos({ x: rect.right + 4, y: rect.top });
						}
						setCollectionMenu(menuOpen ? null : c.id);
					};

					return (
						<div
							key={c.id}
							className="group relative mb-0.5"
							data-collection-row
						>
							<div
								className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer select-none"
								style={{
									background: active ? "var(--bg-subtle)" : "transparent",
									color: active ? "var(--text)" : "var(--text-muted)",
								}}
								onClick={() => selectCollection(c.id)}
								onTouchStart={(e) => {
									longPressTimer.current = setTimeout(() => {
										openMenu(e);
										longPressTimer.current = null;
									}, 500);
								}}
								onTouchEnd={() => {
									if (longPressTimer.current) {
										clearTimeout(longPressTimer.current);
										longPressTimer.current = null;
									}
								}}
								onTouchMove={() => {
									if (longPressTimer.current) {
										clearTimeout(longPressTimer.current);
										longPressTimer.current = null;
									}
								}}
							>
								{isPrivate && !isUnlocked ? (
									<svg
										className="w-3.5 h-3.5 shrink-0 text-amber-500/60"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth="1.5"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
										/>
									</svg>
								) : (
									<svg
										className="w-3.5 h-3.5 shrink-0"
										style={{
											color: isPrivate
												? "rgba(245,158,11,0.5)"
												: "var(--text-faint)",
										}}
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v1H2V6zm0 3v5a2 2 0 002 2h12a2 2 0 002-2V9H2z"
											clipRule="evenodd"
										/>
									</svg>
								)}
								<span className="truncate flex-1">{c.name}</span>
								{(!isPrivate || isUnlocked) && (
									<span
										className="text-xs shrink-0 group-hover:opacity-0"
										style={{ color: "var(--text-faint)" }}
									>
										{count}
									</span>
								)}
								<button
									className="shrink-0 w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 hidden md:group-hover:flex items-center justify-center rounded"
									style={{ color: "var(--text-faint)" }}
									onClick={openMenu}
								>
									<svg
										className="w-3.5 h-3.5"
										fill="currentColor"
										viewBox="0 0 16 16"
									>
										<circle cx="8" cy="2.5" r="1.5" />
										<circle cx="8" cy="8" r="1.5" />
										<circle cx="8" cy="13.5" r="1.5" />
									</svg>
								</button>
							</div>

							{editingId === c.id && (
								<div className="px-2 pb-1" onClick={(e) => e.stopPropagation()}>
									<input
										autoFocus
										className="w-full rounded-lg px-3 py-1.5 text-sm outline-none"
										style={{
											background: "var(--bg-subtle)",
											border: "1px solid var(--border)",
											color: "var(--text)",
										}}
										value={editingName}
										onChange={(e) => setEditingName(e.target.value)}
										onKeyDown={async (e) => {
											if (e.key === "Enter") {
												await supabase
													.from("bookmarks_collection")
													.update({ name: editingName.trim() })
													.eq("id", c.id);
												fetchCollections();
												setEditingId(null);
											}
											if (e.key === "Escape") setEditingId(null);
										}}
										onBlur={async () => {
											if (editingName.trim()) {
												await supabase
													.from("bookmarks_collection")
													.update({ name: editingName.trim() })
													.eq("id", c.id);
												fetchCollections();
											}
											setEditingId(null);
										}}
									/>
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Fixed desktop dropdown */}
			{collectionMenu &&
				(() => {
					const c = collections.find((col) => col.id === collectionMenu);
					if (!c) return null;
					const isPrivate = c.is_private;
					const items = [
						{
							label: "Rename",
							color: "var(--text-muted)",
							action: () => {
								setCollectionMenu(null);
								if (isPrivate) setRenameGate(c);
								else {
									setEditingId(c.id);
									setEditingName(c.name);
								}
							},
						},
						{
							label: isPrivate ? "Set Public" : "Set Private",
							color: "rgb(217,119,6)",
							action: () => {
								setCollectionMenu(null);
								setPrivacyAction({
									collection: c,
									action: isPrivate ? "unset" : "set",
								});
							},
						},
						{
							label: "Clear bookmarks",
							color: "rgb(234,88,12)",
							action: () => {
								setCollectionMenu(null);
								if (isPrivate) setClearGate(c);
								else setConfirmClear(c);
							},
						},
						{
							label: "Delete",
							color: "rgb(239,68,68)",
							action: () => {
								setCollectionMenu(null);
								if (isPrivate) setDeleteCollGate(c);
								else
									setConfirmDelete({
										type: "collection",
										id: c.id,
										name: c.name,
									});
							},
						},
					];
					return (
						<div
							data-menu
							className="fixed z-[9999] w-44 rounded-xl shadow-2xl overflow-hidden"
							style={{
								background: "var(--bg-surface)",
								border: "1px solid var(--border)",
								left: collectionMenuPos.x,
								top: collectionMenuPos.y,
							}}
						>
							{items.map(({ label, color, action }, i) => (
								<span key={label}>
									{i > 0 && (
										<div style={{ borderTop: "1px solid var(--border)" }} />
									)}
									<button
										className="w-full text-left px-3 py-2.5 text-xs flex items-center gap-2 transition-colors"
										style={{ color }}
										onMouseEnter={(e) =>
											(e.currentTarget.style.background = "var(--bg-subtle)")
										}
										onMouseLeave={(e) =>
											(e.currentTarget.style.background = "transparent")
										}
										onClick={action}
									>
										{label}
									</button>
								</span>
							))}
						</div>
					);
				})()}
		</div>
	);

	return (
		<div
			className="min-h-screen flex flex-col"
			style={{ background: "var(--bg)", color: "var(--text)" }}
		>
			{unlocking && (
				<PasswordDialog
					collectionName={unlocking.name}
					label="Enter password to unlock"
					onConfirm={async (pw) => {
						const e = await verifyPassword(pw);
						if (e) return e;
						const id = unlocking.id;
						setUnlockedPrivate((p) => new Set([...p, id]));
						await fetchCollectionBookmarks(id);
						setUnlocking(null);
						setActiveCollection(id);
						setMobileSidebarOpen(false);
						return null;
					}}
					onCancel={() => setUnlocking(null)}
				/>
			)}
			{privacyAction && (
				<PasswordDialog
					collectionName={privacyAction.collection.name}
					label={
						privacyAction.action === "set"
							? "Confirm to make private"
							: "Confirm to make public"
					}
					onConfirm={async (pw) => {
						const e = await verifyPassword(pw);
						if (e) return e;
						await supabase
							.from("bookmarks_collection")
							.update({ is_private: privacyAction.action === "set" })
							.eq("id", privacyAction.collection.id);
						if (privacyAction.action === "set") {
							evictCollectionBookmarks(privacyAction.collection.id);
							setUnlockedPrivate((p) => {
								const n = new Set(p);
								n.delete(privacyAction.collection.id);
								return n;
							});
							if (activeCollection === privacyAction.collection.id)
								setActiveCollection(null);
						} else {
							await fetchCollectionBookmarks(privacyAction.collection.id);
						}
						await fetchCollections();
						setPrivacyAction(null);
						return null;
					}}
					onCancel={() => setPrivacyAction(null)}
				/>
			)}
			{renameGate && (
				<PasswordDialog
					collectionName={renameGate.name}
					label="Enter password to rename"
					onConfirm={async (pw) => {
						const e = await verifyPassword(pw);
						if (e) return e;
						setEditingId(renameGate.id);
						setEditingName(renameGate.name);
						setRenameGate(null);
						return null;
					}}
					onCancel={() => setRenameGate(null)}
				/>
			)}
			{deleteCollGate && (
				<PasswordDialog
					collectionName={deleteCollGate.name}
					label="Enter password to delete"
					onConfirm={async (pw) => {
						const e = await verifyPassword(pw);
						if (e) return e;
						const c = deleteCollGate;
						setDeleteCollGate(null);
						setConfirmDelete({ type: "collection", id: c.id, name: c.name });
						return null;
					}}
					onCancel={() => setDeleteCollGate(null)}
				/>
			)}
			{clearGate && (
				<PasswordDialog
					collectionName={clearGate.name}
					label="Enter password to clear"
					onConfirm={async (pw) => {
						const e = await verifyPassword(pw);
						if (e) return e;
						const c = clearGate;
						setClearGate(null);
						setConfirmClear(c);
						return null;
					}}
					onCancel={() => setClearGate(null)}
				/>
			)}
			{confirmDelete && (
				<ConfirmDialog
					title={
						confirmDelete.type === "collection"
							? "Delete Collection"
							: "Delete Bookmark"
					}
					description={
						confirmDelete.type === "collection"
							? `"${confirmDelete.name}" and all its bookmarks will be permanently deleted.`
							: `"${confirmDelete.name}" will be permanently deleted.`
					}
					onConfirm={async () => {
						confirmDelete.type === "bookmark"
							? await deleteBookmark(confirmDelete.id)
							: await deleteCollection(confirmDelete.id);
						setConfirmDelete(null);
					}}
					onCancel={() => setConfirmDelete(null)}
				/>
			)}
			{confirmClear && (
				<ConfirmDialog
					title="Clear Collection"
					description={`All bookmarks in "${confirmClear.name}" will be deleted. The collection remains.`}
					confirmLabel="Clear"
					onConfirm={async () => {
						const ids = bookmarks
							.filter((b) => b.collection_id === confirmClear.id)
							.map((b) => b.id);
						await Promise.all(ids.map((id) => deleteBookmark(id)));
						setConfirmClear(null);
					}}
					onCancel={() => setConfirmClear(null)}
				/>
			)}
			{mobileLongPressCollection && (
				<CollectionOptionsModal
					collection={mobileLongPressCollection}
					isPrivate={mobileLongPressCollection.is_private}
					onClose={() => setMobileLongPressCollection(null)}
					onRename={() => {
						if (mobileLongPressCollection.is_private)
							setRenameGate(mobileLongPressCollection);
						else {
							setEditingId(mobileLongPressCollection.id);
							setEditingName(mobileLongPressCollection.name);
						}
					}}
					onSetPrivacy={() =>
						setPrivacyAction({
							collection: mobileLongPressCollection,
							action: mobileLongPressCollection.is_private ? "unset" : "set",
						})
					}
					onClear={() => {
						if (mobileLongPressCollection.is_private)
							setClearGate(mobileLongPressCollection);
						else setConfirmClear(mobileLongPressCollection);
					}}
					onDelete={() => {
						if (mobileLongPressCollection.is_private)
							setDeleteCollGate(mobileLongPressCollection);
						else
							setConfirmDelete({
								type: "collection",
								id: mobileLongPressCollection.id,
								name: mobileLongPressCollection.name,
							});
					}}
				/>
			)}

			{showBookmarkForm && (
				<Modal
					title="New Bookmark"
					onClose={() => {
						setShowBookmarkForm(false);
						setBookmarkForm(EMPTY_BOOKMARK_FORM);
						setBookmarkFormError("");
					}}
				>
					<div className="flex flex-col gap-4">
						<Field label="Title">
							<input
								autoFocus
								className="w-full rounded-lg px-4 py-2.5 text-sm outline-none"
								style={inputStyle}
								placeholder="Bookmark title..."
								value={bookmarkForm.title}
								onChange={(e) =>
									setBookmarkForm({ ...bookmarkForm, title: e.target.value })
								}
							/>
						</Field>
						<Field label="URL">
							<input
								className="w-full rounded-lg px-4 py-2.5 text-sm outline-none"
								style={inputStyle}
								placeholder="https://..."
								value={bookmarkForm.url}
								onChange={(e) =>
									setBookmarkForm({ ...bookmarkForm, url: e.target.value })
								}
							/>
						</Field>
						<Field label="Collection (optional)">
							<select
								className="w-full rounded-lg px-4 py-2.5 text-sm outline-none appearance-none"
								style={inputStyle}
								value={bookmarkForm.collection}
								onChange={(e) =>
									setBookmarkForm({
										...bookmarkForm,
										collection: e.target.value,
									})
								}
							>
								<option value="">None (Uncategorized)</option>
								{collections.map((c) => (
									<option key={c.id} value={c.id}>
										{c.is_private ? "🔒 " : ""}
										{c.name}
									</option>
								))}
							</select>
						</Field>
						<Field label="Tag (optional)">
							<input
								className="w-full rounded-lg px-4 py-2.5 text-sm outline-none"
								style={inputStyle}
								placeholder="e.g. design, work"
								value={bookmarkForm.tag}
								onChange={(e) =>
									setBookmarkForm({ ...bookmarkForm, tag: e.target.value })
								}
							/>
						</Field>
						{bookmarkFormError && (
							<p className="text-sm text-red-500">{bookmarkFormError}</p>
						)}
						<div className="flex gap-3 pt-1">
							<button
								className="flex-1 rounded-lg py-2.5 text-sm font-medium"
								style={{
									background: "var(--bg-subtle)",
									color: "var(--text-muted)",
								}}
								onClick={() => setShowBookmarkForm(false)}
							>
								Cancel
							</button>
							<button
								className="flex-1 rounded-lg py-2.5 text-sm font-semibold disabled:opacity-40"
								style={{ background: "var(--accent)", color: "#fff" }}
								onClick={handleAddBookmark}
								disabled={bookmarkFormSaving}
							>
								{bookmarkFormSaving ? "Saving..." : "Save"}
							</button>
						</div>
					</div>
				</Modal>
			)}

			{showCollForm && (
				<Modal
					title="New Collection"
					onClose={() => {
						setShowCollForm(false);
						setCollForm(EMPTY_COLL_FORM);
						setCollFormError("");
					}}
				>
					<div className="flex flex-col gap-4">
						<Field label="Name">
							<input
								autoFocus
								className="w-full rounded-lg px-4 py-2.5 text-sm outline-none"
								style={inputStyle}
								placeholder="Collection name..."
								value={collForm.name}
								onChange={(e) =>
									setCollForm({ ...collForm, name: e.target.value })
								}
								onKeyDown={(e) => e.key === "Enter" && handleAddCollection()}
							/>
						</Field>
						<button
							type="button"
							className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-left"
							style={{
								background: collForm.isPrivate
									? "rgba(245,158,11,0.08)"
									: "var(--bg-subtle)",
								border: `1px solid ${collForm.isPrivate ? "rgba(245,158,11,0.3)" : "var(--border)"}`,
							}}
							onClick={() =>
								setCollForm({ ...collForm, isPrivate: !collForm.isPrivate })
							}
						>
							<div
								className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${collForm.isPrivate ? "border-amber-500 bg-amber-500" : "border-current"}`}
								style={{ color: "var(--text-faint)" }}
							>
								{collForm.isPrivate && (
									<svg
										className="w-3 h-3 text-white"
										fill="none"
										viewBox="0 0 10 10"
										stroke="currentColor"
										strokeWidth="2.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M1.5 5l2.5 2.5 4.5-4" />
									</svg>
								)}
							</div>
							<div>
								<p
									className="font-medium"
									style={{
										color: collForm.isPrivate
											? "rgba(245,158,11,0.9)"
											: "var(--text)",
									}}
								>
									Private collection
								</p>
								<p
									className="text-xs mt-0.5"
									style={{ color: "var(--text-faint)" }}
								>
									Requires password to view
								</p>
							</div>
						</button>
						{collFormError && (
							<p className="text-sm text-red-500">{collFormError}</p>
						)}
						<div className="flex gap-3 pt-1">
							<button
								className="flex-1 rounded-lg py-2.5 text-sm font-medium"
								style={{
									background: "var(--bg-subtle)",
									color: "var(--text-muted)",
								}}
								onClick={() => setShowCollForm(false)}
							>
								Cancel
							</button>
							<button
								className="flex-1 rounded-lg py-2.5 text-sm font-semibold disabled:opacity-40"
								style={{ background: "var(--accent)", color: "#fff" }}
								onClick={handleAddCollection}
								disabled={collFormSaving}
							>
								{collFormSaving ? "Creating..." : "Create"}
							</button>
						</div>
					</div>
				</Modal>
			)}

			<header
				className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 border-b"
				style={{ background: "var(--bg)", borderColor: "var(--border)" }}
			>
				<button
					className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0"
					style={{ color: "var(--text-muted)" }}
					onClick={() => {
						if (window.innerWidth < 768) setMobileSidebarOpen(true);
						else setSidebarOpen((v) => !v);
					}}
				>
					<svg
						className="w-4 h-4"
						fill="none"
						viewBox="0 0 20 14"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinecap="round"
					>
						<path d="M1 1h18M1 7h18M1 13h18" />
					</svg>
				</button>
				<div className="flex items-center gap-2">
					<span className="font-display font-bold text-lg tracking-tight">
						tb
					</span>
					<span
						className="font-display font-semibold text-sm tracking-widest uppercase hidden sm:block"
						style={{ color: "var(--text-muted)" }}
					>
						Tobuko
					</span>
				</div>
				<div className="flex items-center gap-2 ml-auto">
					<button
						onClick={toggle}
						className="w-8 h-8 flex items-center justify-center rounded-lg"
						style={{
							background: "var(--bg-subtle)",
							color: "var(--text-muted)",
						}}
					>
						{theme === "dark" ? (
							<svg
								className="w-4 h-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth="1.5"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
								/>
							</svg>
						) : (
							<svg
								className="w-4 h-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth="1.5"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
								/>
							</svg>
						)}
					</button>
					<button
						onClick={() => setShowBookmarkForm(true)}
						className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium"
						style={{ background: "var(--accent)", color: "#fff" }}
					>
						<svg
							className="w-3.5 h-3.5"
							fill="none"
							viewBox="0 0 14 14"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
						>
							<path d="M7 1v12M1 7h12" />
						</svg>
						<span className="hidden sm:inline">Add</span>
					</button>
					<button
						onClick={logout}
						className="text-sm px-3 py-1.5 rounded-lg hidden sm:block"
						style={{
							background: "var(--bg-subtle)",
							color: "var(--text-muted)",
						}}
					>
						Sign out
					</button>
				</div>
			</header>

			<div
				className="flex flex-1 overflow-hidden"
				style={{ height: "calc(100dvh - 57px)" }}
			>
				<div
					className="fixed inset-0 z-30 md:hidden transition-opacity duration-300"
					style={{
						background: "rgba(0,0,0,0.4)",
						opacity: mobileSidebarOpen ? 1 : 0,
						pointerEvents: mobileSidebarOpen ? "auto" : "none",
					}}
					onClick={() => setMobileSidebarOpen(false)}
				/>
				<aside
					className="fixed left-0 top-0 bottom-0 z-40 w-72 md:hidden border-r overflow-hidden transition-transform duration-300 ease-in-out"
					style={{
						background: "var(--bg)",
						borderColor: "var(--border)",
						transform: mobileSidebarOpen
							? "translateX(0)"
							: "translateX(-100%)",
					}}
				>
					<div
						className="flex items-center justify-between px-4 py-3 border-b"
						style={{ borderColor: "var(--border)" }}
					>
						<span className="font-display font-bold">Collections</span>
						<button
							onClick={() => setMobileSidebarOpen(false)}
							style={{ color: "var(--text-faint)" }}
						>
							<svg
								className="w-5 h-5"
								fill="none"
								viewBox="0 0 14 14"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
							>
								<path d="M1 1l12 12M13 1L1 13" />
							</svg>
						</button>
					</div>
					<SidebarContent />
				</aside>

				<aside
					className="hidden md:flex flex-col border-r overflow-hidden transition-all duration-200 shrink-0"
					style={{
						width: sidebarOpen ? "224px" : "0px",
						borderColor: "var(--border)",
						opacity: sidebarOpen ? 1 : 0,
						pointerEvents: sidebarOpen ? "auto" : "none",
					}}
				>
					<SidebarContent />
				</aside>

				<main className="flex-1 flex flex-col overflow-hidden min-w-0">
					<div
						className="flex items-center gap-2 px-4 py-3 border-b flex-wrap"
						style={{ borderColor: "var(--border)" }}
					>
						<div
							className="relative flex-1 min-w-0"
							style={{ maxWidth: "420px" }}
						>
							<svg
								className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
								style={{ color: "var(--text-faint)" }}
								fill="none"
								viewBox="0 0 16 16"
								stroke="currentColor"
								strokeWidth="2"
							>
								<circle cx="6.5" cy="6.5" r="5" />
								<path d="M10.5 10.5l3.5 3.5" strokeLinecap="round" />
							</svg>
							<input
								className="w-full rounded-lg py-2 pl-8 pr-4 text-sm outline-none"
								style={{
									background: "var(--bg-subtle)",
									border: "1px solid var(--border)",
									color: "var(--text)",
								}}
								placeholder="Search bookmarks..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
							{search && (
								<button
									className="absolute right-3 top-1/2 -translate-y-1/2"
									style={{ color: "var(--text-faint)" }}
									onClick={() => setSearch("")}
								>
									<svg
										className="w-3.5 h-3.5"
										fill="none"
										viewBox="0 0 14 14"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
									>
										<path d="M1 1l12 12M13 1L1 13" />
									</svg>
								</button>
							)}
						</div>
						<div className="relative">
							<button
								onClick={() => setTagFilterOpen((v) => !v)}
								className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors"
								style={{
									background:
										tagFilterOpen || activeTags.size > 0
											? "var(--bg-subtle)"
											: "transparent",
									border: "1px solid var(--border)",
									color:
										activeTags.size > 0 ? "var(--accent)" : "var(--text-muted)",
								}}
							>
								<svg
									className="w-3.5 h-3.5"
									fill="none"
									viewBox="0 0 16 16"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M2 4h12M4 8h8M6 12h4" />
								</svg>
								<span className="hidden sm:inline">Tags</span>
								{activeTags.size > 0 && (
									<span
										className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
										style={{ background: "var(--accent)", color: "#fff" }}
									>
										{activeTags.size}
									</span>
								)}
							</button>
							<TagFilterSheet
								open={tagFilterOpen}
								allTags={allTags}
								activeTags={activeTags}
								onToggleTag={(tag) =>
									setActiveTags((p) => {
										const n = new Set(p);
										n.has(tag) ? n.delete(tag) : n.add(tag);
										return n;
									})
								}
								onClearAll={() => setActiveTags(new Set())}
								onClose={() => setTagFilterOpen(false)}
							/>
						</div>
						<p
							className="text-sm ml-auto"
							style={{ color: "var(--text-faint)" }}
						>
							{visibleBookmarks.length}
							<span className="hidden sm:inline">
								{" "}
								bookmark{visibleBookmarks.length !== 1 ? "s" : ""}
							</span>
						</p>
					</div>

					<div className="flex-1 overflow-y-auto p-4 sm:p-6">
						{visibleBookmarks.length === 0 ? (
							<div className="flex flex-col items-center justify-center h-full gap-3 text-center py-16">
								<div
									className="w-14 h-14 rounded-2xl flex items-center justify-center"
									style={{ background: "var(--bg-subtle)" }}
								>
									<svg
										className="w-7 h-7"
										style={{ color: "var(--text-faint)" }}
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth="1.5"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
										/>
									</svg>
								</div>
								<div>
									<p
										className="font-display font-semibold"
										style={{ color: "var(--text-muted)" }}
									>
										{search || activeTags.size > 0
											? "No results"
											: "No bookmarks yet"}
									</p>
									<p
										className="text-sm mt-1"
										style={{ color: "var(--text-faint)" }}
									>
										{search || activeTags.size > 0
											? "Try adjusting your filters"
											: "Click Add to save your first bookmark"}
									</p>
								</div>
							</div>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
								{visibleBookmarks.map((bookmark) => (
									<BookmarkCard
										key={bookmark.id}
										bookmark={bookmark}
										collections={collections}
										menu={menu}
										editingId={editingId}
										editingName={editingName}
										copiedId={copiedId}
										movingId={movingId}
										getFavicon={getFavicon}
										onOpenUrl={() =>
											window.open(bookmark.url, "_blank", "noopener,noreferrer")
										}
										onToggleMenu={(id) =>
											setMenu((p) =>
												p?.id === id ? null : { type: "bookmark", id },
											)
										}
										onStartEdit={() => {
											setEditingId(bookmark.id);
											setEditingName(bookmark.title);
											setMenu(null);
										}}
										onSaveEdit={() => handleEdit("bookmark", bookmark.id)}
										onCancelEdit={() => setEditingId(null)}
										onSetEditingName={setEditingName}
										onCopy={() => {
											navigator.clipboard.writeText(bookmark.url);
											setCopiedId(bookmark.id);
											setTimeout(() => setCopiedId(null), 1500);
										}}
										onStartMove={() => {
											setMovingId(bookmark.id);
											setMenu(null);
										}}
										onMove={(cid) => handleMove(bookmark, cid)}
										onCancelMove={() => setMovingId(null)}
										onDelete={() => {
											setConfirmDelete({
												type: "bookmark",
												id: bookmark.id,
												name: bookmark.title,
											});
											setMenu(null);
										}}
										menuRef={menuRef}
									/>
								))}
							</div>
						)}
					</div>
				</main>
			</div>
		</div>
	);
}
