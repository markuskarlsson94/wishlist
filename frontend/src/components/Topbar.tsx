import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoginDialog from "./dialogs/LoginDialog";
import { useEffect, useState } from "react";
import UserSearchBar from "./UserSearchBar";
import PasswordResetRequestDialog from "./dialogs/PasswordResetRequestDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import AppSidebarTrigger from "./AppSidebarTrigger";

const Topbar = () => {
	const { userId, isAuthenticated } = useAuth();
	const [passwordResetRequestDialogOpen, setPasswordResetRequestDialogOpen] = useState<boolean>(false);
	const [email, setEmail] = useState<string | undefined>(undefined);
	const location = useLocation();
	const navigate = useNavigate();
	const isMobile = useIsMobile();

	useEffect(() => {
		if (isAuthenticated && userId) {
			if (location.pathname === "/") {
				navigate(`/user/${userId}/wishlists`);
			}
		}
	}, [userId, isAuthenticated]);

	const onPasswordResetRequestSent = (email: string | undefined) => {
		setEmail(email);
		setPasswordResetRequestDialogOpen(true);
	};

	return (
		<>
			<div className="relative bg-slate-800 flex items-center px-3 py-2 sticky top-0 z-10">
				<div className="absolute left-3">{isMobile && isAuthenticated && <AppSidebarTrigger />}</div>
				{isAuthenticated && (
					<div className="m-auto">
						<UserSearchBar />
					</div>
				)}
				{!isAuthenticated && (
					<div className="flex-1 flex justify-end">
						<LoginDialog onPasswordResetRequestSent={onPasswordResetRequestSent} />
					</div>
				)}
			</div>
			<PasswordResetRequestDialog
				open={passwordResetRequestDialogOpen}
				setOpen={setPasswordResetRequestDialogOpen}
				email={email}
			/>
		</>
	);
};

export default Topbar;
