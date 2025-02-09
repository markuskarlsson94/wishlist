import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useState } from "react";
import NameUpdateForm from "@/forms/NameUpdateForm";

type NameUpdateDialogConfig = {
	onSuccess?: () => void;
};

const NameUpdateDialog = (config?: NameUpdateDialogConfig) => {
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
				<Button>Update Name</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Update name</DialogTitle>
				</DialogHeader>
				<NameUpdateForm onSuccess={onSuccess} />
			</DialogContent>
		</Dialog>
	);
};

export default NameUpdateDialog;
