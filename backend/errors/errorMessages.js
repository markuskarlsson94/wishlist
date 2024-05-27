const errorMessages = {
    userAlreadyExists: {
        status: 400,
        message: "User already exists",
    },

    userNotFound: {
        status: 404,
        message: "User not found",
    },

    wishlistNotFound: {
        status: 404,
        message: "Wishlist not found",
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

    unauthorizedToDeleteWishlist: {
        status: 401,
        message: "Unauthorized to delete wishlist",
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