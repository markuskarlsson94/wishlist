import { NavLink, useNavigate } from "react-router-dom";
import RegisterForm from "../forms/RegisterForm";
import useRegister from "../hooks/register";
import RegisterInputType from "../types/RegisterInputType";
import { AxiosError } from "axios";
import { useState } from "react";
import RoundedRect from "./RoundedRect";

const Register = () => {
	const [showError, setShowError] = useState<boolean>(false);
	const navigate = useNavigate();

	const onSuccess = () => {
		navigate("/");
	};

	const onError = (error: AxiosError) => {
		setShowError(error.response?.status === 400);
	};

	const register = useRegister({ onSuccess, onError });

	const handleRegister = (input: RegisterInputType) => {
		register(input);
	};

	return (
		<div className="bg-slate-200 flex min-h-screen">
			<RoundedRect className="self-start">
				<h2>Register</h2>
				{RegisterForm(handleRegister)}
				<NavLink to={"/"}>Login</NavLink>
				{showError && <p>User already exists</p>}
			</RoundedRect>
		</div>
	);
};

export default Register;
