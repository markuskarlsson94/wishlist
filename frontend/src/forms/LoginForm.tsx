import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/useLogin";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { StatusCodes } from "http-status-codes";
import { Info } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
	email: z.string().min(1, "Email is required"),
	password: z.string().min(1, "Password is required"),
});

type LoginConfig = {
	onSubmit?: (values: { email: string; password: string }) => void;
	onForgotPassword?: () => void;
};

const LoginForm = (config?: LoginConfig) => {
	const [warning, setWarning] = useState<string | undefined>(undefined);

	const values = {
		email: "",
		password: "",
	};

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		values,
	});

	const password = form.watch("password");

	const onError = (error: AxiosError) => {
		if (error.response?.status === StatusCodes.UNAUTHORIZED) {
			setWarning("Unknown email or password");
		} else {
			setWarning("Unknown error");
		}
	};

	const { login } = useLogin({ onError });

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		if (config?.onSubmit) config.onSubmit(values);
		login({ ...values });
	};

	const onForgotPassword = () => {
		if (config?.onForgotPassword) {
			config.onForgotPassword();
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className="space-y-2">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input placeholder="Email" {...field} />
								</FormControl>
								<FormDescription />
							</FormItem>
						)}
					/>
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
				</div>

				<div className="flex flex-row justify-between items-center mt-6">
					<div>
						{warning && (
							<div className="flex flex-row items-center gap-x-2">
								<Info opacity={0.7} />
								<p className="font-medium text-sm text-red-500">{warning}</p>
							</div>
						)}
					</div>

					<div className="flex gap-x-2">
						<Button variant={"ghost"} type="button" onClick={onForgotPassword}>
							Forgot password?
						</Button>
						<Button type="submit" disabled={password === ""}>
							Login
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};

export default LoginForm;
