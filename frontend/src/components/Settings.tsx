import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton";
import RoundedRect from "./RoundedRect";
import PasswordUpdateDialog from "./dialogs/PasswordUpdateDialog";
import NameUpdateDialog from "./dialogs/NameUpdateDialog";
import UserDeleteDialog from "./dialogs/UserDeleteDialog";

const Settings = () => {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate(-1);
	};

	return (
		<RoundedRect>
			<div className="flex flex-col">
				<div className="relative flex flex-row items-center justify-center">
					<BackButton className="absolute left-0" onClick={handleBack} />
					<p className="font-medium">Settings</p>
				</div>

				<div className="h-12" />

				<div className="flex justify-center">
					<div className="flex flex-col w-80 gap-y-3">
						<NameUpdateDialog />
						<PasswordUpdateDialog />
						<div className="h-2" />
						<UserDeleteDialog />
					</div>
				</div>
			</div>
		</RoundedRect>
	);
};

export default Settings;
