import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = () => {
    const { userId } = useAuth();

    return (
        <NavLink to={`${userId}/wishlists`}>Wishlists</NavLink>
    );
};

export default Sidebar;