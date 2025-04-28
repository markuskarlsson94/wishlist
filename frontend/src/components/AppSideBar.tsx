import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Bell, Heart, ListChecks, LogOut, LucideIcon, Scroll, Settings } from "lucide-react";
import { useLogout } from "@/hooks/useLogout";
import { useGetFriendRequests } from "@/hooks/friendRequest";

const AppSidebar = () => {
	const { userId } = useAuth();
	const navigate = useNavigate();
	const { isMobile, setOpenMobile } = useSidebar();

	const navigateTo = (to: string) => {
		navigate(to);

		if (isMobile) {
			setOpenMobile(false);
			console.log("here");
		}
	};

	const { logout } = useLogout({
		onSettled: () => {
			navigate("/");
		},
	});

	const AppSidebarButton = ({ title, to, Icon }: { title: string; to: string; Icon: LucideIcon }) => {
		return (
			<SidebarMenuItem>
				<SidebarMenuButton onClick={() => navigateTo(to)}>
					<div className="flex items-center gap-2">
						<Icon size={16} />
						<p className="font-medium">{title}</p>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		);
	};

	const AppSidebarFriendsButton = ({ title, to, Icon }: { title: string; to: string; Icon: LucideIcon }) => {
		const { receivedFriendRequests } = useGetFriendRequests(userId);
		let pendingFriendRequests;

		if (receivedFriendRequests?.length > 0) {
			pendingFriendRequests = receivedFriendRequests.length;
			if (pendingFriendRequests > 9) {
				pendingFriendRequests = "9+";
			}
		}

		return (
			<SidebarMenuItem>
				<SidebarMenuButton onClick={() => navigateTo(to)}>
					<div className="flex items-center gap-2">
						<Icon size={16} />
						<p className="font-medium">{title}</p>
					</div>
				</SidebarMenuButton>
				{pendingFriendRequests && (
					<SidebarMenuBadge>
						<div className="flex gap-1 items-center">
							<Bell size={16} />
							<p className="font-medium">{pendingFriendRequests}</p>
						</div>
					</SidebarMenuBadge>
				)}
			</SidebarMenuItem>
		);
	};

	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<div className="flex justify-center gap-x-3 items-center">
							<p
								className="text-xl font-bold text-slate-800 cursor-pointer"
								onClick={() => navigateTo("/")}
							>
								{APP_NAME}
							</p>
							<div onClick={() => navigateTo("/beta-info")} className="cursor-pointer">
								<Badge className="bg-red-200 text-black hover:bg-red-300">Beta</Badge>
							</div>
						</div>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<AppSidebarButton title="My Wishlists" to={`user/${userId}/wishlists`} Icon={Scroll} />
							<AppSidebarButton title="My Reservations" to="/reservations" Icon={ListChecks} />
							<AppSidebarFriendsButton title="My Friends" to={`user/${userId}/friends`} Icon={Heart} />
							<AppSidebarButton title="Settings" to="/settings" Icon={Settings} />
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenuButton onClick={() => logout()} asChild>
					<Button variant={"ghost"}>
						<LogOut /> Log out
					</Button>
				</SidebarMenuButton>
			</SidebarFooter>
		</Sidebar>
	);
};

export default AppSidebar;
