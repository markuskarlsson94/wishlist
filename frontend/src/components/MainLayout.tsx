import Sidebar from "./Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import Topbar from "./Topbar";
import Bottombar from "./Bottombar";
import { useAuth } from "@/contexts/AuthContext";

const MainLayout = () => {
	const { isAuthenticated } = useAuth();
	const location = useLocation();
	const isHomePage = location.pathname === "/";
	const col = isHomePage ? "bg-white-200" : "bg-gray-200";

	return (
		<>
			<div className={`flex flex-col min-h-screen ${col}`}>
				<Topbar />
				<div className="flex flex-grow flex-row mx-auto space-x-4 my-4">
					{isAuthenticated && !isHomePage && <Sidebar />}
					<div className="w-[600px]">
						<Outlet />
					</div>
				</div>
				<Bottombar />
			</div>
		</>
	);
};

export default MainLayout;
