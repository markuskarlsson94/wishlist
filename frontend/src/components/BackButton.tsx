import React from "react";
import { ChevronLeft } from "lucide-react";
import IconButton from "./IconButton";
import { type ButtonProps } from "./ui/button";

const BackButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ ...props }, ref) => {
	return (
		<IconButton ref={ref} {...props} variant={"secondary"}>
			<ChevronLeft />
		</IconButton>
	);
});

BackButton.displayName = "BackButton";

export default BackButton;
