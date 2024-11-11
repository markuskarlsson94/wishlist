import { useLogout } from "@/hooks/useLogout";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const Topbar = () => {
	const navigate = useNavigate();
	const { logout } = useLogout({
		onSuccess: () => {
			navigate("/");
		},
	});

	return (
		<div className="h-[50px] bg-slate-800 flex items-center">
			<Button variant={"secondary"} onClick={() => logout()} className="ml-auto">
				Logout <LogOut />
			</Button>
		</div>
	);
};

export default Topbar;
