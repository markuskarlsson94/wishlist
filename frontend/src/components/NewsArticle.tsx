import news from "@/news";
import { useNavigate, useParams } from "react-router-dom";
import RoundedRect from "./RoundedRect";
import BackButton from "./BackButton";
import NotFound from "./NotFound";

const NewsArticle = () => {
	const params = useParams<{ id: string }>();
	const id = Number(params.id);
	const navigate = useNavigate();

	const handleBack = () => {
		navigate(-1);
	};

	const article = news.find((a) => a.id === id);

	if (!article) {
		return <NotFound type="Article" />;
	}

	return (
		<RoundedRect>
			<div className="flex flex-col gap-y-6">
				<div className="relative flex items-center">
					<BackButton onClick={handleBack} />
				</div>
				<div className="flex flex-col gap-y-3">
					<p className="text-sm text-muted-foreground">
						Posted {article.createdAt.toLocaleDateString()}.{" "}
						{article.updatedAt && <span> Updated {article.updatedAt.toLocaleDateString()}.</span>}
					</p>
					<p>{article.text}</p>
				</div>
			</div>
		</RoundedRect>
	);
};

export default NewsArticle;
