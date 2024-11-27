import { LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import LoginForm from "@/forms/LoginForm";

const LoginDialog = () => {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant={"secondary"}>
					Login <LogIn />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Login</DialogTitle>
				</DialogHeader>
				<LoginForm />
			</DialogContent>
		</Dialog>
	);
};

export default LoginDialog;
