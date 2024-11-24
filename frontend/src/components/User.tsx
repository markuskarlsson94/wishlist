import { useNavigate, useParams } from "react-router-dom";
import {
	useAcceptFriendRequest,
	useCreateFriendRequest,
	useDeleteFriendRequest,
	useGetFriendRequests,
} from "../hooks/friendRequest";
import { useAuth } from "../contexts/AuthContext";
import { useDeleteFriend, useGetFriends } from "../hooks/friend";
import { useGetUser } from "../hooks/user";
import RoundedRect from "./RoundedRect";
import { Button, buttonVariants } from "./ui/button";
import { useMemo } from "react";
import BackButton from "./BackButton";
import { Calendar, HeartHandshake, Users } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./ui/alert-dialog";

const User = () => {
	const params = useParams<{ userId: string }>();
	const userId = Number(params.userId);
	const { userId: viewer } = useAuth();
	const { user } = useGetUser(userId);
	const createFriendRequest = useCreateFriendRequest({ userId });
	const { sentFriendRequests, receivedFriendRequests } = useGetFriendRequests(viewer);
	const acceptFriendRequest = useAcceptFriendRequest({ userId: viewer });
	const deleteFriendRequest = useDeleteFriendRequest({ userId: viewer });
	const { friends } = useGetFriends(viewer);
	const { friends: userFriends } = useGetFriends(userId);
	const deleteFriend = useDeleteFriend({ userId: viewer });
	const navigate = useNavigate();

	const isSelf = viewer === userId;
	const sentFriendRequest = sentFriendRequests.find((r) => r.sender === viewer && r.receiver === userId);
	const receivedFriendRequest = receivedFriendRequests.find((r) => r.sender === userId && r.receiver === viewer);

	const friendship = useMemo(() => {
		return friends.find((f) => f.userId === userId);
	}, [friends]);

	const userIsFriend = friendship !== undefined;

	const commonFriends = useMemo(
		() => friends.filter((friend) => userFriends.some((f) => f.userId === friend.userId)).length,
		[friends, userFriends],
	);

	const handleDeleteFriend = () => {
		deleteFriend(userId);
	};

	const handleCancelFriendRequest = () => {
		if (sentFriendRequest) {
			deleteFriendRequest(sentFriendRequest.id);
		}
	};

	const handleAcceptFriendRequest = () => {
		if (receivedFriendRequest) {
			acceptFriendRequest(receivedFriendRequest.id);
		}
	};

	const handleSendFriendRequest = () => {
		if (viewer) {
			createFriendRequest(viewer, userId);
		}
	};

	const handleBack = () => {
		navigate(-1);
	};

	const friendButton = () => {
		if (!viewer || isSelf) return;

		if (userIsFriend) {
			return (
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant={"secondary"}>Remove friend</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Remove friend?</AlertDialogTitle>
							<AlertDialogDescription>{`Are you sure you want to remove ${user?.firstName} as a friend?`}</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								className={buttonVariants({ variant: "destructive" })}
								onClick={() => {
									handleDeleteFriend();
								}}
							>
								Remove
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			);
		} else if (sentFriendRequest) {
			return (
				<Button variant={"secondary"} onClick={handleCancelFriendRequest}>
					Cancel friend request
				</Button>
			);
		} else if (receivedFriendRequest) {
			return (
				<Button variant={"secondary"} onClick={handleAcceptFriendRequest}>
					Accept friend request
				</Button>
			);
		} else {
			return (
				<Button variant={"secondary"} onClick={handleSendFriendRequest}>
					Send friend request
				</Button>
			);
		}
	};

	const commonFriendString = (commonFriends: number) => {
		return commonFriends > 1 ? "common friends" : "common friend";
	};

	const handleGoToWishlists = () => {
		navigate(`/user/${userId}/wishlists`);
	};

	const handleGoToFriends = () => {
		navigate(`/user/${userId}/friends`);
	};

	return (
		<RoundedRect>
			<div className="flex flex-col gap-y-3">
				<BackButton onClick={handleBack} />
				<div className="flex justify-between items-center">
					<div className="flex gap-x-3">
						<p className="text-large font-medium">
							{user?.firstName} {user?.lastName} {user?.id === userId && <span> (You)</span>}
						</p>
					</div>
				</div>
				{!isSelf && !userIsFriend && commonFriends >= 1 && (
					<div className="flex gap-x-2 items-center">
						<Users strokeWidth={1.5} opacity={0.5} />
						<p className="text-sm text-muted-foreground">
							{commonFriends} {commonFriendString(commonFriends)}
						</p>
					</div>
				)}
				{userIsFriend && (
					<div className="flex gap-x-2 items-center">
						<HeartHandshake strokeWidth={1.5} opacity={0.5} />
						<p className="text-sm text-muted-foreground">
							Friends since {new Date(friendship.createdAt).toLocaleDateString()}
						</p>
					</div>
				)}
				{user && (
					<div className="flex gap-x-2 items-center">
						<Calendar strokeWidth={1.5} opacity={0.5} />
						<p className="text-sm text-muted-foreground">
							User since {new Date(user.createdAt).toLocaleDateString()}
						</p>
					</div>
				)}
				<div className="flex justify-between mt-3">
					<div className="flex gap-x-2">
						<Button onClick={handleGoToWishlists}>Wishlists</Button>
						<Button onClick={handleGoToFriends}>Friends</Button>
					</div>
					{friendButton()}
				</div>
			</div>
		</RoundedRect>
	);
};

export default User;
