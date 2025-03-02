import { useNavigate } from "react-router-dom";
import RoundedRect from "./RoundedRect";
import BackButton from "./BackButton";
import { Separator } from "./ui/separator";

const FAQ = () => {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate(-1);
	};

	const QA = ({ question, children }: { question: string; children: React.ReactNode }) => {
		return (
			<div>
				<p className="font-medium">{question}</p>
				<div className="pl-4">{children}</div>
			</div>
		);
	};

	return (
		<RoundedRect>
			<div className="flex flex-col gap-y-6">
				<div className="relative flex items-center">
					<BackButton onClick={handleBack} />
					<p className="absolute left-1/2 transform -translate-x-1/2 font-medium">FAQ</p>
				</div>

				<div className="flex flex-col gap-y-6">
					<QA question="Why did my reservation disappear without me doing anything?">
						<p>A reservation could disappear for a number of different reasons</p>
						<ul className="list-disc list-inside pl-4">
							<li>The item or wishlist was removed by the owner</li>
							<li>The user profile of the owner was deleted</li>
							<li>
								The visibility level of the corresponding wishlist has changed so that you no longer can
								access it
							</li>
						</ul>
					</QA>

					<Separator />

					<QA question={"Is there any way to see who has reserved the items in my wishlist?"}>
						<p>No.</p>
					</QA>

					<Separator />

					<QA question={"Should I remove the item from my wishlist after I have received it?"}>
						<p>
							Yes, it is good practice to remove the item after you have received it. The reservation will
							then also be removed from the user who gifted it from you.
						</p>
					</QA>

					<Separator />

					<QA question={"How do I edit or delete an item/wishlist?"}>
						<p>Press the three dots in the upper right corner to open the edit/delete options.</p>
					</QA>

					<Separator />

					<QA question={"Can I send messages to users?"}>
						<p>
							There is currently no way to message users other than through anonymous comments on items.
						</p>
					</QA>

					<Separator />

					<QA question={"Can I recover my account after I deleted it?"}>
						<p>No, there is unfourtunately no way to recover a deleted account currently.</p>
					</QA>
				</div>
			</div>
		</RoundedRect>
	);
};

export default FAQ;
