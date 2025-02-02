import PasswordRestForm from "@/forms/PasswordResetForm";
import RoundedRect from "./RoundedRect";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useResetPassword } from "@/hooks/password";
import { CircleAlert } from "lucide-react";

const PasswordReset = () => {
	const navigate = useNavigate();
	const [params, _setParams] = useSearchParams();
	const token = params.get("token");

	const handleSuccess = () => {
		navigate("/password-updated");
	};

	const { resetPassword, isError } = useResetPassword({ onSuccess: handleSuccess });

	const handleSubmit = (values: { password: string; passwordRepeat: string }) => {
		if (token && values.password) {
			resetPassword(token, values.password);
		}
	};

	return (
		<RoundedRect>
			<div className="flex mb-4">
				<p className="font-medium m-auto">Enter new password</p>
			</div>
			<PasswordRestForm onSubmit={handleSubmit} />
			{isError && (
				<div className="mt-4 flex justify-center">
					<div className="flex flex-row gap-x-2">
						<CircleAlert color="#bf7373" />
						<p>Unable to update password. Invalid token</p>
					</div>
				</div>
			)}
		</RoundedRect>
	);
};

export default PasswordReset;
