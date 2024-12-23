import { useNavigate } from "react-router-dom";
import RoundedRect from "./RoundedRect";
import BackButton from "./BackButton";

const FAQ = () => {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate(-1);
	};

	const QA = ({ question, children }: { question: string; children: React.ReactNode }) => {
		return (
			<div>
				<p className="font-medium">{question}</p>
				{children}
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

				<div className="flex flex-col gap-y-6">
					<QA question="Why did my reservation disappear without me doing anything?">
						<p>A reservation could disappear for a couple of different reasons</p>
						<ul className="list-disc list-inside pl-4">
							<li>The item or wishlsit was removed by the owner</li>
							<li>The user profile of the owner was deleted</li>
							<li>
								The visibility level of the corresponding wishlist has changed so that you no longer can
								access it
							</li>
						</ul>
					</QA>

					<QA question={"Is there any way to see who has reserved the items in my wishlist?"}>
						<p>No.</p>
					</QA>

					<QA question={"I've forgotten my password. What do I do?"}>
						<p>Please send an email to the admin using the same email you used to sign up with.</p>
					</QA>
				</div>
			</div>
		</RoundedRect>
	);
};

export default FAQ;
