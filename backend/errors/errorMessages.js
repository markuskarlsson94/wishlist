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