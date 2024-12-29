import RegisterForm from "@/forms/RegisterForm";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useState } from "react";

const RegisterDialog = () => {
	const [open, setOpen] = useState<boolean>(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Sign up</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Register</DialogTitle>
				</DialogHeader>
				<RegisterForm setOpen={setOpen} />
			</DialogContent>
		</Dialog>
	);
};

export default RegisterDialog;
