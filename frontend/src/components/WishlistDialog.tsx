import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import WishlistForm from "@/forms/WishlistForm";
import WishlistInputType from "@/types/WishlistInputType";
import { useState } from "react";

type WishlistDialogConfig = {
	title: string;
	submitButtonTitle: string;
	onSubmit: (input: WishlistInputType) => void;
	values: WishlistInputType;
};

const WishlistDialog = ({ config }: { config: WishlistDialogConfig }) => {
	const [open, setOpen] = useState<boolean>(false);

	const onSubmit = (values: WishlistInputType) => {
		config.onSubmit(values);
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>{config.title}</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{config.title}</DialogTitle>
				</DialogHeader>
				{WishlistForm({
					open,
					values: config.values,
					onSubmit,
					submitButtonTitle: config.submitButtonTitle,
				})}
			</DialogContent>
		</Dialog>
	);
};

export default WishlistDialog;
