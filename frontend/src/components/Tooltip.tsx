import { forwardRef } from "react";
import { Tooltip as ShadcnTooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface Props {
	children: any;
	tooltip: string;
}

const Tooltip = forwardRef<HTMLDivElement, Props>(({ children, tooltip }, ref) => {
	return (
		<>
			<ShadcnTooltip>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				<TooltipContent ref={ref}>
					<p className="text-sm font-medium">{tooltip}</p>
				</TooltipContent>
			</ShadcnTooltip>
		</>
	);
});

Tooltip.displayName = "Tooltip";

export default Tooltip;
