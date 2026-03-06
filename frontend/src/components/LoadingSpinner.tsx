import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";

const LoadingSpinner = ({ className }: { className?: string }) => {
	return <LoaderCircle color="#a1a1a1ff" className={cn("animate-spin", className)} />;
};

export default LoadingSpinner;
