import { StatusCodes } from "http-status-codes";

const errorMessages = {
	userAlreadyExists: {
		status: StatusCodes.BAD_REQUEST,
		message: "User already exists",
	},

	wishlistTypeNotFound: {
		status: StatusCodes.BAD_REQUEST,
		message: "Wishlist type not found",
	},

	userNotFound: {
		status: StatusCodes.NOT_FOUND,
		message: "User not found",
	},

	wishlistNotFound: {
		status: StatusCodes.NOT_FOUND,
		message: "Wishlist not found",
	},

	wishlistItemNotFound: {
		status: StatusCodes.NOT_FOUND,
		message: "Wishlist item not found",
	},

	reservationNotFound: {
		status: StatusCodes.NOT_FOUND,
		message: "Reservation not found",
	},

	refreshTokenRequired: {
		status: StatusCodes.BAD_REQUEST,
		message: "Refresh token required",
	},

	commentNotFound: {
		status: StatusCodes.NOT_FOUND,
		message: "Comment not found",
	},

	passwordsDontMatch: {
		status: StatusCodes.BAD_REQUEST,
		message: "New passwords do not match",
	},

	oldPasswordIncorrect: {
		status: StatusCodes.BAD_REQUEST,
		message: "Old password is incorrect",
	},

	unableToAddItem: {
		status: StatusCodes.BAD_REQUEST,
		message: "Unable to add item",
	},

	unableToAddLessThanOneItem: {
		status: StatusCodes.BAD_REQUEST,
		message: "Unable to add less than one item",
	},

	amountToReserveTooSmall: {
		status: StatusCodes.BAD_REQUEST,
		message: "Amount to reserve is too small",
	},

	amountToReserveTooLarge: {
		status: StatusCodes.BAD_REQUEST,
		message: "Amount to reserve is too large",
	},

	unableToReserveOwnItem: {
		status: StatusCodes.BAD_REQUEST,
		message: "Unable to reserve own item",
	},

	itemAlreadyReservedByUser: {
		status: StatusCodes.BAD_REQUEST,
		message: "Item already reserved by user",
	},

	userAlreadyAddedAsFriend: {
		status: StatusCodes.BAD_REQUEST,
		message: "User already added as friend",
	},

	unableToRemoveFriend: {
		status: StatusCodes.BAD_REQUEST,
		message: "Unable to remove friend",
	},

	unableToAddSameUserAsFriend: {
		status: StatusCodes.BAD_REQUEST,
		message: "Unable to add same user as friend",
	},

	unableToRemoveSameUserAsFriend: {
		status: StatusCodes.BAD_REQUEST,
		message: "Unable to remove same user as friend",
	},

	unableToCreateFriendRequestWithSelf: {
		status: StatusCodes.BAD_REQUEST,
		message: "Unable to create friend request with self",
	},

	userQueryTooShort: {
		status: StatusCodes.BAD_REQUEST,
		message: "User query too short",
	},

	missingItemProperties: {
		status: StatusCodes.BAD_REQUEST,
		message: "Missing item properties",
	},

	unableToVerifyUser: {
		status: StatusCodes.BAD_REQUEST,
		message: "Unable to verify User",
	},

	missingPassword: {
		status: StatusCodes.BAD_REQUEST,
		message: "Missing password",
	},

	invalidEmail: {
		status: StatusCodes.BAD_REQUEST,
		message: "Invalid email",
	},

	missingUserProperties: {
		status: StatusCodes.BAD_REQUEST,
		message: "Missing user properties",
	},

	missingImage: {
		status: StatusCodes.BAD_REQUEST,
		message: "Missing image",
	},

	invalidEmailOrPassword: {
		status: StatusCodes.UNAUTHORIZED,
		message: "Invalid email or password",
	},

	invalidRefreshToken: {
		status: StatusCodes.UNAUTHORIZED,
		message: "Invalid refresh token",
	},

	unauthorizedToDeleteOtherUser: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to delete other user",
	},

	unauthorizedToAddWishlist: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to add wishlist",
	},

	unauthorizedToDeleteWishlist: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to delete wishlist",
	},

	unauthorizedToUpdateWishlist: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to update wishlist",
	},

	unauthorizedToUpdateWishlistItem: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to update wishlist item",
	},

	unauthorizedToClearReservations: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to clear reservations",
	},

	unauthorizedToRemoveReservation: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to remove reservation",
	},

	unauthorizedToViewReservations: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to view reservations",
	},

	unauthorizedToAddFriend: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to add friend",
	},

	unauthorizedToRemoveFriend: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to remove friend",
	},

	unauthorizedToViewFriends: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to view friends",
	},

	unauthorizedToCreateFriendRequest: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to create friend request",
	},

	unauthorizedToRemoveFriendRequest: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to remove friend request",
	},

	unauthorizedToAcceptFriendRequest: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to accept friend request",
	},

	unauthorizedToGetFriendRequest: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to get friend request",
	},

	unauthorizedToGetFriendRequests: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to get friend requests",
	},

	unauthorizedToAddComment: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to add comment",
	},

	unauthorizedToRemoveComment: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to remove comment",
	},

	unauthorizedToUpdateComment: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to update comment",
	},

	unauthorizedToGetComments: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to get comments",
	},

	unauthorizedToLogout: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to logout",
	},

	unauthorizedToUpdatePassword: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to update password",
	},

	unauthorizedToUpdateProfilePicture: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to update profile picture",
	},

	unauthorizedToUpdateUser: {
		status: StatusCodes.FORBIDDEN,
		message: "Unauthorized to update user",
	},

	serverError: {
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		message: "Server error",
	},

	unableToAddNewUser: {
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		message: "Unable to add new user",
	},

	unableToCreateWishlist: {
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		message: "Unable to create wishlist",
	},

	unableToGetWishlistsForUser: {
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		message: "Unable to get wishlists for user",
	},

	unableToCreateFriendRequest: {
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		message: "Unable to create friend request",
	},

	unableToRemoveFriendRequest: {
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		message: "Unable to remove friend request",
	},

	unableToAcceptFriendRequest: {
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		message: "Unable to accept friend request",
	},

	unableToGetFriendRequest: {
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		message: "Unable to get friend request",
	},

	unableToGetFriendRequests: {
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		message: "Unable to get friend requests",
	},

	unableToGetUsers: {
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		message: "Unable to get users",
	},

	unableToAddComment: {
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		message: "Unable to add comment",
	},

	unableToUpdateComment: {
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		message: "Unable to update comment",
	},

	unableToRemoveComment: {
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		message: "Unable to remove comment",
	},

	unableToGetComments: {
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		message: "Unable to get comments",
	},

	unableToLogout: {
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		message: "Unable to logout",
	},

	unableToAddPasswordToken: {
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		message: "Unable to add password token",
	},

	unableToResetPassword: {
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		message: "Unable to reset password",
	},

	unableToUpdateUser: {
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		message: "Unable to update user",
	},

	unableToUploadProfilePicture: {
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		message: "Unable to upload profile picture",
	},
};

export default errorMessages;
