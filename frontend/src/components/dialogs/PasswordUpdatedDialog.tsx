import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

const PasswordUpdatedDialog = ({
	open,
	setOpen,
}: {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Password updated</DialogTitle>
					<DialogDescription>Your password has successfully been updated!</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button onClick={() => setOpen(false)}>Got it</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default PasswordUpdatedDialog;
