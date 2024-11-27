import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/useLogin";
import { useCurrentUser } from "@/hooks/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import z from "zod";

const formSchema = z.object({
	email: z.string().min(1, "Email is required"),
	password: z.string().min(1, "Password is required"),
});

type LoginConfig = {
	onSubmit?: (values: { email: string; password: string }) => void;
};

const LoginForm = (config?: LoginConfig) => {
	const navigate = useNavigate();
	const { user } = useCurrentUser();
	const [loggedIn, setLoggedIn] = useState<boolean>(false);

	const values = {
		email: "",
		password: "",
	};

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		values,
	});

	const onLogin = () => {
		setLoggedIn(true);
	};

	const { login } = useLogin({ onSuccess: onLogin });

	useEffect(() => {
		if (loggedIn && user) {
			navigate(`/user/${user}/wishlists`);
		}
	}, [user, loggedIn]);

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		if (config?.onSubmit) config.onSubmit(values);
		login({ ...values });
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
									<Input placeholder="Password" type="password" {...field} />
								</FormControl>
								<FormDescription />
							</FormItem>
						)}
					/>
				</div>

				<div className="mt-6 float-right">
					<Button type="submit">Login</Button>
				</div>
			</form>
		</Form>
	);
};

export default LoginForm;
