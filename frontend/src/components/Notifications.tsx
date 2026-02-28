import { useAuth } from "@/contexts/AuthContext";
import {
	useDeleteNotifcationsByUser,
	useDeleteNotification,
	useGetNotificationTypes,
	useGetUserNotifications,
} from "@/hooks/notification";
import { Bell } from "lucide-react";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "./ui/popover";
import NotificationType from "@/types/NotificationType";
import NotificationTypeType from "@/types/NotificationTypeType";
import { useGetItem } from "@/hooks/item";
import { NavLink } from "react-router-dom";
import { useGetFriendRequest } from "@/hooks/friendRequest";
import { useGetUser } from "@/hooks/user";
import { Badge } from "./ui/badge";
import ReactTimeAgo from "react-time-ago";
import ProfilePicture from "./ProfilePicture";
import React, { useState } from "react";
import { Separator } from "./ui/separator";
import { X } from "lucide-react";
import Tooltip from "./Tooltip";
import { Button } from "./ui/button";

const FriendRequestNotification = ({
	notification,
	setOpen,
}: {
	notification: NotificationType;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	if (notification.friendRequest) {
		const { friendRequest, isSuccess } = useGetFriendRequest(notification.friendRequest);
		const { user } = useGetUser(friendRequest?.sender);

		if (isSuccess) {
			return (
				<NavLink
					to={`user/${user?.id}`}
					onClick={() => {
						setOpen(false);
					}}
				>
					<div className="flex gap-x-2 items-center">
						<ProfilePicture src={user?.profilePicture} className="h-8 w-8" />
						<p>
							<span className="font-medium">
								{user?.firstName} {user?.lastName}
							</span>
							{" sent you a friend request"}
						</p>
					</div>
				</NavLink>
			);
		}
	}

	return <></>;
};

const CommentNotification = ({
	notification,
	setOpen,
}: {
	notification: NotificationType;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	if (notification.item) {
		const { item, isSuccess } = useGetItem(notification.item);

		if (isSuccess)
			return (
				<NavLink to={`item/${item?.id}`} onClick={() => setOpen(false)}>
					<p>
						New comment on <span className="font-medium">{item?.title}</span>
					</p>
				</NavLink>
			);
	}

	return <></>;
};

const NotificationWrapper = ({
	notification,
	children,
}: {
	notification: NotificationType;
	children: React.ReactNode;
}) => {
	const { userId } = useAuth();
	const deleteNotification = useDeleteNotification({ userId });

	return (
		<div className="flex justify-between py-2">
			<div className="flex flex-col gap-x-3 gap-y-2 items-start">
				<div>{children}</div>
				<Badge variant={"secondary"}>
					<ReactTimeAgo date={new Date(notification.createdAt)} />
				</Badge>
			</div>
			{userId && (
				<div className="cursor-pointer">
					<Tooltip tooltip="Remove">
						<X color="#b9b9b9" onClick={() => deleteNotification(notification.id)} />
					</Tooltip>
				</div>
			)}
		</div>
	);
};

const Notifications = () => {
	const { userId } = useAuth();
	const { notifications } = useGetUserNotifications(userId);
	const { types } = useGetNotificationTypes();
	const [open, setOpen] = useState<boolean>(false);
	const deleteNotifications = useDeleteNotifcationsByUser({ userId });

	const maxHeight = 360;
	const friendRequestNotificationId = types?.find((t: NotificationTypeType) => t.name === "friendRequest").id;
	const commentNotificationId = types?.find((t: NotificationTypeType) => t.name === "comment").id;

	const active = notifications.length > 0;
	const color = active ? "#ffffff" : "#62748e";

	const notificationCountText = () => {
		const length = notifications.length;
		const maxLength = 9;

		if (length > maxLength) {
			return `${maxLength}+`;
		}

		return length;
	};

	const notificationType = (n: NotificationType) => {
		if (n.type === friendRequestNotificationId)
			return <FriendRequestNotification notification={n} setOpen={setOpen} />;

		if (n.type === commentNotificationId) return <CommentNotification notification={n} setOpen={setOpen} />;

		return <>Unknown Notificaion</>;
	};

	const NotificationsContent = () => {
		if (notifications.length === 0)
			return (
				<div className="flex">
					<div className="m-auto font-medium text-gray-300">No notifications</div>
				</div>
			);

		return (
			<div>
				{notifications.map((n: NotificationType, index: number) => (
					<React.Fragment key={n.id}>
						<NotificationWrapper notification={n}>{notificationType(n)}</NotificationWrapper>
						{index < notifications.length - 1 && <Separator className="my-2" />}
					</React.Fragment>
				))}
			</div>
		);
	};

	return (
		<div className="relative">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<div className="cursor-pointer">
						<Bell color={color} />
						{active && (
							<div className="absolute right-[9px] top-[-10px] rounded-full bg-red-500 text-sm font-medium px-1 text-white text-white border-2 border-slate-800">
								{notificationCountText()}
							</div>
						)}
					</div>
				</PopoverTrigger>
				<PopoverAnchor />
				<PopoverContent className="w-64 md:w-80 shadow-2xl mt-2">
					<div className="flex justify-between items-center mb-4">
						<p className="font-medium text-lg">Notifications</p>
						{active && (
							<Button variant={"secondary"} onClick={() => deleteNotifications()}>
								Clear all
							</Button>
						)}
					</div>
					<div
						style={{ maxHeight: `${maxHeight}px` }}
						className="overflow-y-auto pr-2 md:[&::-webkit-scrollbar]:w-2 md:[&::-webkit-scrollbar-track]:bg-gray-100
  md:[&::-webkit-scrollbar-thumb]:bg-gray-300"
					>
						<NotificationsContent />
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default Notifications;
