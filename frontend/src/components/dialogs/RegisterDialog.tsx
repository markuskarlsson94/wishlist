import RegisterForm from "@/forms/RegisterForm";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useState } from "react";
import GoogleAuthButton from "../GoogleAuthButton";
import SeparatorWithLabel from "../SeparatorWithLabel";

const RegisterDialog = ({
	setRegistrationConfirmedDialogOpen,
	setRegistredEmail,
}: {
	setRegistrationConfirmedDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setRegistredEmail: React.Dispatch<React.SetStateAction<string | undefined>>;
}) => {
	const [open, setOpen] = useState<boolean>(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Sign up now!</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Register</DialogTitle>
				</DialogHeader>

				<GoogleAuthButton />

				<SeparatorWithLabel label="Or by email" />

				<RegisterForm
					setOpen={setOpen}
					setRegistrationConfirmedDialogOpen={setRegistrationConfirmedDialogOpen}
					setRegistredEmail={setRegistredEmail}
				/>
			</DialogContent>
		</Dialog>
	);
};

export default RegisterDialog;
