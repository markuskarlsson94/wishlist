import notificationService from "./services/notificationService.js";

let notificationTypes = {};

export const initNotificationTypes = async () => {
	const types = await notificationService.getTypes();
	const friendRequest = types.find((type) => type.name === "friendRequest").id;
	const comment = types.find((type) => type.name === "comment").id;

	notificationTypes = {
		FRIENDREQUEST: friendRequest,
		COMMENT: comment,
	};
};

export const friendRequestType = () => {
	return notificationTypes.FRIENDREQUEST;
};

export const commentType = () => {
	return notificationTypes.COMMENT;
};
