const errorMessages = {
    userAlreadyExists: {
        status: 400,
        message: "User already exists",
    },

    wishlistTypeNotFound: {
        status: 400,
        message: "Wishlist type not found",
    },

    userNotFound: {
        status: 404,
        message: "User not found",
    },

    wishlistNotFound: {
        status: 404,
        message: "Wishlist not found",
    },

    wishlistItemNotFound: {
        status: 404,
        message: "Wishlist item not found",
    },

    reservationNotFound: {
        status: 404,
        message: "Reservation not found",
    },

    refreshTokenRequired: {
        status: 400,
        message: "Refresh token required",
    },

    passwordsDontMatch: {
        status: 400,
        message: "New passwords do not match"
    },

    oldPasswordIncorrect: {
        status: 400,
        message: "Old password is incorrect",
    },

    unableToAddLessThanOneItem: {
        status: 400,
        message: "Unable to add less than one item",
    },

    amountToReserveTooSmall: {
        status: 400,
        message: "Amount to reserve is too small",
    },

    amountToReserveTooLarge: {
        status: 400,
        message: "Amount to reserve is too large",
    },

    unableToReserveOwnItem: {
        status: 400,
        message: "Unable to reserve own item",
    },

    itemAlreadyReservedByUser: {
        status: 400,
        message: "Item already reserved by user",
    },

    invalidEmailOrPassword: {
        status: 401,
        message: "Invalid email or password",
    },

    invalidRefreshToken: {
        status: 401,
        message: "Invalid refresh token",
    },

    unauthorizedToDeleteOtherUser: {
        status: 401,
        message: "Unauthorized to delete other user",
    },

    unauthorizedToAddWishlist: {
        status: 401,
        message: "Unauthorized to add wishlist",
    },

    unauthorizedToDeleteWishlist: {
        status: 401,
        message: "Unauthorized to delete wishlist",
    },

    unauthorizedToUpdateWishlist: {
        status: 401,
        message: "Unauthorized to update wishlist",
    },

    unauthorizedToClearReservations: {
        status: 401,
        message: "Unauthorized to clear reservations",
    },

    unauthorizedToRemoveReservation: {
        status: 401,
        message: "Unauthorized to remove reservation",
    },

    unauthorizedToViewReservations: {
        status: 401,
        message: "Unauthorized to view reservations",
    },
    
    serverError: {
        status: 500,
        message: "Server error",
    },

    unableToAddNewUser: {
        status: 500,
        message: "Unable to add new user",
    },

    unableToCreateWishlist: {
        status: 500,
        message: "Unable to create wishlist",
    },

    unableToGetWishlistsForUser: {
        status: 500,
        message: "UnableToGetWishlistsForUser",
    }
};

export default errorMessages;