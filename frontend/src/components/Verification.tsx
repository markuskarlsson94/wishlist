import { useNavigate, useSearchParams } from "react-router-dom";
import RoundedRect from "./RoundedRect";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useVerification } from "@/hooks/useVerification";
import { useEffect } from "react";

const Verification = () => {
	const [params, _setParams] = useSearchParams();
	const token = params.get("token");
	const navigate = useNavigate();
	const { verify, data, isSuccess, isPending, isError } = useVerification();

	useEffect(() => {
		if (isSuccess) {
			navigate("/account-verified");
		}
	}, [data, isSuccess]);

	const iconSize = 96;
	const classname = "flex flex-col items-center gap-y-6";

	return (
		<RoundedRect>
			<div className={classname}>
				{isPending && (
					<>
						<LoaderCircle size={48} color="#bfbfbf" className="animate-spin" />
						<p className="font-medium">Verifying account...</p>
					</>
				)}
				{!isPending &&
					(isError ? (
						<>
							<CircleAlert size={iconSize} color="#bf7373" />
							<div className="flex flex-col items-center">
								<p className="font-medium">Failed to verify account</p>
								<p>Your account may already have been verified or the token is invalid</p>
							</div>
						</>
					) : (
						<>
							<p>Please click the button below to verify your account</p>
						</>
					))}
				<Button
					onClick={() => {
						if (token) {
							verify({ token });
						}
					}}
				>
					Verify account
				</Button>
			</div>
		</RoundedRect>
	);
};

export default Verification;
