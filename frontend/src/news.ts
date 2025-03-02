import { APP_NAME } from "./constants";
import NewsType from "./types/NewsType";

const news: NewsType[] = [];
let id = 0;

news.unshift({
	id: ++id,
	title: `Hello world, ${APP_NAME} is live!`,
	text: "This is the first news article on this site!",
	createdAt: new Date("2025-03-01"),
});

export default news;
