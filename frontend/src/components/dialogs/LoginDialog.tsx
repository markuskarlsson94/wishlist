import { LogIn } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import LoginForm from "@/forms/LoginForm";
import { useState } from "react";
import ForgotPasswordForm from "@/forms/ForgotPasswordForm";
import GoogleAuthButton from "../GoogleAuthButton";
import SeparatorWithLabel from "../SeparatorWithLabel";

const LoginDialogHeader = ({ showPasswordResetDialog }: { showPasswordResetDialog: boolean }) => {
	if (showPasswordResetDialog) {
		return (
			<>
				<DialogTitle>Reset password</DialogTitle>
				<DialogDescription>
					Enter the email which you used to register. An email will be sent to you which contains a link to
					reset your password.
				</DialogDescription>
			</>
		);
	}

	return <DialogTitle>Login</DialogTitle>;
};

const LoginDialogContent = ({
	setOpen,
	onPasswordResetRequestSent,
	setShowPasswordResetDialog,
	showPasswordResetDialog,
}: {
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	onPasswordResetRequestSent: (email: string) => void;
	setShowPasswordResetDialog: React.Dispatch<React.SetStateAction<boolean>>;
	showPasswordResetDialog: boolean;
}) => {
	return (
		<>
			<GoogleAuthButton />

			<SeparatorWithLabel label="Or by email" />

			{showPasswordResetDialog ? (
				<ForgotPasswordForm
					setOpen={setOpen}
					onSuccess={onPasswordResetRequestSent}
					onBack={() => setShowPasswordResetDialog(false)}
				/>
			) : (
				<LoginForm onForgotPassword={() => setShowPasswordResetDialog(true)} />
			)}
		</>
	);
};

type LoginDialogConfig = {
	onPasswordResetRequestSent?: (email: string) => void;
};

const LoginDialog = (config: LoginDialogConfig) => {
	const [open, setOpen] = useState<boolean>(false);
	const [showPasswordResetDialog, setShowPasswordResetDialog] = useState<boolean>(false);

	const onPasswordResetRequestSent = (email: string) => {
		if (config.onPasswordResetRequestSent) {
			config.onPasswordResetRequestSent(email);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(open) => {
				if (open) setShowPasswordResetDialog(false);
				setOpen(open);
			}}
		>
			<DialogTrigger asChild>
				<Button variant={"secondary"}>
					Login <LogIn />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<LoginDialogHeader showPasswordResetDialog={showPasswordResetDialog} />
				</DialogHeader>
				<LoginDialogContent
					setOpen={setOpen}
					onPasswordResetRequestSent={onPasswordResetRequestSent}
					setShowPasswordResetDialog={setShowPasswordResetDialog}
					showPasswordResetDialog={showPasswordResetDialog}
				/>
			</DialogContent>
		</Dialog>
	);
};

export default LoginDialog;
