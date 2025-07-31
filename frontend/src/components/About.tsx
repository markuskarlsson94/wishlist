import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton";
import RoundedRect from "./RoundedRect";
import { NavLink } from "react-router-dom";
import { APP_NAME } from "@/constants";

const About = () => {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate(-1);
	};

	return (
		<RoundedRect>
			<div className="flex flex-col gap-y-6">
				<div className="relative flex items-center">
					<BackButton onClick={handleBack} />
					<p className="absolute left-1/2 transform -translate-x-1/2 font-medium">About {APP_NAME}</p>
				</div>

				<p>
					{APP_NAME} is a free-to-use and minimal website that allows users to create and manage their own
					wishlists. Items in wishlists can be reserved by other users to make sure they wont be bought twice.
					The owner of the wishlist can't see which items have been reserved. Other users can however see who
					reserved what.
				</p>

				<p>
					As a wishlist owner you have control over who can see the wishlist. You can select to have it
					visible to every user, just your friends, or only you. This can be changed at any time in the
					wishlist settings.
				</p>

				<p>
					Sometimes you might want to ask a question regarding an item in another users wishlist. All comments
					are anonymous and the wishlist owner and other users won't know your identity.
				</p>

				<p>
					You can add other users as friends. This is done by sending them a friend request or accepting
					requests sent to you. You can view all your friends and pending friend request by clicking the "My
					friends" button in the sidebar.
				</p>

				<p>
					Please note that the website is currently in a beta stage and may not fully function as intended.
					You can read more in the{" "}
					<NavLink to={"/beta-info"}>
						<span className="underline hover:no-underline hover:text-gray-400">Public Beta Disclaimer</span>
					</NavLink>
					.
				</p>

				<p>If you have any questions or suggestions you are always free to contact us.</p>
			</div>
		</RoundedRect>
	);
};

export default About;
