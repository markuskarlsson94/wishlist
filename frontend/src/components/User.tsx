import { NavLink, useNavigate, useParams } from "react-router-dom";
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
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useMemo } from "react";
import BackButton from "./BackButton";

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

	const userIsFriend = friends?.some((f) => f.userId === userId);

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
			return <Button onClick={handleDeleteFriend}>Remove friend</Button>;
		} else if (sentFriendRequest) {
			return <Button onClick={handleCancelFriendRequest}>Cancel friend request</Button>;
		} else if (receivedFriendRequest) {
			return <Button onClick={handleAcceptFriendRequest}>Accept friend request</Button>;
		} else {
			return <Button onClick={handleSendFriendRequest}>Send friend request</Button>;
		}
	};

	const commonFriendString = (commonFriends: number) => {
		return commonFriends > 1 ? "common friends" : "common friend";
	};

	return (
		<RoundedRect>
			<BackButton onClick={handleBack} />
			<div className="flex justify-between items-center">
				<div className="flex gap-x-3">
					<p>
						{user?.firstName} {user?.lastName}
					</p>
					{!isSelf && !userIsFriend && commonFriends >= 1 && (
						<Badge variant={"secondary"} className="self-center">
							{commonFriends} {commonFriendString(commonFriends)}
						</Badge>
					)}
				</div>
				{friendButton()}
			</div>
			<div>
				<NavLink to={`/user/${userId}/wishlists`}>Wishlists</NavLink>
			</div>
			<div>
				<NavLink to={`/user/${userId}/friends`}>Friends</NavLink>
			</div>
		</RoundedRect>
	);
};

export default User;
