import { useNavigate, NavLink, useParams } from "react-router-dom";
import { useAcceptFriendRequest, useDeleteFriendRequest, useGetFriendRequests } from "../hooks/friendRequest";
import FriendRequest from "../types/FriendRequesstType";
import { useAuth } from "../contexts/AuthContext";
import { useGetUser } from "../hooks/user";
import { useGetFriends } from "../hooks/friend";
import RoundedRect from "./RoundedRect";
import BackButton from "./BackButton";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import HoverCard from "./HoverCard";
import FriendType from "@/types/FriendType";

const ReceivedFriendRequest = ({ friendRequest }: { friendRequest: FriendRequest }) => {
	const { userId } = useAuth();
	const { user } = useGetUser(friendRequest.sender);
	const deleteFriendRequest = useDeleteFriendRequest({ userId });
	const acceptFriendRequest = useAcceptFriendRequest({ userId });

	const handleAccept = () => {
		acceptFriendRequest(friendRequest.id);
	};

	const handleDecline = () => {
		deleteFriendRequest(friendRequest.id);
	};

	return (
		<div key={friendRequest.id}>
			<Card>
				<CardHeader>
					<CardTitle>
						<div className="flex justify-between">
							<NavLink to={`/user/${friendRequest.sender}`}>
								{user?.firstName} {user?.lastName}
							</NavLink>
							<div className="flex gap-x-3">
								<Button onClick={handleAccept}>Accept</Button>
								<Button onClick={handleDecline}>Decline</Button>
							</div>
						</div>
					</CardTitle>
				</CardHeader>
			</Card>
		</div>
	);
};

const SentFriendRequest = ({ friendRequest }: { friendRequest: FriendRequest }) => {
	const { userId } = useAuth();
	const { user } = useGetUser(friendRequest.receiver);
	const deleteFriendRequest = useDeleteFriendRequest({ userId });

	const handleCancel = () => {
		deleteFriendRequest(friendRequest.id);
	};

	return (
		<div key={friendRequest.id}>
			<Card>
				<CardHeader>
					<CardTitle>
						<div className="flex justify-between">
							<NavLink to={`/user/${friendRequest.receiver}`}>
								{user?.firstName} {user?.lastName}
							</NavLink>
							<Button onClick={handleCancel}>Cancel</Button>
						</div>
					</CardTitle>
				</CardHeader>
			</Card>
		</div>
	);
};

const Friend = ({ friend }: { friend: FriendType }) => {
	const { user } = useGetUser(friend.userId);

	return (
		<NavLink to={`/user/${friend.userId}`}>
			<HoverCard>
				<CardHeader>
					<CardTitle className="flex justify-between items-center">
						{user?.firstName} {user?.lastName}{" "}
					</CardTitle>
				</CardHeader>
			</HoverCard>
		</NavLink>
	);
};

const Friends = () => {
	const params = useParams<{ userId: string }>();
	const userId = Number(params.userId);
	const { userId: viewer } = useAuth();
	const navigate = useNavigate();
	const { sentFriendRequests, receivedFriendRequests } = useGetFriendRequests(userId);
	const { friends } = useGetFriends(userId);

	const handleBack = () => {
		navigate(-1);
	};

	const friendRequests = () => {
		return (
			<>
				<h3>Received friend requests</h3>
				{receivedFriendRequests.map((friendRequest) => (
					<ReceivedFriendRequest key={friendRequest.id} friendRequest={friendRequest} />
				))}
				<h3>Sent friend requests</h3>
				{sentFriendRequests.map((friendRequest) => (
					<SentFriendRequest key={friendRequest.id} friendRequest={friendRequest} />
				))}
			</>
		);
	};

	return (
		<RoundedRect>
			<div className="flex flex-col gap-y-3">
				<BackButton onClick={handleBack} />
				{viewer === userId && friendRequests()}
				<h3>Friends</h3>
				{friends.map((friend) => (
					<Friend key={friend.userId} friend={friend} />
				))}
			</div>
		</RoundedRect>
	);
};

export default Friends;
