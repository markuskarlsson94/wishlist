import { Separator } from "./ui/separator";

const SeparatorWithLabel = ({ label }: { label: string }) => {
	return (
		<div className="relative flex items-center justify-center overflow-hidden">
			<Separator className="flex-1" />
			<p className="px-2 text-sm text-gray-500 whitespace-nowrap">{label}</p>
			<Separator className="flex-1" />
		</div>
	);
};

export default SeparatorWithLabel;
