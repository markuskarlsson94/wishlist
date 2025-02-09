import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import Wishlists from "./components/Wishlists";
import Wishlist from "./components/Wishlist";
import Item from "./components/Item";
import Friends from "./components/Friends";
import MainLayout from "./components/MainLayout";
import User from "./components/User";
import Reservations from "./components/Reservations";
import Home from "./components/Home";
import BetaInfo from "./components/BetaInfo";
import About from "./components/About";
import News from "./components/News";
import NewsArticle from "./components/NewsArticle";
import FAQ from "./components/FAQ";
import TermsOfService from "./components/TermsOfService";
import Verification from "./components/Verification";
import AccountVerified from "./components/AccountVerified";
import PasswordReset from "./components/PasswordReset";
import PasswordUpdated from "./components/PasswordUpdated";
import Settings from "./components/Settings";

function App() {
	return (
		<AuthProvider>
			<Router>
				<Routes>
					<Route element={<MainLayout />}>
						<Route path="/" element={<Home />} />
						<Route element={<ProtectedRoutes />}>
							<Route path="/reservations" element={<Reservations />} />
							<Route path="/user/:userId" element={<User />} />
							<Route path="/user/:userId/wishlists" element={<Wishlists />} />
							<Route path="/user/:userId/friends" element={<Friends />} />
							<Route path="/wishlist/:id" element={<Wishlist />} />
							<Route path="/item/:id" element={<Item />} />
							<Route path="/settings" element={<Settings />} />
						</Route>
						<Route path="beta-info" element={<BetaInfo />} />
						<Route path="about" element={<About />} />
						<Route path="news" element={<News />} />
						<Route path="news/:id" element={<NewsArticle />} />
						<Route path="faq" element={<FAQ />} />
						<Route path="terms-of-service" element={<TermsOfService />} />
						<Route path="verify" element={<Verification />} />
						<Route path="account-verified" element={<AccountVerified />} />
						<Route path="reset-password" element={<PasswordReset />} />
						<Route path="password-updated" element={<PasswordUpdated />} />
					</Route>
				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;
