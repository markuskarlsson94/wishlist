import { ShieldCheck } from "lucide-react";
import RoundedRect from "./RoundedRect";

const PasswordUpdated = () => {
	return (
		<RoundedRect>
			<div className={"flex flex-col items-center gap-y-6"}>
				<ShieldCheck size={96} color="#79bf73" />
				<p className="font-medium">Password successfully updated</p>
				<p>
					Your password has successfully been updated. Click the login button in the top right corner to log
					in.
				</p>
			</div>
		</RoundedRect>
	);
};

export default PasswordUpdated;
