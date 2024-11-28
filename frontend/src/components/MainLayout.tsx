import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";
import Bottombar from "./Bottombar";
import { useAuth } from "@/contexts/AuthContext";

const MainLayout = () => {
	const { isAuthenticated } = useAuth();

	return (
		<>
			<div className="bg-gray-200 flex flex-col min-h-screen">
				<Topbar />
				<div className="flex flex-grow flex-row mx-auto space-x-4 my-4">
					{isAuthenticated && <Sidebar />}
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
