import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import ItemInputType from "@/types/ItemInputType";

const formSchema = z.object({
	title: z.string().min(1, { message: "Title must be specified" }),
	description: z.string(),
	link: z.string().nullable(),
});

type ItemFormConfig = {
	open: boolean;
	values: ItemInputType;
	onSubmit: (values: ItemInputType) => void;
	submitButtonTitle: string;
};

const ItemForm = ({ config }: { config: ItemFormConfig }) => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		values: config.values,
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		const newValues = {
			...values,
			link: values.link === "" ? null : values.link,
		};

		config.onSubmit(newValues);
		form.reset();
	};

	useEffect(() => {
		if (!config.open) {
			form.reset();
		}
	}, [config.open]);

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className="space-y-2">
					<FormField
						control={form.control}
						name="title"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Title*</FormLabel>
								<FormControl>
									<Input placeholder="Title" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Textarea placeholder="Description" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="link"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Link</FormLabel>
								<FormControl>
									<Input placeholder="Link" {...field} value={field.value ?? ""} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="mt-6 float-right">
					<Button type="submit">{config.submitButtonTitle}</Button>
				</div>
			</form>
		</Form>
	);
};

export default ItemForm;
