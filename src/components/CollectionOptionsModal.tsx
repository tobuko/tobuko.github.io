import type { Collection } from "../lib/supabase";

export function CollectionOptionsModal({
	collection,
	isPrivate,
	onClose,
	onRename,
	onSetPrivacy,
	onClear,
	onDelete,
}: {
	collection: Collection;
	isPrivate: boolean;
	onClose: () => void;
	onRename: () => void;
	onSetPrivacy: () => void;
	onClear: () => void;
	onDelete: () => void;
}) {
	const items = [
		{
			label: "Rename",
			color: "var(--text-muted)",
			action: onRename,
			icon: <path d="M11 2l3 3-8 8H3v-3l8-8z" strokeLinejoin="round" />,
		},
		{
			label: isPrivate ? "Set Public" : "Set Private",
			color: "rgb(217,119,6)",
			action: onSetPrivacy,
			icon: isPrivate ? (
				<>
					<rect x="3" y="7" width="10" height="7" rx="1" />
					<path d="M5 7V5a3 3 0 016 0v2" />
				</>
			) : (
				<>
					<rect x="3" y="7" width="10" height="7" rx="1" />
					<path d="M5 7V5a3 3 0 016 0" />
				</>
			),
		},
		{
			label: "Clear bookmarks",
			color: "rgb(234,88,12)",
			action: onClear,
			icon: (
				<path
					d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			),
		},
		{
			label: "Delete",
			color: "rgb(239,68,68)",
			action: onDelete,
			icon: (
				<path
					d="M3 4h10M6 4V2h4v2M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			),
		},
	];

	return (
		<div
			className="fixed inset-0 z-50 flex items-end justify-center md:hidden"
			style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
			onClick={onClose}
		>
			<div
				className="w-full max-w-sm rounded-t-2xl overflow-hidden shadow-2xl"
				style={{
					background: "var(--bg-surface)",
					border: "1px solid var(--border)",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Handle */}
				<div className="flex justify-center pt-3 pb-2">
					<div
						className="w-10 h-1 rounded-full"
						style={{ background: "var(--border-strong)" }}
					/>
				</div>
				{/* Collection name */}
				<p
					className="text-center text-xs font-medium tracking-widest uppercase px-4 pb-3"
					style={{ color: "var(--text-faint)" }}
				>
					{collection.name}
				</p>
				<div style={{ borderTop: "1px solid var(--border)" }}>
					{items.map(({ label, color, action, icon }) => (
						<button
							key={label}
							className="w-full text-left px-5 py-4 text-sm flex items-center gap-3 active:opacity-60"
							style={{ color, borderBottom: "1px solid var(--border)" }}
							onClick={() => {
								action();
								onClose();
							}}
						>
							<svg
								className="w-4 h-4 shrink-0"
								fill="none"
								viewBox="0 0 16 16"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
							>
								{icon}
							</svg>
							{label}
						</button>
					))}
				</div>
				<button
					className="w-full py-4 text-sm font-semibold"
					style={{ color: "var(--text-muted)" }}
					onClick={onClose}
				>
					Cancel
				</button>
			</div>
		</div>
	);
}
