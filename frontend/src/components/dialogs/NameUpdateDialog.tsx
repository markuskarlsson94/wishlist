import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useState } from "react";
import NameUpdateForm from "@/forms/NameUpdateForm";
import NameUpdatedDialog from "./NameUpdatedDialog";

type NameUpdateDialogConfig = {
	onSuccess?: () => void;
};

const NameUpdateDialog = (config?: NameUpdateDialogConfig) => {
	const [open, setOpen] = useState<boolean>(false);
	const [showNameUpdatedDialogOpen, setShowNameUpdatedDialogOpen] = useState<boolean>(false);

	const onSuccess = () => {
		setOpen(false);
		setShowNameUpdatedDialogOpen(true);

		if (config?.onSuccess) {
			config.onSuccess();
		}
	};

	return (
		<>
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

			<NameUpdatedDialog open={showNameUpdatedDialogOpen} setOpen={setShowNameUpdatedDialogOpen} />
		</>
	);
};

export default NameUpdateDialog;
