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
import { Users } from "lucide-react";
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
import NotFound from "./NotFound";
import ProfilePicture from "./ProfilePicture";
import { Badge } from "./ui/badge";

const User = () => {
	const params = useParams<{ userId: string }>();
	const userId = Number(params.userId);
	const { userId: viewer } = useAuth();
	const { user, notFound } = useGetUser(userId);
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

	const FriendButton = () => {
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
		return commonFriends > 1 ? `${commonFriends} common friends` : "1 common friend";
	};

	const handleGoToWishlists = () => {
		navigate(`/user/${userId}/wishlists`);
	};

	const handleGoToFriends = () => {
		navigate(`/user/${userId}/friends`);
	};

	if (notFound) {
		return <NotFound type="User" />;
	}

	return (
		<RoundedRect>
			<div className="flex flex-col gap-y-6">
				<BackButton onClick={handleBack} />
				<div className="flex justify-between items-center">
					<div className="flex gap-x-3 items-center">
						<ProfilePicture src={user?.profilePicture} className="h-16 w-16" />
						<p className="text-large font-medium">
							{user?.firstName} {user?.lastName} {userId === viewer && <span> (You)</span>}
						</p>
						{!isSelf && !userIsFriend && commonFriends >= 1 && (
							<Badge variant={"secondary"}>
								<div className="flex gap-x-2 items-center ">
									<>
										<Users size={16} />
										<p>{commonFriendString(commonFriends)}</p>
									</>
								</div>
							</Badge>
						)}
					</div>
				</div>
				<div className="flex justify-between">
					<div className="flex gap-x-2">
						<Button onClick={handleGoToWishlists}>Wishlists</Button>
						<Button onClick={handleGoToFriends}>Friends</Button>
					</div>
					<FriendButton />
				</div>
			</div>
		</RoundedRect>
	);
};

export default User;
