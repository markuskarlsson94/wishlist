import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLogout } from "../hooks/useLogout";

const Home = () => {
    const navigate = useNavigate();
    const { isAuthenticated, userId } = useAuth();

    const onLogout = () => {
        navigate("/");
    }

    const { logout } = useLogout({ onSuccess: onLogout });

    const handleLogout = () => {
        logout();
    }

    return (
        <>
            <h2>Home</h2>
            <p>Welcome!</p>
            <button onClick={handleLogout} disabled={!userId}>Logout</button>
            {<div>User id: {userId}</div>}
            {isAuthenticated ? <div>authenticated</div> : <div>not authenticated</div>}
            <NavLink to={`/${userId}/wishlists`}>Wishlists</NavLink>
        </>
    );
};

export default Home;