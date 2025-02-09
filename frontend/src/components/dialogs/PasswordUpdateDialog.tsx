import PasswordUpdateForm from "@/forms/PasswordUpdateForm";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useState } from "react";

type PasswordUpdateDialogConfig = {
	onSuccess?: () => void;
};

const PasswordUpdateDialog = (config?: PasswordUpdateDialogConfig) => {
	const [open, setOpen] = useState<boolean>(false);

	const onSuccess = () => {
		setOpen(false);

		if (config?.onSuccess) {
			config.onSuccess();
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Update Password</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Update password</DialogTitle>
				</DialogHeader>
				<PasswordUpdateForm onSuccess={onSuccess} />
			</DialogContent>
		</Dialog>
	);
};

export default PasswordUpdateDialog;
