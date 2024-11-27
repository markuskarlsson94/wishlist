import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import WishlistInputType from "@/types/WishlistInputType";
import useWishlistTypes from "@/hooks/useWishlistTypes";
import { findFormattedType, getFormattedType } from "@/utils/wishlist/utils";
import WishlistTypeInfoType from "@/types/WishlistTypeInfoType";

const formSchema = z.object({
	title: z.string().min(1, "Title must be specified").max(255, "Title is too long"),
	description: z.string().max(255, "Description is too long"),
	type: z.string().max(255, "Type is too long"),
});

type WishlistFormConfig = {
	open: boolean;
	values: WishlistInputType;
	onSubmit: (values: WishlistInputType) => void;
	submitButtonTitle: string;
};

const WishlistForm = ({ config }: { config: WishlistFormConfig }) => {
	const { types } = useWishlistTypes();
	const formattedTypes = types.map((t) => getFormattedType(t));
	const [type, setType] = useState<WishlistTypeInfoType | undefined>(
		findFormattedType(formattedTypes, config.values.type),
	);

	const values = {
		...config.values,
		type: `${config.values.type}`,
	};

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		values,
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		const newValues = {
			...values,
			type: Number(values.type),
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
						name="type"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Visibility</FormLabel>
								<FormControl>
									<Select
										onValueChange={(value) => {
											field.onChange(value);
											setType(findFormattedType(formattedTypes, value));
										}}
										defaultValue={field.value}
									>
										<SelectTrigger>
											<SelectValue placeholder={formattedTypes[0].name} />
										</SelectTrigger>
										<SelectContent>
											{formattedTypes.map((type) => (
												<SelectItem key={type.id} value={`${type.id}`}>
													{type.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="flex">
						<p className="flex m-auto text-sm text-gray-400">{type?.description}</p>
					</div>
				</div>

				<div className="mt-6 float-right">
					<Button type="submit">{config.submitButtonTitle}</Button>
				</div>
			</form>
		</Form>
	);
};

export default WishlistForm;
