import { useNavigate } from "react-router-dom";
import RoundedRect from "./RoundedRect";
import { Button } from "./ui/button";
import RegisterDialog from "./dialogs/RegisterDialog";
import RegistrationConfirmedDialog from "./dialogs/RegistrationConfirmedDialog";
import { useState } from "react";

const Home = () => {
	const [registrationConfirmedDialogOpen, setRegistrationConfirmedDialogOpen] = useState<boolean>(false);
	const [registredEmail, setRegistredEmail] = useState<string | undefined>(undefined);

	const navigate = useNavigate();

	const handleReadMore = () => {
		navigate("/about");
	};

	return (
		<RoundedRect>
			<div className="relative flex flex-col">
				<img
					src={"../public/wishlist.png"}
					className="absolute top-[120px] left-[10px] -rotate-3"
					height={220}
					width={220}
				/>
				<div className="flex flex-col w-[400px] h-[350px] justify-between ml-auto mt-8 mb-12">
					<div className="w-[300px]">
						<p className="font-medium">Create and manage wishlists</p>
						<p className="text-sm text-muted-foreground">
							Control who can see them. Everyone, just your friends, or only you!
						</p>
					</div>
					<div className="w-[300px] self-end">
						<p className="font-medium">Reserve other users items</p>
						<p className="text-sm text-muted-foreground">
							Make sure no one else buys the same thing. No one can see what you reserve
						</p>
					</div>
					<div className="w-[300px] self-center">
						<p className="font-medium">Anonymous comments</p>
						<p className="text-sm text-muted-foreground">
							Have a question? Add comments without anyone knowing it's you
						</p>
					</div>
				</div>
				<div className="self-end">
					<div className="flex gap-x-2">
						<RegisterDialog
							setRegistrationConfirmedDialogOpen={setRegistrationConfirmedDialogOpen}
							setRegistredEmail={setRegistredEmail}
						/>
						<Button variant={"secondary"} onClick={handleReadMore}>
							Read more
						</Button>
					</div>
				</div>
			</div>
			<RegistrationConfirmedDialog
				open={registrationConfirmedDialogOpen}
				setOpen={setRegistrationConfirmedDialogOpen}
				registredEmail={registredEmail}
			/>
		</RoundedRect>
	);
};

export default Home;
