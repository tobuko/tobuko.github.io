import type { Bookmark, Collection } from "../lib/supabase";

type MenuState = { type: "collection" | "bookmark"; id: string } | null;

export function BookmarkCard({
	bookmark,
	collections,
	menu,
	editingId,
	editingName,
	copiedId,
	movingId,
	getFavicon,
	onOpenUrl,
	onToggleMenu,
	onStartEdit,
	onSaveEdit,
	onCancelEdit,
	onSetEditingName,
	onCopy,
	onStartMove,
	onMove,
	onCancelMove,
	onDelete,
	menuRef,
}: {
	bookmark: Bookmark;
	collections: Collection[];
	menu: MenuState;
	editingId: string | null;
	editingName: string;
	copiedId: string | null;
	movingId: string | null;
	getFavicon: (url: string) => string;
	onOpenUrl: () => void;
	onToggleMenu: (id: string) => void;
	onStartEdit: () => void;
	onSaveEdit: () => void;
	onCancelEdit: () => void;
	onSetEditingName: (n: string) => void;
	onCopy: () => void;
	onStartMove: () => void;
	onMove: (cid: string) => void;
	onCancelMove: () => void;
	onDelete: () => void;
	menuRef: React.RefObject<HTMLDivElement>;
}) {
	const isEditing = editingId === bookmark.id;
	const isMoving = movingId === bookmark.id;
	const isMenuOpen = menu?.type === "bookmark" && menu.id === bookmark.id;

	return (
		<div
			className="group relative flex flex-col rounded-xl p-4 transition-all hover:shadow-lg"
			style={{
				background: "var(--bg-surface)",
				border: "1px solid var(--border)",
			}}
		>
			{/* Favicon + domain */}
			<div className="flex items-center gap-2.5 mb-3">
				<img
					src={getFavicon(bookmark.url)}
					className="w-5 h-5 rounded shrink-0"
					onError={(e) => {
						e.currentTarget.style.display = "none";
					}}
					alt=""
				/>
				<span
					className="text-xs truncate"
					style={{ color: "var(--text-faint)" }}
				>
					{(() => {
						try {
							return new URL(bookmark.url).hostname;
						} catch {
							return bookmark.url;
						}
					})()}
				</span>
			</div>

			{/* Title / edit / move */}
			{isEditing ? (
				<input
					autoFocus
					className="w-full rounded-lg px-3 py-1.5 text-sm outline-none mb-2"
					style={{
						background: "var(--bg-subtle)",
						border: "1px solid var(--border)",
						color: "var(--text)",
					}}
					value={editingName}
					onChange={(e) => onSetEditingName(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") onSaveEdit();
						if (e.key === "Escape") onCancelEdit();
					}}
					onBlur={onSaveEdit}
				/>
			) : isMoving ? (
				<div className="flex items-center gap-2 mb-2">
					<select
						autoFocus
						className="flex-1 rounded-lg px-3 py-1.5 text-xs outline-none appearance-none"
						style={{
							background: "var(--bg-subtle)",
							border: "1px solid var(--border)",
							color: "var(--text)",
						}}
						defaultValue={bookmark.collection_id}
						onChange={(e) => onMove(e.target.value)}
					>
						<option value="">Move to...</option>
						{collections
							.filter((c) => c.id !== bookmark.collection_id)
							.map((c) => (
								<option key={c.id} value={c.id}>
									{c.is_private ? "🔒 " : ""}
									{c.name}
								</option>
							))}
					</select>
					<button onClick={onCancelMove} style={{ color: "var(--text-faint)" }}>
						<svg
							className="w-4 h-4"
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
			) : (
				<button
					className="text-sm font-medium text-left mb-2 line-clamp-2 transition-colors hover:underline underline-offset-2"
					style={{ color: "var(--text)" }}
					onClick={onOpenUrl}
				>
					{bookmark.title}
				</button>
			)}

			{/* Tag */}
			{bookmark.tag && (
				<span
					className="self-start text-xs px-2 py-0.5 rounded-full mb-3"
					style={{ background: "var(--bg-subtle)", color: "var(--text-muted)" }}
				>
					{bookmark.tag}
				</span>
			)}

			{/* Actions */}
			<div
				className="flex items-center gap-1 mt-auto pt-2 border-t"
				style={{ borderColor: "var(--border)" }}
			>
				{/* Copy URL */}
				<button
					onClick={onCopy}
					className="w-7 h-7 flex items-center justify-center rounded-lg"
					style={{ color: "var(--text-faint)" }}
					title="Copy URL"
				>
					{copiedId === bookmark.id ? (
						<svg
							className="w-3.5 h-3.5 text-green-500"
							fill="none"
							viewBox="0 0 14 14"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M2 7l3.5 3.5L12 3" />
						</svg>
					) : (
						<svg
							className="w-3.5 h-3.5"
							fill="none"
							viewBox="0 0 16 16"
							stroke="currentColor"
							strokeWidth="1.5"
						>
							<rect x="5" y="5" width="8" height="9" rx="1" />
							<path d="M3 11V3a1 1 0 011-1h7" strokeLinecap="round" />
						</svg>
					)}
				</button>

				{/* ··· menu */}
				<div className="relative ml-auto" data-menu>
					<button
						onClick={() => onToggleMenu(bookmark.id)}
						className="w-7 h-7 flex items-center justify-center rounded-lg"
						style={{ color: "var(--text-faint)" }}
					>
						<svg
							className="w-3.5 h-3.5"
							fill="currentColor"
							viewBox="0 0 16 16"
						>
							<circle cx="8" cy="3" r="1.5" />
							<circle cx="8" cy="8" r="1.5" />
							<circle cx="8" cy="13" r="1.5" />
						</svg>
					</button>
					{isMenuOpen && (
						<div
							ref={menuRef}
							data-menu
							className="absolute bottom-full right-0 mb-1 w-36 rounded-xl shadow-2xl overflow-hidden z-20"
							style={{
								background: "var(--bg-surface)",
								border: "1px solid var(--border)",
							}}
						>
							{[
								{
									label: "Rename",
									icon: (
										<path d="M11 2l3 3-8 8H3v-3l8-8z" strokeLinejoin="round" />
									),
									action: onStartEdit,
								},
								{
									label: "Move to...",
									icon: (
										<path
											d="M2 8h10M8 4l4 4-4 4"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									),
									action: onStartMove,
								},
							].map(({ label, icon, action }) => (
								<button
									key={label}
									className="w-full text-left px-3 py-2.5 text-xs flex items-center gap-2 transition-colors"
									style={{ color: "var(--text-muted)" }}
									onMouseEnter={(e) =>
										(e.currentTarget.style.background = "var(--bg-subtle)")
									}
									onMouseLeave={(e) =>
										(e.currentTarget.style.background = "transparent")
									}
									onClick={action}
								>
									<svg
										className="w-3 h-3"
										fill="none"
										viewBox="0 0 16 16"
										stroke="currentColor"
										strokeWidth="1.5"
									>
										{icon}
									</svg>
									{label}
								</button>
							))}
							<div style={{ borderTop: "1px solid var(--border)" }} />
							<button
								className="w-full text-left px-3 py-2.5 text-xs flex items-center gap-2 text-red-500 transition-colors"
								onMouseEnter={(e) =>
									(e.currentTarget.style.background = "rgba(239,68,68,0.08)")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.background = "transparent")
								}
								onClick={onDelete}
							>
								<svg
									className="w-3 h-3"
									fill="none"
									viewBox="0 0 16 16"
									stroke="currentColor"
									strokeWidth="1.5"
								>
									<path
										d="M3 4h10M6 4V2h4v2M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								Delete
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
