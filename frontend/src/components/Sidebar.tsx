import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import RoundedRect from "./RoundedRect";
import { Button } from "./ui/button";

const Sidebar = () => {
	const { userId } = useAuth();

	return (
		<RoundedRect className="flex flex-col self-start gap-y-3">
			<Button variant={"ghost"}>
				<NavLink to={`user/${userId}/wishlists`}>My Wishlists</NavLink>
			</Button>
			<Button variant={"ghost"}>
				<NavLink to={"/reservations"}>My Reservations</NavLink>
			</Button>
			<Button variant={"ghost"}>
				<NavLink to={`user/${userId}/friends`}>My Friends</NavLink>
			</Button>
			<Button variant={"ghost"}>
				<NavLink to={`/settings`}>Settings</NavLink>
			</Button>
		</RoundedRect>
	);
};

export default Sidebar;
