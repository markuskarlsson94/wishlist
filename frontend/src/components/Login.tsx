import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import { NavLink } from "react-router-dom";
import RoundedRect from "./RoundedRect";
import { useCurrentUser } from "@/hooks/user";

const Login = () => {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const navigate = useNavigate();
	const { user } = useCurrentUser();
	const [loggedIn, setLoggedIn] = useState<boolean>(false);

	const onLogin = () => {
		setLoggedIn(true);
	};

	const { login, isError } = useLogin({ onSuccess: onLogin });

	useEffect(() => {
		if (loggedIn && user) {
			navigate(`/user/${user}/wishlists`);
		}
	}, [user, loggedIn]);

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		login({ email, password });
	};

	return (
		<div className="bg-gray-200 flex min-h-screen">
			<RoundedRect className="self-start">
				<h2>Login</h2>
				<form onSubmit={handleLogin}>
					<div>
						<label>Username:</label>
						<input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
					</div>
					<div>
						<label>Password:</label>
						<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
					</div>
					{isError && <p>Wrong email or password</p>}
					<button type="submit">Login</button>
				</form>
				<NavLink to={"/register"}>Register</NavLink>
			</RoundedRect>
		</div>
	);
};

export default Login;
