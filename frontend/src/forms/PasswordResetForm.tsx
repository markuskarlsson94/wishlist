import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
	password: z.string().min(1, "Password is required"),
	passwordRepeat: z.string().min(1, "Password is required"),
});

type PasswordResetConfig = {
	onSubmit?: (values: { password: string; passwordRepeat: string }) => void;
};

const PasswordRestForm = (config?: PasswordResetConfig) => {
	const [showPasswordWarning, setShowPasswordWarning] = useState<boolean>(false);

	const values = {
		password: "",
		passwordRepeat: "",
	};

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		values,
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		setShowPasswordWarning(false);

		if (values.password !== values.passwordRepeat) {
			setShowPasswordWarning(true);
			return;
		}

		if (config?.onSubmit) {
			config?.onSubmit(values);
		}
	};

	const password = form.watch("password");
	const passwordRepeat = form.watch("passwordRepeat");

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className="flex flex-col space-y-2">
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<PasswordInput placeholder="Password" {...field} />
								</FormControl>
								<FormDescription />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="passwordRepeat"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password repeated</FormLabel>
								<FormControl>
									<PasswordInput placeholder="Password" {...field} />
								</FormControl>
								<FormDescription />
							</FormItem>
						)}
					/>

					<div className="flex justify-between items-center">
						<div>
							{showPasswordWarning && (
								<p className="font-medium text-sm text-red-500">Passwords do not match</p>
							)}
						</div>

						<Button type="submit" disabled={password === "" || passwordRepeat === ""}>
							Confirm new password
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};

export default PasswordRestForm;
