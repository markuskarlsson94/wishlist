const RoundedRect = ({ className, children }: { className?: string; children: React.ReactNode }) => {
	const combinedClassName = `bg-white rounded-md shadow-md p-5 ${className || ""}`;
	return <div className={combinedClassName}>{children}</div>;
};

export default RoundedRect;
