import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import logger from "../logger.js";

const ses = new SESClient({
	region: process.env.AWS_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_ACCESS_KEY,
	},
});

export const sendEmail = async (
	sender,
	recipients,
	subject,
	message,
	onEmailSent = (recipients, data) => {
		logger.info(`Email sent to ${recipients}. Message id = ${data.MessageId}`);
	},
) => {
	const params = {
		Source: `"${process.env.APP_NAME}" <${sender}@${process.env.EMAIL_DOMAIN}>`,
		Destination: { ToAddresses: recipients },
		Message: {
			Subject: { Data: subject },
			Body: { Html: { Data: message } },
		},
	};

	try {
		const data = await ses.send(new SendEmailCommand(params));
		onEmailSent(recipients, data);
	} catch (error) {
		logger.error(error);
	}
};
