import { useLogout } from "@/hooks/useLogout";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const Topbar = () => {
	const navigate = useNavigate();
	const { logout } = useLogout({
		onSettled: () => {
			navigate("/");
		},
	});

	return (
		<div className="bg-slate-800 flex items-center p-2 sticky z-10 top-0">
			<Button variant={"secondary"} onClick={() => logout()} className="ml-auto">
				Logout <LogOut />
			</Button>
		</div>
	);
};

export default Topbar;
