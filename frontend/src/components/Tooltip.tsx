import React from "react";
import { Tooltip as ShadcnTooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface Props {
	children: any;
	tooltip: string;
}

const Tooltip: React.FC<Props> = ({ children, tooltip }) => {
	return (
		<>
			<ShadcnTooltip>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				<TooltipContent>
					<p className="text-sm font-medium">{tooltip}</p>
				</TooltipContent>
			</ShadcnTooltip>
		</>
	);
};

Tooltip.displayName = "Tooltip";

export default Tooltip;
