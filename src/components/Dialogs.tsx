import { useState, useRef, useEffect } from "react";

// ── Confirm Dialog ────────────────────────────────────────────────────────────
export function ConfirmDialog({
	title,
	description,
	confirmLabel = "Delete",
	onConfirm,
	onCancel,
}: {
	title: string;
	description: string;
	confirmLabel?: string;
	onConfirm: () => void;
	onCancel: () => void;
}) {
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
		>
			<div
				className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 shadow-2xl"
				style={{
					background: "var(--bg-surface)",
					border: "1px solid var(--border)",
				}}
			>
				<div className="flex flex-col items-center gap-3 text-center">
					<div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
						<svg
							className="w-6 h-6 text-red-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth="1.5"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
							/>
						</svg>
					</div>
					<div>
						<p
							className="font-display font-semibold text-base mb-1"
							style={{ color: "var(--text)" }}
						>
							{title}
						</p>
						<p className="text-sm" style={{ color: "var(--text-muted)" }}>
							{description}
						</p>
					</div>
				</div>
				<div className="flex gap-3">
					<button
						className="flex-1 rounded-lg py-2.5 text-sm font-semibold"
						style={{
							background: "var(--bg-subtle)",
							color: "var(--text-muted)",
						}}
						onClick={onCancel}
					>
						Cancel
					</button>
					<button
						className="flex-1 rounded-lg py-2.5 text-sm font-semibold bg-red-500 hover:bg-red-400 text-white transition-colors"
						onClick={onConfirm}
					>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}

// ── Password Dialog ───────────────────────────────────────────────────────────
export function PasswordDialog({
	collectionName,
	label,
	onConfirm,
	onCancel,
}: {
	collectionName: string;
	label: string;
	onConfirm: (pw: string) => Promise<string | null>;
	onCancel: () => void;
}) {
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const ref = useRef<HTMLInputElement>(null);
	useEffect(() => {
		setTimeout(() => ref.current?.focus(), 50);
	}, []);

	const submit = async () => {
		if (!password.trim()) return;
		setLoading(true);
		setError("");
		const err = await onConfirm(password);
		if (err) {
			setError(err);
			setPassword("");
		}
		setLoading(false);
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
		>
			<div
				className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 shadow-2xl"
				style={{
					background: "var(--bg-surface)",
					border: "1px solid var(--border)",
				}}
			>
				<div className="flex flex-col items-center gap-2 text-center">
					<div
						className="w-12 h-12 rounded-full flex items-center justify-center"
						style={{ background: "var(--bg-subtle)" }}
					>
						<svg
							className="w-6 h-6"
							style={{ color: "var(--text-muted)" }}
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
					</div>
					<div>
						<p
							className="font-display font-semibold text-base"
							style={{ color: "var(--text)" }}
						>
							Private Collection
						</p>
						<p
							className="text-xs mt-0.5"
							style={{ color: "var(--text-muted)" }}
						>
							{collectionName}
						</p>
						<p
							className="text-xs mt-2 tracking-wide uppercase"
							style={{ color: "var(--text-faint)" }}
						>
							{label}
						</p>
					</div>
				</div>
				<input
					ref={ref}
					type="password"
					className="w-full rounded-lg px-4 py-2.5 text-sm outline-none"
					style={{
						background: "var(--bg-subtle)",
						border: "1px solid var(--border)",
						color: "var(--text)",
					}}
					placeholder="Password..."
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") submit();
						if (e.key === "Escape") onCancel();
					}}
				/>
				{error && <p className="text-sm text-red-500">{error}</p>}
				<div className="flex gap-3">
					<button
						className="flex-1 rounded-lg py-2.5 text-sm font-semibold"
						style={{
							background: "var(--bg-subtle)",
							color: "var(--text-muted)",
						}}
						onClick={onCancel}
					>
						Cancel
					</button>
					<button
						className="flex-1 rounded-lg py-2.5 text-sm font-semibold disabled:opacity-40 transition-colors"
						style={{ background: "var(--accent)", color: "#fff" }}
						onClick={submit}
						disabled={loading || !password.trim()}
					>
						{loading ? "Verifying..." : "Confirm"}
					</button>
				</div>
			</div>
		</div>
	);
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────
export function Modal({
	title,
	onClose,
	children,
}: {
	title: string;
	onClose: () => void;
	children: React.ReactNode;
}) {
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
		>
			<div
				className="w-full max-w-md rounded-2xl shadow-2xl"
				style={{
					background: "var(--bg-surface)",
					border: "1px solid var(--border)",
				}}
			>
				<div className="flex items-center justify-between px-6 pt-6 pb-4">
					<h2
						className="font-display font-bold text-lg"
						style={{ color: "var(--text)" }}
					>
						{title}
					</h2>
					<button
						onClick={onClose}
						className="w-8 h-8 flex items-center justify-center rounded-lg"
						style={{ color: "var(--text-faint)" }}
					>
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
				<div className="px-6 pb-6">{children}</div>
			</div>
		</div>
	);
}

// ── Field ─────────────────────────────────────────────────────────────────────
export function Field({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<label
				className="block text-xs font-medium tracking-widest uppercase mb-1.5"
				style={{ color: "var(--text-muted)" }}
			>
				{label}
			</label>
			{children}
		</div>
	);
}

export const inputStyle: React.CSSProperties = {
	background: "var(--bg-subtle)",
	border: "1px solid var(--border)",
	color: "var(--text)",
};
