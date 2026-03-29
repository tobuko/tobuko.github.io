import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { useTheme } from "../components/ThemeProvider";

const features = [
	{
		icon: (
			<svg
				className="w-5 h-5"
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
		),
		title: "Save anything",
		desc: "Clip any page from any device with one click. Browser extension for Chrome, web app for everywhere else.",
	},
	{
		icon: (
			<svg
				className="w-5 h-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth="1.5"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
				/>
			</svg>
		),
		title: "Collections & tags",
		desc: "Organize into collections, label with tags, search everything instantly. No more lost links.",
	},
	{
		icon: (
			<svg
				className="w-5 h-5"
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
		),
		title: "Private collections",
		desc: "Some links are just for you. Lock collections with your account password — private at the server level, not just visually.",
	},
	{
		icon: (
			<svg
				className="w-5 h-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth="1.5"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
				/>
			</svg>
		),
		title: "Sync everywhere",
		desc: "Real-time sync across the extension, web app, and any device. Open on your phone what you saved on your laptop.",
	},
	{
		icon: (
			<svg
				className="w-5 h-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth="1.5"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
				/>
			</svg>
		),
		title: "Share collections",
		desc: "Generate a public link for any collection and share it with anyone — no account required to view.",
	},
	{
		icon: (
			<svg
				className="w-5 h-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth="1.5"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z"
				/>
			</svg>
		),
		title: "Search & filter",
		desc: "Full-text search across titles, URLs, and tags. Filter by tag to find exactly what you're looking for.",
	},
];

function Nav({ toggle, theme }: { toggle: () => void; theme: string }) {
	return (
		<nav
			className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 py-4 border-b"
			style={{ background: "var(--bg)", borderColor: "var(--border)" }}
		>
			<a href="#" className="flex items-center gap-2.5">
				<span className="font-display text-xl font-bold tracking-tight">
					tb
				</span>
				<span
					className="font-display text-sm font-semibold tracking-widest uppercase hidden sm:block"
					style={{ color: "var(--text-muted)" }}
				>
					Tobuko
				</span>
			</a>
			<div className="flex items-center gap-2 sm:gap-4">
				<a
					href="#features"
					className="text-sm hidden sm:block transition-colors"
					style={{ color: "var(--text-muted)" }}
					onClick={(e) => {
						e.preventDefault();
						document
							.getElementById("features")
							?.scrollIntoView({ behavior: "smooth" });
					}}
				>
					Features
				</a>
				<a
					href="#privacy-section"
					className="text-sm hidden sm:block transition-colors"
					style={{ color: "var(--text-muted)" }}
					onClick={(e) => {
						e.preventDefault();
						document
							.getElementById("privacy-section")
							?.scrollIntoView({ behavior: "smooth" });
					}}
				>
					Privacy
				</a>
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
				<Link
					to="/login"
					className="text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
					style={{ background: "var(--accent)", color: "#fff" }}
				>
					Sign in
				</Link>
			</div>
		</nav>
	);
}

