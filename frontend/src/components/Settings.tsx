import BackButton from "./BackButton";
import RoundedRect from "./RoundedRect";
import PasswordUpdateDialog from "./dialogs/PasswordUpdateDialog";
import NameUpdateDialog from "./dialogs/NameUpdateDialog";
import UserDeleteDialog from "./dialogs/UserDeleteDialog";
import ProfilePictureDialog from "./ProfilePictureDialog";
import { useInvalidateCurrentUser, useGetRoles, useGetUser } from "@/hooks/user";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "./ui/checkbox";
import { useState } from "react";

const Settings = () => {
	const { userId, isAdmin, role } = useAuth();
	const { user } = useGetUser(userId);
	const { userRole, adminRole } = useGetRoles();
	const invalidateCurrentUser = useInvalidateCurrentUser();
	const storedRole = localStorage.getItem("requestedRole");
	const [requestedRole, setRequestedRole] = useState<number | null>(storedRole !== null ? Number(storedRole) : null);

	const handleToggleAdminMode = () => {
		if (user) {
			const currentRole = requestedRole ?? role;
			const newRole = currentRole === userRole ? adminRole : userRole;
			localStorage.setItem("requestedRole", newRole);
			setRequestedRole(newRole);
			invalidateCurrentUser();
		}
	};

	return (
		<RoundedRect>
			<div className="flex flex-col">
				<div className="relative flex flex-row items-center">
					<BackButton />
					<p className="absolute left-1/2 transform -translate-x-1/2 font-medium">Settings</p>
				</div>

				<div className="h-12" />

				<div className="flex justify-center">
					<div className="flex flex-col md:w-80 gap-y-3">
						<NameUpdateDialog />
						{!user?.isGoogleUser && (
							<>
								<PasswordUpdateDialog />
							</>
						)}
						<ProfilePictureDialog />
						{isAdmin && (
							<div className="flex gap-x-2 items-center">
								<Checkbox checked={requestedRole === adminRole} onClick={handleToggleAdminMode} />
								<p>Admin mode</p>
							</div>
						)}
						<div className="h-2" />
						<UserDeleteDialog />
					</div>
				</div>
			</div>
		</RoundedRect>
	);
};

export default Settings;
