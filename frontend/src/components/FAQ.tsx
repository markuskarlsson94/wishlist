import { useNavigate } from "react-router-dom";
import RoundedRect from "./RoundedRect";
import BackButton from "./BackButton";

const FAQ = () => {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate(-1);
	};

	const QA = ({ question, answer }: { question: string; answer: string }) => {
		return (
			<div>
				<p className="font-medium">{question}</p>
				<p>{answer}</p>
			</div>
		);
	};

	return (
		<RoundedRect>
			<div className="flex flex-col gap-y-6">
				<div className="relative flex items-center">
					<BackButton className="absolute" onClick={handleBack} />
					<p className="font-medium m-auto">FAQ</p>
				</div>

				<div className="flex flex-col gap-y-3">
					<div>
						<p className="font-medium"></p>
						<p></p>
					</div>
					<QA
						question={"Why did my reservation dissapear without me doing anything?"}
						answer={
							"A reservation will dissapear if the item you reserved is removed. This will occur if the owner either removes the item or the corresponding wishlist. The reservation will also be removed if the user who owns the item is deleted. Your reservation will also be hidden if the wishlist visibility changes so that you no longer can access the wishlist."
						}
					/>

					<QA
						question={"Is there any way to see who has reserved the items in my wishlist?"}
						answer={"No."}
					/>
				</div>
			</div>
		</RoundedRect>
	);
};

export default FAQ;
