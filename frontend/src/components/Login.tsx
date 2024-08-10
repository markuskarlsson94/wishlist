import { useState } from "react";
import axiosInstance from "../axiosInstance";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

type LoginCredentials = {
    email: string;
    password: string;
}

type LoginResponse = {
    accessToken: string,
    refreshToken: string,
}

const Login = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showError, setShowError] = useState<boolean>(false);
    const navigate = useNavigate();

    const loginMutation = useMutation({
        mutationFn: async ({ email, password }: LoginCredentials): Promise<LoginResponse> => {
            const res = await axiosInstance.post("/auth/login", {
                email,
                password,
            });
        
            return res.data;
        },
        onError: (error) => {
            console.error("Login failed:", error);
            setShowError(true);
        },
        onSuccess: (data) => {
            setShowError(false);
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            navigate("/home");
        },
    });

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        loginMutation.mutate({ email, password });
    };

    return (
        <>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Username:</label>
                    <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {showError && <p>Wrong email or password</p>}
                <button type="submit">Login</button>
            </form>
        </>
    );
};

export default Login;