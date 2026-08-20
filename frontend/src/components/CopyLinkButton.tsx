import { useState } from "react";
import { Button } from "./ui/button";
import { Check, Copy } from "lucide-react";

const CopyLinkButton = ({ textToCopy }: { textToCopy: string }) => {
	const [copied, setCopied] = useState<boolean>(false);

	const onClick = () => {
		navigator.clipboard.writeText(textToCopy);
		setCopied(true);

		setTimeout(() => {
			setCopied(false);
		}, 3000);
	};

	return (
		<Button onClick={onClick}>
			{copied ? (
				<>
					<Check />
					Link copied
				</>
			) : (
				<>
					<Copy />
					Copy link
				</>
			)}
		</Button>
	);
};

export default CopyLinkButton;
