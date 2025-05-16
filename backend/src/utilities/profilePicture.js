import ErrorMessage from "../errors/ErrorMessage.js";
import errorMessages from "../errors/errorMessages.js";
import logger from "../logger.js";
import userService from "../services/userService.js";
import { uploadProfilePicture as upload, removeProfilePicture as remove } from "./profilePictureProvider.js";

export const uploadProfilePicture = async (user, userId, image, mimeType = undefined) => {
	if (!image) {
		throw new ErrorMessage(errorMessages.missingImage);
	}

	const u = await userService.getById(user, userId);
	const fileName = `${user.id}_${u.firstName}-${u.lastName}_${new Date().toISOString()}`;

	try {
		return await upload(u.profilePicture, image, fileName, mimeType);
	} catch (error) {
		logger.error(error.message);
		throw new ErrorMessage(errorMessages.unableToUploadProfilePicture);
	}
};

export const removeProfilePicture = async (user, userId) => {
	const u = await userService.getById(user, userId);

	try {
		await remove(u.profilePicture);
	} catch (error) {
		logger.error(error.message);
	}
};
