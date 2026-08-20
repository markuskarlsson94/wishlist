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
	SidebarSeparator,
	useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
	Bell,
	Check,
	Copy,
	Heart,
	ListChecks,
	LogOut,
	LucideIcon,
	MessageCircle,
	Scroll,
	Settings,
} from "lucide-react";
import { useLogout } from "@/hooks/useLogout";
import { useGetFriendRequests } from "@/hooks/friendRequest";
import { useGetUser } from "@/hooks/user";
import { APP_NAME } from "@/constants";
import ProfilePicture from "./ProfilePicture";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useState } from "react";

const AppSidebar = () => {
	const { userId } = useAuth();
	const navigate = useNavigate();
	const { isMobile, setOpenMobile } = useSidebar();
	const { user } = useGetUser(userId);
	const [shareDialogOpen, setShareDialogOpen] = useState<boolean>(false);
	const [copied, setCopied] = useState<boolean>(false);

	const navigateTo = (to: string) => {
		navigate(to);

		if (isMobile) {
			setOpenMobile(false);
		}
	};

	const { logout } = useLogout({
		onSettled: () => {
			navigate("/");
		},
	});

	const onOpenShareDialog = () => {
		setShareDialogOpen(true);

		if (isMobile) {
			setOpenMobile(false);
		}
	};

	const onCopy = () => {
		if (copied) return;

		navigator.clipboard.writeText(import.meta.env.VITE_APP_DOMAIN);
		setCopied(true);

		setTimeout(() => {
			setCopied(false);
		}, 3000);
	};

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

	const AppSidebarShareButton = () => {
		return (
			<SidebarMenuItem>
				<SidebarMenuButton onClick={onOpenShareDialog}>
					<div className="flex items-center gap-2">
						<MessageCircle size={16} />
						<p className="font-medium">Tell a Friend</p>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		);
	};

	return (
		<>
			<Sidebar>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupContent>
							<div className="flex justify-center gap-x-3 items-center">
								<p
									className="text-2xl font-bold cursor-pointer bg-gradient-to-tr from-blue-600 to-emerald-400 inline-block text-transparent bg-clip-text"
									onClick={() => navigateTo("/")}
								>
									{APP_NAME}
								</p>
								<div onClick={() => navigateTo("/beta-info")} className="cursor-pointer">
									{
										<Badge className="bg-gray-800 text-white hover:bg-gray-300 hover:text-black">
											Beta
										</Badge>
									}
								</div>
							</div>
						</SidebarGroupContent>
					</SidebarGroup>
					{user && (
						<>
							<SidebarGroup>
								<SidebarGroupContent>
									<div className="flex flex-col gap-y-2">
										<ProfilePicture src={user.profilePicture} className="mx-auto h-16 w-16" />
										<p className="font-bold mx-auto [overflow-wrap:anywhere]">{`${user.firstName} ${user.lastName}`}</p>
									</div>
								</SidebarGroupContent>
							</SidebarGroup>
							<SidebarSeparator />
						</>
					)}
					<SidebarGroup>
						<SidebarGroupContent>
							<SidebarMenu>
								<AppSidebarButton title="My Wishlists" to={`user/${userId}/wishlists`} Icon={Scroll} />
								<AppSidebarButton title="My Reservations" to="/reservations" Icon={ListChecks} />
								<AppSidebarFriendsButton
									title="My Friends"
									to={`user/${userId}/friends`}
									Icon={Heart}
								/>
								<AppSidebarButton title="Settings" to="/settings" Icon={Settings} />
								<AppSidebarShareButton />
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
				<SidebarSeparator />
				<SidebarFooter>
					<SidebarMenuButton onClick={() => logout()} asChild>
						<Button variant={"ghost"}>
							<LogOut /> Log out
						</Button>
					</SidebarMenuButton>
				</SidebarFooter>
			</Sidebar>

			<Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Tell a Friend</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col gap-y-4">
						<p className="">
							Thank you for using {APP_NAME}! Click the button below to get a link to this website that
							you can send to your friends ✨
						</p>
						<div className="flex flex-wrap items-center justify-between gap-y-2">
							<p>{import.meta.env.VITE_APP_DOMAIN}</p>
							<Button onClick={onCopy}>
								{copied ? (
									<>
										<Check />
										Link copied
									</>
								) : (
									<>
										<Copy />
										Copy link
									</>
								)}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default AppSidebar;
