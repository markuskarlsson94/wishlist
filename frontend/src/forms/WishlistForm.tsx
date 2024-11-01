import { Formik, Form, Field, ErrorMessage } from "formik";
import { z } from "zod";
import WishlistInputType from "../types/WishlistInputType";
import WishlistTypeType from "../types/WishlistTypeType";

const schema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string(),
	type: z.number(),
});

const validate = (values: WishlistInputType) => {
	values.type = Number(values.type);
	const result = schema.safeParse(values);

	if (!result.success) {
		const errors: any = {};

		result.error.errors.forEach((error: any) => {
			errors[error.path[0]] = error.message;
		});

		return errors;
	}
};

const WishlistForm = (
	initialValues: WishlistInputType,
	types: WishlistTypeType[],
	handleSubmit: (values: WishlistInputType) => void,
	handleCancel: () => void,
) => {
	return (
		<Formik
			initialValues={initialValues}
			validate={validate}
			onSubmit={(values, { setSubmitting }) => {
				setSubmitting(false);
				handleSubmit(values);
			}}
		>
			{({ isSubmitting }) => (
				<Form>
					<div>
						<label htmlFor="title">Title</label>
						<Field name="title" type="text" />
						<ErrorMessage name="title" component="div" />
					</div>

					<div>
						<label htmlFor="description">Description</label>
						<Field name="description" type="text" />
						<ErrorMessage name="description" component="div" />
					</div>

					<div>
						<label htmlFor="type">Type</label>
						<Field as="select" name="type">
							{types.map((type) => (
								<option key={type.id} value={type.id}>
									{type.name}
								</option>
							))}
						</Field>
						<ErrorMessage name="type" component="div" />
					</div>

					<button type="submit" disabled={isSubmitting}>
						Submit
					</button>

					<button onClick={handleCancel}>Cancel</button>
				</Form>
			)}
		</Formik>
	);
};

export default WishlistForm;
