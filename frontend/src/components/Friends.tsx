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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

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
						<div className="flex justify-between items-center">
							<NavLink to={`/user/${friendRequest.sender}`}>
								<div className="flex gap-x-3 items-center">
									<Avatar>
										<AvatarImage src="./../../public/profile.png" />
										<AvatarFallback />
									</Avatar>
									{user?.firstName} {user?.lastName}
								</div>
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
						<div className="flex justify-between items-center">
							<NavLink to={`/user/${friendRequest.receiver}`}>
								<div className="flex gap-x-3 items-center">
									<Avatar>
										<AvatarImage src="./../../public/profile.png" />
										<AvatarFallback />
									</Avatar>
									{user?.firstName} {user?.lastName}
								</div>
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
	const { userId } = useAuth();

	return (
		<NavLink to={`/user/${friend.userId}`}>
			<HoverCard>
				<CardHeader>
					<CardTitle className="flex justify-between items-center">
						<div className="flex gap-x-3 items-center">
							<Avatar>
								<AvatarImage src="./../../public/profile.png" />
								<AvatarFallback />
							</Avatar>
							<div>
								{friend?.firstName} {friend?.lastName}
								{friend.userId === userId && <span> (You)</span>}
							</div>
						</div>
					</CardTitle>
				</CardHeader>
			</HoverCard>
		</NavLink>
	);
};

const Friends = () => {
	const params = useParams<{ userId: string }>();
	const userId = Number(params.userId);
	const { user, isSuccess } = useGetUser(userId);
	const { userId: viewer } = useAuth();
	const navigate = useNavigate();
	const { sentFriendRequests, receivedFriendRequests } = useGetFriendRequests(userId);
	const { friends, isSuccess: isSuccessFriends } = useGetFriends(userId);

	const isOwner: boolean = userId === viewer;

	const handleBack = () => {
		navigate(-1);
	};

	const friendRequests = () => {
		const requestCount = receivedFriendRequests.length + sentFriendRequests.length;

		return (
			<>
				{requestCount !== 0 && (
					<>
						<p className="font-medium">Friend requests {`(${requestCount})`}</p>
						{receivedFriendRequests.map((friendRequest) => (
							<ReceivedFriendRequest key={friendRequest.id} friendRequest={friendRequest} />
						))}
						{sentFriendRequests.map((friendRequest) => (
							<SentFriendRequest key={friendRequest.id} friendRequest={friendRequest} />
						))}
					</>
				)}
			</>
		);
	};

	const getTitle = () => {
		if (isOwner) return "My Friends";

		if (isSuccess && user) {
			const { firstName, lastName } = user;
			return `${firstName} ${lastName}'s friends`;
		}

		return "";
	};

	return (
		<RoundedRect>
			<div className="flex flex-col gap-y-3">
				<div className="relative flex items-center">
					<BackButton className="" onClick={handleBack} />
					<p className="absolute left-1/2 transform -translate-x-1/2 font-medium">{getTitle()}</p>
				</div>

				<div className="h-3" />

				{viewer === userId && friendRequests()}
				{friends.length !== 0 && <p className="font-medium mt-3">Friends {`(${friends.length})`}</p>}
				{friends.length === 0 && <p className="m-auto text-2xl font-medium text-gray-300">No friends yet</p>}
				{isSuccessFriends && friends?.map((friend) => <Friend key={friend.userId} friend={friend} />)}
			</div>
		</RoundedRect>
	);
};

export default Friends;
