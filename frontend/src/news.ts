import { APP_NAME } from "./constants";
import NewsType from "./types/NewsType";

const news: NewsType[] = [];
let id = 0;

news.unshift({
	id: ++id,
	title: `Hello world, ${APP_NAME} is live!`,
	text: `${APP_NAME} has officially been launched onto the world wide web! 🎉`,
	createdAt: new Date("2026-02-16"),
});

export default news;
