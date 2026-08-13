import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import AppPage from "./pages/AppPage";
import Share from "./pages/Share";
import Privacy from "./pages/Privacy";

export default function App() {
	return (
		<ThemeProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Landing />} />
					<Route path="/login" element={<Auth />} />
					<Route path="/app" element={<AppPage />} />
					<Route path="/share/:id" element={<Share />} />
					<Route path="/privacy" element={<Privacy />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</BrowserRouter>
		</ThemeProvider>
	);
}
