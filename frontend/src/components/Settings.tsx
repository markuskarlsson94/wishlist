import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton";
import RoundedRect from "./RoundedRect";
import { Button, buttonVariants } from "./ui/button";
import PasswordUpdateDialog from "./dialogs/PasswordUpdateDialog";
import PasswordUpdatedDialog from "./dialogs/PasswordUpdatedDialog";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./ui/alert-dialog";
import { useDeleteUser } from "@/hooks/user";
import { useAuth } from "@/contexts/AuthContext";
import NameUpdateDialog from "./dialogs/NameUpdateDialog";
import NameUpdatedDialog from "./dialogs/NameUpdatedDialog";

const Settings = () => {
	const navigate = useNavigate();
	const [nameUpdatedDialogOpen, setNameUpdatedDialogOpen] = useState<boolean>(false);
	const [passwordUpdatedDialogOpen, setPasswordUpdatedDialogOpen] = useState<boolean>(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
	const { userId, setIsAuthenticated } = useAuth();

	const handleBack = () => {
		navigate(-1);
	};

	const onNameUpdated = () => {
		setNameUpdatedDialogOpen(true);
	};

	const onPasswordUpdated = () => {
		setPasswordUpdatedDialogOpen(true);
	};

	const onDeleteUserSuccess = () => {
		setIsAuthenticated(false);
		navigate("/");
	};

	const deleteUser = useDeleteUser({ onSuccess: onDeleteUserSuccess });

	const onDeleteUser = () => {
		if (userId !== undefined) {
			deleteUser(userId);
		}
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
						<NameUpdateDialog onSuccess={onNameUpdated} />
						<PasswordUpdateDialog onSuccess={onPasswordUpdated} />
						<div className="h-2" />
						<Button variant={"destructive"} onClick={() => setIsDeleteDialogOpen(true)}>
							Delete Account
						</Button>
					</div>
				</div>
			</div>

			<AlertDialog open={isDeleteDialogOpen} onOpenChange={() => setIsDeleteDialogOpen(!isDeleteDialogOpen)}>
				<AlertDialogTrigger asChild></AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete account</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to permanently delete your account and all associated data? This
							action can not be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className={buttonVariants({ variant: "destructive" })}
							onClick={() => onDeleteUser()}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<NameUpdatedDialog open={nameUpdatedDialogOpen} setOpen={setNameUpdatedDialogOpen} />
			<PasswordUpdatedDialog open={passwordUpdatedDialogOpen} setOpen={setPasswordUpdatedDialogOpen} />
		</RoundedRect>
	);
};

export default Settings;
