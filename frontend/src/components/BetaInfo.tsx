import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton";
import RoundedRect from "./RoundedRect";
import { Bug, Database, Settings, Trash2 } from "lucide-react";

const BetaInfo = () => {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate(-1);
	};

	return (
		<RoundedRect>
			<div className="flex flex-col gap-y-6">
				<div className="relative flex items-center">
					<BackButton className="absolute" onClick={handleBack} />
					<p className="font-medium m-auto">Public Beta Disclaimer</p>
				</div>

				<p className="mt-3">
					Thank you for participating in the public beta of our web application! Please note that this is a
					beta version and is still under active development. By using this application during the beta phase,
					you acknowledge and agree to the following:
				</p>

				<div className="flex flex-col gap-y-6 px-3">
					<div>
						<div className="flex gap-x-3">
							<Database strokeWidth={1} />
							<p className="font-medium">Data Handling and Storage</p>
						</div>
						<p>
							Our web app stores user-submitted data to provide its intended functionality. While we
							strive to ensure the security and privacy of your data, there may be unforeseen issues
							during this testing phase. We strongly recommend avoiding the submission of sensitive or
							confidential information at this time.
						</p>
					</div>

					<div>
						<div className="flex gap-x-3">
							<Bug strokeWidth={1} />
							<p className="font-medium">Potential Bugs and Issues</p>
						</div>
						<p>
							As a beta product, the app may experience bugs, downtime, or functionality issues. Your
							feedback on these matters is invaluable and will help us refine and improve the final
							version.
						</p>
					</div>

					<div>
						<div className="flex gap-x-3">
							<Trash2 strokeWidth={1} />
							<p className="font-medium">No Guarantees on Data Retention</p>
						</div>
						<p>
							Data submitted during the beta phase may be subject to deletion or loss as we make updates
							to the application. Please ensure that you retain backups of any critical information you
							submit.
						</p>
					</div>

					<div>
						<div className="flex gap-x-3">
							<Settings strokeWidth={1} />
							<p className="font-medium">Changes to Features and Policies</p>
						</div>
						<p>
							Features and policies may change as the app evolves. We will notify users of significant
							changes, but your continued use of the beta app indicates your agreement to any updates.
						</p>
					</div>
				</div>

				<p>
					By using this beta app, you agree to these terms and understand that your feedback helps shape the
					future of this application. If you encounter any issues or have suggestions, please contact us.
				</p>

				<p>Thank you for helping us improve! ❤</p>
			</div>
		</RoundedRect>
	);
};

export default BetaInfo;
