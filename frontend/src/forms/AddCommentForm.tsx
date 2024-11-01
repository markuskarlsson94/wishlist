import { Formik, Form, Field, ErrorMessage } from "formik";
import { z } from "zod";
import CommentInputType from "../types/CommentInputType";

const schema = z.object({
	comment: z.string().min(1, "Comment is required"),
});

const validate = (values: CommentInputType) => {
	const result = schema.safeParse(values);

	if (!result.success) {
		const errors: any = {};

		result.error.errors.forEach((error: any) => {
			errors[error.path[0]] = error.message;
		});

		return errors;
	}
};

const AddCommentForm = (handleSubmit: (values: CommentInputType) => void) => {
	return (
		<Formik
			initialValues={{ comment: "" }}
			validate={validate}
			onSubmit={(values, { setSubmitting, resetForm }) => {
				setSubmitting(false);
				handleSubmit(values);
				resetForm();
			}}
		>
			{({ isSubmitting }) => (
				<Form>
					<div>
						<label htmlFor="comment">Comment</label>
						<Field name="comment" type="text" />
						<ErrorMessage name="comment" component="div" />
					</div>

					<button type="submit" disabled={isSubmitting}>
						Add comment
					</button>
				</Form>
			)}
		</Formik>
	);
};

export default AddCommentForm;
