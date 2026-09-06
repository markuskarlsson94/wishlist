import { forwardRef, useImperativeHandle } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from "@/components/ui/input-group";
import { useAuth } from "@/contexts/AuthContext";
import commentSchema from "@/schemas/commentSchema";
import { useAddComment } from "@/hooks/comment";

type AddCommentFormConfig = {
	itemId: number;
};

export interface AddCommentFormRef {
	submit: () => void;
}

const AddCommentForm = forwardRef<AddCommentFormRef, { config: AddCommentFormConfig }>(({ config }, ref) => {
	const { isAdmin } = useAuth();
	const addComment = useAddComment({ itemId: config?.itemId });

	const form = useForm<z.infer<typeof commentSchema>>({
		resolver: zodResolver(commentSchema),
		defaultValues: { comment: "", asAdmin: false },
		mode: "onSubmit",
		reValidateMode: "onSubmit",
	});

	const commentValue = useWatch({ control: form.control, name: "comment" });

	const handleSubmit = (values: z.infer<typeof commentSchema>) => {
		addComment(values);
		form.reset();
	};

	useImperativeHandle(ref, () => ({
		submit: () => form.handleSubmit(handleSubmit)(),
	}));

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)}>
				<InputGroup>
					<FormField
						control={form.control}
						name="comment"
						render={({ field }) => (
							<FormItem className="w-full">
								<FormControl>
									<InputGroupTextarea placeholder="Type your comment here" {...field} />
								</FormControl>
							</FormItem>
						)}
					/>

					<InputGroupAddon align="block-end">
						<div className="flex w-full items-center justify-between">
							{isAdmin && (
								<FormField
									control={form.control}
									name="asAdmin"
									render={({ field }) => (
										<FormItem className="flex items-center space-y-0">
											<FormControl>
												<label className="flex items-center gap-x-2 text-sm cursor-pointer select-none">
													<Checkbox checked={field.value} onCheckedChange={field.onChange} />
													<FormLabel className="cursor-pointer">As admin</FormLabel>
												</label>
											</FormControl>
										</FormItem>
									)}
								/>
							)}

							<div className="ml-auto">
								<InputGroupButton
									type="submit"
									variant="default"
									size="sm"
									disabled={!commentValue?.trim()}
								>
									Add comment
								</InputGroupButton>
							</div>
						</div>
					</InputGroupAddon>
				</InputGroup>
			</form>
		</Form>
	);
});

export default AddCommentForm;
