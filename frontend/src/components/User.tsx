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

		if (friends?.includes(userId)) {
			return <button onClick={handleDeleteFriend}>Remove friend</button>;
		} else if (sentFriendRequest) {
			return <button onClick={handleCancelFriendRequest}>Cancel friend request</button>;
		} else if (receivedFriendRequest) {
			return <button onClick={handleAcceptFriendRequest}>Accept friend request</button>;
		} else {
			return <button onClick={handleSendFriendRequest}>Send friend request</button>;
		}
	};

	return (
		<RoundedRect>
			<h2>User</h2>
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
