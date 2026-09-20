import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

const Infobox = ({ className, children }: { className?: string; children: React.ReactNode }) => {
	return (
		<div className={cn("flex gap-x-2 bg-slate-100 rounded-lg p-2 mt-2", className)}>
			<div>
				<Info color="#90a1b9" />
			</div>
			<div className="text-sm font-medium m-auto text-slate-500">
				<p>{children}</p>
			</div>
		</div>
	);
};

export default Infobox;
