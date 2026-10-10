import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoginDialog from "./dialogs/LoginDialog";
import { useEffect, useState } from "react";
import UserSearchBar from "./UserSearchBar";
import PasswordResetRequestDialog from "./dialogs/PasswordResetRequestDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import AppSidebarTrigger from "./AppSidebarTrigger";
import Notifications from "./Notifications";
import { useGetRoles } from "@/hooks/user";

const Topbar = () => {
	const { userId, isAuthenticated, isAdmin, role } = useAuth();
	const { adminRole } = useGetRoles();
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
			<header className="bg-slate-800 flex items-center sticky top-0 z-10">
				<div className="flex w-full flex-col">
					<div className="relative flex w-full items-center py-2">
						<div className="absolute left-5">{isMobile && isAuthenticated && <AppSidebarTrigger />}</div>
						{isAuthenticated && (
							<>
								<div className="relative m-auto">
									<UserSearchBar />
									{!isMobile && (
										<div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-9">
											<Notifications />
										</div>
									)}
								</div>
								{isMobile && (
									<div className="absolute right-5 top-1/2 transform -translate-y-1/2">
										<Notifications />
									</div>
								)}
							</>
						)}
						{!isAuthenticated && (
							<div className="flex-1 flex justify-end">
								<LoginDialog onPasswordResetRequestSent={onPasswordResetRequestSent} />
							</div>
						)}
					</div>
					{isAdmin && role === adminRole && (
						<div className="flex w-full bg-emerald-500">
							<p className="text-white text-sm font-medium m-auto">Admin mode</p>
						</div>
					)}
				</div>
			</header>
			<PasswordResetRequestDialog
				open={passwordResetRequestDialogOpen}
				setOpen={setPasswordResetRequestDialogOpen}
				email={email}
			/>
		</>
	);
};

export default Topbar;
