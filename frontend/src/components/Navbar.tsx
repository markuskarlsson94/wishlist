import BackButton from "./BackButton";
import RoundedRect from "./RoundedRect";
import { NavLink, useNavigate } from "react-router-dom";
import {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbEllipsis,
	BreadcrumbSeparator,
	BreadcrumbLink,
} from "./ui/breadcrumb";
import React from "react";

type BreadCrumbType = {
	title?: string;
	link?: string;
};

const Navbar = ({ breadcrumbs }: { breadcrumbs?: BreadCrumbType[] }) => {
	const navigate = useNavigate();

	return (
		<RoundedRect>
			<div className="flex items-center gap-x-4">
				<BackButton onClick={() => navigate(-1)} />
				<Breadcrumb className="font-medium">
					<BreadcrumbList className="text-xs md:text-sm">
						{breadcrumbs?.map((breadcrumb, index) => (
							<React.Fragment key={breadcrumb.link}>
								{breadcrumb.link ? (
									<BreadcrumbItem>
										<BreadcrumbLink asChild>
											<NavLink to={breadcrumb.link}>
												{breadcrumb.title ? breadcrumb.title : <BreadcrumbEllipsis />}
											</NavLink>
										</BreadcrumbLink>
									</BreadcrumbItem>
								) : (
									<BreadcrumbItem>
										{breadcrumb.title ? breadcrumb.title : <BreadcrumbEllipsis />}
									</BreadcrumbItem>
								)}
								{index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
							</React.Fragment>
						))}
					</BreadcrumbList>
				</Breadcrumb>
			</div>
		</RoundedRect>
	);
};

export default Navbar;
