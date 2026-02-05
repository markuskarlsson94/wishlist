import { Resend } from "resend";
import logger from "../logger.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (
	sender,
	recipients,
	subject,
	message,
	onEmailSent = (data) => {
		logger.info(`Email sent to ${data.recipients}. Message id = ${data.id}`);
	},
) => {
	try {
		const from = `${sender}@${process.env.EMAIL_DOMAIN}`;

		const res = await resend.emails.send({
			from: `"${process.env.APP_NAME}" <${from}>`,
			to: recipients,
			replyTo: from,
			subject,
			html: message,
		});

		onEmailSent({ recipients, id: res.data.id });
	} catch (error) {
		logger.error(error);
	}
};
