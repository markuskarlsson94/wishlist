import { z } from "zod";
import CommentInputType from "../types/CommentInputType";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const formSchema = z.object({
	comment: z.string().min(1, "Comment is required"),
});

type AddCommentFormConfig = {
	onSubmit: (values: CommentInputType) => void;
};

const AddCommentForm = ({ config }: { config: AddCommentFormConfig }) => {
	const [comment, setComment] = useState<string>("");

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		values: { comment: "" },
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		config.onSubmit(values);
		form.reset();
	};

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
										setComment(e.target.value);
									}}
								/>
							</FormControl>
						</FormItem>
					)}
				></FormField>

				<div className="mt-2">
					<Button disabled={comment.length === 0} type="submit">
						Add comment
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default AddCommentForm;
