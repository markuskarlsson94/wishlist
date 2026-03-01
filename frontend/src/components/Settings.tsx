import BackButton from "./BackButton";
import RoundedRect from "./RoundedRect";
import PasswordUpdateDialog from "./dialogs/PasswordUpdateDialog";
import NameUpdateDialog from "./dialogs/NameUpdateDialog";
import UserDeleteDialog from "./dialogs/UserDeleteDialog";
import ProfilePictureDialog from "./ProfilePictureDialog";
import { useGetUser } from "@/hooks/user";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
	const { userId } = useAuth();
	const { user } = useGetUser(userId);

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
						<div className="h-2" />
						<UserDeleteDialog />
					</div>
				</div>
			</div>
		</RoundedRect>
	);
};

export default Settings;
