import { useNavigate, NavLink, useParams } from "react-router-dom";
import { useAcceptFriendRequest, useDeleteFriendRequest, useGetFriendRequests } from "../hooks/friendRequest";
import FriendRequest from "../types/FriendRequesstType";
import { useAuth } from "../contexts/AuthContext";
import { useGetUser } from "../hooks/user";
import { useGetFriends } from "../hooks/friend";

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
            <NavLink to={`/user/${friendRequest.sender}`}>
                {user?.firstName} {user?.lastName}
            </NavLink>
            <button onClick={handleAccept}>Accept</button>
            <button onClick={handleDecline}>Decline</button>
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
            <NavLink to={`/user/${friendRequest.receiver}`}>
                {user?.firstName} {user?.lastName}
            </NavLink>
            <button onClick={handleCancel}>Cancel</button>
        </div>
    );
};

const Friend = ({ friend }: { friend: number }) => {
    const { user } = useGetUser(friend);

    return (
        <div>
            <NavLink to={`/user/${friend}`}>
                {user?.firstName} {user?.lastName}
            </NavLink>
        </div>
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
                {receivedFriendRequests.map(friendRequest => <ReceivedFriendRequest key={friendRequest.id} friendRequest={friendRequest}/>)}
                <h3>Sent friend requests</h3>
                {sentFriendRequests.map(friendRequest => <SentFriendRequest key={friendRequest.id} friendRequest={friendRequest}/>)}
            </>
        );
    };

    return (
        <>
            <h2>Friends</h2>
            <button onClick={handleBack}>Back</button>
            {viewer === userId && friendRequests()}
            <h3>Friends</h3>
            {friends.map(friend => <Friend key={friend} friend={friend} />)}
        </>
    );
};

export default Friends;