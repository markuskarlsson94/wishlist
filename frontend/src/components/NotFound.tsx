import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton";
import RoundedRect from "./RoundedRect";

const NotFound = ({ type }: { type: string }) => {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate(-1);
	};

	return (
		<RoundedRect>
			<BackButton onClick={handleBack} />
			<div className="h-3" />
			<div className="flex">
				<p className="m-auto text-2xl font-medium text-gray-300">{type} not found</p>
			</div>
		</RoundedRect>
	);
};

export default NotFound;
