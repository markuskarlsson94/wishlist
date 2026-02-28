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
import ProfilePicture from "./ProfilePicture";
import { useGetUser } from "@/hooks/user";
import BackButton from "./BackButton";

type BreadCrumbType = {
	title?: string;
	link?: string;
	userId?: number;
};

const BreadcrumbItemCustom = ({ breadcrumb }: { breadcrumb: BreadCrumbType }) => {
	const { user } = useGetUser(breadcrumb?.userId);

	return breadcrumb.link ? (
		<BreadcrumbItem>
			{breadcrumb.userId && <ProfilePicture src={user?.profilePicture} className="h-6 w-6 md:h-8 md:w-8" />}
			<BreadcrumbLink asChild>
				<NavLink to={breadcrumb.link}>{breadcrumb.title ? breadcrumb.title : <BreadcrumbEllipsis />}</NavLink>
			</BreadcrumbLink>
		</BreadcrumbItem>
	) : (
		<BreadcrumbItem>{breadcrumb.title ? breadcrumb.title : <BreadcrumbEllipsis />}</BreadcrumbItem>
	);
};

const Navbar = ({ breadcrumbs }: { breadcrumbs?: BreadCrumbType[] }) => {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate(-1);
	};

	return (
		<RoundedRect>
			<div className="flex gap-x-3">
				<BackButton onClick={handleBack} />
				<Breadcrumb className="flex min-h-9 font-medium items-center">
					<BreadcrumbList className="text-xs md:text-sm">
						{breadcrumbs?.map((breadcrumb, index) => (
							<React.Fragment key={breadcrumb.link}>
								<BreadcrumbItemCustom breadcrumb={breadcrumb} />
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
