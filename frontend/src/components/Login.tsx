import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import { NavLink } from "react-router-dom";
import RoundedRect from "./RoundedRect";

const Login = () => {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const navigate = useNavigate();

	const onLogin = () => {
		navigate("/home");
	};

	const { login, isError } = useLogin({ onSuccess: onLogin });

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		login({ email, password });
	};

	return (
		<div className="bg-slate-200 flex min-h-screen">
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
