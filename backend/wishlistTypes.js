import wishlistService from "./services/wishlistService";

let wishlistTypes = {};

export const initWishlistTypes = async () => {
    const types = await wishlistService.getTypes();
    const pub = types.find((type) => type.name === "public").id;
    const friends = types.find((type) => type.name === "friends").id;
    const invite = types.find((type) => type.name === "invite").id;
    const hidden = types.find((type) => type.name === "hidden").id;

    wishlistTypes = {
        PUBLIC: pub,
        FRIEND: friends,
        INVITE: invite,
        HIDDEN: hidden,
    };
};

export const publicType = () => {
    return wishlistTypes.PUBLIC;
};

export const friendType = () => {
    return wishlistTypes.FRIEND;
};

export const inviteType = () => {
    return wishlistTypes.INVITE;
};

export const hiddenType = () => {
    return wishlistTypes.HIDDEN;
};

export const allTypes = () => {
    return [ 
        wishlistTypes.PUBLIC, 
        wishlistTypes.FRIEND, 
        wishlistTypes.INVITE, 
        wishlistTypes.HIDDEN
    ];
}