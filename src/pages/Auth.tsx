import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { useTheme } from "../components/ThemeProvider";

export default function Auth() {
	const { user, loadSession, login, register } = useStore();
	const navigate = useNavigate();
	const { theme, toggle } = useTheme();

	const [mode, setMode] = useState<"login" | "register">("login");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	useEffect(() => {
		loadSession().then(() => {
			if (useStore.getState().user) navigate("/app");
		});
	}, []);

	useEffect(() => {
		if (user) navigate("/app");
	}, [user]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setLoading(true);
		if (mode === "login") {
			const err = await login(email, password);
			if (err) setError(err);
		} else {
			const err = await register(email, password);
			if (err) setError(err);
			else setSuccess("Account created! You can now sign in.");
		}
		setLoading(false);
	};

	return (
		<div
			className="min-h-screen flex flex-col"
			style={{ background: "var(--bg)", color: "var(--text)" }}
		>
			{/* Nav */}
			<nav
				className="flex items-center justify-between px-6 sm:px-10 py-4 border-b"
				style={{ background: "var(--bg)", borderColor: "var(--border)" }}
			>
				<Link to="/" className="flex items-center gap-2.5">
					<span className="font-display text-xl font-bold tracking-tight">
						tb
					</span>
					<span
						className="font-display text-sm font-semibold tracking-widest uppercase hidden sm:block"
						style={{ color: "var(--text-muted)" }}
					>
						Tobuko
					</span>
				</Link>
				<button
					onClick={toggle}
					className="w-8 h-8 flex items-center justify-center rounded-lg"
					style={{ background: "var(--bg-subtle)", color: "var(--text-muted)" }}
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
			</nav>

			{/* Form */}
			<div className="flex-1 flex items-center justify-center px-4 py-16">
				<div className="w-full max-w-sm">
					<div className="mb-8">
						<h1
							className="font-display text-3xl font-bold mb-2"
							style={{ color: "var(--text)" }}
						>
							{mode === "login" ? "Welcome back" : "Create account"}
						</h1>
						<p className="text-sm" style={{ color: "var(--text-muted)" }}>
							{mode === "login"
								? "Sign in to access your bookmarks."
								: "Start saving and organizing your bookmarks."}
						</p>
					</div>

					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<div>
							<label
								className="block text-xs font-medium tracking-widest uppercase mb-1.5"
								style={{ color: "var(--text-muted)" }}
							>
								Email
							</label>
							<input
								type="email"
								required
								className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
								style={{
									background: "var(--bg-subtle)",
									border: "1px solid var(--border)",
									color: "var(--text)",
								}}
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div>
							<label
								className="block text-xs font-medium tracking-widest uppercase mb-1.5"
								style={{ color: "var(--text-muted)" }}
							>
								Password
							</label>
							<input
								type="password"
								required
								className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
								style={{
									background: "var(--bg-subtle)",
									border: "1px solid var(--border)",
									color: "var(--text)",
								}}
								placeholder={
									mode === "register" ? "Minimum 6 characters" : "••••••••"
								}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>

						{error && (
							<p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">
								{error}
							</p>
						)}
						{success && (
							<p className="text-sm text-green-600 dark:text-green-400 bg-green-500/10 rounded-lg px-3 py-2">
								{success}
							</p>
						)}

						<button
							type="submit"
							disabled={loading}
							className="w-full rounded-lg py-2.5 text-sm font-semibold tracking-wide transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
							style={{ background: "var(--accent)", color: "#fff" }}
						>
							{loading ? (
								<>
									<svg
										className="w-4 h-4 animate-spin"
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
									{mode === "login" ? "Signing in..." : "Creating account..."}
								</>
							) : mode === "login" ? (
								"Sign in"
							) : (
								"Create account"
							)}
						</button>

						<p
							className="text-center text-sm"
							style={{ color: "var(--text-muted)" }}
						>
							{mode === "login" ? "No account? " : "Already have an account? "}
							<button
								type="button"
								className="font-medium underline underline-offset-2"
								style={{ color: "var(--accent)" }}
								onClick={() => {
									setMode(mode === "login" ? "register" : "login");
									setError("");
									setSuccess("");
								}}
							>
								{mode === "login" ? "Create one" : "Sign in"}
							</button>
						</p>
					</form>
				</div>
			</div>
		</div>
	);
}
