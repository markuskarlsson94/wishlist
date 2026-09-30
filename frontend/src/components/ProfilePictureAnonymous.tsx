import ProfilePicture from "./ProfilePicture";

const ProfilePictureAnonymous = ({ index }: { index?: number }) => {
	let profilePicture = "profileAnonymous";

	if (index) {
		const colors = ["Blue", "Red", "Green", "Purple", "Yellow"];
		const i = (index - 1) % colors.length;
		profilePicture = `${profilePicture}${colors[i]}`;
	}
	return <ProfilePicture src={`./../../${profilePicture}.png`} />;
};

export default ProfilePictureAnonymous;
