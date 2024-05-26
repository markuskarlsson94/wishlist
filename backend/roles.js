import userService from "./services/userService.js";

let userRoles = {};

export const initUserRoles = async () => {
    const roles = await userService.getUserRoles();
    const adminRole = roles.find((role) => role.name === "admin").id;
    const userRole = roles.find((role) => role.name === "user").id;
    
    userRoles = {
        ADMIN: adminRole,
        USER: userRole
    };
};

export default userRoles;