import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";

const MainLayout = () => {
	return (
		<div className="bg-slate-200 flex flex-col min-h-screen">
			<Topbar />
			<div className="flex flex-row mx-auto space-x-4">
				<Sidebar />
				<div className="w-[600px] bg-white p-3">
					<Outlet />
				</div>
			</div>
		</div>
	);
};

export default MainLayout;
