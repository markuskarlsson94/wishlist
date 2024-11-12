import React from "react";
import { Card } from "./ui/card";

interface Props {
	className?: string;
	children: any;
}

const HoverCard: React.FC<Props> = ({ className, children }) => {
	return <Card className={`hover:bg-gray-50 ${className}`}>{children}</Card>;
};

HoverCard.displayName = "HoverCard";

export default HoverCard;
