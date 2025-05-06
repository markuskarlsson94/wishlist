import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useGetUser, useUpdateName } from "@/hooks/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
});

type NameUpdateConfig = {
	onSuccess?: () => void;
	onError?: (error: AxiosError) => void;
};

const NameUpdateForm = (config?: NameUpdateConfig) => {
	const { userId } = useAuth();
	const { user, isSuccess } = useGetUser(userId);
	const [warning, setWarning] = useState<string | undefined>(undefined);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
		},
	});

	useEffect(() => {
		if (isSuccess && user) {
			form.reset({
				firstName: user.firstName || "",
				lastName: user.lastName || "",
			});
		}
	}, [isSuccess, user, form]);

	const onSuccess = () => {
		if (config?.onSuccess) {
			config.onSuccess();
		}
	};

	const onError = (error: AxiosError) => {
		if (config?.onError) {
			config.onError(error);
		}

		setWarning("Unknown error");
	};

	const updateName = useUpdateName({ onSuccess, onError });

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		setWarning(undefined);

		if (userId) {
			updateName(userId, values.firstName, values.lastName);
		}
	};

	const firstName = form.watch("firstName");
	const lastName = form.watch("lastName");

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className="flex flex-col space-y-2">
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

					<div className="flex justify-between items-center">
						<div>{warning && <p className="font-medium text-sm text-red-500">{warning}</p>}</div>

						<Button type="submit" disabled={(firstName === "" || lastName === "") && isSuccess}>
							Update name
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};

export default NameUpdateForm;
