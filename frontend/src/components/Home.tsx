import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import { useMutation } from "@tanstack/react-query";
import useUser from "../hooks/useUser";

const Home = () => {
    const navigate = useNavigate();
    const { user, isSuccess, isFetching } = useUser();

    const logoutMutation = useMutation({
        mutationFn: async (): Promise<void> => {
            return (await axiosInstance.post("/auth/logout", {
                userId: user,
            }));
        },
        onError: (error) => {
            console.error("Logout failed:", error);
        },
        onSuccess: () => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            navigate("/");
        },
    });

    const handleLogout = async () => {
        logoutMutation.mutate();
    }

    return (
        <>
            <h2>Home</h2>
            <p>Welcome!</p>
            <button onClick={handleLogout} disabled={!isSuccess}>Logout</button>
            {(isSuccess && !isFetching) && <div>{user}</div>}
        </>
    );
};

export default Home;