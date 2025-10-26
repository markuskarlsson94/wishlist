import { useNavigate } from "react-router-dom";
import RoundedRect from "./RoundedRect";
import BackButton from "./BackButton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

const FAQ = () => {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate(-1);
	};

	return (
		<RoundedRect>
			<div className="flex flex-col gap-y-6">
				<div className="relative flex items-center">
					<BackButton onClick={handleBack} />
					<p className="absolute left-1/2 transform -translate-x-1/2 font-medium">FAQ</p>
				</div>

				<Accordion type="multiple">
					<AccordionItem value="1">
						<AccordionTrigger>Why did my reservation disappear for seemingly no reason?</AccordionTrigger>
						<AccordionContent>
							<p>A reservation can disappear for a number of different reasons</p>
							<ul className="list-disc list-inside pl-4">
								<li>The item or wishlist was removed by the owner</li>
								<li>The user profile of the owner was deleted</li>
								<li>
									The visibility level of the corresponding wishlist has changed so that you no longer
									can access it
								</li>
							</ul>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="2">
						<AccordionTrigger>
							Is there any way to see who has reserved the items in my wishlist?
						</AccordionTrigger>
						<AccordionContent>No, it is not possible.</AccordionContent>
					</AccordionItem>
					<AccordionItem value="3">
						<AccordionTrigger>
							Should I remove the item from my wishlist after I have received it?
						</AccordionTrigger>
						<AccordionContent>
							Yes, it is good practice to remove the item after you have received it. The reservation will
							then also be removed from the user who gifted it to you.
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="4">
						<AccordionTrigger>How do I edit or delete an item/wishlist?</AccordionTrigger>
						<AccordionContent>
							Press the three dots in the upper right corner to open the edit/delete options.
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="5">
						<AccordionTrigger>Can I send direct messages to users?</AccordionTrigger>
						<AccordionContent>
							There is currently no way to message users other than through anonymous comments on items.
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="6">
						<AccordionTrigger>Can I recover my account after I deleted it?</AccordionTrigger>
						<AccordionContent>
							No, there is unfourtunately no way to recover a deleted account currently.
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="7">
						<AccordionTrigger>
							Can I change login method to another one than I registred with?
						</AccordionTrigger>
						<AccordionContent>No, this is not possible at the moment.</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
		</RoundedRect>
	);
};

export default FAQ;
