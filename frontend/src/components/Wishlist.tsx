import { useState, useEffect } from "react";
import ItemInputType from "../types/ItemInputType";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCreateItem, useGetItems } from "../hooks/item";
import {
	useDeleteWishlist,
	useGetInvitations,
	useGetWishlist,
	useInviteUser,
	useUninviteUser,
	useUpdateWishlist,
} from "../hooks/wishlist";
import useWishlistTypes from "../hooks/useWishlistTypes";
import WishlistInputType from "../types/WishlistInputType";
import RoundedRect from "./RoundedRect";
import ItemDialog from "./dialogs/ItemDialog";
import { Button, buttonVariants } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import WishlistForm from "@/forms/WishlistForm";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./ui/alert-dialog";
import { EllipsisVertical, Share2Icon, UserRound, UserRoundPlus } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useGetComments } from "@/hooks/comment";
import ItemType from "@/types/ItemType";
import HoverCard from "./HoverCard";
import EditIcon from "./icons/EditIcon";
import DeleteIcon from "./icons/DeleteIcon";
import Tooltip from "./Tooltip";
import { useGetReservationByItemId } from "@/hooks/reservation";
import { findFormattedType, friendToUser, getFormattedType } from "@/utils/wishlist/utils";
import WishlistTypeInfoType from "@/types/WishlistTypeInfoType";
import { Badge } from "./ui/badge";
import NotFound from "./NotFound";
import { useGetUser, useSearchUser } from "@/hooks/user";
import Navbar from "./Navbar";
import { cn } from "@/lib/utils";
import LoadingSpinner from "./LoadingSpinner";
import { StatusCodes } from "http-status-codes";
import { AxiosError } from "axios";
import CopyLinkButton from "./CopyLinkButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useGetFriends } from "@/hooks/friend";
import FriendType from "@/types/FriendType";
import ProfilePicture from "./ProfilePicture";
import WishlistType from "@/types/WishlistType";
import Searchbar from "./Searchbar";
import UserType from "@/types/UserType";

const ReservationBadge = ({ item }: { item: ItemType }) => {
	const { userId } = useAuth();
	const { reservation } = useGetReservationByItemId(item.id);
	const reserved = !!reservation;

	if (reservation?.fulfilled) return <Badge>Gifted</Badge>;

	if (reservation?.user === userId) return <Badge className="whitespace-nowrap">Reserved by you</Badge>;

	if (reserved) return <Badge variant={"secondary"}>Reserved</Badge>;

	return <></>;
};

const Item = ({ item }: { item: ItemType }) => {
	const { comments } = useGetComments(item.id);
	const commentCount = comments.length;

	return (
		<div>
			<NavLink to={`/item/${item.id}`}>
				<HoverCard>
					<CardHeader>
						<div className="flex flex-wrap gap-y-1 items-start">
							<div className="pt-[0.14rem]">
								<CardTitle className="[overflow-wrap:anywhere]">{item.title}</CardTitle>
								<CardDescription className="[overflow-wrap:anywhere]">
									{item.description}
								</CardDescription>
							</div>
							<div className="flex flex-wrap gap-x-3 gap-y-2 ml-auto">
								<ReservationBadge item={item} />
								{commentCount > 0 && (
									<Badge variant={"secondary"} className="whitespace-nowrap">{`${commentCount} ${
										commentCount > 1 ? "comments" : "comment"
									}`}</Badge>
								)}
							</div>
						</div>
					</CardHeader>
				</HoverCard>
			</NavLink>
		</div>
	);
};

