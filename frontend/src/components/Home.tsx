import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import RegisterDialog from "./dialogs/RegisterDialog";
import RegistrationConfirmedDialog from "./dialogs/RegistrationConfirmedDialog";
import { useEffect, useState } from "react";
import { APP_NAME } from "@/constants";
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "./ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const Home = () => {
	const [registrationConfirmedDialogOpen, setRegistrationConfirmedDialogOpen] = useState<boolean>(false);
	const [registredEmail, setRegistredEmail] = useState<string | undefined>(undefined);
	const [featureCount, setFeatureCount] = React.useState(0);
	const [currentFeature, setCurrentFeature] = React.useState(0);
	const isMobile = useIsMobile();
	const navigate = useNavigate();
	const [api, setApi] = useState<CarouselApi>();

	const handleReadMore = () => {
		navigate("/about");
	};

	const autoplay = React.useRef(Autoplay({ delay: 6000, stopOnInteraction: true, stopOnMouseEnter: true }));

	useEffect(() => {
		if (!api) return;

		setFeatureCount(api.scrollSnapList().length);
		setCurrentFeature(api.selectedScrollSnap() + 1);

		api.on("select", () => {
			setCurrentFeature(api.selectedScrollSnap() + 1);
		});
	}, [api]);

	const features = [
		{
			description: "Build your wishlists in seconds",
			descriptionSmall: "Control who can see them: Everyone, your friends, or just you",
			image: "./../../wishlist.png",
		},
		{
			description: "Connect with friends",
			descriptionSmall: "Keep track of their lists and wishes",
			image: "./../../friends.png",
		},
		{
			description: "Reserve items",
			descriptionSmall: "No more duplicate gifts! The wishlist owner can't see what has been reserved",
			image: "./../../reservation.png",
		},
		{
			description: "Comment anonymously",
			descriptionSmall: "Got a question about an item? Your identity will be hidden for other users",
			image: "./../../comments.png",
		},
	];

	return (
		<div>
			<div className="relative flex flex-col">
				<div className="md:h-8" />

				<div className="flex flex-col">
					<h1 className="text-4xl font-bold self-center text-white">{APP_NAME}</h1>
					<p className="font-medium self-center text-gray-100 text-center">
						The simple and intuitive wishlist manager
					</p>
				</div>

				<div className="h-6 md:h-12" />
			</div>

			<div className="flex flex-col gap-y-4">
				<Carousel className="m-auto px-0 w-[328px] md:w-80" plugins={[autoplay.current]} setApi={setApi}>
					<CarouselContent className="items-center">
						{features.map((feature) => (
							<CarouselItem key={feature.description}>
								<img src={feature.image ?? "./../../wishlist.png"} className="m-auto"></img>
							</CarouselItem>
						))}
					</CarouselContent>
					{!isMobile && (
						<>
							<CarouselPrevious />
							<CarouselNext />
						</>
					)}
				</Carousel>
				<>
					<div className="flex gap-x-2 m-auto">
						{Array.from({ length: featureCount }, (_, i) => (
							<div
								key={i}
								className={cn(
									"h-[8px] rounded-full",
									i + 1 === currentFeature ? "w-[8px] bg-white" : "w-[8px] bg-white opacity-25",
								)}
							/>
						))}
					</div>
					<div className="m-auto w-72">
						<p className="text-white font-medium text-lg text-center">
							{features[currentFeature - 1]?.description}
						</p>
						<p className="text-gray-100 font-medium text-sm text-center min-h-[2lh]">
							{features[currentFeature - 1]?.descriptionSmall}
						</p>
					</div>
				</>
			</div>

			<div className="h-4 md:h-4" />

			<div className="flex justify-center pb-10 md:pb-0">
				<div className="flex gap-x-4">
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
