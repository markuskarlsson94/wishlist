import news from "@/news";
import { useParams } from "react-router-dom";
import RoundedRect from "./RoundedRect";
import BackButton from "./BackButton";
import NotFound from "./NotFound";
import { Badge } from "./ui/badge";

const NewsArticle = () => {
	const params = useParams<{ id: string }>();
	const id = Number(params.id);
	const article = news.find((a) => a.id === id);

	if (!article) {
		return <NotFound type="Article" />;
	}

	return (
		<RoundedRect>
			<div className="flex flex-col gap-y-6">
				<div className="relative flex items-center justify-between">
					<BackButton />
					<p className="absolute left-1/2 transform -translate-x-1/2 font-medium">{article.title}</p>
					<Badge variant={"secondary"}>{article.createdAt.toLocaleDateString()}</Badge>
				</div>
				<div className="flex flex-col gap-y-3">
					<p>{article.text}</p>
				</div>
			</div>
		</RoundedRect>
	);
};

export default NewsArticle;
