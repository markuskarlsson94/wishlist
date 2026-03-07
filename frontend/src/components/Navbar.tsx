import RoundedRect from "./RoundedRect";
import { NavLink } from "react-router-dom";
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
import { Skeleton } from "./ui/skeleton";

type BreadCrumbType = {
	title?: string;
	link?: string;
	userId?: number;
};

type BreadCrumbProps = {
	breadcrumbs: BreadCrumbType[];
	isLoading?: boolean;
};

const BreadcrumbItemCustom = ({ breadcrumb }: { breadcrumb: BreadCrumbType }) => {
	const { user } = useGetUser(breadcrumb?.userId);

	return breadcrumb.link ? (
		<BreadcrumbItem>
			{breadcrumb.userId && <ProfilePicture src={user?.profilePicture} className="h-8 w-8" />}
			<BreadcrumbLink asChild>
				<NavLink to={breadcrumb.link}>{breadcrumb.title ? breadcrumb.title : <BreadcrumbEllipsis />}</NavLink>
			</BreadcrumbLink>
		</BreadcrumbItem>
	) : (
		<BreadcrumbItem>{breadcrumb.title ? breadcrumb.title : <BreadcrumbEllipsis />}</BreadcrumbItem>
	);
};

const Navbar = ({ props }: { props: BreadCrumbProps }) => {
	const breadcrumbs = props.breadcrumbs;

	return (
		<RoundedRect>
			<div className="flex gap-x-3">
				<BackButton />
				{props?.isLoading ? (
					<div className="flex items-center">
						<Skeleton className="h-6 w-[200px]" />
					</div>
				) : (
					<Breadcrumb className="flex min-h-9 font-medium items-center">
						<BreadcrumbList className="text-xs md:text-sm break-all">
							{breadcrumbs?.map((breadcrumb, index) => (
								<React.Fragment key={`${breadcrumb.title}-${index}`}>
									<BreadcrumbItemCustom breadcrumb={breadcrumb} />
									{index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
								</React.Fragment>
							))}
						</BreadcrumbList>
					</Breadcrumb>
				)}
			</div>
		</RoundedRect>
	);
};

export default Navbar;
