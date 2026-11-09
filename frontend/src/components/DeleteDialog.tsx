import { useEffect, useState } from "react";
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
} from "./ui/alert-dialog";
import { buttonVariants } from "./ui/button";

const DeleteDialog = ({
	title,
	description,
	cancelText,
	deleteText,
	onDelete,
	open,
	onOpenChange,
}: {
	title: string;
	description: string;
	cancelText: string;
	deleteText: string;
	onDelete: () => void;
	open: boolean;
	onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const [disabled, setDisabled] = useState<boolean>(true);

	useEffect(() => {
		let timer: number;
		if (open) {
			setDisabled(true);
			timer = setTimeout(() => {
				setDisabled(false);
			}, 3000);
		} else {
			setDisabled(true);
		}
		return () => clearTimeout(timer);
	}, [open]);

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogTrigger asChild></AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription className="[overflow-wrap:anywhere]">{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>{cancelText}</AlertDialogCancel>
					<AlertDialogAction
						className={buttonVariants({ variant: "destructive" })}
						onClick={onDelete}
						disabled={disabled}
					>
						{deleteText}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default DeleteDialog;
