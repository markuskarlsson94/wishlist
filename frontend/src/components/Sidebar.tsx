import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import RoundedRect from "./RoundedRect";
import { Button } from "./ui/button";

const Sidebar = () => {
	const { userId } = useAuth();

	return (
		<RoundedRect className="flex flex-col self-start">
			<Button variant={"ghost"}>
				<NavLink to={`user/${userId}/wishlists`}>Wishlists</NavLink>
			</Button>
			<Button variant={"ghost"}>
				<NavLink to={"/reservations"}>Reservations</NavLink>
			</Button>
			<Button variant={"ghost"}>
				<NavLink to={`user/${userId}/friends`}>Friends</NavLink>
			</Button>
			<Button variant={"ghost"}>
				<NavLink to={"/users"}>Users</NavLink>
			</Button>
		</RoundedRect>
	);
};

export default Sidebar;
