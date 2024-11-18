import { NavLink, useParams } from "react-router-dom";
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
	const deleteFriend = useDeleteFriend({ userId: viewer });

	const sentFriendRequest = sentFriendRequests.find((r) => r.sender === viewer && r.receiver === userId);
	const receivedFriendRequest = receivedFriendRequests.find((r) => r.sender === userId && r.receiver === viewer);

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

	const friendButton = () => {
		if (!viewer || viewer === userId) return;

		if (friends?.some((f) => f.userId === userId)) {
			return <Button onClick={handleDeleteFriend}>Remove friend</Button>;
		} else if (sentFriendRequest) {
			return <Button onClick={handleCancelFriendRequest}>Cancel friend request</Button>;
		} else if (receivedFriendRequest) {
			return <Button onClick={handleAcceptFriendRequest}>Accept friend request</Button>;
		} else {
			return <Button onClick={handleSendFriendRequest}>Send friend request</Button>;
		}
	};

	return (
		<RoundedRect>
			<p>
				{user?.firstName} {user?.lastName}
			</p>
			{friendButton()}
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
