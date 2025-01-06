import { useLogout } from "@/hooks/useLogout";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Badge } from "./ui/badge";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoginDialog from "./LoginDialog";
import { useEffect } from "react";
import UserSearchBar from "./UserSearchBar";

const Topbar = () => {
	const { userId, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const { logout } = useLogout({
		onSettled: () => {
			navigate("/");
		},
	});

	useEffect(() => {
		if (isAuthenticated && userId) {
			navigate(`/user/${userId}/wishlists`);
		}
	}, [userId, isAuthenticated]);

	return (
		<div className="bg-slate-800 flex items-center p-2 sticky z-10 top-0 justify-between">
			<NavLink to="/beta-info">
				<Badge className="bg-red-200 text-black hover:bg-red-300">Beta</Badge>
			</NavLink>
			{isAuthenticated && <UserSearchBar />}
			{isAuthenticated && (
				<Button variant={"secondary"} onClick={() => logout()} className="ml-auto">
					Logout <LogOut />
				</Button>
			)}
			{!isAuthenticated && (
				<div className="ml-auto">
					<LoginDialog />
				</div>
			)}
		</div>
	);
};

export default Topbar;
