import { compare, genSalt, hash } from "bcryptjs";

export const createHashPassword = async (password = "", salt = 10) => {
  const saltString = await genSalt(salt);
  return await hash(password, saltString);
};

export const compareHashPassword = async (password = "", hashPassword = "") => {
  return await compare(password, hashPassword);
};
