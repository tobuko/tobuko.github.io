import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../components/ThemeProvider";

const sections = [
	{
		title: "What we collect",
		body: `We collect only what's necessary to make Tobuko work:
— Your email address and encrypted password (via Supabase Auth)
— The bookmarks you save: URL, title, tag, and which collection they belong to
— Collection names and whether they are marked private

We do not collect browsing history, page content, analytics about how you use the app, or any data beyond what you explicitly save.`,
	},
	{
		title: "How we use your data",
		body: `Your data is used exclusively to provide the Tobuko service:
— To authenticate you and keep your session active
— To store and sync your bookmarks across devices
— To enforce private collection access (server-side)

We do not use your data for advertising, profiling, or any third-party purpose.`,
	},
	{
		title: "Private collections",
		body: `Private collections are protected at the database level, not just visually in the UI. When a collection is marked private, its bookmarks are excluded from API responses until the correct account password is verified in the same session. Even if someone accessed your account token, private bookmark contents would not be returned without re-authentication.`,
	},
	{
		title: "Data storage",
		body: `Your data is stored on Supabase (supabase.com), a hosted PostgreSQL service. Supabase stores data in data centers within the region selected at project creation. We do not sell, share, or transfer your data to any third parties.`,
	},
	{
		title: "Data retention & deletion",
		body: `You can delete individual bookmarks and collections at any time from within the app. To permanently delete your account and all associated data, contact us at the email below. We will process deletion requests within 30 days.`,
	},
	{
		title: "Cookies & tracking",
		body: `Tobuko uses a session cookie to keep you signed in. We do not use advertising cookies, tracking pixels, or any third-party analytics scripts. We do not use Google Analytics or similar services.`,
	},
	{
		title: "Changes to this policy",
		body: `If we make material changes to this policy, we will update the date below and, where appropriate, notify you by email. Continued use of Tobuko after changes constitutes acceptance of the updated policy.`,
	},
	{
		title: "Contact",
		body: `If you have questions or requests related to your privacy, contact us at: privacy@tobuko.github.io`,
	},
];

export default function Privacy() {
	const { theme, toggle } = useTheme();
	const [showScrollTop, setShowScrollTop] = useState(false);

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	useEffect(() => {
		const onScroll = () => setShowScrollTop(window.scrollY > 400);
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<div
			className="min-h-screen"
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
						className="text-sm font-medium px-4 py-1.5 rounded-lg"
						style={{ background: "var(--accent)", color: "#fff" }}
					>
						Sign in
					</Link>
				</div>
			</nav>

			<div className="max-w-2xl mx-auto px-6 py-16">
				{/* Header */}
				<div className="mb-12">
					<p
						className="text-xs font-semibold tracking-widest uppercase mb-3"
						style={{ color: "var(--accent)" }}
					>
						Legal
					</p>
					<h1
						className="font-display text-4xl font-bold mb-3"
						style={{ color: "var(--text)" }}
					>
						Privacy Policy
					</h1>
					<p className="text-sm" style={{ color: "var(--text-faint)" }}>
						Last updated:{" "}
						{new Date().toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</p>
				</div>

				<p
					className="text-base leading-relaxed mb-12"
					style={{ color: "var(--text-muted)" }}
				>
					Tobuko is a bookmark manager. We take privacy seriously — your
					bookmarks are personal, and we built the product around that
					assumption. This policy explains what data we collect, why, and how we
					protect it.
				</p>

				<div className="flex flex-col gap-10">
					{sections.map((s, i) => (
						<div
							key={s.title}
							className="pb-10 border-b last:border-b-0"
							style={{ borderColor: "var(--border)" }}
						>
							<div className="flex items-baseline gap-3 mb-3">
								<span
									className="font-mono text-xs"
									style={{ color: "var(--text-faint)" }}
								>
									{String(i + 1).padStart(2, "0")}
								</span>
								<h2
									className="font-display font-semibold text-xl"
									style={{ color: "var(--text)" }}
								>
									{s.title}
								</h2>
							</div>
							<div
								className="text-sm leading-relaxed whitespace-pre-line pl-7"
								style={{ color: "var(--text-muted)" }}
							>
								{s.body}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Footer */}
			<footer
				className="border-t px-6 py-8 mt-8"
				style={{ borderColor: "var(--border)" }}
			>
				<div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
					<span className="text-sm" style={{ color: "var(--text-faint)" }}>
						Tobuko · {new Date().getFullYear()}
					</span>
					<div
						className="flex items-center gap-6 text-sm"
						style={{ color: "var(--text-muted)" }}
					>
						<Link to="/" className="hover:underline underline-offset-2">
							Home
						</Link>
						<Link to="/login" className="hover:underline underline-offset-2">
							Sign in
						</Link>
					</div>
				</div>
			</footer>

			{/* Scroll to top */}
			<button
				onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
				className="fixed bottom-6 right-6 z-50 w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-all duration-300"
				style={{
					background: "var(--accent)",
					color: "#fff",
					opacity: showScrollTop ? 1 : 0,
					pointerEvents: showScrollTop ? "auto" : "none",
					transform: showScrollTop ? "translateY(0)" : "translateY(12px)",
				}}
				title="Back to top"
				aria-label="Scroll to top"
			>
				<svg
					className="w-4 h-4"
					fill="none"
					viewBox="0 0 14 14"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M7 11V3M3 7l4-4 4 4" />
				</svg>
			</button>
		</div>
	);
}
