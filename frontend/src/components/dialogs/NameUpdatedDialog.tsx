import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

const NameUpdatedDialog = ({
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
					<DialogTitle>Name updated</DialogTitle>
					<DialogDescription>Your name has successfully been updated!</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button onClick={() => setOpen(false)}>Got it</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default NameUpdatedDialog;
