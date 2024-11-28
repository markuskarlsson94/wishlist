import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import Wishlists from "./components/Wishlists";
import Wishlist from "./components/Wishlist";
import Item from "./components/Item";
import Friends from "./components/Friends";
import Users from "./components/Users";
import MainLayout from "./components/MainLayout";
import User from "./components/User";
import Reservations from "./components/Reservations";
import Register from "./components/Register";
import Home from "./components/Home";
import BetaInfo from "./components/BetaInfo";

function App() {
	return (
		<AuthProvider>
			<Router>
				<Routes>
					<Route element={<MainLayout />}>
						<Route path="/" element={<Home />} />
						<Route path="/register" element={<Register />} />
						<Route element={<ProtectedRoutes />}>
							<Route path="/users" element={<Users />} />
							<Route path="/reservations" element={<Reservations />} />
							<Route path="/user/:userId" element={<User />} />
							<Route path="/user/:userId/wishlists" element={<Wishlists />} />
							<Route path="/user/:userId/friends" element={<Friends />} />
							<Route path="/wishlist/:id" element={<Wishlist />} />
							<Route path="/item/:id" element={<Item />} />
						</Route>
						<Route path="beta-info" element={<BetaInfo />} />
					</Route>
				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;
