import notificationService from "./services/notificationService.js";

let notificationTypes = {};

export const initNotificationTypes = async () => {
	const types = await notificationService.getTypes();
	const friendRequest = types.find((type) => type.name === "friendRequest").id;
	const comment = types.find((type) => type.name === "comment").id;
	const fulfillment = types.find((type) => type.name === "fulfillment").id;

	notificationTypes = {
		FRIENDREQUEST: friendRequest,
		COMMENT: comment,
		FULFILLMENT: fulfillment,
	};
};

export const friendRequestType = () => {
	return notificationTypes.FRIENDREQUEST;
};

export const commentType = () => {
	return notificationTypes.COMMENT;
};

export const fulfillmentType = () => {
	return notificationTypes.FULFILLMENT;
};
