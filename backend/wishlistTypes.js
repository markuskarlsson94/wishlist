import wishlistService from "./services/wishlistService";

let wishlistTypes = {};

export const initWishlistTypes = async () => {
    const types = await wishlistService.getTypes();
    const pub = types.find((type) => type.name === "public").id;
    const friends = types.find((type) => type.name === "friends").id;
    const invite = types.find((type) => type.name === "invite").id;
    const priv = types.find((type) => type.name === "hidden").id;

    wishlistTypes = {
        PUBLIC: pub,
        FRIEND: friends,
        INVITE: invite,
        PRIVATE: priv,
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

export const privateType = () => {
    return wishlistTypes.PRIVATE;
};