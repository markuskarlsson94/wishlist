import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";
import Bottombar from "./Bottombar";

const MainLayout = () => {
	return (
		<>
			<div className="bg-gray-200 flex flex-col min-h-screen">
				<Topbar />
				<div className="flex flex-grow flex-row mx-auto space-x-4 my-4">
					<Sidebar />
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
