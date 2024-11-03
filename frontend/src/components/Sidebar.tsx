import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = () => {
	const { userId } = useAuth();

	return (
		<div className="bg-white flex flex-col self-start p-3">
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
		</div>
	);
};

export default Sidebar;