const InviteAlertDialog = ({
	user,
	wishlistId,
	open,
	onOpenChange,
}: {
	user: UserType;
	wishlistId: number;
	open: boolean;
	onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const invite = useInviteUser();

	const inviteUser = (userId: number) => {
		invite(wishlistId, userId);
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogTrigger asChild></AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Remove user</AlertDialogTitle>
					<AlertDialogDescription>
						<p className="[overflow-wrap:anywhere]">
							{`Are you sure you want ${user.firstName} to get access to this wishlist?`}
						</p>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>No, don't add user</AlertDialogCancel>
					<AlertDialogAction onClick={() => inviteUser(user.id)}>Yes, add user</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

const UninviteAlertDialog = ({
	user,
	wishlistId,
	open,
	onOpenChange,
}: {
	user: UserType;
	wishlistId: number;
	open: boolean;
	onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const uninvite = useUninviteUser();

	const uninviteUser = (userId: number) => {
		uninvite(wishlistId, userId);
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogTrigger asChild></AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Remove user</AlertDialogTitle>
					<AlertDialogDescription>
						<p className="[overflow-wrap:anywhere]">
							{`Are you sure you want to remove access for ${user.firstName} to this wishlist?`}
						</p>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>No, keep user</AlertDialogCancel>
					<AlertDialogAction onClick={() => uninviteUser(user.id)}>Yes, remove user</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

const SearchResultUser = ({
	userId,
	friends,
	wishlist,
	invitations,
}: {
	userId: number;
	friends: FriendType[];
	wishlist: WishlistType;
	invitations: number[] | undefined;
}) => {
	const { userId: viewer } = useAuth();
	const { user } = useGetUser(userId);
	const [uninviteDialogOpen, setUninviteDialogOpen] = useState<boolean>(false);
	const [inviteDialogOpen, setInviteDialogOpen] = useState<boolean>(false);

	const isFriend = friends?.some((friend: FriendType) => friend.userId === userId);
	const isInvited = invitations?.includes(userId);
	const isSelf = viewer === userId;

	if (!user) return <></>;

	return (
		<Card className="p-2">
			<div className="flex flex-row items-center gap-x-2">
				<NavLink to={`/user/${userId}`}>
					<ProfilePicture src={user.profilePicture} />
				</NavLink>
				<div className="flex flex-wrap items-center w-full">
					<div className="flex flex-col">
						<NavLink to={`/user/${userId}`}>
							<p className="[overflow-wrap:anywhere]">{`${user.firstName} ${user.lastName}`}</p>
						</NavLink>
						<div>{isFriend && <Badge variant={"secondary"}>Friend</Badge>}</div>
						<div>{isSelf && <Badge variant={"secondary"}>You</Badge>}</div>
					</div>
					{isInvited && (
						<Button variant={"secondary"} className="ml-auto" onClick={() => setUninviteDialogOpen(true)}>
							Remove
						</Button>
					)}
					{!isInvited && !isSelf && (
						<Button onClick={() => setInviteDialogOpen(true)} className="ml-auto">
							Add
						</Button>
					)}

					<UninviteAlertDialog
						user={user}
						wishlistId={wishlist.id}
						open={uninviteDialogOpen}
						onOpenChange={setUninviteDialogOpen}
					/>

					<InviteAlertDialog
						user={user}
						wishlistId={wishlist.id}
						open={inviteDialogOpen}
						onOpenChange={setInviteDialogOpen}
					/>
				</div>
			</div>
		</Card>
	);
};

const InviteDialog = ({
	wishlist,
	open,
	onOpenChange,
}: {
	wishlist: WishlistType;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) => {
	const { userId } = useAuth();
	let { friends } = useGetFriends(userId);
	const { invitations } = useGetInvitations(wishlist.id);
	const [disabled, setDisabled] = useState<boolean>(true);
	const [query, setQuery] = useState<string>("");
	let { users, isFetching, isSuccess, hasNextPage, fetchNextPage } = useSearchUser(query);
	const [showResult, setShowResult] = useState<boolean>(false);
	const [inviteDialogOpen, setIsInviteDialogOpen] = useState<boolean>(false);
	const [selectedFriend, setSelectedFriend] = useState<FriendType | undefined>(undefined);

	useEffect(() => {
		if (!open) {
			setQuery("");
			setShowResult(false);
			setDisabled(true);
		}
	}, [open]);

	useEffect(() => {
		if (isSuccess) setShowResult(true);
	}, [isSuccess]);

	let filteredFriends: FriendType[] = [];
	if (invitations) {
		filteredFriends = friends.filter((friend: FriendType) => !invitations.includes(friend.userId));
	}

	const handleSearch = (input: string) => {
		setQuery(input);
	};

	const handleChange = (input: string) => {
		if (input.length < 3) {
			setDisabled(true);
		} else {
			setDisabled(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Invite users</DialogTitle>
					<DialogDescription>Add users that you want to be able to access this wishlist</DialogDescription>
				</DialogHeader>
				<Tabs defaultValue="account">
					<TabsList>
						<TabsTrigger value="friends">Friends</TabsTrigger>
						<TabsTrigger value="all">All users</TabsTrigger>
					</TabsList>
					<TabsContent value="friends">
						<div
							className="flex flex-col gap-y-3 overflow-y-auto md:[&::-webkit-scrollbar]:w-2 md:[&::-webkit-scrollbar-track]:bg-gray-100
  md:[&::-webkit-scrollbar-thumb]:bg-gray-300"
							style={{ maxHeight: "400px" }}
						>
							{filteredFriends.map((friend: FriendType) => (
								<Card key={friend.userId} className="p-3">
									<div className="flex gap-x-2 items-center">
										<ProfilePicture src={friend.profilePicture} />
										<div className="flex flex-wrap gap-y-2 items-center w-full">
											<p className="[overflow-wrap:anywhere]">{`${friend.firstName} ${friend.lastName}`}</p>
											<Button
												className="ml-auto"
												onClick={() => {
													setSelectedFriend(friend);
													setIsInviteDialogOpen(true);
												}}
											>
												Add
											</Button>
										</div>
									</div>
								</Card>
							))}
							{friends.length === 0 && (
								<p className="m-auto text-2xl font-medium text-gray-300 py-6">No more friends to add</p>
							)}
						</div>

						{selectedFriend && (
							<InviteAlertDialog
								user={friendToUser(selectedFriend)}
								wishlistId={wishlist.id}
								open={inviteDialogOpen}
								onOpenChange={setIsInviteDialogOpen}
							/>
						)}
					</TabsContent>
					<TabsContent value="all">
						<div className="flex flex-col gap-y-6">
							<Searchbar
								placeholder="Search for user"
								onSearch={handleSearch}
								onChange={handleChange}
								disabled={disabled}
							/>
							<div
								className="flex flex-col overflow-y-auto md:[&::-webkit-scrollbar]:w-2 md:[&::-webkit-scrollbar-track]:bg-gray-100
  md:[&::-webkit-scrollbar-thumb]:bg-gray-300"
								style={{ maxHeight: "400px" }}
							>
								<div className="flex flex-col py-3 gap-y-3">
									{showResult &&
										users.map((user: number) => (
											<SearchResultUser
												userId={user}
												friends={friends}
												wishlist={wishlist}
												invitations={invitations}
												key={user}
											/>
										))}
									{showResult && users.length === 0 && (
										<div className="flex">
											<p className="m-auto text-muted-foreground">No results</p>
										</div>
									)}
								</div>
								{hasNextPage && (
									<Button
										onClick={() => fetchNextPage()}
										disabled={isFetching}
										variant={"secondary"}
										className="m-auto"
									>
										{isFetching ? "Loading..." : "Load more"}
									</Button>
								)}
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
};

const InvitedUser = ({ wishlist, userId }: { wishlist: WishlistType; userId: number }) => {
	const { user } = useGetUser(userId);
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);

	if (user)
		return (
			<Card className="p-3">
				<div className="flex flex-wrap gap-y-2">
					<NavLink to={`/user/${user.id}`}>
						<div className="flex gap-x-2 items-center">
							<ProfilePicture src={user.profilePicture} />
							<p className="[overflow-wrap:anywhere]">{`${user.firstName} ${user.lastName}`}</p>
						</div>
					</NavLink>
					<Button className="ml-auto" onClick={() => setDialogOpen(true)}>
						Remove
					</Button>
				</div>

				<UninviteAlertDialog
					user={user}
					wishlistId={wishlist.id}
					open={dialogOpen}
					onOpenChange={setDialogOpen}
				/>
			</Card>
		);
};

const UninviteDialog = ({
	wishlist,
	open,
	onOpenChange,
}: {
	wishlist: WishlistType;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) => {
	const { invitations } = useGetInvitations(wishlist.id);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Invited users</DialogTitle>
					<DialogDescription>The following users can access this wishlist</DialogDescription>
				</DialogHeader>
				<div
					className="flex flex-col gap-y-3 overflow-y-auto md:[&::-webkit-scrollbar]:w-2 md:[&::-webkit-scrollbar-track]:bg-gray-100
  md:[&::-webkit-scrollbar-thumb]:bg-gray-300"
					style={{ maxHeight: "200px" }}
				>
					{invitations?.map((i: number) => (
						<InvitedUser wishlist={wishlist} userId={i} key={i} />
					))}
					{invitations?.length === 0 && (
						<p className="m-auto text-2xl font-medium text-gray-300 py-6">No invited users</p>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

const Wishlist = () => {
	const [isOwner, setIsOwner] = useState<boolean>(false);
	const params = useParams<{ id: string }>();
	const id = Number(params.id);
	const { wishlist, isSuccess: isSuccessWishlist, isLoading: isLoadingWishlist, notFound } = useGetWishlist(id);
	const updateWishlist = useUpdateWishlist();
	const { userId } = useAuth();
	const { user } = useGetUser(wishlist?.owner);
	const navigate = useNavigate();
	const deleteWishlist = useDeleteWishlist({
		onSuccess: () => {
			navigate(`/user/${userId}/wishlists`, { replace: true });
		},
	});
	const { items, isSuccess: isSuccessItems, isLoading: isLoadingItems } = useGetItems(id);
	const { createItem } = useCreateItem({
		onError: (error: AxiosError) => {
			if (error.response?.status === StatusCodes.FORBIDDEN) {
				setErrorOpen(true);
			}
		},
	});
	const { types, inviteType } = useWishlistTypes();
	const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
	const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false);
	const [isInviteDialogOpen, setIsInviteDialogOpen] = useState<boolean>(false);
	const [isUninviteDialogOpen, setIsUninviteDialogOpen] = useState<boolean>(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
	const formattedTypes = types.map((t) => getFormattedType(t));
	const [type, setType] = useState<WishlistTypeInfoType | undefined>(undefined);
	const [errorOpen, setErrorOpen] = useState(false);

	const isSuccess = isSuccessWishlist && isSuccessItems;
	const isLoading = isLoadingWishlist || isLoadingItems;

	useEffect(() => {
		if (isSuccessWishlist) {
			setIsOwner(wishlist?.owner === userId);
			if (wishlist) setType(findFormattedType(formattedTypes, wishlist.type));
		}
	}, [wishlist, isSuccessWishlist]);

	const onSubmitItem = (input: ItemInputType) => {
		if (wishlist) createItem(input, wishlist.id);
	};

	const onSubmitWishlist = (input: WishlistInputType) => {
		if (wishlist) updateWishlist(wishlist.id, input);
		setIsEditDialogOpen(false);
	};

	const itemValues: ItemInputType = {
		title: "",
		description: "",
		link: "",
	};

	const wishlistValues = {
		title: wishlist?.title || "",
		description: wishlist?.description || "",
		type: wishlist?.type || types[0]?.id,
	};

	const breadcrumbProps = () => {
		return isOwner
			? {
					breadcrumbs: [
						{ title: "My Wishlists", link: `/user/${userId}/wishlists` },
						{ title: wishlist?.title },
					],
					isLoading: !userId || !wishlist,
			  }
			: {
					breadcrumbs: [
						{ title: user?.firstName, link: `/user/${user?.id}`, userId: user?.id },
						{ title: "Wishlists", link: `/user/${wishlist?.owner}/wishlists` },
						{ title: wishlist?.title },
					],
					isLoading: !user || !wishlist,
			  };
	};

	const getShareLink = () => {
		if (!wishlist) return "";

		return `${import.meta.env.VITE_APP_DOMAIN}/wishlist/${wishlist.id}`;
	};

	if (notFound) {
		return <NotFound type="Wishlist" />;
	}

	return (
		<div className="flex flex-col gap-y-2">
			<Navbar props={breadcrumbProps()} />
			<RoundedRect>
				{isLoading && <LoadingSpinner className="m-auto" />}
				{isSuccess && wishlist && (
					<>
						<div className="flex items-start justify-between gap-x-3">
							<p className={cn("font-medium [overflow-wrap:anywhere]", isOwner ? "pt-[0.3rem]" : "")}>
								{wishlist.title}
							</p>

							<div className="flex gap-x-3 items-center">
								{type && (
									<Badge variant={"secondary"}>
										<Tooltip tooltip={type.description}>
											<p className="text-nowrap">{type.name}</p>
										</Tooltip>
									</Badge>
								)}

								<div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button size={"icon"} variant={"ghost"}>
												<EllipsisVertical />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											{isOwner && (
												<DropdownMenuItem
													onClick={() => setIsEditDialogOpen(true)}
													className="flex justify-between items-center"
												>
													<span>Edit</span>
													<EditIcon />
												</DropdownMenuItem>
											)}
											<DropdownMenuItem
												onClick={() => setIsShareDialogOpen(true)}
												className="flex justify-between items-center"
											>
												<span>Share</span>
												<Share2Icon />
											</DropdownMenuItem>
											{type?.id === inviteType && (
												<>
													<DropdownMenuItem
														onClick={() => setIsInviteDialogOpen(true)}
														className="flex justify-between items-center"
													>
														<span>Add users</span>
														<UserRoundPlus />
													</DropdownMenuItem>

													<DropdownMenuItem
														onClick={() => setIsUninviteDialogOpen(true)}
														className="flex justify-between items-center"
													>
														<span>View/Remove users</span>
														<UserRound />
													</DropdownMenuItem>
												</>
											)}
											{isOwner && (
												<DropdownMenuItem
													onClick={() => setIsDeleteDialogOpen(true)}
													className="flex justify-between items-center"
												>
													<span>Delete</span>
													<DeleteIcon />
												</DropdownMenuItem>
											)}
										</DropdownMenuContent>
									</DropdownMenu>

									<Dialog
										open={isEditDialogOpen}
										onOpenChange={() => setIsEditDialogOpen(!isEditDialogOpen)}
									>
										<DialogTrigger></DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Edit wishlist</DialogTitle>
											</DialogHeader>
											<WishlistForm
												config={{
													open: isEditDialogOpen,
													values: wishlistValues,
													onSubmit: onSubmitWishlist,
													submitButtonTitle: "Save",
												}}
											/>
										</DialogContent>
									</Dialog>

									<Dialog
										open={isShareDialogOpen}
										onOpenChange={() => setIsShareDialogOpen(!isShareDialogOpen)}
									>
										<DialogTrigger></DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Share wishlist</DialogTitle>
											</DialogHeader>
											<div className="flex flex-col gap-y-4">
												<p className="">{getShareLink()}</p>
												<div className="ml-auto">
													<CopyLinkButton textToCopy={getShareLink()} />
												</div>
											</div>
										</DialogContent>
									</Dialog>

									<InviteDialog
										wishlist={wishlist}
										open={isInviteDialogOpen}
										onOpenChange={setIsInviteDialogOpen}
									/>

									<UninviteDialog
										wishlist={wishlist}
										open={isUninviteDialogOpen}
										onOpenChange={setIsUninviteDialogOpen}
									/>

									<AlertDialog
										open={isDeleteDialogOpen}
										onOpenChange={() => setIsDeleteDialogOpen(!isDeleteDialogOpen)}
									>
										<AlertDialogTrigger asChild></AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>Delete wishlist</AlertDialogTitle>
												<AlertDialogDescription>
													Are you sure you want to permanently delete this wishlist and all
													its items?
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancel</AlertDialogCancel>
												<AlertDialogAction
													className={buttonVariants({ variant: "destructive" })}
													onClick={() => {
														if (wishlist) {
															deleteWishlist(wishlist.id);
														}
													}}
												>
													Delete
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</div>
						</div>

						{items && (
							<>
								<div className="my-6">
									<p className="[overflow-wrap:anywhere]">{wishlist.description}</p>
								</div>

								<div className="flex flex-col gap-y-3">
									{items.length === 0 && (
										<div className="flex">
											<p className="m-auto text-2xl font-medium text-gray-300">No items</p>
										</div>
									)}
									{items.map((item) => (
										<Item key={item.id} item={item} />
									))}
									{isOwner && (
										<div className="self-end mt-3">
											<ItemDialog
												config={{
													title: "Add item",
													submitButtonTitle: "Add",
													onSubmit: onSubmitItem,
													values: itemValues,
												}}
											/>
										</div>
									)}
								</div>
							</>
						)}
						<AlertDialog open={errorOpen} onOpenChange={setErrorOpen}>
							<AlertDialogContent>
								<AlertDialogHeader className="font-medium">Error</AlertDialogHeader>
								Too many items
								<AlertDialogFooter>
									<AlertDialogCancel>Close</AlertDialogCancel>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</>
				)}
			</RoundedRect>
		</div>
	);
};

export default Wishlist;
