import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import RegisterDialog from "./dialogs/RegisterDialog";
import RegistrationConfirmedDialog from "./dialogs/RegistrationConfirmedDialog";
import { useState } from "react";
import { APP_NAME } from "@/constants";
import { Ghost, Heart, ListChecks, LucideIcon, Scroll } from "lucide-react";

const Home = () => {
	const [registrationConfirmedDialogOpen, setRegistrationConfirmedDialogOpen] = useState<boolean>(false);
	const [registredEmail, setRegistredEmail] = useState<string | undefined>(undefined);

	const navigate = useNavigate();

	const handleReadMore = () => {
		navigate("/about");
	};

	const Feature = ({
		title,
		description,
		Icon,
		delay = "0ms",
	}: {
		title: string;
		description: string;
		Icon: LucideIcon;
		delay?: string;
	}) => {
		return (
			<div className="animate-fade-slide-in opacity-0" style={{ animationDelay: delay }}>
				<div className="flex flex-row gap-x-3 items-center transform transition-transform duration-150 ease-in-out hover:scale-105">
					<Icon size={24} color={"white"} />
					<div className="max-w-[18rem]">
						<p className="font-medium text-slate-800">{title}</p>
						<p className="text-sm font-medium text-gray-100">{description}</p>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div>
			<div className="relative flex flex-col">
				<div className="h-8" />

				<div className="flex flex-col">
					<p className="text-4xl font-bold self-center text-white">{APP_NAME}</p>
					<p className="font-medium self-center text-gray-100">The simple and intuitive wishlist manager</p>
				</div>

				<div className="h-12" />

				<div className="flex flex-col gap-y-10 self-center">
					<Feature
						title="Create and Manage Wishlists"
						description="Build your wishlist in seconds. Choose who can see it: Everyone, friends, or just you."
						Icon={Scroll}
						delay="500ms"
					/>

					<Feature
						title="Connect with Friends"
						description="Keep track of your friends wishes and share yours. Make gift-giving organized and fun."
						Icon={Heart}
						delay="750ms"
					/>

					<Feature
						title="Reserve Items"
						description="Avoid duplicate gifts. The wishlist owner can't see what you reserve."
						Icon={ListChecks}
						delay="1000ms"
					/>

					<Feature
						title="Anonymous Comments"
						description="Ask questions about wishlist items without revealing your identity."
						Icon={Ghost}
						delay="1250ms"
					/>
				</div>
			</div>
			<div className="h-12" />
			<div className="flex justify-center">
				<div className="flex gap-x-4 animate-fade-slide-in opacity-0" style={{ animationDelay: "2250ms" }}>
					<RegisterDialog
						setRegistrationConfirmedDialogOpen={setRegistrationConfirmedDialogOpen}
						setRegistredEmail={setRegistredEmail}
					/>
					<Button variant={"ghost"} onClick={handleReadMore}>
						Read more
					</Button>
				</div>
			</div>
			<RegistrationConfirmedDialog
				open={registrationConfirmedDialogOpen}
				setOpen={setRegistrationConfirmedDialogOpen}
				registredEmail={registredEmail}
			/>
		</div>
	);
};

export default Home;
