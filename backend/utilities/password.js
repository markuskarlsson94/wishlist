import bcrypt from "bcrypt";

export const generatePassword = async (password) => {
    return (await bcrypt.hash(password, 10));
};

export const passwordsMatching = async (plaintext, hashed) => {
    return (await bcrypt.compare(plaintext, hashed));
}