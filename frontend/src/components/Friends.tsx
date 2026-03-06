import { NavLink, useParams } from "react-router-dom";
import { useAcceptFriendRequest, useDeleteFriendRequest, useGetFriendRequests } from "../hooks/friendRequest";
import FriendRequest from "../types/FriendRequesstType";
import { useAuth } from "../contexts/AuthContext";
import { useGetUser } from "../hooks/user";
import { useGetFriends } from "../hooks/friend";
import RoundedRect from "./RoundedRect";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import HoverCard from "./HoverCard";
import FriendType from "@/types/FriendType";
import NotFound from "./NotFound";
import ProfilePicture from "./ProfilePicture";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import Navbar from "./Navbar";
import BackButton from "./BackButton";
import LoadingSpinner from "./LoadingSpinner";

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
						<div className="flex flex-wrap gap-y-2 justify-between items-center">
							<NavLink to={`/user/${friendRequest.sender}`}>
								<div className="flex gap-x-3 items-center">
									<ProfilePicture src={user?.profilePicture} />
									{user?.firstName} {user?.lastName}
								</div>
							</NavLink>
							<div className="flex gap-x-3">
								<Button onClick={handleAccept}>Accept</Button>
								<Button onClick={handleDecline} variant={"secondary"}>
									Decline
								</Button>
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
									<ProfilePicture src={user?.profilePicture} />
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
							<ProfilePicture src={friend.profilePicture} />
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
	const { user, notFound } = useGetUser(userId);
	const { userId: viewer } = useAuth();
	const { sentFriendRequests, receivedFriendRequests } = useGetFriendRequests(userId);
	const { friends, isSuccess, isLoading } = useGetFriends(userId);

	const isOwner: boolean = userId === viewer;

	const FriendRequests = () => {
		const requestCount = receivedFriendRequests.length + sentFriendRequests.length;

		return (
			<>
				{requestCount !== 0 && (
					<Accordion type="single" collapsible defaultValue="friendRequests">
						<AccordionItem value="friendRequests">
							<AccordionTrigger>Friend requests</AccordionTrigger>
							<AccordionContent>
								{receivedFriendRequests.map((friendRequest) => (
									<ReceivedFriendRequest key={friendRequest.id} friendRequest={friendRequest} />
								))}
								{sentFriendRequests.map((friendRequest) => (
									<SentFriendRequest key={friendRequest.id} friendRequest={friendRequest} />
								))}
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				)}
			</>
		);
	};

	const breadcrumbProps = () => {
		return {
			breadcrumbs: [
				{ title: user?.firstName, link: `/user/${user?.id}`, userId: user?.id },
				{ title: "Friends" },
			],
			isLoading: !user,
		};
	};

	if (notFound) {
		return <NotFound type="User" />;
	}

	return (
		<div className="flex flex-col gap-y-2">
			{!isOwner && <Navbar props={breadcrumbProps()} />}
			<RoundedRect>
				{isLoading && <LoadingSpinner className="m-auto" />}
				{isSuccess && friends && (
					<div className="flex flex-col gap-y-6">
						{isOwner ? (
							<div className="relative flex gap-x-3 items-center">
								<BackButton />
								<p className="absolute left-1/2 transform -translate-x-1/2 font-medium">My Friends</p>
							</div>
						) : (
							<p className="font-medium">Friends</p>
						)}
						{viewer === userId && <FriendRequests />}
						{friends.length === 0 && (
							<p className="m-auto text-2xl font-medium text-gray-300">No friends yet</p>
						)}
						{friends.map((friend) => (
							<Friend key={friend.userId} friend={friend} />
						))}
					</div>
				)}
			</RoundedRect>
		</div>
	);
};

export default Friends;
