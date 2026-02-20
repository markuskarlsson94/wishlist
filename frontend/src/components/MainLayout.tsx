import { Outlet, useLocation } from "react-router-dom";
import Topbar from "./Topbar";
import Bottombar from "./Bottombar";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider } from "./ui/sidebar";
import AppSidebar from "./AppSideBar";

const MainLayout = () => {
	const { isAuthenticated } = useAuth();
	const location = useLocation();
	const isHomePage = location.pathname === "/";
	const col = isHomePage ? "bg-gradient-to-tr from-blue-600 to-emerald-400" : "bg-neutral-200";

	return (
		<div className="min-h-screen flex flex-col">
			<SidebarProvider>
				{isAuthenticated && <AppSidebar />}
				<div className={`flex flex-col flex-grow ${col}`}>
					<Topbar />
					<div className="flex-grow w-full max-w-2xl px-4 mx-auto my-6">
						<Outlet />
					</div>
					<Bottombar />
				</div>
			</SidebarProvider>
		</div>
	);
};

export default MainLayout;
