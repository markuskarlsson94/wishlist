import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useUpdatePassword } from "@/hooks/password";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
	passwordCur: z.string().min(1, "Current password is required"),
	passwordNew: z.string().min(1, "New Password is required"),
	passwordNewRepeat: z.string().min(1, "New Password is required"),
});

type PasswordResetConfig = {
	onSuccess?: () => void;
	onError?: (error: AxiosError) => void;
};

const PasswordResetForm = (config?: PasswordResetConfig) => {
	const [warning, setWarning] = useState<string | undefined>(undefined);

	const values = {
		passwordCur: "",
		passwordNew: "",
		passwordNewRepeat: "",
	};

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		values,
	});

	const onSuccess = () => {
		if (config?.onSuccess) {
			config.onSuccess();
		}
	};

	const onError = (error: AxiosError) => {
		if (config?.onError) {
			config.onError(error);
		}

		setWarning("Current password is incorrect");
	};

	const updatePassword = useUpdatePassword({ onSuccess, onError });

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		setWarning(undefined);

		if (values.passwordNew !== values.passwordNewRepeat) {
			setWarning("New passwords do not match");
			return;
		}

		updatePassword(values.passwordCur, values.passwordNew, values.passwordNewRepeat);
	};

	const passwordCur = form.watch("passwordCur");
	const passwordNew = form.watch("passwordNew");
	const passwordNewRepeat = form.watch("passwordNewRepeat");

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className="flex flex-col space-y-2">
					<FormField
						control={form.control}
						name="passwordCur"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Current password</FormLabel>
								<FormControl>
									<PasswordInput placeholder="Current password" {...field} />
								</FormControl>
								<FormDescription />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="passwordNew"
						render={({ field }) => (
							<FormItem>
								<FormLabel>New password</FormLabel>
								<FormControl>
									<PasswordInput placeholder="New password" {...field} />
								</FormControl>
								<FormDescription />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="passwordNewRepeat"
						render={({ field }) => (
							<FormItem>
								<FormLabel>New password repeated</FormLabel>
								<FormControl>
									<PasswordInput placeholder="New password" {...field} />
								</FormControl>
								<FormDescription />
							</FormItem>
						)}
					/>

					<div className="flex justify-between items-center">
						<div>{warning && <p className="font-medium text-sm text-red-500">{warning}</p>}</div>

						<Button
							type="submit"
							disabled={passwordCur === "" || passwordNew === "" || passwordNewRepeat === ""}
						>
							Confirm new password
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};

export default PasswordResetForm;
