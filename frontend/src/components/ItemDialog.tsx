import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ItemForm from "@/forms/ItemForm";
import ItemInputType from "@/types/ItemInputType";
import { useState } from "react";

type ItemDialogConfig = {
	title: string;
	submitButtonTitle: string;
	onSubmit: (input: ItemInputType) => void;
	values: ItemInputType;
};

const ItemDialog = ({ config }: { config: ItemDialogConfig }) => {
	const [open, setOpen] = useState<boolean>(false);

	const onSubmit = (values: ItemInputType) => {
		config.onSubmit(values);
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>{config.title}</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{config.title}</DialogTitle>
				</DialogHeader>
				<ItemForm
					config={{
						open,
						values: config.values,
						onSubmit,
						submitButtonTitle: config.submitButtonTitle,
					}}
				/>
			</DialogContent>
		</Dialog>
	);
};

export default ItemDialog;
