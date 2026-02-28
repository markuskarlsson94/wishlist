import React from "react";
import { ChevronLeft } from "lucide-react";
import { Button, type ButtonProps } from "./ui/button";

const BackButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ ...props }, ref) => {
	return (
		<div>
			<Button size={"icon"} ref={ref} {...props} variant={"secondary"}>
				<ChevronLeft />
			</Button>
		</div>
	);
});

BackButton.displayName = "BackButton";

export default BackButton;
