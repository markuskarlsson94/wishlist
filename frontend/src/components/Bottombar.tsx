import { NavLink } from "react-router-dom";

const Bottombar = () => {
	const Link = ({ to, title }: { to: string; title: string }) => {
		return (
			<NavLink to={to} className={"hover:underline"}>
				<p className="text-sm">{title}</p>
			</NavLink>
		);
	};

	const Column = ({ children }: { children: React.ReactNode }) => {
		return <div className="flex flex-col gap-y-1 flex-grow basis-0">{children}</div>;
	};

	return (
		<footer className="bg-slate-800 w-full mt-auto">
			<div className="max-w-xl md:max-w-2xl mx-auto px-10 py-4">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-white">
					<Column>
						<p className="font-medium">Info</p>
						<Link to={"/about"} title={"About"} />
						<Link to={"/news"} title="News Archive" />
					</Column>
					<Column>
						<p className="font-medium">Policy</p>
						<Link to={"/terms-of-service"} title={"Terms of Service"} />
						<Link to={"/beta-info"} title={"Beta Disclaimer"} />
					</Column>
					<Column>
						<p className="font-medium">Support</p>
						<Link to={"/faq"} title={"FAQ"} />
					</Column>
					<Column>
						<p className="font-medium">Contact</p>
						<Link to={"https://www.linkedin.com/in/markus-karlsson-a200b9262/"} title={"LinkedIn"} />
						{/*<Link to={"mailto:admin@mail.com"} title={"Mail"} />*/}
					</Column>
				</div>
				<div className="flex">
					<div className="m-auto">
						<p className="text-sm">© {import.meta.env.VITE_COPYRIGHT}</p>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Bottombar;
