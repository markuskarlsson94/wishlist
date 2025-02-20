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

	const Feature = ({ title, description, Icon }: { title: string; description: string; Icon: LucideIcon }) => {
		return (
			<div className="flex flex-row gap-x-3 items-center">
				<Icon size={24} color={"#f87171"} />
				<div className="max-w-[18rem]">
					<p className="font-medium">{title}</p>
					<p className="text-sm text-muted-foreground">{description}</p>
				</div>
			</div>
		);
	};

	return (
		<div>
			<div className="relative flex flex-col">
				<div className="h-8" />

				<div className="flex flex-col">
					<p className="text-4xl font-bold text-red-500 self-center">{APP_NAME}</p>
					<p className="font-medium self-center">The simple and intuitive wishlist manager</p>
				</div>

				<div className="h-10" />

				<div className="flex flex-col gap-y-10 self-center">
					<Feature
						title="Create and Manage Wishlists"
						description="Build your wishlist in seconds. Choose who can see it: Everyone, friends, or just you."
						Icon={Scroll}
					/>

					<Feature
						title="Connect with Friends"
						description="Keep track of your friends wishlists and share yours. Make gift-giving personal and easy."
						Icon={Heart}
					/>

					<Feature
						title="Reserve Items"
						description="Reserve items to avoid duplicate gifts. Only you knows what you reserved."
						Icon={ListChecks}
					/>

					<Feature
						title="Anonymous Comments"
						description="Ask anonymous questions about wishlist items. No one will know it’s you."
						Icon={Ghost}
					/>
				</div>
			</div>
			<div className="h-12" />
			<div className="flex justify-center">
				<div className="flex gap-x-4">
					<RegisterDialog
						setRegistrationConfirmedDialogOpen={setRegistrationConfirmedDialogOpen}
						setRegistredEmail={setRegistredEmail}
					/>
					<Button variant={"secondary"} onClick={handleReadMore}>
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
