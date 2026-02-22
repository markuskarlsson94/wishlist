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
		`<b>Thank you for signing up at <a href=${url}>${process.env.VITE_APP_NAME}</a>!</b><p>You need to follow the link in this email in order to verify your identity and finish your account setup.</p><a href=${link}>Verify your account</a><p>You can safely ignore this email if you did not sign up for ${process.env.VITE_APP_NAME}.</p><p>You can not reply to this message.</p>`,
		(data) => {
			logger.info(`Verfication email sent to ${data.recipients}. Message id = ${data.id}`);
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
		`<p>We have received a request to reset your password for your <a href=${url}>${process.env.VITE_APP_NAME}</a> account. If you made this request, click the link below to set a new password</p><a href=${link}>Reset your password</a><p>This link will expire shortly for safety reasons. If you did not request a password reset, you can safely ignore this email.</p><p>You can not reply to this message.</p>`,
		(data) => {
			logger.info(`Password reset email sent to ${data.recipients}. Message id = ${data.id}`);
		},
	);
};
