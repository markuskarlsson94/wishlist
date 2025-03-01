import { useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

const AppSidebarTrigger = () => {
	const { toggleSidebar } = useSidebar();

	return <Menu color="#ffffff" onClick={toggleSidebar} className="cursor-pointer" />;
};

export default AppSidebarTrigger;
