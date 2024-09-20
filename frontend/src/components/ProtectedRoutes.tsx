import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoutes = () => {
    const { isAuthenticated, isLoadingAuthStatus } = useAuth();

    if (isLoadingAuthStatus) return <div />;
    if (isAuthenticated) return <Outlet />;
    return <Navigate to="/" />;
};

export default ProtectedRoutes;