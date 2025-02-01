import { Form, FormControl, FormDescription, FormField, FormItem } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRequestPasswordReset } from "@/hooks/password";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";

const formSchema = z.object({
	email: z.string().min(1, "Email is required"),
});

type ForgotPasswordFormConfig = {
	setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
	setPasswordResetRequestDialogOpen?: React.Dispatch<React.SetStateAction<boolean>>;
	setEmail?: React.Dispatch<React.SetStateAction<string | undefined>>;
	setShowForgotPassword: React.Dispatch<React.SetStateAction<boolean>>;
};

const ForgotPasswordForm = (config?: ForgotPasswordFormConfig) => {
	const requestPasswordReset = useRequestPasswordReset({
		onSuccess: (email: string) => {
			if (config?.setPasswordResetRequestDialogOpen) config.setPasswordResetRequestDialogOpen(true);
			if (config?.setEmail) config.setEmail(email);
		},
	});

	const values = {
		email: "",
	};

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		values,
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		requestPasswordReset(values.email);
		if (config?.setOpen) config.setOpen(false);
	};

	const email = form.watch("email");

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className="flex flex-col">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input placeholder="Email" {...field} />
								</FormControl>
								<FormDescription />
							</FormItem>
						)}
					/>
					<div className="flex gap-x-2 self-end">
						<Button
							variant={"secondary"}
							type="button"
							onClick={() => config?.setShowForgotPassword(false)}
						>
							Back
						</Button>
						<Button type="submit" disabled={email === ""}>
							Send
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};

export default ForgotPasswordForm;
