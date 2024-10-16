import { Formik, Form, Field, ErrorMessage } from "formik";
import { z } from "zod"; 
import ItemInputType from "../types/ItemInputType";

const schema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string(),
});

const validate = (values: ItemInputType) => {
    const result = schema.safeParse(values);

    if (!result.success) {
        const errors: any = {};
        
        result.error.errors.forEach((error: any) => {
            errors[error.path[0]] = error.message;
        });

        return errors;
    }
};

const ItemForm = (
        initialValues: ItemInputType,
        handleAdd: (values: ItemInputType) => void,
        handleCancel: () => void,
    ) => { 
    return (
        <Formik
            initialValues={initialValues}
            validate={validate}
            onSubmit={(values, { setSubmitting }) => {
                setSubmitting(false);
                handleAdd(values);
            }}
        >
            {({ isSubmitting }) => (
                <Form>
                    <div>
                        <label htmlFor="title">Title</label>
                        <Field name="title" type="text"/>
                        <ErrorMessage name="title" component="div"/>
                    </div>
                    
                    <div>
                        <label htmlFor="description">Description</label>
                        <Field name="description" type="text"/>
                        <ErrorMessage name="description" component="div"/>
                    </div>

                    <button type="submit" disabled={isSubmitting}>
                        Submit
                    </button>

                    <button onClick={handleCancel}>Cancel</button>
                </Form>
            )}    
        </ Formik>
    );
};

export default ItemForm;