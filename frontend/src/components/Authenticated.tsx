import { refreshAxiosInstance } from "@/axiosInstance";
import { useCurrentUser } from "@/hooks/user";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Authenticated = () => {
	const navigate = useNavigate();
	const [params, _setParams] = useSearchParams();
	const { user } = useCurrentUser();
	const accessToken = params.get("accessToken");
	const refreshToken = params.get("refreshToken");

	useEffect(() => {
		if (accessToken) {
			localStorage.setItem("accessToken", accessToken);
			refreshAxiosInstance();
		}

		if (refreshToken) {
			localStorage.setItem("refreshToken", refreshToken);
		}
	}, [accessToken, refreshToken]);

	useEffect(() => {
		if (user?.id) {
			navigate(`/user/${user.id}/wishlists`);
		}
	}, [user, navigate]);

	return <></>;
};

export default Authenticated;
