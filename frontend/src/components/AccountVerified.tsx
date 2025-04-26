import { ShieldCheck } from "lucide-react";
import RoundedRect from "./RoundedRect";
import { APP_NAME } from "@/constants";

const AccountVerified = () => {
	return (
		<RoundedRect>
			<div className={"flex flex-col items-center gap-y-6"}>
				<ShieldCheck size={96} color="#79bf73" />
				<p className="font-medium">Account successfully verfied</p>
				<p>
					Congratulations! Your account has successfully been verified and you are ready to start using{" "}
					{APP_NAME}. To get started, click the login button in the top right corner and login using your
					credentials.
				</p>
			</div>
		</RoundedRect>
	);
};

export default AccountVerified;
