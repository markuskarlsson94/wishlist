import NewsType from "./types/NewsType";

const news: NewsType[] = [];
let id = 0;

news.unshift({
	id: ++id,
	title: "Hello world",
	text: "This is the first news article on this site!",
	createdAt: new Date("2024-11-30"),
});

export default news;
