import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axiosInstance";
import UserType from "../types/UserType";
import RoundedRect from "./RoundedRect";
import BackButton from "./BackButton";

const Users = () => {
	const [users, setUsers] = useState<UserType[]>([]);
	const navigate = useNavigate();

	const { data, isSuccess } = useQuery({
		queryKey: ["users"],
		queryFn: () => axiosInstance.get("/user/all"),
	});

	useEffect(() => {
		if (isSuccess) {
			setUsers(data.data.users);
		}
	}, [data, isSuccess]);

	const handleBack = () => {
		navigate(-1);
	};

	const User = (user: UserType) => {
		return (
			<div key={user.id}>
				<NavLink to={`/user/${user.id}`}>
					{user.firstName} {user.lastName}
				</NavLink>
			</div>
		);
	};

	return (
		<RoundedRect>
			<BackButton onClick={handleBack} />
			{users.map((user) => User(user))}
		</RoundedRect>
	);
};

export default Users;
