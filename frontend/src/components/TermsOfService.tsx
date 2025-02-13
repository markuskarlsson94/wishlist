import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton";
import RoundedRect from "./RoundedRect";
import { APP_NAME } from "@/constants";

const TermsOfService = () => {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate(-1);
	};

	return (
		<RoundedRect>
			<div className="flex flex-col gap-y-6">
				<div className="relative flex items-center">
					<BackButton className="absolute" onClick={handleBack} />
					<p className="font-medium m-auto">Terms of Service</p>
				</div>

				<p className="mt-3">
					Welcome to {APP_NAME} (“we,” “us,” or “our”). By accessing or using our web application (“Service”),
					you agree to comply with and be bound by these Terms of Service. Please read them carefully before
					using the Service. If you do not agree to these terms, you may not use the Service.
				</p>

				<div>
					<p className="font-medium">1. Acceptance of Terms</p>
					<p>
						By using our Service, you acknowledge that you are at least 18 years old or have the legal
						capacity to enter into this agreement. If you are using the Service on behalf of an
						organization, you agree to these terms on behalf of that organization.
					</p>
				</div>

				<div>
					<p className="font-medium">2. Description of the Service</p>
					<p>
						{APP_NAME} allows users to submit and store data for creating and managing wishlists. The
						Service is provided on an “as is” and “as available” basis during its beta phase. Features and
						functionality may be added, modified, or removed at any time without notice.
					</p>
				</div>

				<div>
					<p className="font-medium">3. User Responsabilities</p>
					<div className="flex flex-col gap-y-2">
						<p>By using the Service, you agree to: </p>
						<ul className="list-disc list-inside pl-4">
							<li>Provide accurate and lawful information.</li>
							<li>submitting any sensitive, confidential, or illegal content.</li>
							<li>Refrain from Use the Service only for its intended purposes. </li>
						</ul>
						<p>
							You are solely responsible for the content you submit, and we do not assume liability for
							any loss, misuse, or unauthorized access to your data during the beta phase.
						</p>
					</div>
				</div>

				<div>
					<p className="font-medium">4. Prohibited Activities</p>
					<div className="flex flex-col gap-y-2">
						<p>You may not: </p>
						<ul className="list-disc list-inside pl-4">
							<li>Violate any applicable laws or regulations.</li>
							<li>Submit malicious, harmful, or inappropriate content.</li>
							<li>
								Attempt to reverse-engineer, decompile, or exploit the Service or its underlying systems
								in a manner inconsistent with the permitted use of the software or any applicable
								open-source license.
							</li>
							<li>Interfere with the security, operation, or performance of the Service. </li>
						</ul>
					</div>
				</div>

				<div>
					<p className="font-medium">5. Data Storage and Privacy</p>
					<p>
						While we implement security measures to protect your data, we cannot guarantee absolute
						security. By using the Service, you consent to the collection, storage, and processing of your
						data as outlined in our [Privacy Policy]. Data submitted during the beta phase may be deleted or
						modified without notice.
					</p>
				</div>

				<div>
					<p className="font-medium">6. Beta Disclaimer</p>
					<p>
						As a beta product, the Service is under active development and may contain bugs or errors. By
						using the Service, you acknowledge and accept these limitations. We are not liable for any data
						loss, downtime, or issues arising during this phase.
					</p>
				</div>

				<div>
					<p className="font-medium">7. Intellectual Property and Licensing</p>
					<div className="flex flex-col gap-y-2">
						<ul className="list-disc list-inside pl-4">
							<li>
								<span className="font-medium">Ownership of Code and Content</span>
								<p className="pl-4">
									All code and underlying software used to operate the Service, unless otherwise
									stated, is owned or licensed by us. By using the Service, you acknowledge that the
									software may be governed by applicable open-source licenses, which may allow for
									review and redistribution of the code under specific conditions.
								</p>
							</li>

							<li>
								<span className="font-medium">User Content</span>
								<p className="pl-4">
									You retain ownership of any content you submit through the Service. However, by
									submitting content, you grant us a worldwide, non-exclusive, royalty-free license to
									use, store, display, and distribute your content for the purpose of operating and
									improving the Service.
								</p>
							</li>

							<li>
								<span className="font-medium">No User Access to Source Code</span>
								<p className="pl-4">
									While our underlying software may be distributed under an open-source license, this
									does not imply that users of the Service have direct access to or rights over its
									source code in the context of using this web application.
								</p>
							</li>

							<li>
								<span className="font-medium">No Warranty</span>
								<p className="pl-4">
									The Service is provided on an “as is” basis. While the code powering the Service may
									be open-source, we make no guarantees regarding its performance, reliability, or
									suitability for any particular purpose.
								</p>
							</li>
						</ul>
					</div>
				</div>

				<div>
					<p className="font-medium">8. Termination</p>
					<p>
						We reserve the right to suspend or terminate your access to the Service at any time, for any
						reason, including violations of these Terms of Service. You may discontinue use of the Service
						at any time.
					</p>
				</div>

				<div>
					<p className="font-medium">9. Limitation of Liability</p>
					<p>
						To the fullest extent permitted by law, we are not liable for any direct, indirect, incidental,
						or consequential damages resulting from your use of or inability to use the Service. Your sole
						remedy is to discontinue use of the Service.
					</p>
				</div>

				<div>
					<p className="font-medium">10. Indemnification</p>
					<p>
						You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from
						your use of the Service or violation of these Terms of Service.
					</p>
				</div>

				<div>
					<p className="font-medium">11. Governing Law</p>
					<p>
						These Terms of Service are governed by the laws of Sweden, without regard to conflict of law
						principles. Any disputes shall be resolved exclusively in the courts of Sweden.
					</p>
				</div>

				<div>
					<p className="font-medium">12. Modification of Terms</p>
					<p>
						We may update these Terms of Service at any time. Changes will be effective upon posting.
						Continued use of the Service after changes indicates your acceptance of the updated terms.
					</p>
				</div>

				<p>
					For questions or concerns regarding these Terms of Service, please contact us at [support email or
					feedback link].
				</p>
			</div>
		</RoundedRect>
	);
};

export default TermsOfService;
