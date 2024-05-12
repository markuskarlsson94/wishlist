import userRoles from "./roles.js";

let userId = 0;

const users = [
    {
        id: userId++,
        username: "admin",
        email: "admin@mail.com",
        password: "$2b$10$VBOsAZiw9kVAjdixWVSD9.cRMbttIjulDWlWRQJh0j2L6YPJS5G/i",
        role: userRoles.ADMIN
    },
    {
        id: userId++,
        username: "customer",
        email: "customer@mail.com",
        password: "$2b$10$nxeNYaYGG0wtb5gDyok29ekEIOeT6t0UjQTy6hpexL2lv/3EQAADq",
        role: userRoles.CUSTOMER
    }
];

export const getUsers = () => {
    return users;
}

export const findUserById = (id) => {
    return users.find(u => u.id === id);
}

export const findUserByUsername = (username) => {
    return users.find(u => u.username === username);
}

export const addUser = (username, email, password) => {
    users.push({
        id: userId++,
        username,
        email,
        password,
        role: userRoles.CUSTOMER
    });
}

export const updateUserPassword = (username, newPassword) => {
    users = users.map(u => {
        if (u.username !== username) {
            return u;
        } else {
            console.log("user found");
            const o = { ...u, password: newPassword, role: 3 };
            console.log(o);
            return o;
        }
    });
}