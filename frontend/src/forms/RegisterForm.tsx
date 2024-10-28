import { Formik, Form, Field, ErrorMessage } from "formik";
import { z } from "zod";
import RegisterInputType from "../types/RegisterInputType";

const schema = z.object({
    email: z.string().min(1, "Email is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    password: z.string().min(1, "Password is required"),
});

const validate = (values: RegisterInputType) => {
    const result = schema.safeParse(values);

    if (!result.success) {
        const errors: any = {};
        
        result.error.errors.forEach((error: any) => {
            errors[error.path[0]] = error.message;
        });

        return errors;
    }
};

const initialValues: RegisterInputType = {
    email: "",
    firstName: "",
    lastName: "",
    password: "",
};

const RegisterForm = (
        handleSubmit: (values: RegisterInputType) => void,
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
            {({ isSubmitting}) => (
                <Form>
                    <div>
                        <label htmlFor="email">Email</label>
                        <Field name="email" type="text"/>
                        <ErrorMessage name="email" component="div"/>
                    </div>
                    
                    <div>
                        <label htmlFor="firstName">First name</label>
                        <Field name="firstName" type="text"/>
                        <ErrorMessage name="firstName" component="div"/>
                    </div>
                    
                    <div>
                        <label htmlFor="lastName">Last name</label>
                        <Field name="lastName" type="text"/>
                        <ErrorMessage name="lastName" component="div"/>
                    </div>
                    
                    <div>
                        <label htmlFor="password">Password</label>
                        <Field name="password" type="password"/>
                        <ErrorMessage name="password" component="div"/>
                    </div>

                    <button type="submit" disabled={isSubmitting}>
                        Submit
                    </button>
                </Form>
            )}
        </Formik>
    );
};

export default RegisterForm;