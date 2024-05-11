import userRoles from "./roles.js";

const users = [
    {
        username: "admin",
        email: "admin@mail.com",
        password: "$2b$10$VBOsAZiw9kVAjdixWVSD9.cRMbttIjulDWlWRQJh0j2L6YPJS5G/i",
        role: userRoles.ADMIN
    },
    {
        username: "customer",
        email: "customer@mail.com",
        password: "$2b$10$nxeNYaYGG0wtb5gDyok29ekEIOeT6t0UjQTy6hpexL2lv/3EQAADq",
        role: userRoles.CUSTOMER
    }
];

export default users;