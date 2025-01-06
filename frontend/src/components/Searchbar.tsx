import { Search, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useRef, useState } from "react";

const Searchbar = ({
	placeholder,
	disabled = false,
	onSearch,
	onChange,
	onKeyDown,
	onClear,
}: {
	placeholder?: string;
	disabled: boolean;
	onSearch: (query: string) => void;
	onChange?: (input: string) => void;
	onKeyDown?: (key: string) => void;
	onClear?: () => void;
}) => {
	const [input, setinput] = useState<string>("");
	const inputRef = useRef<HTMLInputElement>(null);

	const handleSearch = (query: string) => {
		onSearch(query);

		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	const handleInputChange = (input: string) => {
		setinput(input);
		if (onChange) onChange(input);
	};

	const handleClick = () => {
		handleSearch(input);
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (onKeyDown) onKeyDown(event.key);

		if (event.key === "Enter" && !disabled) {
			handleSearch(input);
		}
	};

	const handleClear = () => {
		const ref = inputRef.current;

		if (ref) {
			ref.value = "";
			ref.focus();
		}

		setinput("");
		if (onChange) onChange(input);
		if (onClear) onClear();
	};

	return (
		<div className="relative">
			<Input
				type={"text"}
				ref={inputRef}
				placeholder={placeholder}
				className="w-80 bg-white pr-16"
				onChange={(e) => handleInputChange(e.target.value)}
				onKeyDown={handleKeyDown}
			/>
			{input.length > 0 && (
				<Button
					variant={"ghost"}
					size={"icon"}
					className="absolute right-8 top-0 h-full px-3 py-2 hover:bg-transparent"
					onClick={handleClear}
				>
					<X opacity={0.5} />
				</Button>
			)}
			<Button
				variant={"ghost"}
				size={"icon"}
				className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				disabled={disabled}
			>
				<Search />
			</Button>
		</div>
	);
};

export default Searchbar;
