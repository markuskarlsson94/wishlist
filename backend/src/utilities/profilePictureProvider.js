import { createClient } from "@supabase/supabase-js";
import ErrorMessage from "../errors/ErrorMessage.js";
import errorMessages from "../errors/errorMessages.js";
import logger from "../logger.js";

const supabase = createClient(`https://${process.env.SUPABASE_PROJECT}.supabase.co`, process.env.SUPABASE_SERVICE_ROLE);
const bucketName = process.env.SUPABASE_BUCKET;

export const uploadProfilePicture = async (profilePictureURL, image, fileName, mimeType) => {
	if (profilePictureURL) {
		try {
			const segments = profilePictureURL.split("/");
			const profilePicture = segments.at(-1);

			const { error: removeError } = await supabase.storage.from(bucketName).remove(profilePicture);

			if (removeError) {
				logger.error(removeError.message);
			}
		} catch (err) {
			logger.error(err.message);
		}
	}

	const { error: uploadError } = await supabase.storage
		.from(bucketName)
		.upload(fileName, image.buffer, { contentType: mimeType, upsert: true });

	if (uploadError) {
		logger.error(uploadError.message);
		throw new ErrorMessage(errorMessages.unableToUploadProfilePicture);
	}

	return supabase.storage.from(bucketName).getPublicUrl(fileName).data.publicUrl;
};

export const removeProfilePicture = async (profilePictureURL) => {
	const segments = profilePictureURL.split("/");
	const profilePicture = segments.at(-1);

	const { error } = await supabase.storage.from(bucketName).remove(profilePicture);

	if (error) {
		logger.error(error);
	}
};
