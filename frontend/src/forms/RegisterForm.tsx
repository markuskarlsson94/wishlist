import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useRegister from "@/hooks/register";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Info } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import z from "zod";

const formSchema = z.object({
	email: z.string().min(1, "Email is required"),
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	password: z.string().min(1, "Password is required"),
	passwordRepeat: z.string().min(1, "Password is required"),
	tosAccepted: z.boolean(),
});

type RegisterConfig = {
	onSubmit?: (values: {
		email: string;
		firstName: string;
		lastName: string;
		password: string;
		passwordRepeat: string;
		tosAccepted: boolean;
	}) => void;
	setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
	setRegistrationConfirmedDialogOpen?: React.Dispatch<React.SetStateAction<boolean>>;
	setRegistredEmail?: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const RegisterForm = (config?: RegisterConfig) => {
	const [showPasswordWarning, setShowPasswordWarning] = useState<boolean>(false);
	const [warning, setWarning] = useState<string | undefined>(undefined);

	const values = {
		email: "",
		firstName: "",
		lastName: "",
		password: "",
		passwordRepeat: "",
		tosAccepted: false,
	};

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		values,
	});

	const tosAccepted = form.watch("tosAccepted");
	const email = form.watch("email");

	const onSuccess = () => {
		if (config?.setOpen) config.setOpen(false);
		if (config?.setRegistrationConfirmedDialogOpen) config.setRegistrationConfirmedDialogOpen(true);
		if (config?.setRegistredEmail) config.setRegistredEmail(email);
	};

	const onError = (error: AxiosError) => {
		if (error.response?.status === 400) {
			setWarning("User is already registred");
		} else {
			setWarning("Unknown error");
		}
	};

	const register = useRegister({ onSuccess, onError });

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		setShowPasswordWarning(false);
		setWarning(undefined);

		if (values.password !== values.passwordRepeat) {
			setShowPasswordWarning(true);
			return;
		}

		if (config?.onSubmit) config.onSubmit(values);
		register({ ...values });
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

					<div className="grid grid-cols-12 gap-4">
						<div className="col-span-6">
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>First name</FormLabel>
										<FormControl>
											<Input placeholder="First name" {...field} />
										</FormControl>
										<FormDescription />
									</FormItem>
								)}
							/>
						</div>

						<div className="col-span-6">
							<FormField
								control={form.control}
								name="lastName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Last name</FormLabel>
										<FormControl>
											<Input placeholder="Last name" {...field} />
										</FormControl>
										<FormDescription />
									</FormItem>
								)}
							/>
						</div>
					</div>

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

					{showPasswordWarning && <p className="font-medium text-sm text-red-500">Passwords do not match</p>}

					<div className="h-2"></div>

					<FormField
						control={form.control}
						name="tosAccepted"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0">
								<FormControl>
									<Checkbox checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel>
										I have read and agree to the{" "}
										<NavLink to={"/terms-of-service"}>
											<span className="underline hover:no-underline hover:text-gray-400">
												Terms of Service
											</span>
										</NavLink>
									</FormLabel>
								</div>
								<FormDescription />
							</FormItem>
						)}
					/>
				</div>

				<div className="h-2"></div>

				<div className="flex flex-row justify-between items-center mt-6">
					<div>
						{warning && (
							<div className="flex flex-row items-center gap-x-2">
								<Info opacity={0.7} />
								<p className="font-medium text-sm text-red-500">{warning}</p>
							</div>
						)}
					</div>
					<div>
						<Button type="submit" disabled={!tosAccepted}>
							Register
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};

export default RegisterForm;
