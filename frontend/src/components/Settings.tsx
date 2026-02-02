import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton";
import RoundedRect from "./RoundedRect";
import PasswordUpdateDialog from "./dialogs/PasswordUpdateDialog";
import NameUpdateDialog from "./dialogs/NameUpdateDialog";
import UserDeleteDialog from "./dialogs/UserDeleteDialog";
import ProfilePictureDialog from "./ProfilePictureDialog";
import { useGetUser } from "@/hooks/user";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
	const navigate = useNavigate();
	const { userId } = useAuth();
	const { user } = useGetUser(userId);

	const handleBack = () => {
		navigate(-1);
	};

	return (
		<RoundedRect>
			<div className="flex flex-col">
				<div className="relative flex flex-row items-center">
					<BackButton onClick={handleBack} />
					<p className="absolute left-1/2 transform -translate-x-1/2 font-medium">Settings</p>
				</div>

				<div className="h-12" />

				<div className="flex justify-center">
					<div className="flex flex-col w-80 gap-y-3">
						{!user?.isGoogleUser && (
							<>
								<NameUpdateDialog />
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
