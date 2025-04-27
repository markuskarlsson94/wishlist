import { z } from "zod";
import CommentInputType from "../types/CommentInputType";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { forwardRef, useImperativeHandle } from "react";
import commentSchema from "@/schemas/commentSchema";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";

type AddCommentFormConfig = {
	onSubmit: (values: CommentInputType) => void;
	onCommentChange?: (comment: string) => void;
};

const AddCommentForm = forwardRef(({ config }: { config: AddCommentFormConfig }, ref) => {
	const { isAdmin } = useAuth();

	const form = useForm<z.infer<typeof commentSchema>>({
		resolver: zodResolver(commentSchema),
		values: { comment: "", asAdmin: false },
	});

	const onSubmit = (values: z.infer<typeof commentSchema>) => {
		config.onSubmit(values);
		form.reset();
	};

	useImperativeHandle(ref, () => ({
		submit: () => form.handleSubmit(onSubmit)(),
	}));

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="comment"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Textarea
									placeholder="Type your comment here"
									{...field}
									onChange={(e) => {
										field.onChange(e);
										if (config.onCommentChange) {
											config.onCommentChange(e.target.value);
										}
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				></FormField>
				{isAdmin && (
					<FormField
						control={form.control}
						name="asAdmin"
						render={({ field }) => (
							<FormItem>
								<div className="flex items-center gap-x-2 pt-2">
									<FormLabel>Comment as admin</FormLabel>
									<FormControl>
										<Checkbox checked={field.value} onCheckedChange={field.onChange} />
									</FormControl>
								</div>
							</FormItem>
						)}
					/>
				)}
			</form>
		</Form>
	);
});

export default AddCommentForm;
