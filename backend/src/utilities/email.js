import logger from "../logger.js";
import envConfig from "../envConfig.js";
import { sendEmail } from "./emailProvider.js";

export const sendVerificationEmail = async (receiver, token) => {
	const url = envConfig.getFrontendUrl();
	const link = `${url}/verify?token=${token}`;

	await sendEmail(
		"noreply",
		[receiver],
		"Account Verification",
		`<p>Thank you for signing up at ${process.env.APP_NAME}!</p><p>In order to finish your account setup, you need to follow the link in this email to verify your identity.</p><a href=${link}>Verify your account</a><p>If you did not sign up for ${process.env.APP_NAME}, you can safely ignore this email.</p><p>You can not reply to this message.</p>`,
		(recipients, data) => {
			logger.info(`Verfication email sent to ${recipients}. Message id = ${data.MessageId}`);
		},
	);
};

export const sendPasswordResetEmail = async (receiver, token) => {
	const url = envConfig.getFrontendUrl();
	const link = `${url}/reset-password?token=${token}`;

	await sendEmail(
		"noreply",
		[receiver],
		"Password Reset",
		`<p>We have received a request to reset your password for your ${process.env.APP_NAME} account. If you made this request, click the link below to set a new password</p><a href=${link}>Reset your password</a><p>This link will expire shortly for safety reasons. If you did not request a password reset, you can safely ignore this email.</p><p>You can not reply to this message.</p>`,
		(recipients, data) => {
			logger.info(`Password reset email sent to ${recipients}. Message id = ${data.MessageId}`);
		},
	);
};
