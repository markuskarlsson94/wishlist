import { AxiosError } from "axios";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useDeleteUser } from "@/hooks/user";
import LogoutPromptDialog from "./LogoutPromptDialog";
import { useState } from "react";
import { StatusCodes } from "http-status-codes";
import DeleteDialog from "../DeleteDialog";

const UserDeleteDialog = () => {
	const { userId, setIsAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [showLogoutPromptDialogOpen, setShowLogoutPromptDialogOpen] = useState<boolean>(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

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
			<Button variant={"destructive"} onClick={() => setDeleteDialogOpen(true)}>
				Delete Account
			</Button>
			<DeleteDialog
				title="Delete account"
				description="Are you sure you want to permanently delete your account and all associated data? This
							action can not be undone."
				cancelText="No, keep my account"
				deleteText="Yes, delete my account"
				onDelete={onDeleteUser}
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
			/>
			<LogoutPromptDialog open={showLogoutPromptDialogOpen} setOpen={setShowLogoutPromptDialogOpen} />
		</>
	);
};

export default UserDeleteDialog;
