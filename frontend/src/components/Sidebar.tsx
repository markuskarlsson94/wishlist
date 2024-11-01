import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = () => {
	const { userId } = useAuth();

	return (
		<>
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
		</>
	);
};

export default Sidebar;
