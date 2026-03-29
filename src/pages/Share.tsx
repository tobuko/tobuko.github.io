import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase, Collection, Bookmark } from "../lib/supabase";
import { useTheme } from "../components/ThemeProvider";

export default function Share() {
	const { id } = useParams<{ id: string }>();
	const { theme, toggle } = useTheme();

	const [collection, setCollection] = useState<Collection | null>(null);
	const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const [search, setSearch] = useState("");

	useEffect(() => {
		if (!id) {
			setError("Invalid link.");
			setLoading(false);
			return;
		}

		const load = async () => {
			// Fetch collection
			const { data: col, error: colErr } = await supabase
				.from("bookmarks_collection")
				.select("*")
				.eq("id", id)
				.single();

			if (colErr || !col) {
				setError("Collection not found or no longer shared.");
				setLoading(false);
				return;
			}

			// Don't expose private collections
			if (col.is_private) {
				setError("This collection is private.");
				setLoading(false);
				return;
			}

			setCollection(col);

			const { data: bms } = await supabase
				.from("bookmarks")
				.select("*")
				.eq("collection_id", id)
				.order("created_at", { ascending: false });

			setBookmarks(bms ?? []);
			setLoading(false);
		};

		load();
	}, [id]);

	const getFavicon = (url: string) => {
		try {
			return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;
		} catch {
			return "";
		}
	};

	const filtered = bookmarks.filter((b) => {
		const q = search.trim().toLowerCase();
		if (!q) return true;
		return (
			b.title.toLowerCase().includes(q) ||
			b.url.toLowerCase().includes(q) ||
			(b.tag ?? "").toLowerCase().includes(q)
		);
	});

	return (
		<div
			className="min-h-screen flex flex-col"
			style={{ background: "var(--bg)", color: "var(--text)" }}
		>
			{/* Nav */}
			<nav
				className="flex items-center justify-between px-6 py-4 border-b"
				style={{ borderColor: "var(--border)" }}
			>
				<Link to="/" className="flex items-center gap-2.5">
					<span className="font-display text-lg font-bold tracking-tight">
						tb
					</span>
					<span
						className="font-display text-sm font-semibold tracking-widest uppercase"
						style={{ color: "var(--text-muted)" }}
					>
						Tobuko
					</span>
				</Link>
				<div className="flex items-center gap-3">
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
					<Link
						to="/login"
						className="text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
						style={{ background: "var(--accent)", color: "#fff" }}
					>
						Try Tobuko
					</Link>
				</div>
			</nav>

			<div className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
				{loading && (
					<div className="flex items-center justify-center py-20">
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
				)}

				{error && (
					<div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
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
									d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
								/>
							</svg>
						</div>
						<div>
							<p
								className="font-display font-semibold text-lg"
								style={{ color: "var(--text)" }}
							>
								{error}
							</p>
							<p
								className="text-sm mt-1"
								style={{ color: "var(--text-muted)" }}
							>
								The collection may have been removed or set to private.
							</p>
						</div>
						<Link
							to="/"
							className="text-sm font-medium underline underline-offset-2"
							style={{ color: "var(--accent)" }}
						>
							Go to Tobuko
						</Link>
					</div>
				)}

				{!loading && !error && collection && (
					<>
						{/* Collection header */}
						<div className="mb-8">
							<div className="flex items-start justify-between gap-4 flex-wrap">
								<div>
									<p
										className="text-xs font-medium tracking-widest uppercase mb-2"
										style={{ color: "var(--text-faint)" }}
									>
										Shared collection
									</p>
									<h1
										className="font-display text-3xl font-bold"
										style={{ color: "var(--text)" }}
									>
										{collection.name}
									</h1>
									<p
										className="text-sm mt-1.5"
										style={{ color: "var(--text-muted)" }}
									>
										{bookmarks.length} bookmark
										{bookmarks.length !== 1 ? "s" : ""}
									</p>
								</div>

								{/* Copy link button */}
								<button
									className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all"
									style={{
										background: "var(--bg-subtle)",
										border: "1px solid var(--border)",
										color: "var(--text-muted)",
									}}
									onClick={() => {
										navigator.clipboard.writeText(window.location.href);
										setCopiedId("__link__");
										setTimeout(() => setCopiedId(null), 1500);
									}}
								>
									{copiedId === "__link__" ? (
										<>
											<svg
												className="w-4 h-4 text-green-500"
												fill="none"
												viewBox="0 0 14 14"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<path d="M2 7l3.5 3.5L12 3" />
											</svg>{" "}
											Copied!
										</>
									) : (
										<>
											<svg
												className="w-4 h-4"
												fill="none"
												viewBox="0 0 16 16"
												stroke="currentColor"
												strokeWidth="1.5"
											>
												<path
													d="M5 7.5a2.5 2.5 0 000 5h1m4-10h1a2.5 2.5 0 010 5H10M6 10h4"
													strokeLinecap="round"
												/>
											</svg>{" "}
											Copy link
										</>
									)}
								</button>
							</div>

							{/* Search */}
							{bookmarks.length > 5 && (
								<div className="relative mt-5 max-w-sm">
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
										placeholder="Search in collection..."
										value={search}
										onChange={(e) => setSearch(e.target.value)}
									/>
								</div>
							)}
						</div>

						{/* Bookmark list */}
						{filtered.length === 0 ? (
							<p
								className="text-sm py-8 text-center"
								style={{ color: "var(--text-faint)" }}
							>
								No results for "{search}"
							</p>
						) : (
							<div className="flex flex-col gap-2">
								{filtered.map((bookmark) => (
									<a
										key={bookmark.id}
										href={bookmark.url}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-4 rounded-xl p-4 transition-all group hover:-translate-y-0.5"
										style={{
											background: "var(--bg-surface)",
											border: "1px solid var(--border)",
										}}
									>
										<img
											src={getFavicon(bookmark.url)}
											className="w-8 h-8 rounded-lg shrink-0"
											onError={(e) => {
												e.currentTarget.style.display = "none";
											}}
											alt=""
										/>
										<div className="flex-1 min-w-0">
											<p
												className="text-sm font-medium truncate transition-colors group-hover:underline underline-offset-2"
												style={{ color: "var(--text)" }}
											>
												{bookmark.title}
											</p>
											<p
												className="text-xs truncate mt-0.5"
												style={{ color: "var(--text-faint)" }}
											>
												{(() => {
													try {
														return new URL(bookmark.url).hostname;
													} catch {
														return bookmark.url;
													}
												})()}
											</p>
										</div>
										{bookmark.tag && (
											<span
												className="text-xs px-2.5 py-1 rounded-full shrink-0"
												style={{
													background: "var(--bg-subtle)",
													color: "var(--text-muted)",
												}}
											>
												{bookmark.tag}
											</span>
										)}
										<svg
											className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
											style={{ color: "var(--text-faint)" }}
											fill="none"
											viewBox="0 0 16 16"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="M3 8h10M9 4l4 4-4 4" />
										</svg>
									</a>
								))}
							</div>
						)}

						{/* Footer CTA */}
						<div
							className="mt-12 rounded-2xl p-6 text-center"
							style={{
								background: "var(--bg-subtle)",
								border: "1px solid var(--border)",
							}}
						>
							<p
								className="font-display font-semibold text-base mb-1"
								style={{ color: "var(--text)" }}
							>
								Save and organize your own bookmarks
							</p>
							<p
								className="text-sm mb-4"
								style={{ color: "var(--text-muted)" }}
							>
								Tobuko helps you collect links, organize them into collections,
								and access them anywhere.
							</p>
							<Link
								to="/login"
								className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
								style={{ background: "var(--accent)", color: "#fff" }}
							>
								Get started free
								<svg
									className="w-4 h-4"
									fill="none"
									viewBox="0 0 16 16"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M3 8h10M9 4l4 4-4 4" />
								</svg>
							</Link>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
