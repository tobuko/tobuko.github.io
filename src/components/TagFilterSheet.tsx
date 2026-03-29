// ── Tag Filter — desktop dropdown + mobile bottom sheet ───────────────────────
export function TagFilterSheet({
	open,
	allTags,
	activeTags,
	onToggleTag,
	onClearAll,
	onClose,
}: {
	open: boolean;
	allTags: string[];
	activeTags: Set<string>;
	onToggleTag: (tag: string) => void;
	onClearAll: () => void;
	onClose: () => void;
}) {
	const TagPills = ({ size = "sm" }: { size?: "sm" | "md" }) => (
		<div className="flex flex-wrap gap-1.5">
			{activeTags.size > 0 && (
				<button
					className={`${size === "md" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs"} rounded-full border transition-colors`}
					style={{ borderColor: "var(--border)", color: "var(--text-faint)" }}
					onClick={onClearAll}
				>
					Clear all
				</button>
			)}
			{allTags.map((tag) => {
				const active = activeTags.has(tag);
				return (
					<button
						key={tag}
						onClick={() => onToggleTag(tag)}
						className={`${size === "md" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs"} rounded-full border transition-all`}
						style={{
							background: active ? "var(--accent)" : "transparent",
							borderColor: active ? "var(--accent)" : "var(--border)",
							color: active ? "#fff" : "var(--text-muted)",
						}}
					>
						{tag}
					</button>
				);
			})}
		</div>
	);

	return (
		<>
			{/* Desktop dropdown */}
			{open && (
				<div
					className="hidden sm:block absolute top-full left-0 mt-1.5 z-30 rounded-xl p-3 shadow-2xl min-w-[200px]"
					style={{
						background: "var(--bg-surface)",
						border: "1px solid var(--border)",
					}}
				>
					{allTags.length === 0 ? (
						<p className="text-xs py-1" style={{ color: "var(--text-faint)" }}>
							No tags found
						</p>
					) : (
						<TagPills />
					)}
				</div>
			)}

			{/* Mobile bottom sheet */}
			{open && (
				<div
					className="sm:hidden fixed inset-0 z-50 flex items-end justify-center"
					style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
					onClick={onClose}
				>
					<div
						className="w-full max-w-lg rounded-t-2xl shadow-2xl"
						style={{
							background: "var(--bg-surface)",
							border: "1px solid var(--border)",
						}}
						onClick={(e) => e.stopPropagation()}
					>
						{/* Handle */}
						<div className="flex justify-center pt-3 pb-1">
							<div
								className="w-10 h-1 rounded-full"
								style={{ background: "var(--border-strong)" }}
							/>
						</div>
						<div className="flex items-center justify-between px-5 py-3">
							<p
								className="font-display font-semibold text-base"
								style={{ color: "var(--text)" }}
							>
								Filter by Tag
							</p>
							{activeTags.size > 0 && (
								<button
									className="text-xs font-medium"
									style={{ color: "var(--accent)" }}
									onClick={onClearAll}
								>
									Clear all
								</button>
							)}
						</div>
						<div className="px-5 pb-6">
							{allTags.length === 0 ? (
								<p
									className="text-sm py-4 text-center"
									style={{ color: "var(--text-faint)" }}
								>
									No tags found
								</p>
							) : (
								<TagPills size="md" />
							)}
						</div>
						<button
							className="w-full py-4 text-sm font-semibold border-t"
							style={{
								color: "var(--text-muted)",
								borderColor: "var(--border)",
							}}
							onClick={onClose}
						>
							Done
						</button>
					</div>
				</div>
			)}
		</>
	);
}
