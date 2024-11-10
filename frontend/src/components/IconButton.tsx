import React from "react";
import { Button, type ButtonProps } from "./ui/button";
import { cn } from "@/lib/utils";

interface CustomButtonProps extends ButtonProps {}

const IconButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
	({ className = "", children, ...props }, ref) => {
		return (
			<Button ref={ref} className={cn("relative top-[3px] w-[36px]", className)} {...props}>
				<>{children}</>
			</Button>
		);
	},
);

IconButton.displayName = "IconButton";

export default IconButton;
