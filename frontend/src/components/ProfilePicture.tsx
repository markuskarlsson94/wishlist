import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const ProfilePicture = ({ src, className }: { src: string | undefined; className?: string }) => {
	return (
		<Avatar className={className}>
			<AvatarImage src={src ?? "./../../public/profile.png"} />
			<AvatarFallback />
		</Avatar>
	);
};

export default ProfilePicture;
