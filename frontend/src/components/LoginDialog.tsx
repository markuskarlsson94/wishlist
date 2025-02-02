import { LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import LoginForm from "@/forms/LoginForm";
import { useState } from "react";
import ForgotPasswordForm from "@/forms/ForgotPasswordForm";

type LoginDialogConfig = {
	setPasswordResetRequestDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setEmail: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const LoginDialog = (config: LoginDialogConfig) => {
	const [open, setOpen] = useState<boolean>(false);
	const [showPasswordReset, setShowPasswordReset] = useState<boolean>(false);

	const dialogHeader = (forgotPasswordDialog: boolean) => {
		if (forgotPasswordDialog) {
			return (
				<>
					<DialogTitle>Reset password</DialogTitle>
					<DialogDescription>
						Enter the email which you used to register. An email will be sent to you which contains a link
						to reset your password.
					</DialogDescription>
				</>
			);
		}

		return <DialogTitle>Login</DialogTitle>;
	};

	const dialogContent = (forgotPasswordDialog: boolean) => {
		return forgotPasswordDialog ? (
			<ForgotPasswordForm
				setShowForgotPassword={setShowPasswordReset}
				setOpen={setOpen}
				setPasswordResetRequestDialogOpen={config.setPasswordResetRequestDialogOpen}
				setEmail={config.setEmail}
			/>
		) : (
			<LoginForm setShowForgotPassword={setShowPasswordReset} />
		);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(open) => {
				if (open) setShowPasswordReset(false);
				setOpen(open);
			}}
		>
			<DialogTrigger asChild>
				<Button variant={"secondary"}>
					Login <LogIn />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>{dialogHeader(showPasswordReset)}</DialogHeader>
				{dialogContent(showPasswordReset)}
			</DialogContent>
		</Dialog>
	);
};

export default LoginDialog;
