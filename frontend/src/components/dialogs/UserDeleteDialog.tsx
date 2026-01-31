import { AxiosError } from "axios";
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
} from "../ui/alert-dialog";
import { Button, buttonVariants } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useDeleteUser } from "@/hooks/user";
import LogoutPromptDialog from "./LogoutPromptDialog";
import { useState } from "react";
import { StatusCodes } from "http-status-codes";

const UserDeleteDialog = () => {
	const { userId, setIsAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [showLogoutPromptDialogOpen, setShowLogoutPromptDialogOpen] = useState<boolean>(false);

	const onDeleteUserSuccess = () => {
		setIsAuthenticated(false);
		navigate("/");
	};

	const onDeleteUserError = (error: AxiosError) => {
		if (error.response?.status === StatusCodes.FORBIDDEN) {
			setShowLogoutPromptDialogOpen(true);
		}
	};

	const deleteUser = useDeleteUser({ onSuccess: onDeleteUserSuccess, onError: onDeleteUserError });

	const onDeleteUser = () => {
		if (userId !== undefined) {
			deleteUser(userId);
		}
	};

	return (
		<>
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button variant={"destructive"}>Delete Account</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete account</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to permanently delete your account and all associated data? This
							action can not be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>No, don't delete</AlertDialogCancel>
						<AlertDialogAction
							className={buttonVariants({ variant: "destructive" })}
							onClick={() => onDeleteUser()}
						>
							Yes, delete my account
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<LogoutPromptDialog open={showLogoutPromptDialogOpen} setOpen={setShowLogoutPromptDialogOpen} />
		</>
	);
};

export default UserDeleteDialog;
