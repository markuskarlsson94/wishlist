import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../ui/alert-dialog";

const RegistrationConfirmedDialog = ({
	open,
	setOpen,
	registredEmail,
}: {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	registredEmail: string | undefined;
}) => {
	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Registration complete ✨</AlertDialogTitle>
					<AlertDialogDescription>
						Your account has been sucessfully registred! Follow the link that has been sent to{" "}
						{registredEmail} in order to finish the account setup.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogAction>Got it</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default RegistrationConfirmedDialog;
