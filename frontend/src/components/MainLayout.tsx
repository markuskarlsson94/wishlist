import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
    return (
        <>
            <Sidebar />
            <Outlet />
        </>
    );
};

export default MainLayout;