export default function Landing() {
	const { theme, toggle } = useTheme();
	const { loadSession } = useStore();
	const navigate = useNavigate();
	const [showScrollTop, setShowScrollTop] = useState(false);

	useEffect(() => {
		loadSession().then(() => {
			if (useStore.getState().user) navigate("/app", { replace: true });
		});
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
			<Nav toggle={toggle} theme={theme} />

			{/* ── Hero ── */}
			<section className="pt-36 pb-24 px-6 text-center">
				<div className="max-w-3xl mx-auto">
					<div
						className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium tracking-wide mb-8 border"
						style={{
							background: "var(--bg-subtle)",
							borderColor: "var(--border)",
							color: "var(--text-muted)",
						}}
					>
						<span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
						Free to use · No credit card required
					</div>
					<h1
						className="font-display text-5xl sm:text-6xl font-bold leading-tight tracking-tight mb-6"
						style={{ color: "var(--text)" }}
					>
						Bookmarks that
						<br />
						<span style={{ color: "var(--accent)" }}>
							actually stay organized
						</span>
					</h1>
					<p
						className="text-lg sm:text-xl leading-relaxed mb-10 max-w-xl mx-auto"
						style={{ color: "var(--text-muted)" }}
					>
						Save, organize, and find your links from anywhere. Collections,
						tags, private vaults, real-time sync — all in one place.
					</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
						<Link
							to="/login"
							className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:opacity-90"
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
						<a
							href="#features"
							className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium border transition-all"
							style={{
								borderColor: "var(--border)",
								color: "var(--text-muted)",
							}}
							onClick={(e) => {
								e.preventDefault();
								document
									.getElementById("features")
									?.scrollIntoView({ behavior: "smooth" });
							}}
						>
							See features
						</a>
					</div>
				</div>
			</section>

			{/* ── Features ── */}
			<section
				id="features"
				className="py-24 px-6 border-t"
				style={{ borderColor: "var(--border)" }}
			>
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-16">
						<p
							className="text-xs font-semibold tracking-widest uppercase mb-3"
							style={{ color: "var(--accent)" }}
						>
							Features
						</p>
						<h2
							className="font-display text-3xl sm:text-4xl font-bold"
							style={{ color: "var(--text)" }}
						>
							Everything you need, nothing you don't
						</h2>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{features.map((f) => (
							<div
								key={f.title}
								className="rounded-2xl p-6 transition-all hover:shadow-lg"
								style={{
									background: "var(--bg-surface)",
									border: "1px solid var(--border)",
								}}
							>
								<div
									className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
									style={{
										background: "var(--bg-subtle)",
										color: "var(--accent)",
									}}
								>
									{f.icon}
								</div>
								<h3
									className="font-display font-semibold text-base mb-2"
									style={{ color: "var(--text)" }}
								>
									{f.title}
								</h3>
								<p
									className="text-sm leading-relaxed"
									style={{ color: "var(--text-muted)" }}
								>
									{f.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── How it works ── */}
			<section
				className="py-24 px-6 border-t"
				style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}
			>
				<div className="max-w-4xl mx-auto">
					<div className="text-center mb-16">
						<p
							className="text-xs font-semibold tracking-widest uppercase mb-3"
							style={{ color: "var(--accent)" }}
						>
							How it works
						</p>
						<h2
							className="font-display text-3xl sm:text-4xl font-bold"
							style={{ color: "var(--text)" }}
						>
							Three steps to organized
						</h2>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
						{[
							{
								step: "01",
								title: "Create an account",
								desc: "Sign up in seconds. No email verification needed to get started.",
							},
							{
								step: "02",
								title: "Install the extension",
								desc: "Add Tobuko to Chrome and save any page with one click from the browser toolbar.",
							},
							{
								step: "03",
								title: "Find anything, anywhere",
								desc: "Access your bookmarks from the web app on any device. Search, filter, share.",
							},
						].map((s) => (
							<div key={s.step} className="flex flex-col items-start">
								<span
									className="font-display text-4xl font-bold mb-4"
									style={{ color: "var(--border-strong)" }}
								>
									{s.step}
								</span>
								<h3
									className="font-display font-semibold text-lg mb-2"
									style={{ color: "var(--text)" }}
								>
									{s.title}
								</h3>
								<p
									className="text-sm leading-relaxed"
									style={{ color: "var(--text-muted)" }}
								>
									{s.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Privacy highlight ── */}
			<section
				id="privacy-section"
				className="py-24 px-6 border-t"
				style={{ borderColor: "var(--border)" }}
			>
				<div className="max-w-3xl mx-auto text-center">
					<div
						className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
						style={{ background: "var(--bg-subtle)", color: "var(--accent)" }}
					>
						<svg
							className="w-7 h-7"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth="1.5"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
							/>
						</svg>
					</div>
					<h2
						className="font-display text-3xl sm:text-4xl font-bold mb-4"
						style={{ color: "var(--text)" }}
					>
						Your data, your rules
					</h2>
					<p
						className="text-lg leading-relaxed mb-8"
						style={{ color: "var(--text-muted)" }}
					>
						We don't sell your data. We don't run ads. Private collections are
						locked at the server level — not just hidden in the UI. Your
						bookmarks are only visible to you.
					</p>
					<Link
						to="/privacy"
						className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4"
						style={{ color: "var(--accent)" }}
					>
						Read our privacy policy
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
			</section>

			{/* ── CTA ── */}
			<section
				className="py-24 px-6 border-t text-center"
				style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}
			>
				<div className="max-w-xl mx-auto">
					<h2
						className="font-display text-3xl sm:text-4xl font-bold mb-4"
						style={{ color: "var(--text)" }}
					>
						Ready to stop losing links?
					</h2>
					<p className="text-base mb-8" style={{ color: "var(--text-muted)" }}>
						Join Tobuko for free. No credit card, no ads.
					</p>
					<Link
						to="/login"
						className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold transition-all hover:opacity-90"
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
			</section>

			{/* ── Footer ── */}
			<footer
				className="border-t px-6 py-8"
				style={{ borderColor: "var(--border)" }}
			>
				<div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
					<div className="flex items-center gap-2">
						<span className="font-display font-bold">tb</span>
						<span className="text-sm" style={{ color: "var(--text-faint)" }}>
							Tobuko · {new Date().getFullYear()}
						</span>
					</div>
					<div
						className="flex items-center gap-6 text-sm"
						style={{ color: "var(--text-muted)" }}
					>
						<Link to="/privacy" className="hover:underline underline-offset-2">
							Privacy Policy
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
