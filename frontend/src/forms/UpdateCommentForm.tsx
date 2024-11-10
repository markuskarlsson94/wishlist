import { z } from "zod";
import CommentInputType from "../types/CommentInputType";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
	comment: z.string().min(1, "Comment is required"),
});

type UpdateCommentFormConfig = {
	comment: string;
	onSubmit: (values: CommentInputType) => void;
};

const UpdateCommentForm = ({ config }: { config: UpdateCommentFormConfig }) => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		values: { comment: config.comment },
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
								<Textarea {...field} />
							</FormControl>
						</FormItem>
					)}
				></FormField>

				<div className="mt-6 float-right">
					<Button type="submit">Edit</Button>
				</div>
			</form>
		</Form>
	);
};

export default UpdateCommentForm;
