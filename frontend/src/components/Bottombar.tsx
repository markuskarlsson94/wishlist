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
		<div className="bg-slate-800">
			<div className="grid grid-cols-4 text-white m-auto gap-x-12 py-4" style={{ width: "max-content" }}>
				<Column>
					<p className="font-medium">News</p>
					<Link to={"/news"} title="Archive" />
				</Column>
				<Column>
					<p className="font-medium">Info</p>
					<Link to={"/about"} title={"About"} />
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
					<Link to={"mailto:admin@mail.com"} title={"Mail"} />
				</Column>
			</div>
			<div className="flex text-white py-2">
				<div className="m-auto">
					<p className="text-sm">© {import.meta.env.VITE_COPYRIGHT}</p>
				</div>
			</div>
		</div>
	);
};

export default Bottombar;
