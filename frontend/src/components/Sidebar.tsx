import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import RoundedRect from "./RoundedRect";

const Sidebar = () => {
	const { userId } = useAuth();

	return (
		<RoundedRect className="flex flex-col self-start">
			<div>
				<NavLink to={`user/${userId}/wishlists`}>Wishlists</NavLink>
			</div>
			<div>
				<NavLink to={"/reservations"}>Reservations</NavLink>
			</div>
			<div>
				<NavLink to={`user/${userId}/friends`}>Friends</NavLink>
			</div>
			<div>
				<NavLink to={"/users"}>Users</NavLink>
			</div>
		</RoundedRect>
	);
};

export default Sidebar;
