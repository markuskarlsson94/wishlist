import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";

const MainLayout = () => {
	return (
		<>
			<Topbar />
			<Sidebar />
			<Outlet />
		</>
	);
};

export default MainLayout;
