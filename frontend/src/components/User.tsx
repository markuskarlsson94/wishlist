import { NavLink, useParams } from "react-router-dom";

const User = () => {
    const { userId } = useParams();

    return (
        <>
            <h2>User</h2>
            <div>
                <NavLink to={`/user/${userId}/wishlists`}>Wishlists</NavLink>
            </div>
            <div>
                <NavLink to={`/user/${userId}/friends`}>Friends</NavLink>
            </div>
        </>
    );
};

export default User;