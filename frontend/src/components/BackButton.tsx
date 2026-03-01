import React from "react";
import { ChevronLeft } from "lucide-react";
import { Button, type ButtonProps } from "./ui/button";
import { useNavigate } from "react-router-dom";

const BackButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ ...props }, ref) => {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate(-1);
	};

	return (
		<div>
			<Button size={"icon"} ref={ref} {...props} variant={"secondary"} onClick={handleBack}>
				<ChevronLeft />
			</Button>
		</div>
	);
});

BackButton.displayName = "BackButton";

export default BackButton;
