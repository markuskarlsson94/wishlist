import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "./ui/alert-dialog";

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
						Your account has been sucessfully registred! To finish the account setup you have to follow the
						link that has been sent to {registredEmail} and click the confirmation button.
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
