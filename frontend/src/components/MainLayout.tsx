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
	const col = isHomePage ? "bg-white-200" : "bg-neutral-200";

	return (
		<div className="min-h-screen flex flex-col">
			<SidebarProvider>
				{isAuthenticated && <AppSidebar />}
				<div className={`flex flex-col flex-grow ${col}`}>
					<Topbar />
					<div className="flex-grow w-[40rem] mx-auto my-4">
						<Outlet />
					</div>
					<Bottombar />
				</div>
			</SidebarProvider>
		</div>
	);
};

export default MainLayout;
