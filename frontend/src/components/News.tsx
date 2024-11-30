import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton";
import RoundedRect from "./RoundedRect";
import { CardHeader, CardTitle } from "./ui/card";
import news from "@/news";
import HoverCard from "./HoverCard";
import { NavLink } from "react-router-dom";
import { Badge } from "./ui/badge";
import ReactTimeAgo from "react-time-ago";
import React from "react";
import Tooltip from "./Tooltip";
import NewsType from "@/types/NewsType";

const News = () => {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate(-1);
	};

	const DateWrapper = React.forwardRef<HTMLDivElement, { article: NewsType; children: React.ReactNode }>(
		({ article, children }, ref) => {
			return (
				<Tooltip ref={ref} tooltip={new Date(article.createdAt).toUTCString()}>
					{children}
				</Tooltip>
			);
		},
	);

	const Article = ({ article }: { article: NewsType }) => {
		const DateWrapperWithArticle = (props: any) => <DateWrapper {...props} article={article} />;

		return (
			<NavLink to={`/news/${article.id}`}>
				<HoverCard>
					<CardHeader>
						<CardTitle>
							<div className="flex justify-between items-center">
								{article.title}
								<Badge variant={"secondary"}>
									<ReactTimeAgo
										date={article.createdAt}
										tooltip={false}
										wrapperComponent={DateWrapperWithArticle}
									/>
								</Badge>
							</div>
						</CardTitle>
					</CardHeader>
				</HoverCard>
			</NavLink>
		);
	};

	return (
		<RoundedRect>
			<div className="flex flex-col gap-y-6">
				<div className="relative flex items-center">
					<BackButton className="absolute" onClick={handleBack} />
					<p className="font-medium m-auto">News archive</p>
				</div>

				<div className="flex flex-col gap-y-3">
					{news.map((article) => (
						<Article key={article.id} article={article} />
					))}
					{news.length === 0 && (
						<div className="flex">
							<p className="m-auto text-2xl font-medium text-gray-300">No news articles</p>
						</div>
					)}
				</div>
			</div>
		</RoundedRect>
	);
};

export default News;
