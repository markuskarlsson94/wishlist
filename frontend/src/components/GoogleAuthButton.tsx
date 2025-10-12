import { FcGoogle } from "react-icons/fc";
import { Button } from "./ui/button";

const GoogleAuthButton = () => {
	return (
		<Button
			variant="outline"
			className="flex items-center justify-center w-full py-2 text-sm font-medium border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
		>
			<FcGoogle className="w-5 h-5 mr-2" />
			Continue with Google
		</Button>
	);
};

export default GoogleAuthButton;
